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
import { Flag } from '@myrmidon/cadmus-ui-flags-picker';
import { NgToolsValidators } from '@myrmidon/ng-tools';
import { EpiLigaturesFragment } from '../epi-ligatures-fragment';

/**
 * EpiLigatures fragment editor component.
 * Thesauri: epi-ligature-types.
 */
@Component({
  selector: 'cadmus-epi-ligatures-fragment',
  templateUrl: './epi-ligatures-fragment.component.html',
  styleUrls: ['./epi-ligatures-fragment.component.css'],
})
export class EpiLigaturesFragmentComponent
  extends ModelEditorComponentBase<EpiLigaturesFragment>
  implements OnInit
{
  public types: FormControl<string[]>;
  public eid: FormControl<string | null>;
  public groupId: FormControl<string | null>;
  public note: FormControl<string | null>;

  public typeEntries: ThesaurusEntry[] | undefined;
  public typeFlags: Flag[];
  public initialTypes: string[];

  constructor(authService: AuthJwtService, formBuilder: FormBuilder) {
    super(authService, formBuilder);
    this.typeFlags = [];
    this.initialTypes = [];
    // form
    this.types = formBuilder.control([], {
      validators: NgToolsValidators.strictMinLengthValidator(1),
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
      this.typeFlags =
        this.typeEntries?.map((e) => {
          return {
            id: e.id,
            label: e.value,
          } as Flag;
        }) || [];
    } else {
      this.typeEntries = undefined;
      this.typeFlags = [];
    }
  }

  private updateForm(fr?: EpiLigaturesFragment | null): void {
    if (!fr) {
      this.form.reset();
      return;
    }

    this.initialTypes = fr.types;
    this.eid.setValue(fr.eid || null);
    this.groupId.setValue(fr.groupId || null);
    this.note.setValue(fr.note || null);
    this.form.markAsPristine();
  }

  public onIdsChange(ids: string[]): void {
    this.types.setValue(ids);
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

    fr.types = this.types.value;
    fr.eid = this.eid.value?.trim();
    fr.groupId = this.groupId.value?.trim();
    fr.note = this.note.value?.trim();

    return fr;
  }
}
