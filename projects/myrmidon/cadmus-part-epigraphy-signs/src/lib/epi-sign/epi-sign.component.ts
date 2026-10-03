import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  Inject,
  input,
  linkedSignal,
  model,
  Optional,
  output,
  untracked,
} from '@angular/core';
import { FormField, form, maxLength, required } from '@angular/forms/signals';

import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  EditorInitializedEvent,
  NgxMonacoEditorComponent,
  StandaloneCodeEditor,
  StandaloneEditorConstructionOptions,
} from '@jean-merelis/ngx-monaco-editor';

import {
  PhysicalMeasurement,
  PhysicalMeasurementSetComponent,
} from '@myrmidon/cadmus-mat-physical-size';
import {
  CADMUS_TEXT_ED_BINDINGS_TOKEN,
  CadmusTextEdBindings,
  CadmusTextEdService,
} from '@myrmidon/cadmus-text-ed';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';
import {
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
  setFieldFromEditor,
} from '@myrmidon/cadmus-ui';

import { EpiSign } from '../epi-signs-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

interface EpiSignControls {
  id: string;
  features: string[];
  description: string;
  measurements: PhysicalMeasurement[];
}

function toDraft(sign?: EpiSign | null): EpiSignControls {
  return {
    id: sign?.id || '',
    features: [...(sign?.features || [])],
    description: sign?.description || '',
    measurements: copyFormValue(sign?.measurements || []),
  };
}

function toModel(draft: EpiSignControls): EpiSign {
  return {
    id: draft.id.trim(),
    features: draft.features.length ? [...draft.features] : undefined,
    description: draft.description.trim() || undefined,
    measurements: draft.measurements.length
      ? copyFormValue(draft.measurements)
      : undefined,
  };
}

/**
 * Epigraphic sign editor component.
 */
@Component({
  selector: 'cadmus-epi-sign',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    NgxMonacoEditorComponent,
    FlagSetComponent,
    PhysicalMeasurementSetComponent,
  ],
  templateUrl: './epi-sign.component.html',
  styleUrl: './epi-sign.component.scss',
  providers: [CadmusTextEdService],
})
export class EpiSignComponent {
  private _editor?: StandaloneCodeEditor;

  public readonly editorOptions: StandaloneEditorConstructionOptions = {
    minimap: { side: 'right' },
    wordWrap: 'on',
    automaticLayout: true,
  };

  // flags
  public readonly featFlags = computed<Flag[]>(() => {
    return this.featEntries()?.map(entryToFlag) || [];
  });

  /**
   * The sign being edited.
   */
  public readonly sign = model<EpiSign>();

  // epi-signs-measure-names
  public readonly measNameEntries = input<ThesaurusEntry[]>();
  // physical-size-units
  public readonly measUnitEntries = input<ThesaurusEntry[]>();
  // physical-size-dim-tags
  public readonly measDimTagEntries = input<ThesaurusEntry[]>();
  // epi-signs-features
  public readonly featEntries = input<ThesaurusEntry[]>();

  public readonly signCancel = output();

  /**
   * The editable draft, derived from the sign. The echo of our own save,
   * normalized by toModel, keeps the draft instead of rebuilding it.
   */
  private readonly _draft = linkedSignal<EpiSign | undefined, EpiSignControls>(
    {
      source: () => this.sign(),
      computation: (sign, previous) =>
        previous &&
        JSON.stringify(sign) === JSON.stringify(toModel(previous.value))
          ? previous.value
          : toDraft(sign),
    },
  );

  public readonly form = form(this._draft, (p) => {
    required(p.id);
    maxLength(p.id, 100);
    maxLength(p.description, 10000);
  });

  /**
   * Set a text field from its editor. See setFieldFromEditor.
   */
  public readonly setFieldFromEditor = setFieldFromEditor;

  constructor(
    private _editService: CadmusTextEdService,
    @Inject(CADMUS_TEXT_ED_BINDINGS_TOKEN)
    @Optional()
    private _editorBindings?: CadmusTextEdBindings,
  ) {
    // clear the interaction state when the draft mirrors the sign again
    effect(() => {
      const draft = this._draft();
      untracked(() => {
        if (this.isDraftInSync(draft)) {
          this.form().reset();
        }
      });
    });
  }

  private isDraftInSync(draft: EpiSignControls): boolean {
    return JSON.stringify(draft) === JSON.stringify(toDraft(this.sign()));
  }

  public onEditorInit(event: EditorInitializedEvent) {
    this._editor = event.editor;
    this._editor.focus();

    if (this._editorBindings) {
      Object.keys(this._editorBindings).forEach((key) => {
        const n = parseInt(key, 10);
        this._editor!.addCommand(n, () => {
          this.applyEdit(this._editorBindings![key as any]);
        });
      });
    }
  }

  private async applyEdit(selector: string) {
    if (!this._editor) {
      return;
    }
    const selection = this._editor.getSelection();
    const text = selection
      ? this._editor.getModel()!.getValueInRange(selection)
      : '';

    const result = await this._editService.edit({
      selector,
      text: text,
    });

    this._editor.executeEdits('my-source', [
      {
        range: selection!,
        text: result.text,
        forceMoveMarkers: true,
      },
    ]);
  }

  public onFeatIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.features, [...ids]);
  }

  public onMeasurementsChange(measurements: PhysicalMeasurement[]): void {
    setFieldFromChild(
      this.form.measurements,
      copyFormValue(measurements || []),
    );
  }

  /**
   * Enter in a text input saves, as the implicit submission of the former
   * form did, unless the save button is disabled.
   */
  public onEnterKey(event: Event): void {
    if (!isImplicitSubmission(event)) {
      return;
    }
    event.preventDefault();
    if (this.form().invalid() || !this.form().dirty()) {
      return;
    }
    this.save();
  }

  public cancel(): void {
    this.signCancel.emit();
  }

  public save(): void {
    if (this.form().invalid()) {
      this.form().markAsTouched();
      return;
    }
    this.sign.set(toModel(this._draft()));
    this.form().reset();
  }
}
