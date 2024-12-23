import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  CadmusUiModule,
  EditedObject,
  ModelEditorComponentBase,
} from '@myrmidon/cadmus-ui';

import {
  EPI_TECHNIQUE_PART_TYPEID,
  EpiTechniquePart,
} from '../epi-technique-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

/**
 * EpiTechnique part editor component.
 * Thesauri: epi-technique-types, epi-technique-tools.
 */
@Component({
  selector: 'cadmus-epi-technique-part',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTabsModule,
    MatTooltipModule,
    FlagSetComponent,
    CadmusUiModule,
  ],
  templateUrl: './epi-technique-part.component.html',
  styleUrl: './epi-technique-part.component.scss',
})
export class EpiTechniquePartComponent
  extends ModelEditorComponentBase<EpiTechniquePart>
  implements OnInit
{
  private _techEntries?: ThesaurusEntry[];
  private _toolEntries?: ThesaurusEntry[];

  public techniques: FormControl<string[]>;
  public tools: FormControl<string[]>;
  public note: FormControl<string | null>;

  // flags
  public techFlags: Flag[] = [];
  public toolFlags: Flag[] = [];

  // epi-technique-types
  @Input()
  public get techEntries(): ThesaurusEntry[] | undefined {
    return this._techEntries;
  }
  public set techEntries(value: ThesaurusEntry[] | undefined) {
    if (this._techEntries === value) {
      return;
    }
    this._techEntries = value || [];
    this.techFlags = this._techEntries.map(entryToFlag);
  }

  // epi-technique-tools
  @Input()
  public get toolEntries(): ThesaurusEntry[] | undefined {
    return this._toolEntries;
  }
  public set toolEntries(value: ThesaurusEntry[] | undefined) {
    if (this._toolEntries === value) {
      return;
    }
    this._toolEntries = value || [];
    this.toolFlags = this._toolEntries.map(entryToFlag);
  }

  constructor(authService: AuthJwtService, formBuilder: FormBuilder) {
    super(authService, formBuilder);
    // form
    this.techniques = formBuilder.control([], { nonNullable: true });
    this.tools = formBuilder.control([], { nonNullable: true });
    this.note = formBuilder.control(null, {
      validators: [Validators.maxLength(5000)],
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      techniques: this.techniques,
      tools: this.tools,
      note: this.note,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'epi-technique-types';
    if (this.hasThesaurus(key)) {
      this.techEntries = thesauri[key].entries;
    } else {
      this.techEntries = undefined;
    }
    key = 'epi-technique-tools';
    if (this.hasThesaurus(key)) {
      this.toolEntries = thesauri[key].entries;
    } else {
      this.toolEntries = undefined;
    }
  }

  private updateForm(part?: EpiTechniquePart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }

    this.techniques.setValue(part.techniques || []);
    this.tools.setValue(part.tools || []);
    this.note.setValue(part.note || null);

    this.form.markAsPristine();
  }

  public onTechIdsChange(ids: string[]): void {
    this.techniques.setValue(ids);
    this.techniques.markAsDirty();
    this.techniques.updateValueAndValidity();
  }

  public onToolIdsChange(ids: string[]): void {
    this.tools.setValue(ids);
    this.tools.markAsDirty();
    this.tools.updateValueAndValidity();
  }

  protected override onDataSet(data?: EditedObject<EpiTechniquePart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): EpiTechniquePart {
    let part = this.getEditedPart(
      EPI_TECHNIQUE_PART_TYPEID
    ) as EpiTechniquePart;

    part.techniques = this.techniques.value.length
      ? this.techniques.value
      : undefined;
    part.tools = this.tools.value.length ? this.tools.value : undefined;
    part.note = this.note.value?.trim() || undefined;

    return part;
  }
}
