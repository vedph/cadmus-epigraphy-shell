import {
  Component,
  effect,
  Inject,
  input,
  model,
  OnDestroy,
  Optional,
  output,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NgeMonacoModule } from '@cisstech/nge/monaco';
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

import { EpiSign } from '../epi-signs-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

/**
 * Epigraphic sign editor component.
 */
@Component({
  selector: 'cadmus-epi-sign',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    NgeMonacoModule,
    FlagSetComponent,
    PhysicalMeasurementSetComponent,
  ],
  templateUrl: './epi-sign.component.html',
  styleUrl: './epi-sign.component.scss',
  providers: [CadmusTextEdService],
})
export class EpiSignComponent implements OnDestroy {
  private _editorModel?: monaco.editor.ITextModel;
  private _editor?: monaco.editor.IStandaloneCodeEditor;
  private readonly _disposables: monaco.IDisposable[] = [];

  // flags
  public featFlags: Flag[] = [];

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

  public id: FormControl<string>;
  public features: FormControl<string[]>;
  public description: FormControl<string | null>;
  public measurements: FormControl<PhysicalMeasurement[]>;
  public form: FormGroup;

  constructor(
    formBuilder: FormBuilder,
    private _editService: CadmusTextEdService,
    @Inject(CADMUS_TEXT_ED_BINDINGS_TOKEN)
    @Optional()
    private _editorBindings?: CadmusTextEdBindings
  ) {
    // form
    this.id = formBuilder.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    });
    this.features = formBuilder.control([], { nonNullable: true });
    this.description = formBuilder.control(null, {
      validators: Validators.maxLength(10000),
    });
    this.measurements = formBuilder.control([], { nonNullable: true });

    this.form = formBuilder.group({
      id: this.id,
      features: this.features,
      description: this.description,
      measurements: this.measurements,
    });

    effect(() => {
      this.updateForm(this.sign());
    });

    effect(() => {
      this.featFlags = this.featEntries()?.map(entryToFlag) || [];
    });
  }

  public ngOnDestroy() {
    this._disposables.forEach((d) => d.dispose());
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

  private updateEditorContent(description: string | null) {
    if (this._editorModel) {
      this._editorModel.setValue(description || '');
    }
  }

  public onEditorInit(editor: monaco.editor.IEditor) {
    editor.updateOptions({
      minimap: {
        side: 'right',
      },
      wordWrap: 'on',
      automaticLayout: true,
    });
    this._editorModel =
      this._editorModel || monaco.editor.createModel('', 'markdown');
    editor.setModel(this._editorModel);
    this._editor = editor as monaco.editor.IStandaloneCodeEditor;

    this._disposables.push(
      this._editorModel.onDidChangeContent((e) => {
        this.description.setValue(this._editorModel!.getValue());
        this.description.markAsDirty();
        this.description.updateValueAndValidity();
      })
    );

    if (this._editorBindings) {
      Object.keys(this._editorBindings).forEach((key) => {
        const n = parseInt(key, 10);
        console.log(
          'Binding ' + n + ' to ' + this._editorBindings![key as any]
        );
        this._editor!.addCommand(n, () => {
          this.applyEdit(this._editorBindings![key as any]);
        });
      });
    }

    // update the editor content if the description is already available
    this.updateEditorContent(this.description.value);
  }

  private updateForm(sign: EpiSign | undefined | null): void {
    if (!sign) {
      this.form.reset();
      return;
    }

    this.id.setValue(sign.id || '');
    this.features.setValue(sign.features || []);
    this.description.setValue(sign.description || null);
    // this._editorModel?.setValue(sign.description || '');
    this.measurements.setValue(sign.measurements || []);

    this.form.markAsPristine();

    this.updateEditorContent(sign.description || null);
  }

  private getSign(): EpiSign {
    return {
      id: this.id.value.trim(),
      features: this.features.value.length ? this.features.value : undefined,
      description: this.description.value?.trim(),
      measurements: this.measurements.value.length
        ? this.measurements.value
        : undefined,
    };
  }

  public onFeatIdsChange(ids: string[]): void {
    this.features.setValue(ids);
    this.features.markAsDirty();
    this.features.updateValueAndValidity();
  }

  public onMeasurementsChange(measurements: PhysicalMeasurement[]): void {
    this.measurements.setValue(measurements);
    this.measurements.markAsDirty();
    this.measurements.updateValueAndValidity();
  }

  public cancel(): void {
    this.signCancel.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.sign.set(this.getSign());
  }
}
