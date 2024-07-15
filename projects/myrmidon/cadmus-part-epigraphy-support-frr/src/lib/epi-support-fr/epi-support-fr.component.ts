import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import {
  PhysicalSize,
  PhysicalSizeComponent,
} from '@myrmidon/cadmus-mat-physical-size';
import {
  ExcelColumnPipe,
  PhysicalGridCoordsService,
  PhysicalGridLocation,
  PhysicalGridLocationComponent,
} from '@myrmidon/cadmus-mat-physical-grid';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { EpiSupportFr, EpiSupportFrCellMapping } from '../epi-support-frr-part';
import { EpiSupportFrCellMappingComponent } from '../epi-support-fr-cell-mapping/epi-support-fr-cell-mapping.component';

@Component({
  selector: 'cadmus-epi-support-fr',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    PhysicalSizeComponent,
    ExcelColumnPipe,
    PhysicalGridLocationComponent,
    EpiSupportFrCellMappingComponent,
  ],
  templateUrl: './epi-support-fr.component.html',
  styleUrl: './epi-support-fr.component.scss',
})
export class EpiSupportFrComponent {
  private readonly _excelColumnPipe: ExcelColumnPipe = new ExcelColumnPipe();
  private _fragment?: EpiSupportFr;
  private _gridPresetEntries?: ThesaurusEntry[];

  @Input()
  public get fragment(): EpiSupportFr | undefined | null {
    return this._fragment;
  }
  public set fragment(value: EpiSupportFr | undefined | null) {
    if (this._fragment !== value) {
      this._fragment = value || undefined;
      this.updateForm(value);
    }
  }

  // physical-size-units
  @Input()
  public unitEntries?: ThesaurusEntry[];

  // physical-size-tags
  @Input()
  public tagEntries?: ThesaurusEntry[];

  // physical-size-dim-tags
  @Input()
  public dimTagEntries?: ThesaurusEntry[];

  // physical-grid-presets
  @Input()
  public get gridPresetEntries(): ThesaurusEntry[] | undefined {
    return this._gridPresetEntries;
  }
  public set gridPresetEntries(value: ThesaurusEntry[] | undefined) {
    this._gridPresetEntries = value;
    this.gridPresets = value?.map((e) => e.value);
  }

  @Output()
  public readonly fragmentChange: EventEmitter<EpiSupportFr> =
    new EventEmitter<EpiSupportFr>();
  @Output()
  public readonly fragmentCancel: EventEmitter<void> = new EventEmitter<void>();

  public id: FormControl<string>;
  public shelfmark: FormControl<string | null>;
  public lost: FormControl<boolean>;
  public size: FormControl<PhysicalSize | null>;
  public location: FormControl<PhysicalGridLocation | null>;
  public mappings: FormControl<EpiSupportFrCellMapping[]>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  public gridPresets?: string[];

  public editedIndex = -1;
  public editedMapping?: EpiSupportFrCellMapping;

  constructor(
    formBuilder: FormBuilder,
    private _gridService: PhysicalGridCoordsService
  ) {
    // form
    this.id = formBuilder.control<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    });
    this.shelfmark = formBuilder.control<string | null>(null, {
      validators: [Validators.maxLength(100)],
    });
    this.lost = formBuilder.control<boolean>(false, { nonNullable: true });
    this.size = formBuilder.control<PhysicalSize | null>(null);
    this.location = formBuilder.control<PhysicalGridLocation | null>(null, {
      validators: Validators.required,
    });
    this.mappings = formBuilder.control<EpiSupportFrCellMapping[]>([], {
      nonNullable: true,
    });
    this.note = formBuilder.control<string | null>(null, {
      validators: [Validators.maxLength(1000)],
    });

    this.form = formBuilder.group({
      id: this.id,
      shelfmark: this.shelfmark,
      lost: this.lost,
      size: this.size,
      location: this.location,
      mappings: this.mappings,
      note: this.note,
    });
  }

  private updateForm(fr: EpiSupportFr | undefined | null): void {
    if (!fr) {
      this.form.reset();
      return;
    }

    this.id.setValue(fr.id);
    this.shelfmark.setValue(fr.shelfmark || null);
    this.lost.setValue(fr.isLost || false);
    this.size.setValue(fr.size || null);
    const location: PhysicalGridLocation = {
      rows: fr.rowCount || 0,
      columns: fr.columnCount || 0,
      coords: this._gridService.parsePhysicalGridCoords(fr.location) || [],
    };
    this.location.setValue(location);
    this.mappings.setValue(fr.cellMappings || []);
    this.note.setValue(fr.note || null);
    this.form.markAsPristine();
  }

  private getFragment(): EpiSupportFr {
    return {
      id: this.id.value?.trim(),
      shelfmark: this.shelfmark.value?.trim(),
      isLost: this.lost.value || undefined,
      size: this.size.value || undefined,
      rowCount: this.location.value?.rows || 0,
      columnCount: this.location.value?.columns || 0,
      location: this.location.value
        ? this._gridService.physicalGridCoordsToString(
            this.location.value?.coords
          )
        : '',
      cellMappings: this.mappings.value?.length
        ? this.mappings.value
        : undefined,
      note: this.note.value?.trim() || undefined,
    };
  }

  public onSizeChange(size: PhysicalSize): void {
    this.size.setValue(size);
    this.size.markAsDirty();
    this.size.updateValueAndValidity();
  }

  public onLocationChange(location: PhysicalGridLocation): void {
    this.location.setValue(location);
    this.location.markAsDirty();
    this.location.updateValueAndValidity();
  }

  public addMapping(): void {
    this.editedMapping = {
      location: '',
    };
    this.editedIndex = -1;
  }

  public editMapping(index: number): void {
    this.editedIndex = index;
    this.editedMapping = this.mappings.value[index];
  }

  public closeMapping(): void {
    this.editedIndex = -1;
    this.editedMapping = undefined;
  }

  public deleteMapping(index: number): void {
    if (this.editedIndex === index) {
      this.closeMapping();
    }
    const mappings = [...this.mappings.value];
    mappings.splice(index, 1);
    this.mappings.setValue(mappings);
    this.mappings.markAsDirty();
    this.mappings.updateValueAndValidity();
  }

  public onMappingChange(mapping: EpiSupportFrCellMapping): void {
    const mappings = [...this.mappings.value];
    if (this.editedIndex === -1) {
      mappings.push(mapping);
    } else {
      mappings[this.editedIndex] = mapping;
    }
    this.mappings.setValue(mappings);
    this.mappings.markAsDirty();
    this.mappings.updateValueAndValidity();

    this.closeMapping();
  }

  public cancel(): void {
    this.fragmentCancel.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this._fragment = this.getFragment();
    this.fragmentChange.emit(this._fragment);
  }
}
