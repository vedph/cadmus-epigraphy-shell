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
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NgToolsModule, NgToolsValidators } from '@myrmidon/ng-tools';
import { DialogService } from '@myrmidon/ng-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import {
  CadmusUiModule,
  EditedObject,
  ModelEditorComponentBase,
} from '@myrmidon/cadmus-ui';
import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  EPI_SIGNS_PART_TYPEID,
  EpiSign,
  EpiSignsPart,
} from '../epi-signs-part';
import { EpiSignComponent } from '../epi-sign/epi-sign.component';

/**
 * EpiSignsPart editor component.
 * Thesauri: epi-signs-measure-names, physical-size-units, physical-size-dim-tags,
 * epi-signs-features (all optional).
 */
@Component({
  selector: 'cadmus-epi-signs-part',
  standalone: true,
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
    MatTabsModule,
    MatTooltipModule,
    NgToolsModule,
    CadmusUiModule,
    EpiSignComponent,
  ],
  templateUrl: './epi-signs-part.component.html',
  styleUrl: './epi-signs-part.component.scss',
})
export class EpiSignsPartComponent
  extends ModelEditorComponentBase<EpiSignsPart>
  implements OnInit
{
  private _editedIndex: number;

  public tabIndex: number;
  public edited: EpiSign | undefined;

  // epi-signs-measure-names
  public measNameEntries?: ThesaurusEntry[];
  // physical-size-units
  public measUnitEntries?: ThesaurusEntry[];
  // physical-size-dim-tags
  public measDimTagEntries?: ThesaurusEntry[];
  // epi-signs-features
  public featEntries?: ThesaurusEntry[];

  public signs: FormControl<EpiSign[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    this._editedIndex = -1;
    this.tabIndex = 0;
    // form
    this.signs = formBuilder.control([], {
      // at least 1 entry
      validators: NgToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      entries: this.signs,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'epi-signs-measure-names';
    if (this.hasThesaurus(key)) {
      this.measNameEntries = thesauri[key].entries;
    } else {
      this.measNameEntries = undefined;
    }

    key = 'physical-size-units';
    if (this.hasThesaurus(key)) {
      this.measUnitEntries = thesauri[key].entries;
    } else {
      this.measUnitEntries = undefined;
    }

    key = 'physical-size-dim-tags';
    if (this.hasThesaurus(key)) {
      this.measDimTagEntries = thesauri[key].entries;
    } else {
      this.measDimTagEntries = undefined;
    }

    key = 'epi-signs-features';
    if (this.hasThesaurus(key)) {
      this.featEntries = thesauri[key].entries;
    } else {
      this.featEntries = undefined;
    }
  }

  private updateForm(part?: EpiSignsPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.signs.setValue(part.signs || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<EpiSignsPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): EpiSignsPart {
    let part = this.getEditedPart(EPI_SIGNS_PART_TYPEID) as EpiSignsPart;
    part.signs = this.signs.value || [];
    return part;
  }

  public addSign(): void {
    const sign: EpiSign = {
      id: '',
    };
    this.editSign(sign, -1);
  }

  public editSign(entry: EpiSign, index: number): void {
    this._editedIndex = index;
    this.edited = entry;
    setTimeout(() => {
      this.tabIndex = 1;
    });
  }

  public closeSign(): void {
    this._editedIndex = -1;
    this.edited = undefined;
    setTimeout(() => {
      this.tabIndex = 0;
    });
  }

  public saveSign(sign: EpiSign): void {
    const signs = [...this.signs.value];

    // if fr.id already exists, replace it
    const i = signs.findIndex((s) => s.id === sign.id);
    if (i > -1) {
      this._editedIndex = i;
    }

    if (this._editedIndex === -1) {
      signs.push(sign);
    } else {
      signs.splice(this._editedIndex, 1, sign);
    }
    this.signs.setValue(signs);
    this.signs.markAsDirty();
    this.signs.updateValueAndValidity();
    this.closeSign();
  }

  public deleteSign(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete sign?')
      .subscribe((yes: boolean | undefined) => {
        if (yes) {
          if (this._editedIndex === index) {
            this.closeSign();
          }
          const entries = [...this.signs.value];
          entries.splice(index, 1);
          this.signs.setValue(entries);
          this.signs.markAsDirty();
          this.signs.updateValueAndValidity();
        }
      });
  }

  public moveSignUp(index: number): void {
    if (index < 1) {
      return;
    }
    const sign = this.signs.value[index];
    const signs = [...this.signs.value];
    signs.splice(index, 1);
    signs.splice(index - 1, 0, sign);
    this.signs.setValue(signs);
    this.signs.markAsDirty();
    this.signs.updateValueAndValidity();
  }

  public moveSignDown(index: number): void {
    if (index + 1 >= this.signs.value.length) {
      return;
    }
    const sign = this.signs.value[index];
    const signs = [...this.signs.value];
    signs.splice(index, 1);
    signs.splice(index + 1, 0, sign);
    this.signs.setValue(signs);
    this.signs.markAsDirty();
    this.signs.updateValueAndValidity();
  }
}
