import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';
import { EditedObject, ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { Flag, FlagsPickerAdapter } from '@myrmidon/cadmus-ui-flags-picker';
import { NgxToolsValidators } from '@myrmidon/ngx-tools';
import { Observable } from 'rxjs';
import { EpiLigaturesFragment } from '../epi-ligatures-fragment';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

/**
 * EpiLigatures fragment editor component.
 * Thesauri: epi-ligature-types.
 */
@Component({
  selector: 'cadmus-epi-ligatures-fragment',
  templateUrl: './epi-ligatures-fragment.component.html',
  styleUrls: ['./epi-ligatures-fragment.component.css'],
  standalone: false,
})
export class EpiLigaturesFragmentComponent
  extends ModelEditorComponentBase<EpiLigaturesFragment>
  implements OnInit
{
  private readonly _flagAdapter: FlagsPickerAdapter;
  private _typeEntries: ThesaurusEntry[];

  public types: FormControl<Flag[]>;
  public eid: FormControl<string | null>;
  public groupId: FormControl<string | null>;
  public note: FormControl<string | null>;

  public set typeEntries(value: ThesaurusEntry[] | undefined | null) {
    if (this._typeEntries === value) {
      return;
    }
    this._typeEntries = value || [];
    this._typeEntries = value || [];
    this._flagAdapter.setSlotFlags('types', this._typeEntries.map(entryToFlag));
  }
  public get typeEntries(): ThesaurusEntry[] | undefined | null {
    return this._typeEntries;
  }

  // flags
  public typeFlags$: Observable<Flag[]>;

  constructor(authService: AuthJwtService, formBuilder: FormBuilder) {
    super(authService, formBuilder);
    // flags
    this._typeEntries = [];
    this._flagAdapter = new FlagsPickerAdapter();
    this.typeFlags$ = this._flagAdapter.selectFlags('types');
    // form
    this.types = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.eid = formBuilder.control(null, Validators.maxLength(500));
    this.groupId = formBuilder.control(null, Validators.maxLength(100));
    this.note = formBuilder.control(null, Validators.maxLength(1000));
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      types: this.types,
      eid: this.eid,
      groupId: this.groupId,
      note: this.note,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    const key = 'epi-ligature-types';
    if (this.hasThesaurus(key)) {
      this.typeEntries = thesauri[key].entries;
    } else {
      this.typeEntries = undefined;
    }
  }

  private updateForm(fr?: EpiLigaturesFragment | null): void {
    if (!fr) {
      this.form.reset();
      return;
    }

    this._flagAdapter.setSlotChecks('types', fr.types);
    this.eid.setValue(fr.eid || null);
    this.groupId.setValue(fr.groupId || null);
    this.note.setValue(fr.note || null);
    this.form.markAsPristine();
  }

  public onTypeFlagsChange(flags: Flag[]): void {
    this._flagAdapter.setSlotFlags('types', flags, true);
    this.types.setValue(flags);
    this.types.markAsDirty();
    this.types.updateValueAndValidity();
  }

  protected override onDataSet(
    data?: EditedObject<EpiLigaturesFragment>
  ): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): EpiLigaturesFragment {
    const fr = this.getEditedFragment() as EpiLigaturesFragment;

    fr.types = this._flagAdapter.getCheckedFlagIds('types');
    fr.eid = this.eid.value?.trim();
    fr.groupId = this.groupId.value?.trim();
    fr.note = this.note.value?.trim();

    return fr;
  }
}
