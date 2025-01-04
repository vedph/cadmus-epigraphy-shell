import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NgxToolsValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import {
  CloseSaveButtonsComponent,
  EditedObject,
  ModelEditorComponentBase,
} from '@myrmidon/cadmus-ui';
import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';
import { PhysicalSizePipe } from '@myrmidon/cadmus-mat-physical-size';

import {
  EPI_SUPPORT_FRR_PART_TYPEID,
  EpiSupportFr,
  EpiSupportFrrPart,
} from '../epi-support-frr-part';
import { EpiSupportFrComponent } from '../epi-support-fr/epi-support-fr.component';

/**
 * EpiSupportFrrPart editor component.
 * Thesauri: physical-size-units, physical-size-tags, physical-size-dim-tags.
 */
@Component({
  selector: 'cadmus-epi-support-frr-part',
  imports: [
    CommonModule,
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    PhysicalSizePipe,
    EpiSupportFrComponent,
    CloseSaveButtonsComponent
  ],
  templateUrl: './epi-support-frr-part.component.html',
  styleUrl: './epi-support-frr-part.component.scss',
})
export class EpiSupportFrrPartComponent
  extends ModelEditorComponentBase<EpiSupportFrrPart>
  implements OnInit
{
  private _editedIndex: number;

  public edited: EpiSupportFr | undefined;

  // physical-size-units
  public unitEntries?: ThesaurusEntry[];

  // physical-size-tags
  public tagEntries?: ThesaurusEntry[];

  // physical-size-dim-tags
  public dimTagEntries?: ThesaurusEntry[];

  public fragments: FormControl<EpiSupportFr[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    this._editedIndex = -1;
    // form
    this.fragments = formBuilder.control([], {
      // at least 1 entry
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      entries: this.fragments,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'physical-size-units';
    if (this.hasThesaurus(key)) {
      this.unitEntries = thesauri[key].entries;
    } else {
      this.unitEntries = undefined;
    }

    key = 'physical-size-tags';
    if (this.hasThesaurus(key)) {
      this.tagEntries = thesauri[key].entries;
    } else {
      this.tagEntries = undefined;
    }

    key = 'physical-size-dim-tags';
    if (this.hasThesaurus(key)) {
      this.dimTagEntries = thesauri[key].entries;
    } else {
      this.dimTagEntries = undefined;
    }
  }

  private updateForm(part?: EpiSupportFrrPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.fragments.setValue(part.fragments || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<EpiSupportFrrPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): EpiSupportFrrPart {
    let part = this.getEditedPart(
      EPI_SUPPORT_FRR_PART_TYPEID
    ) as EpiSupportFrrPart;
    part.fragments = this.fragments.value || [];
    return part;
  }

  public addFr(): void {
    const fr: EpiSupportFr = {
      id: '',
    };
    this.editFr(fr, -1);
  }

  public editFr(entry: EpiSupportFr, index: number): void {
    this._editedIndex = index;
    this.edited = entry;
  }

  public closeFr(): void {
    this._editedIndex = -1;
    this.edited = undefined;
  }

  public saveFr(fr: EpiSupportFr): void {
    const fragments = [...this.fragments.value];

    // if fr.id already exists, replace it
    const i = fragments.findIndex((f) => f.id === fr.id);
    if (i > -1) {
      this._editedIndex = i;
    }

    if (this._editedIndex === -1) {
      fragments.push(fr);
    } else {
      fragments.splice(this._editedIndex, 1, fr);
    }
    this.fragments.setValue(fragments);
    this.fragments.markAsDirty();
    this.fragments.updateValueAndValidity();
    this.closeFr();
  }

  public deleteFr(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete fragment?')
      .subscribe((yes: boolean | undefined) => {
        if (yes) {
          if (this._editedIndex === index) {
            this.closeFr();
          }
          const fragments = [...this.fragments.value];
          fragments.splice(index, 1);
          this.fragments.setValue(fragments);
          this.fragments.markAsDirty();
          this.fragments.updateValueAndValidity();
        }
      });
  }

  public moveFrUp(index: number): void {
    if (index < 1) {
      return;
    }
    const fr = this.fragments.value[index];
    const fragments = [...this.fragments.value];
    fragments.splice(index, 1);
    fragments.splice(index - 1, 0, fr);
    this.fragments.setValue(fragments);
    this.fragments.markAsDirty();
    this.fragments.updateValueAndValidity();
  }

  public moveFrDown(index: number): void {
    if (index + 1 >= this.fragments.value.length) {
      return;
    }
    const fr = this.fragments.value[index];
    const fragments = [...this.fragments.value];
    fragments.splice(index, 1);
    fragments.splice(index + 1, 0, fr);
    this.fragments.setValue(fragments);
    this.fragments.markAsDirty();
    this.fragments.updateValueAndValidity();
  }
}
