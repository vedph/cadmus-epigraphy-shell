import { Component, computed, OnInit, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  UntypedFormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  MatCard,
  MatCardHeader,
  MatCardAvatar,
  MatCardTitle,
  MatCardContent,
  MatCardActions,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

import { NgxToolsValidators } from '@myrmidon/ngx-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';
import {
  ThesauriSet,
  ThesaurusEntry,
  EditedObject,
} from '@myrmidon/cadmus-core';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
} from '@myrmidon/cadmus-ui';

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
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCard,
    MatCardHeader,
    MatCardAvatar,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    FlagSetComponent,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatCardActions,
    TitleCasePipe,
    CloseSaveButtonsComponent,
  ],
})
export class EpiLigaturesFragmentComponent
  extends ModelEditorComponentBase<EpiLigaturesFragment>
  implements OnInit
{
  public types: FormControl<string[]>;
  public eid: FormControl<string | null>;
  public groupId: FormControl<string | null>;
  public note: FormControl<string | null>;

  // epi-ligature-types
  public readonly typeEntries = signal<ThesaurusEntry[] | undefined>(undefined);

  public readonly typeFlags = computed<Flag[]>(
    () => this.typeEntries()?.map(entryToFlag) ?? []
  );

  constructor(authService: AuthJwtService, formBuilder: FormBuilder) {
    super(authService, formBuilder);
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
      this.typeEntries.set(thesauri[key].entries);
    } else {
      this.typeEntries.set(undefined);
    }
  }

  private updateForm(fr?: EpiLigaturesFragment | null): void {
    if (!fr) {
      this.form.reset();
      return;
    }

    this.types.setValue(fr.types || []);
    this.eid.setValue(fr.eid || null);
    this.groupId.setValue(fr.groupId || null);
    this.note.setValue(fr.note || null);
    this.form.markAsPristine();
  }

  public onTypeIdsChange(ids: string[]): void {
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
