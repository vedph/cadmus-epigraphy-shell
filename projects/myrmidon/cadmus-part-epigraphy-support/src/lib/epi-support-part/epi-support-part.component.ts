import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  Validators,
  FormGroup,
  UntypedFormGroup,
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
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { TitleCasePipe } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';

import { FlatLookupPipe } from '@myrmidon/ngx-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import {
  PhysicalSize,
  PhysicalSizeComponent,
  PhysicalSizePipe,
} from '@myrmidon/cadmus-mat-physical-size';
import {
  DecoratedCount,
  DecoratedCountsComponent,
} from '@myrmidon/cadmus-refs-decorated-counts';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

import { DialogService } from '@myrmidon/ngx-mat-tools';
import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  CloseSaveButtonsComponent,
  EditedObject,
  ModelEditorComponentBase,
} from '@myrmidon/cadmus-ui';

import {
  EpiSupportPart,
  EPI_SUPPORT_PART_TYPEID,
  EpiTextArea,
} from '../epi-support-part';
import { EpiTextAreaComponent } from '../epi-text-area/epi-text-area.component';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

/**
 * EpiSupport part editor component.
 * Thesauri: epi-support-materials, epi-support-object-types,
 * epi-support-count-types, epi-support-count-tags, epi-support-features,
 * physical-size-units, physical-size-tags, physical-size-dim-tags.
 * epi-support-text-area-types, epi-support-text-area-layouts,
 * epi-support-text-area-features, epi-support-text-area-frame-types.
 */
