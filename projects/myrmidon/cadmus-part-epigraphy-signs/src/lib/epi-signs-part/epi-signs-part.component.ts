import { Component, OnInit, signal } from '@angular/core';
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

import { deepCopy, EllipsisPipe, NgxToolsValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import {
  CloseSaveButtonsComponent,
  ModelEditorComponentBase,
} from '@myrmidon/cadmus-ui';
import {
  ThesauriSet,
  ThesaurusEntry,
  EditedObject,
} from '@myrmidon/cadmus-core';

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
    EllipsisPipe,
    EpiSignComponent,
    CloseSaveButtonsComponent,
  ],
  templateUrl: './epi-signs-part.component.html',
  styleUrl: './epi-signs-part.component.scss',
})
export class EpiSignsPartComponent
  extends ModelEditorComponentBase<EpiSignsPart>
  implements OnInit
{
  public edited = signal<EpiSign | undefined>(undefined);
  public editedIndex = signal<number>(-1);

  // epi-signs-measure-names
  public readonly measNameEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // physical-size-units
  public readonly measUnitEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // physical-size-dim-tags
  public readonly measDimTagEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // epi-signs-features
  public readonly featEntries = signal<ThesaurusEntry[] | undefined>(undefined);

  public signs: FormControl<EpiSign[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    // form
    this.signs = formBuilder.control([], {
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
      entries: this.signs,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'epi-signs-measure-names';
    if (this.hasThesaurus(key)) {
      this.measNameEntries.set(thesauri[key].entries);
    } else {
      this.measNameEntries.set(undefined);
    }

    key = 'physical-size-units';
    if (this.hasThesaurus(key)) {
      this.measUnitEntries.set(thesauri[key].entries);
    } else {
      this.measUnitEntries.set(undefined);
    }

    key = 'physical-size-dim-tags';
    if (this.hasThesaurus(key)) {
      this.measDimTagEntries.set(thesauri[key].entries);
    } else {
      this.measDimTagEntries.set(undefined);
    }

    key = 'epi-signs-features';
    if (this.hasThesaurus(key)) {
      this.featEntries.set(thesauri[key].entries);
    } else {
      this.featEntries.set(undefined);
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
    this.editedIndex.set(index);
    this.edited.set(deepCopy(entry));
  }

  public closeSign(): void {
    this.editedIndex.set(-1);
    this.edited.set(undefined);
  }

  public saveSign(sign: EpiSign): void {
    const signs = [...this.signs.value];

    // if fr.id already exists, replace it
    const i = signs.findIndex((s) => s.id === sign.id);
    if (i > -1) {
      this.editedIndex.set(i);
    }

    if (this.editedIndex() === -1) {
      signs.push(sign);
    } else {
      signs.splice(this.editedIndex(), 1, sign);
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
          if (this.editedIndex() === index) {
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
