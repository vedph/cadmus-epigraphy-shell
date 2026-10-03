import {
  ChangeDetectionStrategy,
  Component,
  computed,
  linkedSignal,
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { FormField, maxLength } from '@angular/forms/signals';

import {
  MatCard,
  MatCardHeader,
  MatCardAvatar,
  MatCardTitle,
  MatCardContent,
  MatCardActions,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

import { NgxToolsSignalValidators } from '@myrmidon/ngx-tools';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
  HelpLinkComponent,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';

import { EpiLigaturesFragment } from '../epi-ligatures-fragment';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

interface EpiLigaturesFragmentControls {
  types: string[];
  eid: string;
  groupId: string;
  note: string;
}

function toDraft(
  fr?: EpiLigaturesFragment | null,
): EpiLigaturesFragmentControls {
  return {
    types: [...(fr?.types || [])],
    eid: fr?.eid || '',
    groupId: fr?.groupId || '',
    note: fr?.note || '',
  };
}

/**
 * EpiLigatures fragment editor component.
 * Thesauri: epi-ligature-types.
 */
@Component({
  selector: 'cadmus-epi-ligatures-fragment',
  templateUrl: './epi-ligatures-fragment.component.html',
  styleUrls: ['./epi-ligatures-fragment.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    MatCard,
    MatCardHeader,
    MatCardAvatar,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    FlagSetComponent,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatCardActions,
    TitleCasePipe,
    CloseSaveButtonsComponent,
    HelpLinkComponent,
  ],
})
export class EpiLigaturesFragmentComponent extends ModelEditorComponentBase<EpiLigaturesFragment> {
  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    NgxToolsSignalValidators.strictMinLength(p.types, 1);
    maxLength(p.eid, 500);
    maxLength(p.groupId, 100);
    maxLength(p.note, 1000);
  });

  // epi-ligature-types
  public readonly typeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['epi-ligature-types']?.entries,
  );

  public readonly typeFlags = computed<Flag[]>(
    () => this.typeEntries()?.map(entryToFlag) ?? [],
  );

  public onTypeIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.types, [...ids]);
  }

  protected getValue(): EpiLigaturesFragment {
    const fr = this.getEditedFragment() as EpiLigaturesFragment;
    const draft = this._draft();

    fr.types = [...draft.types];
    fr.eid = draft.eid.trim() || undefined;
    fr.groupId = draft.groupId.trim() || undefined;
    fr.note = draft.note.trim() || undefined;

    return fr;
  }
}
