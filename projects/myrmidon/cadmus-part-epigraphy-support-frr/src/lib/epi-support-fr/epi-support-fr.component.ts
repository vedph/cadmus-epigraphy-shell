import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormField, form, maxLength, required } from '@angular/forms/signals';

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
  PhysicalGridCoords,
  PhysicalGridCoordsService,
  PhysicalGridLocation,
  PhysicalGridLocationComponent,
} from '@myrmidon/cadmus-mat-physical-grid';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';

import { EpiSupportFr, EpiSupportFrCellMapping } from '../epi-support-frr-part';
import { EpiSupportFrCellMappingComponent } from '../epi-support-fr-cell-mapping/epi-support-fr-cell-mapping.component';

interface EpiSupportFrControls {
  id: string;
  shelfmark: string;
  lost: boolean;
  size: PhysicalSize | null;
  location: PhysicalGridLocation | null;
  mappings: EpiSupportFrCellMapping[];
  note: string;
}

function toDraft(
  fr: EpiSupportFr | null | undefined,
  gridService: PhysicalGridCoordsService,
): EpiSupportFrControls {
  return {
    id: fr?.id || '',
    shelfmark: fr?.shelfmark || '',
    lost: fr?.isLost || false,
    size: fr?.size ? copyFormValue(fr.size) : null,
    location: fr
      ? {
          rows: fr.rowCount || 0,
          columns: fr.columnCount || 0,
          coords:
            (gridService.parsePhysicalGridCoords(
              fr.location,
            ) as PhysicalGridCoords[]) || [],
        }
      : null,
    mappings: copyFormValue(fr?.cellMappings || []),
    note: fr?.note || '',
  };
}

function toModel(
  draft: EpiSupportFrControls,
  gridService: PhysicalGridCoordsService,
): EpiSupportFr {
  return {
    id: draft.id.trim(),
    shelfmark: draft.shelfmark.trim() || undefined,
    isLost: draft.lost || undefined,
    size: draft.size ? copyFormValue(draft.size) : undefined,
    rowCount: draft.location?.rows || 0,
    columnCount: draft.location?.columns || 0,
    location: draft.location
      ? gridService.physicalGridCoordsToString(draft.location.coords || [])
      : '',
    cellMappings: draft.mappings.length
      ? copyFormValue(draft.mappings)
      : undefined,
    note: draft.note.trim() || undefined,
  };
}

@Component({
  selector: 'cadmus-epi-support-fr',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    MatButtonModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    PhysicalSizeComponent,
    PhysicalGridLocationComponent,
    EpiSupportFrCellMappingComponent,
  ],
  templateUrl: './epi-support-fr.component.html',
  styleUrl: './epi-support-fr.component.scss',
})
export class EpiSupportFrComponent {
  private readonly _gridService = inject(PhysicalGridCoordsService);

  public readonly fragment = model<EpiSupportFr>();

  // physical-size-units
  public readonly unitEntries = input<ThesaurusEntry[]>();
  // physical-size-tags
  public readonly tagEntries = input<ThesaurusEntry[]>();
  // physical-size-dim-tags
  public readonly dimTagEntries = input<ThesaurusEntry[]>();
  // physical-grid-presets
  public readonly gridPresetEntries = input<ThesaurusEntry[]>();

  public readonly fragmentCancel = output();

  public readonly editedMapping = signal<EpiSupportFrCellMapping | undefined>(
    undefined,
  );
  public readonly editedIndex = signal<number>(-1);

  public readonly gridPresets = computed<string[] | undefined>(() =>
    this.gridPresetEntries()?.map((e) => e.value),
  );

  /**
   * The editable draft, derived from the fragment. The echo of our own save,
   * normalized by toModel, keeps the draft instead of rebuilding it.
   */
  private readonly _draft = linkedSignal<
    EpiSupportFr | undefined,
    EpiSupportFrControls
  >({
    source: () => this.fragment(),
    computation: (fr, previous) =>
      previous &&
      JSON.stringify(fr) ===
        JSON.stringify(toModel(previous.value, this._gridService))
        ? previous.value
        : toDraft(fr, this._gridService),
  });

  public readonly form = form(this._draft, (p) => {
    required(p.id);
    maxLength(p.id, 100);
    maxLength(p.shelfmark, 100);
    required(p.location);
    maxLength(p.note, 1000);
  });

  constructor() {
    // clear the interaction state when the draft mirrors the fragment again
    effect(() => {
      const draft = this._draft();
      untracked(() => {
        if (this.isDraftInSync(draft)) {
          this.form().reset();
        }
      });
    });
  }

  private isDraftInSync(draft: EpiSupportFrControls): boolean {
    return (
      JSON.stringify(draft) ===
      JSON.stringify(toDraft(this.fragment(), this._gridService))
    );
  }

  public onSizeChange(size: PhysicalSize | undefined): void {
    setFieldFromChild(this.form.size, size ? copyFormValue(size) : null);
  }

  public onLocationChange(location: PhysicalGridLocation | undefined): void {
    setFieldFromChild(
      this.form.location,
      location ? copyFormValue(location) : null,
    );
  }

  private setMappings(mappings: EpiSupportFrCellMapping[]): void {
    this.form.mappings().value.set(mappings);
    this.form.mappings().markAsDirty();
  }

  public addMapping(): void {
    this.editedMapping.set({
      location: '',
    });
    this.editedIndex.set(-1);
  }

  public editMapping(index: number): void {
    this.editedIndex.set(index);
    this.editedMapping.set(copyFormValue(this.form.mappings().value()[index]));
  }

  public closeMapping(): void {
    this.editedMapping.set(undefined);
    this.editedIndex.set(-1);
  }

  public deleteMapping(index: number): void {
    if (this.editedIndex() === index) {
      this.closeMapping();
    } else if (this.editedIndex() > index) {
      // keep the edited index pointing to the edited mapping
      this.editedIndex.set(this.editedIndex() - 1);
    }
    const mappings = [...this.form.mappings().value()];
    mappings.splice(index, 1);
    this.setMappings(mappings);
  }

  public onMappingChange(mapping: EpiSupportFrCellMapping): void {
    const mappings = [...this.form.mappings().value()];
    if (this.editedIndex() === -1) {
      mappings.push(copyFormValue(mapping));
    } else {
      mappings[this.editedIndex()] = copyFormValue(mapping);
    }
    this.setMappings(mappings);
    this.closeMapping();
  }

  /**
   * Enter in a text input saves, as the implicit submission of the former
   * form did, unless the save button is disabled. Enter in the mapping
   * editor is consumed by that editor.
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
    this.fragmentCancel.emit();
  }

  public save(): void {
    if (this.form().invalid()) {
      this.form().markAsTouched();
      return;
    }
    this.fragment.set(toModel(this._draft(), this._gridService));
    this.form().reset();
  }
}
