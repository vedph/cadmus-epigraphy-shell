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

import { PhysicalSize, PhysicalSizeComponent } from '@myrmidon/cadmus-mat-physical-size';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { EpiSupportFr } from '../epi-support-frr-part';

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
    PhysicalSizeComponent
  ],
  templateUrl: './epi-support-fr.component.html',
  styleUrl: './epi-support-fr.component.scss',
})
export class EpiSupportFrComponent {
  private _fragment?: EpiSupportFr;

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

  @Output()
  public readonly fragmentChange: EventEmitter<EpiSupportFr> =
    new EventEmitter<EpiSupportFr>();
  @Output()
  public readonly fragmentCancel: EventEmitter<void> = new EventEmitter<void>();

  public id: FormControl<string>;
  public shelfmark: FormControl<string | null>;
  public lost: FormControl<boolean>;
  public headText: FormControl<string | null>;
  public headTextLoc: FormControl<string | null>;
  public tailText: FormControl<string | null>;
  public tailTextLoc: FormControl<string | null>;
  public size: FormControl<PhysicalSize | null>;
  public note: FormControl<string | null>;
  public row: FormControl<number>;
  public column: FormControl<number>;
  public rowSpan: FormControl<number>;
  public columnSpan: FormControl<number>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    // form
    this.id = formBuilder.control<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    });
    this.shelfmark = formBuilder.control<string | null>(null, {
      validators: [Validators.maxLength(100)],
    });
    this.lost = formBuilder.control<boolean>(false, { nonNullable: true });
    this.headText = formBuilder.control<string | null>(null, {
      validators: [Validators.maxLength(500)],
    });
    this.headTextLoc = formBuilder.control<string | null>(null, {
      validators: [Validators.maxLength(50)],
    });
    this.tailText = formBuilder.control<string | null>(null, {
      validators: [Validators.maxLength(500)],
    });
    this.tailTextLoc = formBuilder.control<string | null>(null, {
      validators: [Validators.maxLength(50)],
    });
    this.size = formBuilder.control<PhysicalSize | null>(null);
    this.note = formBuilder.control<string | null>(null, {
      validators: [Validators.maxLength(1000)],
    });
    this.row = formBuilder.control<number>(0, {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.min(0),
        Validators.max(1000),
      ],
    });
    this.column = formBuilder.control<number>(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0), Validators.max(100)],
    });
    this.rowSpan = formBuilder.control<number>(0, {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.min(0),
        Validators.max(1000),
      ],
    });
    this.columnSpan = formBuilder.control<number>(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0), Validators.max(100)],
    });

    this.form = formBuilder.group({
      id: this.id,
      shelfmark: this.shelfmark,
      lost: this.lost,
      headText: this.headText,
      headTextLoc: this.headTextLoc,
      tailText: this.tailText,
      tailTextLoc: this.tailTextLoc,
      size: this.size,
      note: this.note,
      row: this.row,
      column: this.column,
      rowSpan: this.rowSpan,
      columnSpan: this.columnSpan,
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
    this.headText.setValue(fr.headText || null);
    this.headTextLoc.setValue(fr.headTextLoc || null);
    this.tailText.setValue(fr.tailText || null);
    this.tailTextLoc.setValue(fr.tailTextLoc || null);
    this.size.setValue(fr.size || null);
    this.note.setValue(fr.note || null);
    this.row.setValue(fr.row || 0);
    this.column.setValue(fr.column || 0);
    this.rowSpan.setValue(fr.rowSpan || 0);
    this.columnSpan.setValue(fr.columnSpan || 0);

    this.form.markAsPristine();
  }

  private getFragment(): EpiSupportFr {
    return {
      id: this.id.value?.trim(),
      shelfmark: this.shelfmark.value?.trim(),
      isLost: this.lost.value || undefined,
      headText: this.headText.value?.trim() || undefined,
      headTextLoc: this.headTextLoc.value?.trim() || undefined,
      tailText: this.tailText.value?.trim() || undefined,
      tailTextLoc: this.tailTextLoc.value?.trim() || undefined,
      size: this.size.value || undefined,
      note: this.note.value?.trim() || undefined,
      row: this.row.value || undefined,
      column: this.column.value || undefined,
      rowSpan: this.rowSpan.value || undefined,
      columnSpan: this.columnSpan.value || undefined,
    };
  }

  public onSizeChange(size: PhysicalSize): void {
    this.size.setValue(size);
    this.size.markAsDirty();
    this.size.updateValueAndValidity();
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
