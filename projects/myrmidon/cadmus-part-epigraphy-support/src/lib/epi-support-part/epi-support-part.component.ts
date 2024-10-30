import { Component, Input, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  Validators,
  FormGroup,
  UntypedFormGroup,
} from '@angular/forms';
import { Observable } from 'rxjs';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';
import { EditedObject, ModelEditorComponentBase } from '@myrmidon/cadmus-ui';

import { PhysicalSize } from '@myrmidon/cadmus-mat-physical-size';
import { DecoratedCount } from '@myrmidon/cadmus-refs-decorated-counts';
import { Flag, FlagsPickerAdapter } from '@myrmidon/cadmus-ui-flags-picker';

import { EpiSupportPart, EPI_SUPPORT_PART_TYPEID } from '../epi-support-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

/**
 * EpiSupport part editor component.
 * Thesauri: epi-support-materials, epi-support-functions, epi-support-types,
 * epi-support-object-types, epi-support-count-types, epi-support-features,
 * physical-size-units, physical-size-tags, physical-size-dim-tags.
 * decorated-count-ids, decorated-count-tags.
 */
@Component({
  selector: 'cadmus-epi-support-part',
  templateUrl: './epi-support-part.component.html',
  styleUrls: ['./epi-support-part.component.scss'],
})
export class EpiSupportPartComponent
  extends ModelEditorComponentBase<EpiSupportPart>
  implements OnInit
{
  private readonly _flagAdapter: FlagsPickerAdapter;
  private _featEntries?: ThesaurusEntry[];

  public material: FormControl<string>;
  public originalFn: FormControl<string | null>;
  public currentFn: FormControl<string | null>;
  public originalType: FormControl<string | null>;
  public currentType: FormControl<string | null>;
  public objectType: FormControl<string | null>;
  public indoor: FormControl<boolean>;
  public hasSupportSize: FormControl<boolean>;
  public supportSize: FormControl<PhysicalSize | null>;
  public hasField: FormControl<boolean>;
  public fieldSize: FormControl<PhysicalSize | null>;
  public hasMirror: FormControl<boolean>;
  public mirrorSize: FormControl<PhysicalSize | null>;
  public hasFrame: FormControl<boolean>;
  public frame: FormControl<string | null>;
  public counts: FormControl<DecoratedCount[]>;
  public features: FormControl<Flag[]>;
  public hasDamnatio: FormControl<boolean>;
  public note: FormControl<string | null>;

  // flags
  public featFlags$: Observable<Flag[]>;

  // epi-support-materials
  public matEntries?: ThesaurusEntry[];
  // epi-support-functions
  public fnEntries?: ThesaurusEntry[];
  // epi-support-types
  public typeEntries?: ThesaurusEntry[];
  // epi-support-object-types
  public objTypeEntries?: ThesaurusEntry[];
  // epi-support-count-types
  public countTypeEntries?: ThesaurusEntry[];

  // epi-support-features
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

  // size:
  // physical-size-units
  public szUnitEntries: ThesaurusEntry[] | undefined;
  // physical-size-tags
  public szTagEntries: ThesaurusEntry[] | undefined;
  // physical-size-dim-tags
  public szDimTagEntries: ThesaurusEntry[] | undefined;

  // counts:
  // decorated-count-ids
  public countIdEntries: ThesaurusEntry[] | undefined;
  // decirated-count-tags
  public countTagEntries: ThesaurusEntry[] | undefined;

  constructor(authService: AuthJwtService, formBuilder: FormBuilder) {
    super(authService, formBuilder);
    // flags
    this._flagAdapter = new FlagsPickerAdapter();
    this.featFlags$ = this._flagAdapter.selectFlags('features');
    // form
    this.material = formBuilder.control<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    });
    this.originalFn = formBuilder.control<string | null>(null, {
      validators: [Validators.maxLength(50)],
    });
    this.currentFn = formBuilder.control<string | null>(null, {
      validators: [Validators.maxLength(50)],
    });
    this.originalType = formBuilder.control<string | null>(null, {
      validators: [Validators.maxLength(50)],
    });
    this.currentType = formBuilder.control<string | null>(null, {
      validators: [Validators.maxLength(50)],
    });
    this.objectType = formBuilder.control<string | null>(null, {
      validators: [Validators.maxLength(50)],
    });
    this.indoor = formBuilder.control<boolean>(false, { nonNullable: true });
    this.hasSupportSize = formBuilder.control<boolean>(false, {
      nonNullable: true,
    });
    this.supportSize = formBuilder.control<PhysicalSize | null>(null);
    this.hasField = formBuilder.control<boolean>(false, { nonNullable: true });
    this.fieldSize = formBuilder.control<PhysicalSize | null>(null);
    this.hasMirror = formBuilder.control<boolean>(false, { nonNullable: true });
    this.mirrorSize = formBuilder.control<PhysicalSize | null>(null);
    this.hasFrame = formBuilder.control<boolean>(false, { nonNullable: true });
    this.frame = formBuilder.control<string | null>(null, {
      validators: [Validators.maxLength(5000)],
    });
    this.counts = formBuilder.control<DecoratedCount[]>([], {
      nonNullable: true,
    });
    this.features = formBuilder.control<Flag[]>([], { nonNullable: true });
    this.hasDamnatio = formBuilder.control<boolean>(false, {
      nonNullable: true,
    });
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
      originalFn: this.originalFn,
      currentFn: this.currentFn,
      originalType: this.originalType,
      currentType: this.currentType,
      objectType: this.objectType,
      indoor: this.indoor,
      hasSupportSize: this.hasSupportSize,
      supportSize: this.supportSize,
      hasField: this.hasField,
      fieldSize: this.fieldSize,
      hasMirror: this.hasMirror,
      mirrorSize: this.mirrorSize,
      hasFrame: this.hasFrame,
      frame: this.frame,
      counts: this.counts,
      features: this.features,
      hasDamnatio: this.hasDamnatio,
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
    key = 'epi-support-functions';
    if (this.hasThesaurus(key)) {
      this.fnEntries = thesauri[key].entries;
    } else {
      this.fnEntries = undefined;
    }
    key = 'epi-support-types';
    if (this.hasThesaurus(key)) {
      this.typeEntries = thesauri[key].entries;
    } else {
      this.typeEntries = undefined;
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
    key = 'epi-support-features';
    if (this.hasThesaurus(key)) {
      this.featEntries = thesauri[key].entries;
    } else {
      this.featEntries = undefined;
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
    key = 'decorated-count-ids';
    if (this.hasThesaurus(key)) {
      this.countIdEntries = thesauri[key].entries;
    } else {
      this.countIdEntries = undefined;
    }
    key = 'decorated-count-tags';
    if (this.hasThesaurus(key)) {
      this.countTagEntries = thesauri[key].entries;
    } else {
      this.countTagEntries = undefined;
    }
  }

  private updateForm(part?: EpiSupportPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }

    this.material.setValue(part.material || '');
    this.originalFn.setValue(part.originalFn || null);
    this.currentFn.setValue(part.currentFn || null);
    this.originalType.setValue(part.originalType || null);
    this.currentType.setValue(part.currentType || null);
    this.objectType.setValue(part.objectType || null);
    this.indoor.setValue(part.indoor || false);
    this.hasSupportSize.setValue(!!part.supportSize);
    this.supportSize.setValue(part.supportSize || null);
    this.hasField.setValue(!!part.fieldSize);
    this.fieldSize.setValue(part.fieldSize || null);
    this.hasMirror.setValue(!!part.mirrorSize);
    this.mirrorSize.setValue(part.mirrorSize || null);
    this.hasFrame.setValue(!!part.frame);
    this.frame.setValue(part.frame || null);
    this.counts.setValue(part.counts || []);
    this.features.setValue(
      this._flagAdapter.setSlotChecks('features', part.features || [])
    );
    this.hasDamnatio.setValue(!!part.hasDamnatio);
    this.note.setValue(part.note || null);

    this.form.markAsPristine();
  }

  public onFeatFlagsChange(flags: Flag[]): void {
    this._flagAdapter.setSlotFlags('features', flags, true);
    this.features.setValue(flags);
    this.features.markAsDirty();
    this.features.updateValueAndValidity();
  }

  public onSupportSizeChange(size: PhysicalSize): void {
    this.supportSize.setValue(size);
    this.supportSize.markAsDirty();
    this.supportSize.updateValueAndValidity();
  }

  public onFieldSizeChange(size: PhysicalSize): void {
    this.fieldSize.setValue(size);
    this.fieldSize.markAsDirty();
    this.fieldSize.updateValueAndValidity();
  }

  public onMirrorSizeChange(size: PhysicalSize): void {
    this.mirrorSize.setValue(size);
    this.mirrorSize.markAsDirty();
    this.mirrorSize.updateValueAndValidity();
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
    part.originalFn = this.originalFn.value?.trim();
    part.currentFn = this.currentFn.value?.trim();
    part.originalType = this.originalType.value?.trim();
    part.currentType = this.currentType.value?.trim();
    part.objectType = this.objectType.value?.trim();
    part.indoor = this.indoor.value;
    part.supportSize =
      this.hasSupportSize.value && this.supportSize.value
        ? this.supportSize.value
        : undefined;
    part.hasField = this.hasField.value;
    part.fieldSize =
      this.hasField.value && this.fieldSize.value
        ? this.fieldSize.value
        : undefined;
    part.hasMirror = this.hasMirror.value;
    part.mirrorSize =
      this.hasMirror.value && this.mirrorSize.value
        ? this.mirrorSize.value
        : undefined;
    part.hasFrame = this.hasFrame.value;
    part.frame = this.frame.value?.trim() || undefined;
    part.counts = this.counts.value || undefined;
    part.features = this._flagAdapter.getOptionalCheckedFlagIds('features');
    part.hasDamnatio = this.hasDamnatio.value;
    part.note = this.note.value?.trim() || undefined;

    return part;
  }
}
