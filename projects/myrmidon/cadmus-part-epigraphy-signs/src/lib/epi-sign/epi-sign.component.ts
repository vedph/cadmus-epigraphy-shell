import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  Optional,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

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
import {
  Flag,
  FlagsPickerAdapter,
  FlagsPickerComponent,
} from '@myrmidon/cadmus-ui-flags-picker';

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
  standalone: true,
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
    FlagsPickerComponent,
    PhysicalMeasurementSetComponent,
  ],
  templateUrl: './epi-sign.component.html',
  styleUrl: './epi-sign.component.scss',
  providers: [CadmusTextEdService],
})
export class EpiSignComponent implements OnDestroy {
  private _sign?: EpiSign;
  private _editorModel?: monaco.editor.ITextModel;
  private _editor?: monaco.editor.IStandaloneCodeEditor;
  private readonly _disposables: monaco.IDisposable[] = [];
  private readonly _flagAdapter: FlagsPickerAdapter;
  // flags
  private _featEntries?: ThesaurusEntry[];

  public featFlags$: Observable<Flag[]>;

  /**
   * The sign being edited.
   */
  @Input()
  public get sign(): EpiSign | undefined | null {
    return this._sign;
  }
  public set sign(value: EpiSign | undefined | null) {
    if (this._sign !== value) {
      this._sign = value || undefined;
      this.updateForm(value);
    }
  }

  // epi-signs-measure-names
  @Input()
  public measNameEntries?: ThesaurusEntry[];

  // physical-size-units
  @Input()
  public measUnitEntries?: ThesaurusEntry[];

  // physical-size-dim-tags
  @Input()
  public measDimTagEntries?: ThesaurusEntry[];

  // epi-signs-features
  @Input()
  public get featEntries(): ThesaurusEntry[] | undefined {
    return this._featEntries;
  }
  public set featEntries(value: ThesaurusEntry[] | undefined) {
    if (this._featEntries === value) {
      return;
    }
    this._featEntries = value || [];
    this._flagAdapter.setSlotFlags(
      'features',
      this._featEntries.map(entryToFlag)
    );
  }

  @Output()
  public readonly signChange: EventEmitter<EpiSign> =
    new EventEmitter<EpiSign>();
  @Output()
  public readonly signCancel: EventEmitter<void> = new EventEmitter<void>();

  public id: FormControl<string>;
  public features: FormControl<Flag[]>;
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
    // flags
    this._flagAdapter = new FlagsPickerAdapter();
    this.featFlags$ = this._flagAdapter.selectFlags('features');
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
  }

  private updateForm(sign: EpiSign | undefined | null): void {
    if (!sign) {
      this.form.reset();
      return;
    }

    this.id.setValue(sign.id || '');
    this.features.setValue(
      this._flagAdapter.setSlotChecks('features', sign.features || [])
    );
    this.description.setValue(sign.description || null);
    this._editorModel?.setValue(sign.description || '');
    this.measurements.setValue(sign.measurements || []);

    this.form.markAsPristine();
  }

  private getSign(): EpiSign {
    return {
      id: this.id.value.trim(),
      features: this._flagAdapter.getOptionalCheckedFlagIds('features'),
      description: this.description.value?.trim(),
      measurements: this.measurements.value.length
        ? this.measurements.value
        : undefined,
    };
  }

  public onFeatFlagsChange(flags: Flag[]): void {
    this._flagAdapter.setSlotFlags('features', flags, true);
    this.features.setValue(flags);
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
    this._sign = this.getSign();
    this.signChange.emit(this._sign);
  }
}
