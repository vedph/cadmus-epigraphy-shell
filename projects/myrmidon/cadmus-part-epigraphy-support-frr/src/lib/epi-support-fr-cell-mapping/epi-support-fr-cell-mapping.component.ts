import {
  ChangeDetectionStrategy,
  Component,
  effect,
  linkedSignal,
  model,
  output,
  untracked,
} from '@angular/core';
import { FormField, form, maxLength, required } from '@angular/forms/signals';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { isImplicitSubmission } from '@myrmidon/cadmus-ui';

import { EpiSupportFrCellMapping } from '../epi-support-frr-part';

interface EpiSupportFrCellMappingControls {
  location: string;
  headText: string;
  headTextLoc: string;
  tailText: string;
  tailTextLoc: string;
}

function toDraft(
  mapping?: EpiSupportFrCellMapping | null,
): EpiSupportFrCellMappingControls {
  return {
    location: mapping?.location || '',
    headText: mapping?.headText || '',
    headTextLoc: mapping?.headTextLoc || '',
    tailText: mapping?.tailText || '',
    tailTextLoc: mapping?.tailTextLoc || '',
  };
}

function toModel(
  draft: EpiSupportFrCellMappingControls,
): EpiSupportFrCellMapping {
  return {
    location: draft.location.trim(),
    headText: draft.headText.trim() || undefined,
    headTextLoc: draft.headTextLoc.trim() || undefined,
    tailText: draft.tailText.trim() || undefined,
    tailTextLoc: draft.tailTextLoc.trim() || undefined,
  };
}

@Component({
  selector: 'cadmus-epi-support-fr-cell-mapping',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
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
  /**
   * The mapping being edited.
   */
  public readonly mapping = model<EpiSupportFrCellMapping>();

  public readonly mappingCancel = output();

  /**
   * The editable draft, derived from the mapping. The echo of our own save,
   * normalized by toModel, keeps the draft instead of rebuilding it.
   */
  private readonly _draft = linkedSignal<
    EpiSupportFrCellMapping | undefined,
    EpiSupportFrCellMappingControls
  >({
    source: () => this.mapping(),
    computation: (mapping, previous) =>
      previous &&
      JSON.stringify(mapping) === JSON.stringify(toModel(previous.value))
        ? previous.value
        : toDraft(mapping),
  });

  public readonly form = form(this._draft, (p) => {
    required(p.location);
    maxLength(p.location, 300);
    maxLength(p.headText, 500);
    maxLength(p.headTextLoc, 100);
    maxLength(p.tailText, 500);
    maxLength(p.tailTextLoc, 100);
  });

  constructor() {
    // clear the interaction state when the draft mirrors the mapping again
    effect(() => {
      const draft = this._draft();
      untracked(() => {
        if (this.isDraftInSync(draft)) {
          this.form().reset();
        }
      });
    });
  }

  private isDraftInSync(draft: EpiSupportFrCellMappingControls): boolean {
    return JSON.stringify(draft) === JSON.stringify(toDraft(this.mapping()));
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

  public cancel(): void {
    this.mappingCancel.emit();
  }

  public save(): void {
    if (this.form().invalid()) {
      this.form().markAsTouched();
      return;
    }
    this.mapping.set(toModel(this._draft()));
    this.form().reset();
  }
}
