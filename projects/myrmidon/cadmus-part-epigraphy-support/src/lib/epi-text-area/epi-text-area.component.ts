import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  input,
  model,
  output,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';
import {
  PhysicalSize,
  PhysicalSizeComponent,
} from '@myrmidon/cadmus-mat-physical-size';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { EpiTextArea } from '../epi-support-part';
import { NgxToolsValidators } from '@myrmidon/ngx-tools';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

@Component({
  selector: 'cadmus-epi-text-area',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    PhysicalSizeComponent,
    FlagSetComponent,
  ],
  templateUrl: './epi-text-area.component.html',
  styleUrl: './epi-text-area.component.css',
})
export class EpiTextAreaComponent {
  public readonly area = model<EpiTextArea>();

  // epi-support-text-area-types
  public readonly typeEntries = input<ThesaurusEntry[]>();
  // epi-support-text-area-layouts
  public readonly layoutEntries = input<ThesaurusEntry[]>();
  // epi-support-text-area-features
  public readonly featEntries = input<ThesaurusEntry[]>();
  // epi-support-text-area-frame-types
  public readonly frameEntries = input<ThesaurusEntry[]>();

  // physical-size-units
  public readonly szUnitEntries = input<ThesaurusEntry[]>();
  // physical-size-tags
  public readonly szTagEntries = input<ThesaurusEntry[]>();
  // physical-size-dim-tags
  public readonly szDimTagEntries = input<ThesaurusEntry[]>();

  public featFlags = computed<Flag[]>(
    () => this.featEntries()?.map((e) => entryToFlag(e)) || []
  );

  public readonly cancel = output();

  public eid: FormControl<string | null>;
  public type: FormControl<string>;
  public layout: FormControl<string | null>;
  public hasSize: FormControl<boolean>;
  public size: FormControl<PhysicalSize | null>;
  public features: FormControl<string[]>;
  public hasFrame: FormControl<boolean>;
  public frameType: FormControl<string | null>;
  public frameDescription: FormControl<string | null>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    // form
    this.eid = formBuilder.control(null, Validators.maxLength(100));
    this.type = formBuilder.control('', {
      nonNullable: true,
      validators: Validators.required,
    });
    this.layout = formBuilder.control(null, Validators.maxLength(50));
    this.hasSize = formBuilder.control(false, { nonNullable: true });
    this.size = formBuilder.control(null);
    this.features = formBuilder.control([], { nonNullable: true });
    this.hasFrame = formBuilder.control(false, { nonNullable: true });
    this.frameType = formBuilder.control(null, [
      Validators.maxLength(50),
      NgxToolsValidators.conditionalValidator(
        () => this.hasFrame.value,
        Validators.required
      ),
    ]);
    this.frameDescription = formBuilder.control(
      null,
      Validators.maxLength(5000)
    );
    this.note = formBuilder.control(null, Validators.maxLength(5000));

    this.form = formBuilder.group({
      eid: this.eid,
      type: this.type,
      layout: this.layout,
      hasSize: this.hasSize,
      size: this.size,
      features: this.features,
      hasFrame: this.hasFrame,
      frameType: this.frameType,
      frameDescription: this.frameDescription,
      note: this.note,
    });

    // when model changes, update form
    effect(() => {
      this.updateForm(this.area());
    });
  }

  private updateForm(area: EpiTextArea | undefined | null): void {
    if (!area) {
      this.form.reset();
      return;
    }

    this.eid.setValue(area.eid || null);
    this.type.setValue(area.type || '');
    this.layout.setValue(area.layout || null);
    this.hasSize.setValue(area.size ? true : false);
    this.size.setValue(area.size || null);
    this.features.setValue(area.features || []);
    this.hasFrame.setValue(area.frameType ? true : false);
    this.frameType.setValue(area.frameType || null);
    this.frameDescription.setValue(area.frameDescription || null);
    this.note.setValue(area.note || null);

    this.form.markAsPristine();
  }

  private getArea(): EpiTextArea {
    return {
      eid: this.eid.value || undefined,
      type: this.type.value?.trim(),
      layout: this.layout.value?.trim() || undefined,
      size: this.hasSize.value ? this.size.value || undefined : undefined,
      features: this.features.value?.length ? this.features.value : undefined,
      frameType: this.hasFrame.value
        ? this.frameType.value || undefined
        : undefined,
      frameDescription: this.hasFrame.value
        ? this.frameDescription.value?.trim() || undefined
        : undefined,
      note: this.note.value?.trim() || undefined,
    };
  }

  public onSizeChange(size: PhysicalSize): void {
    this.size.setValue(size);
    this.size.markAsDirty();
    this.size.updateValueAndValidity();
  }

  public onFeatCheckedIdsChange(ids: string[]): void {
    this.features.setValue(ids);
    this.features.markAsDirty();
    this.features.updateValueAndValidity();
  }

  public dismiss(): void {
    this.cancel.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.area.set(this.getArea());
  }
}
