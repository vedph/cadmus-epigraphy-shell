import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  Validators,
  FormGroup,
  UntypedFormGroup,
} from '@angular/forms';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';
import { PhysicalSize } from '@myrmidon/cadmus-mat-physical-size';
import { EditedObject, ModelEditorComponentBase } from '@myrmidon/cadmus-ui';

import { EpiSupportPart, EPI_SUPPORT_PART_TYPEID } from '../epi-support-part';

/**
 * EpiSupport part editor component.
 * Thesauri: epi-support-functions, epi-support-object-types, epi-support-types,
 * epi-support-materials, epi-support-states, physical-size-units, physical-size-tags,
 * physical-size-dim-tags (all optional).
 */
@Component({
  selector: 'cadmus-gisarc-epi-support-part',
  templateUrl: './epi-support-part.component.html',
  styleUrls: ['./epi-support-part.component.css'],
})
export class EpiSupportPartComponent
  extends ModelEditorComponentBase<EpiSupportPart>
  implements OnInit
{
  public material: FormControl<string>;
  public originalFn: FormControl<string | null>;
  public currentFn: FormControl<string | null>;
  public objectType: FormControl<string | null>;
  public supportType: FormControl<string | null>;
  public indoor: FormControl<boolean>;
  public hasSize: FormControl<boolean>;
  public size: FormControl<PhysicalSize | null>;
  public state: FormControl<string | null>;
  public lastSeen: FormControl<Date | null>;

  public initialSize?: PhysicalSize;

  // epi-support-functions
  public fnEntries: ThesaurusEntry[] | undefined;
  // epi-support-object-types
  public objTypeEntries: ThesaurusEntry[] | undefined;
  // epi-support-types
  public supTypeEntries: ThesaurusEntry[] | undefined;
  // epi-support-materials
  public supMatEntries: ThesaurusEntry[] | undefined;
  // epi-support-states
  public supStateEntries: ThesaurusEntry[] | undefined;
  // size:
  // physical-size-units
  public szUnitEntries: ThesaurusEntry[] | undefined;
  // physical-size-tags
  public szTagEntries: ThesaurusEntry[] | undefined;
  // physical-size-dim-tags
  public szDimTagEntries: ThesaurusEntry[] | undefined;

  constructor(authService: AuthJwtService, formBuilder: FormBuilder) {
    super(authService, formBuilder);
    // form
    this.material = formBuilder.control('', {
      validators: [Validators.required, Validators.maxLength(50)],
      nonNullable: true,
    });
    this.originalFn = formBuilder.control(null, Validators.maxLength(50));
    this.currentFn = formBuilder.control(null, Validators.maxLength(50));
    this.objectType = formBuilder.control(null, Validators.maxLength(50));
    this.supportType = formBuilder.control(null, Validators.maxLength(50));
    this.indoor = formBuilder.control(false, { nonNullable: true });
    this.hasSize = formBuilder.control(false, { nonNullable: true });
    this.size = formBuilder.control(null);
    this.state = formBuilder.control(null, Validators.maxLength(1000));
    this.lastSeen = formBuilder.control(null);
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      originalFn: this.originalFn,
      currentFn: this.currentFn,
      objectType: this.objectType,
      supportType: this.supportType,
      isIndoor: this.indoor,
      material: this.material,
      hasSize: this.hasSize,
      size: this.size,
      state: this.state,
      lastSeen: this.lastSeen,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'epi-support-functions';
    if (this.hasThesaurus(key)) {
      this.fnEntries = thesauri[key].entries;
    } else {
      this.fnEntries = undefined;
    }
    key = 'epi-support-object-types';
    if (this.hasThesaurus(key)) {
      this.objTypeEntries = thesauri[key].entries;
    } else {
      this.objTypeEntries = undefined;
    }
    key = 'epi-support-types';
    if (this.hasThesaurus(key)) {
      this.supTypeEntries = thesauri[key].entries;
    } else {
      this.supTypeEntries = undefined;
    }
    key = 'epi-support-materials';
    if (this.hasThesaurus(key)) {
      this.supMatEntries = thesauri[key].entries;
    } else {
      this.supMatEntries = undefined;
    }
    key = 'epi-support-states';
    if (this.hasThesaurus(key)) {
      this.supStateEntries = thesauri[key].entries;
    } else {
      this.supStateEntries = undefined;
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
  }

  private getDefaultEntryId(
    entries: ThesaurusEntry[] | undefined
  ): string | null {
    return entries?.length ? entries[0].id : null;
  }

  private updateForm(part?: EpiSupportPart): void {
    if (!part) {
      this.form.reset();
      this.material.setValue(this.getDefaultEntryId(this.supMatEntries) || '');
      this.originalFn.setValue(this.getDefaultEntryId(this.fnEntries));
      this.currentFn.setValue(this.getDefaultEntryId(this.fnEntries));
      this.objectType.setValue(this.getDefaultEntryId(this.objTypeEntries));
      this.supportType.setValue(this.getDefaultEntryId(this.supTypeEntries));
      this.form.markAsPristine();
      return;
    }

    this.material.setValue(
      part.material || this.getDefaultEntryId(this.supMatEntries) || ''
    );
    this.originalFn.setValue(
      part.originalFn || this.getDefaultEntryId(this.fnEntries)
    );
    this.currentFn.setValue(
      part.currentFn || this.getDefaultEntryId(this.fnEntries)
    );
    this.objectType.setValue(
      part.objectType || this.getDefaultEntryId(this.objTypeEntries)
    );
    this.supportType.setValue(
      part.supportType || this.getDefaultEntryId(this.supTypeEntries)
    );
    this.indoor.setValue(part.indoor || false);
    this.initialSize = part.size;
    this.hasSize.setValue(part.size ? true : false);
    this.state.setValue(part.state || null);
    this.lastSeen.setValue(part.lastSeen || null);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<EpiSupportPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value || undefined);
  }

  public onSizeChange(size: PhysicalSize): void {
    this.size.setValue(size);
  }

  protected getValue(): EpiSupportPart {
    let part = this.getEditedPart(EPI_SUPPORT_PART_TYPEID) as EpiSupportPart;

    part.material = this.material.value?.trim();
    part.originalFn = this.originalFn.value?.trim();
    part.currentFn = this.currentFn.value?.trim();
    part.objectType = this.objectType.value?.trim();
    part.supportType = this.supportType.value?.trim();
    part.indoor = this.indoor.value || false;
    part.size = this.hasSize.value ? this.size.value || undefined : undefined;
    part.state = this.state.value?.trim();
    part.lastSeen = this.lastSeen.value || undefined;
    return part;
  }
}
