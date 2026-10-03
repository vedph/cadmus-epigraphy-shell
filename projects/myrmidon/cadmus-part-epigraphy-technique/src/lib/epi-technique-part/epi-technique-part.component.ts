import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  linkedSignal,
} from '@angular/core';
import { FormField, maxLength } from '@angular/forms/signals';

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

import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  CloseSaveButtonsComponent,
  ModelEditorComponentBase,
  HelpLinkComponent,
  setFieldFromChild,
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

interface EpiTechniquePartControls {
  grooveType: string;
  techniques: string[];
  tools: string[];
  note: string;
}

function toDraft(part?: EpiTechniquePart | null): EpiTechniquePartControls {
  return {
    grooveType: part?.grooveType || '',
    techniques: [...(part?.techniques || [])],
    tools: [...(part?.tools || [])],
    note: part?.note || '',
  };
}

/**
 * EpiTechnique part editor component.
 * Thesauri: epi-technique-groove-types, epi-technique-types, epi-technique-tools.
 */
@Component({
  selector: 'cadmus-epi-technique-part',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormField,
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
    CloseSaveButtonsComponent,
    HelpLinkComponent,
  ],
  templateUrl: './epi-technique-part.component.html',
  styleUrl: './epi-technique-part.component.scss',
})
export class EpiTechniquePartComponent extends ModelEditorComponentBase<EpiTechniquePart> {
  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    maxLength(p.grooveType, 50);
    maxLength(p.note, 5000);
  });

  // epi-technique-groove-types
  public readonly grooveTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['epi-technique-groove-types']?.entries,
  );
  // epi-technique-types
  public readonly techEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['epi-technique-types']?.entries,
  );
  // epi-technique-tools
  public readonly toolEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['epi-technique-tools']?.entries,
  );

  // flags
  public readonly techFlags = computed<Flag[]>(
    () => this.techEntries()?.map(entryToFlag) ?? [],
  );
  public readonly toolFlags = computed<Flag[]>(
    () => this.toolEntries()?.map(entryToFlag) ?? [],
  );

  public onTechIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.techniques, [...ids]);
  }

  public onToolIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.tools, [...ids]);
  }

  protected getValue(): EpiTechniquePart {
    const part = this.getEditedPart(
      EPI_TECHNIQUE_PART_TYPEID,
    ) as EpiTechniquePart;
    const draft = this._draft();

    part.grooveType = draft.grooveType.trim() || undefined;
    part.techniques = draft.techniques.length
      ? [...draft.techniques]
      : undefined;
    part.tools = draft.tools.length ? [...draft.tools] : undefined;
    part.note = draft.note.trim() || undefined;

    return part;
  }
}