@Component({
  selector: 'cadmus-epi-support-part',
  templateUrl: './epi-support-part.component.html',
  styleUrls: ['./epi-support-part.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIcon,
    MatCard,
    MatCardHeader,
    MatCardAvatar,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    MatTabGroup,
    MatTab,
    MatExpansionModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatError,
    MatInput,
    MatCheckbox,
    TitleCasePipe,
    PhysicalSizeComponent,
    DecoratedCountsComponent,
    FlagSetComponent,
    MatCardActions,
    CloseSaveButtonsComponent,
    EpiTextAreaComponent,
    FlatLookupPipe,
    PhysicalSizePipe
],
})
export class EpiSupportPartComponent
  extends ModelEditorComponentBase<EpiSupportPart>
  implements OnInit
{
  public editedArea?: EpiTextArea;
  public editedAreaIndex = -1;

  public material: FormControl<string>;
  public objectType: FormControl<string | null>;
  public features: FormControl<string[]>;
  public areas: FormControl<EpiTextArea[]>;
  public hasSize: FormControl<boolean>;
  public size: FormControl<PhysicalSize | null>;
  public counts: FormControl<DecoratedCount[]>;
  public note: FormControl<string | null>;

  // flags
  public featFlags: Flag[] = [];

  // epi-support-materials
  public matEntries?: ThesaurusEntry[];
  // epi-support-object-types
  public objTypeEntries?: ThesaurusEntry[];
  // epi-support-count-types
  public countTypeEntries?: ThesaurusEntry[];
  // epi-support-count-tags
  public countTagEntries?: ThesaurusEntry[];
  // epi-support-features
  public featEntries?: ThesaurusEntry[];

  // size:
  // physical-size-units
  public szUnitEntries: ThesaurusEntry[] | undefined;
  // physical-size-tags
  public szTagEntries: ThesaurusEntry[] | undefined;
  // physical-size-dim-tags
  public szDimTagEntries: ThesaurusEntry[] | undefined;

  // text areas:
  // epi-support-text-area-types
  public textAreaTypeEntries: ThesaurusEntry[] | undefined;
  // epi-support-text-area-layouts
  public textAreaLayoutEntries: ThesaurusEntry[] | undefined;
  // epi-support-text-area-features
  public textAreaFeatEntries: ThesaurusEntry[] | undefined;
  // epi-support-text-area-frame-types
  public textAreaFrameEntries: ThesaurusEntry[] | undefined;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    // form
    this.material = formBuilder.control<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    });
    this.objectType = formBuilder.control<string | null>(null, {
      validators: [Validators.maxLength(50)],
    });
    this.hasSize = formBuilder.control<boolean>(false, {
      nonNullable: true,
    });
    this.size = formBuilder.control<PhysicalSize | null>(null);
    this.counts = formBuilder.control<DecoratedCount[]>([], {
      nonNullable: true,
    });
    this.features = formBuilder.control<string[]>([], { nonNullable: true });
    this.areas = formBuilder.control<EpiTextArea[]>([], { nonNullable: true });
    this.note = formBuilder.control<string | null>(null, {
      validators: [Validators.maxLength(5000)],
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      material: this.material,
      objectType: this.objectType,
      hasSupportSize: this.hasSize,
      supportSize: this.size,
      counts: this.counts,
      features: this.features,
      areas: this.areas,
      note: this.note,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'epi-support-materials';
    if (this.hasThesaurus(key)) {
      this.matEntries = thesauri[key].entries;
    } else {
      this.matEntries = undefined;
    }
    key = 'epi-support-object-types';
    if (this.hasThesaurus(key)) {
      this.objTypeEntries = thesauri[key].entries;
    } else {
      this.objTypeEntries = undefined;
    }
    key = 'epi-support-count-types';
    if (this.hasThesaurus(key)) {
      this.countTypeEntries = thesauri[key].entries;
    } else {
      this.countTypeEntries = undefined;
    }
    key = 'epi-support-count-tags';
    if (this.hasThesaurus(key)) {
      this.countTagEntries = thesauri[key].entries;
    } else {
      this.countTagEntries = undefined;
    }
    key = 'epi-support-features';
    if (this.hasThesaurus(key)) {
      this.featEntries = thesauri[key].entries;
      this.featFlags = this.featEntries!.map(entryToFlag) || [];
    } else {
      this.featEntries = undefined;
      this.featFlags = [];
    }
    key = 'physical-size-units';
    if (this.hasThesaurus(key)) {
      this.szUnitEntries = thesauri[key].entries;
    } else {
      this.szUnitEntries = undefined;
    }
    key = 'physical-size-tags';
    if (this.hasThesaurus(key)) {
      this.szTagEntries = thesauri[key].entries;
    } else {
      this.szTagEntries = undefined;
    }
    key = 'physical-size-dim-tags';
    if (this.hasThesaurus(key)) {
      this.szDimTagEntries = thesauri[key].entries;
    } else {
      this.szDimTagEntries = undefined;
    }
    key = 'epi-support-text-area-types';
    if (this.hasThesaurus(key)) {
      this.textAreaTypeEntries = thesauri[key].entries;
    } else {
      this.textAreaTypeEntries = undefined;
    }
    key = 'epi-support-text-area-layouts';
    if (this.hasThesaurus(key)) {
      this.textAreaLayoutEntries = thesauri[key].entries;
    } else {
      this.textAreaLayoutEntries = undefined;
    }
    key = 'epi-support-text-area-features';
    if (this.hasThesaurus(key)) {
      this.textAreaFeatEntries = thesauri[key].entries;
    } else {
      this.textAreaFeatEntries = undefined;
    }
    key = 'epi-support-text-area-frame-types';
    if (this.hasThesaurus(key)) {
      this.textAreaFrameEntries = thesauri[key].entries;
    } else {
      this.textAreaFrameEntries = undefined;
    }
  }

  private updateForm(part?: EpiSupportPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }

    this.material.setValue(part.material || '');
    this.objectType.setValue(part.objectType || null);
    this.hasSize.setValue(!!part.size);
    this.size.setValue(part.size || null);
    this.counts.setValue(part.counts || []);
    this.features.setValue(part.features || []);
    this.areas.setValue(part.textAreas || []);
    this.note.setValue(part.note || null);

    this.form.markAsPristine();
  }

  public onFeatIdsChange(ids: string[]): void {
    this.features.setValue(ids);
    this.features.markAsDirty();
    this.features.updateValueAndValidity();
  }

  public onSupportSizeChange(size: PhysicalSize): void {
    this.size.setValue(size);
    this.size.markAsDirty();
    this.size.updateValueAndValidity();
  }

  public onCountsChange(counts: DecoratedCount[]): void {
    this.counts.setValue(counts);
    this.counts.markAsDirty();
    this.counts.updateValueAndValidity();
  }

  protected override onDataSet(data?: EditedObject<EpiSupportPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): EpiSupportPart {
    let part = this.getEditedPart(EPI_SUPPORT_PART_TYPEID) as EpiSupportPart;

    part.material = this.material.value?.trim();
    part.objectType = this.objectType.value?.trim();
    part.size =
      this.hasSize.value && this.size.value ? this.size.value : undefined;
    part.counts = this.counts.value || undefined;
    part.features = this.features.value || undefined;
    part.textAreas = this.areas.value?.length
      ? this.areas.value || undefined
      : undefined;
    part.note = this.note.value?.trim() || undefined;

    return part;
  }

  public addArea(): void {
    const entry: EpiTextArea = {
      type: this.textAreaTypeEntries?.length
        ? this.textAreaTypeEntries[0].id
        : '',
    };
    this.editArea(entry, -1);
  }

  public editArea(entry: EpiTextArea, index: number): void {
    this.editedAreaIndex = index;
    this.editedArea = entry;
  }

  public closeArea(): void {
    this.editedAreaIndex = -1;
    this.editedArea = undefined;
  }

  public saveArea(entry: EpiTextArea): void {
    const areas = [...this.areas.value];
    if (this.editedAreaIndex === -1) {
      areas.push(entry);
    } else {
      areas.splice(this.editedAreaIndex, 1, entry);
    }
    this.areas.setValue(areas);
    this.areas.markAsDirty();
    this.areas.updateValueAndValidity();
    this.closeArea();
  }

  public deleteArea(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete area?')
      .subscribe((yes: boolean | undefined) => {
        if (yes) {
          if (this.editedAreaIndex === index) {
            this.closeArea();
          }
          const entries = [...this.areas.value];
          entries.splice(index, 1);
          this.areas.setValue(entries);
          this.areas.markAsDirty();
          this.areas.updateValueAndValidity();
        }
      });
  }

  public moveAreaUp(index: number): void {
    if (index < 1) {
      return;
    }
    const area = this.areas.value[index];
    const areas = [...this.areas.value];
    areas.splice(index, 1);
    areas.splice(index - 1, 0, area);
    this.areas.setValue(areas);
    this.areas.markAsDirty();
    this.areas.updateValueAndValidity();
  }

  public moveAreaDown(index: number): void {
    if (index + 1 >= this.areas.value.length) {
      return;
    }
    const area = this.areas.value[index];
    const areas = [...this.areas.value];
    areas.splice(index, 1);
    areas.splice(index + 1, 0, area);
    this.areas.setValue(areas);
    this.areas.markAsDirty();
    this.areas.updateValueAndValidity();
  }
}
