import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  linkedSignal,
  model,
  output,
  untracked,
} from '@angular/core';
import { FormField, form, maxLength, required } from '@angular/forms/signals';

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
import {
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';

import { EpiTextArea } from '../epi-support-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

interface EpiTextAreaControls {
  eid: string;
  type: string;
  layout: string;
  hasSize: boolean;
  size: PhysicalSize | null;
  features: string[];
  hasFrame: boolean;
  frameType: string;
  frameDescription: string;
  note: string;
}

function toDraft(area?: EpiTextArea | null): EpiTextAreaControls {
  return {
    eid: area?.eid || '',
    type: area?.type || '',
    layout: area?.layout || '',
    hasSize: !!area?.size,
    size: area?.size ? copyFormValue(area.size) : null,
    features: [...(area?.features || [])],
    hasFrame: !!(area?.frameType || area?.frameDescription),
    frameType: area?.frameType || '',
    frameDescription: area?.frameDescription || '',
    note: area?.note || '',
  };
}

function toModel(draft: EpiTextAreaControls): EpiTextArea {
  return {
    eid: draft.eid.trim() || undefined,
    type: draft.type.trim(),
    layout: draft.layout.trim() || undefined,
    size:
      draft.hasSize && draft.size ? copyFormValue(draft.size) : undefined,
    features: draft.features.length ? [...draft.features] : undefined,
    frameType: draft.hasFrame
      ? draft.frameType.trim() || undefined
      : undefined,
    frameDescription: draft.hasFrame
      ? draft.frameDescription.trim() || undefined
      : undefined,
    note: draft.note.trim() || undefined,
  };
}

@Component({
  selector: 'cadmus-epi-text-area',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
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

  public readonly featFlags = computed<Flag[]>(
    () => this.featEntries()?.map((e) => entryToFlag(e)) || [],
  );

  public readonly cancel = output();

  /**
   * The editable draft, derived from the area. The echo of our own save,
   * normalized by toModel, keeps the draft instead of rebuilding it.
   */
  private readonly _draft = linkedSignal<
    EpiTextArea | undefined,
    EpiTextAreaControls
  >({
    source: () => this.area(),
    computation: (area, previous) =>
      previous &&
      JSON.stringify(area) === JSON.stringify(toModel(previous.value))
        ? previous.value
        : toDraft(area),
  });

  public readonly form = form(this._draft, (p) => {
    maxLength(p.eid, 100);
    required(p.type);
    maxLength(p.layout, 50);
    // frame type is required only when there is a frame
    required(p.frameType, { when: ({ valueOf }) => valueOf(p.hasFrame) });
    maxLength(p.frameType, 50);
    maxLength(p.frameDescription, 5000);
    maxLength(p.note, 5000);
  });

  constructor() {
    // clear the interaction state when the draft mirrors the area again
    effect(() => {
      const draft = this._draft();
      untracked(() => {
        if (this.isDraftInSync(draft)) {
          this.form().reset();
        }
      });
    });
  }

  private isDraftInSync(draft: EpiTextAreaControls): boolean {
    return JSON.stringify(draft) === JSON.stringify(toDraft(this.area()));
  }

  public onSizeChange(size: PhysicalSize | undefined): void {
    setFieldFromChild(this.form.size, size ? copyFormValue(size) : null);
  }

  public onFeatCheckedIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.features, [...ids]);
  }

  /**
   * Enter in a text input saves, as the implicit submission of the former
   * form did, unless the save button is disabled.
   */
  public onEnterKey(event: Event): void {
    if (!isImplicitSubmission(event)) {
      return;
    }
    event.preventDefault();
    if (this.form().invalid() || !this.form().dirty()) {
      return;
    }
    this.save();
  }

  public dismiss(): void {
    this.cancel.emit();
  }

  public save(): void {
    if (this.form().invalid()) {
      this.form().markAsTouched();
      return;
    }
    this.area.set(toModel(this._draft()));
    this.form().reset();
  }
}
