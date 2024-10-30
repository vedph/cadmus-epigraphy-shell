// NAME-part.component.ts

import { Component, Input, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  Validators,
  FormGroup,
  UntypedFormGroup,
} from '@angular/forms';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';
import { EditedObject, ModelEditorComponentBase } from '@myrmidon/cadmus-ui';

import { Flag, FlagsPickerAdapter } from '@myrmidon/cadmus-ui-flags-picker';

import { EPI_WRITING_PART_TYPEID, EpiWritingPart } from '../epi-writing-part';
import { Observable } from 'rxjs';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

/**
 * EpiWriting part editor component.
 * Thesauri: epi-writing-systems, epi-writing-scripts, epi-writing-casings,
 * epi-writing-features.
 */
@Component({
  selector: 'cadmus-epi-writing-part',
  templateUrl: './epi-writing-part.component.html',
  styleUrl: './epi-writing-part.component.scss',
})
export class EpiWritingPartComponent
  extends ModelEditorComponentBase<EpiWritingPart>
  implements OnInit
{
  private readonly _flagAdapter: FlagsPickerAdapter;
  private _featEntries?: ThesaurusEntry[];

  public system: FormControl<string | null>;
  public script: FormControl<string>;
  public casing: FormControl<string | null>;
  public features: FormControl<Flag[]>;
  public note: FormControl<string | null>;

  // thesauri entries
  // epi-writing-systems
  public systemEntries?: ThesaurusEntry[];
  // epi-writing-scripts
  public scriptEntries?: ThesaurusEntry[];
  // epi-writing-casings
  public casingEntries?: ThesaurusEntry[];
  // epi-writing-features
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
  // flags
  public featFlags$: Observable<Flag[]>;

  constructor(authService: AuthJwtService, formBuilder: FormBuilder) {
    super(authService, formBuilder);
    // flags
    this._flagAdapter = new FlagsPickerAdapter();
    this.featFlags$ = this._flagAdapter.selectFlags('features');
    // form
    this.system = formBuilder.control(null, Validators.maxLength(50));
    this.script = formBuilder.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    });
    this.casing = formBuilder.control(null, Validators.maxLength(50));
    this.features = formBuilder.control([], { nonNullable: true });
    this.note = formBuilder.control(null, Validators.maxLength(5000));
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      system: this.system,
      script: this.script,
      casing: this.casing,
      features: this.features,
      note: this.note,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'epi-writing-systems';
    if (this.hasThesaurus(key)) {
      this.systemEntries = thesauri[key].entries;
    } else {
      this.systemEntries = undefined;
    }
    key = 'epi-writing-scripts';
    if (this.hasThesaurus(key)) {
      this.scriptEntries = thesauri[key].entries;
    } else {
      this.scriptEntries = undefined;
    }
    key = 'epi-writing-casings';
    if (this.hasThesaurus(key)) {
      this.casingEntries = thesauri[key].entries;
    } else {
      this.casingEntries = undefined;
    }
    key = 'epi-writing-features';
    if (this.hasThesaurus(key)) {
      this.featEntries = thesauri[key].entries;
    } else {
      this.featEntries = undefined;
    }
  }

  private updateForm(part?: EpiWritingPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.system.setValue(part.system || null);
    this.script.setValue(part.script || '');
    this.casing.setValue(part.casing || null);
    this.features.setValue(
      this._flagAdapter.setSlotChecks('features', part.features || [])
    );
    this.note.setValue(part.note || null);

    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<EpiWritingPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  public onFeatFlagsChange(flags: Flag[]): void {
    this._flagAdapter.setSlotFlags('features', flags, true);
    this.features.setValue(flags);
    this.features.markAsDirty();
    this.features.updateValueAndValidity();
  }

  protected getValue(): EpiWritingPart {
    let part = this.getEditedPart(EPI_WRITING_PART_TYPEID) as EpiWritingPart;
    part.system = this.system.value?.trim() || undefined;
    part.script = this.script.value?.trim() || '';
    part.casing = this.casing.value?.trim() || undefined;
    part.features = this._flagAdapter.getOptionalCheckedFlagIds('features');
    part.note = this.note.value?.trim() || undefined;

    return part;
  }
}
