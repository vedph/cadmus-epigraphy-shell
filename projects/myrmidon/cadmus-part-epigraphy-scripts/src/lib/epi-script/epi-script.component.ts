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

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { EpiScript } from '../epi-scripts-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

@Component({
  selector: 'cadmus-epi-script',
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
    FlagSetComponent,
  ],
  templateUrl: './epi-script.component.html',
  styleUrl: './epi-script.component.css',
})
export class EpiScriptComponent {
  public readonly script = model<EpiScript>();
  public readonly scriptCancel = output();

  // epi-script-systems
  public readonly systemEntries = input<ThesaurusEntry[]>();
  // epi-scripts
  public readonly scriptEntries = input<ThesaurusEntry[]>();
  // epi-script-casings
  public readonly casingEntries = input<ThesaurusEntry[]>();
  // epi-script-features
  public readonly featEntries = input<ThesaurusEntry[]>();

  // flags
  public readonly featFlags = computed<Flag[]>(
    () => this.featEntries()?.map(entryToFlag) || []
  );

  public system: FormControl<string | null>;
  public scriptCtl: FormControl<string>;
  public casing: FormControl<string | null>;
  public features: FormControl<string[]>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    // form
    this.system = formBuilder.control(null, Validators.maxLength(50));
    this.scriptCtl = formBuilder.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    });
    this.casing = formBuilder.control(null, Validators.maxLength(50));
    this.features = formBuilder.control([], { nonNullable: true });
    this.note = formBuilder.control(null, Validators.maxLength(5000));

    this.form = formBuilder.group({
      system: this.system,
      script: this.scriptCtl,
      casing: this.casing,
      features: this.features,
      note: this.note,
    });

    // when model changes, update form
    effect(() => {
      this.updateForm(this.script());
    });
  }

  private updateForm(script: EpiScript | undefined | null): void {
    if (!script) {
      this.form.reset();
      return;
    }

    this.system.setValue(script.system || null);
    this.scriptCtl.setValue(script.script || '');
    this.casing.setValue(script.casing || null);
    this.features.setValue(script.features || []);
    this.note.setValue(script.note || null);

    this.form.markAsPristine();
  }

  public onFeatIdsChange(ids: string[]): void {
    this.features.setValue(ids);
    this.features.markAsDirty();
    this.features.updateValueAndValidity();
  }

  private getScript(): EpiScript {
    return {
      system: this.system.value || undefined,
      script: this.scriptCtl.value,
      casing: this.casing.value || undefined,
      features: this.features.value?.length
        ? this.features.value || undefined
        : undefined,
      note: this.note.value || undefined,
    };
  }

  public cancel(): void {
    this.scriptCancel.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.script.set(this.getScript());
  }
}
