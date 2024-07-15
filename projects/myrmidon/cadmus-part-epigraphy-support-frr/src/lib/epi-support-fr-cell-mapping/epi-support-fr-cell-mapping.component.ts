import { Component, EventEmitter, Input, output, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { EpiSupportFrCellMapping } from '../epi-support-frr-part';

@Component({
  selector: 'cadmus-epi-support-fr-cell-mapping',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
  ],
  templateUrl: './epi-support-fr-cell-mapping.component.html',
  styleUrl: './epi-support-fr-cell-mapping.component.scss',
})
export class EpiSupportFrCellMappingComponent {
  private _mapping?: EpiSupportFrCellMapping;

  @Input()
  public get mapping(): EpiSupportFrCellMapping | undefined {
    return this._mapping;
  }
  public set mapping(value: EpiSupportFrCellMapping | undefined | null) {
    if (this._mapping === value) {
      return;
    }
    this._mapping = value || undefined;
    this.updateForm(this._mapping);
  }

  @Output()
  public readonly mappingChange: EventEmitter<EpiSupportFrCellMapping> =
    new EventEmitter<EpiSupportFrCellMapping>();

  @Output()
  public readonly mappingCancel: EventEmitter<void> = new EventEmitter<void>();

  public location: FormControl<string>;
  public headText: FormControl<string | null>;
  public headTextLoc: FormControl<string | null>;
  public tailText: FormControl<string | null>;
  public tailTextLoc: FormControl<string | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.location = formBuilder.control<string>('', {
      validators: [Validators.required, Validators.maxLength(300)],
      nonNullable: true,
    });
    this.headText = formBuilder.control<string | null>(null, {
      validators: Validators.maxLength(500),
    });
    this.headTextLoc = formBuilder.control<string | null>(null, {
      validators: Validators.maxLength(100),
    });
    this.tailText = formBuilder.control<string | null>(null, {
      validators: Validators.maxLength(500),
    });
    this.tailTextLoc = formBuilder.control<string | null>(null, {
      validators: Validators.maxLength(100),
    });
    this.form = formBuilder.group({
      headText: this.headText,
      headTextLoc: this.headTextLoc,
      tailText: this.tailText,
      tailTextLoc: this.tailTextLoc,
    });
  }

  private updateForm(mapping?: EpiSupportFrCellMapping) {
    if (!mapping) {
      this.form.reset();
      return;
    }

    this.location.setValue(mapping.location);
    this.headText.setValue(mapping.headText || null);
    this.headTextLoc.setValue(mapping.headTextLoc || null);
    this.tailText.setValue(mapping.tailText || null);
    this.tailTextLoc.setValue(mapping.tailTextLoc || null);
    this.form.markAsPristine();
  }

  private getMapping(): EpiSupportFrCellMapping {
    return {
      location: this.location.value?.trim(),
      headText: this.headText.value?.trim(),
      headTextLoc: this.headTextLoc.value?.trim(),
      tailText: this.tailText.value?.trim(),
      tailTextLoc: this.tailTextLoc.value?.trim(),
    };
  }

  public cancel(): void {
    this.mappingCancel.emit();
  }

  public save(): void {
    if (!this.form.valid) {
      return;
    }
    this._mapping = this.getMapping();
    this.mappingChange.emit(this._mapping);
  }
}
