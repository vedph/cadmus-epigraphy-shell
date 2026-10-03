import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';

import {
  MatCard,
  MatCardHeader,
  MatCardAvatar,
  MatCardTitle,
  MatCardContent,
  MatCardActions,
} from '@angular/material/card';
import { TitleCasePipe } from '@angular/common';

import { MatIcon } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { take } from 'rxjs';

import { FlatLookupPipe, NgxToolsSignalValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
  HelpLinkComponent,
  copyFormValue,
} from '@myrmidon/cadmus-ui';

import {
  EPI_SCRIPTS_PART_TYPEID,
  EpiScript,
  EpiScriptsPart,
} from '../epi-scripts-part';
import { EpiScriptComponent } from '../epi-script/epi-script.component';

interface EpiScriptsPartControls {
  scripts: EpiScript[];
}

function toDraft(part?: EpiScriptsPart | null): EpiScriptsPartControls {
  return {
    scripts: copyFormValue(part?.scripts || []),
  };
}

/**
 * EpiScripts part editor component.
 * Thesauri: epi-script-systems, epi-scripts, epi-script-casings,
 * epi-script-features.
 */
@Component({
  selector: 'cadmus-epi-scripts-part',
  templateUrl: './epi-scripts-part.component.html',
  styleUrl: './epi-scripts-part.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatCard,
    MatCardHeader,
    MatCardAvatar,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    MatExpansionModule,
    MatCardActions,
    MatTooltipModule,
    TitleCasePipe,
    FlatLookupPipe,
    EpiScriptComponent,
    CloseSaveButtonsComponent,
    HelpLinkComponent,
  ],
})
export class EpiScriptsPartComponent extends ModelEditorComponentBase<EpiScriptsPart> {
  private readonly _dialogService = inject(DialogService);

  public readonly edited = signal<EpiScript | undefined>(undefined);
  public readonly editedIndex = signal<number>(-1);

  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    // at least 1 entry
    NgxToolsSignalValidators.strictMinLength(p.scripts, 1);
  });

  // thesauri entries
  // epi-script-systems
  public readonly systemEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['epi-script-systems']?.entries,
  );
  // epi-scripts
  public readonly scriptEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['epi-scripts']?.entries,
  );
  // epi-script-casings
  public readonly casingEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['epi-script-casings']?.entries,
  );
  // epi-script-features
  public readonly featEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['epi-script-features']?.entries,
  );

  protected getValue(): EpiScriptsPart {
    const part = this.getEditedPart(EPI_SCRIPTS_PART_TYPEID) as EpiScriptsPart;
    part.scripts = copyFormValue(this._draft().scripts);
    return part;
  }

  private setScripts(scripts: EpiScript[]): void {
    this.form.scripts().value.set(scripts);
    this.form.scripts().markAsDirty();
  }

  public addScript(): void {
    const entry: EpiScript = {
      script: this.scriptEntries()?.[0]?.id || '',
    };
    this.editScript(entry, -1);
  }

  public editScript(script: EpiScript, index: number): void {
    this.editedIndex.set(index);
    this.edited.set(copyFormValue(script));
  }

  public closeScript(): void {
    this.editedIndex.set(-1);
    this.edited.set(undefined);
  }

  public saveScript(script: EpiScript): void {
    const scripts = [...this.form.scripts().value()];
    if (this.editedIndex() === -1) {
      scripts.push(copyFormValue(script));
    } else {
      scripts.splice(this.editedIndex(), 1, copyFormValue(script));
    }
    this.setScripts(scripts);
    this.closeScript();
  }

  public deleteScript(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete Script?')
      .pipe(take(1))
      .subscribe((yes: boolean | undefined) => {
        if (yes) {
          if (this.editedIndex() === index) {
            this.closeScript();
          } else if (this.editedIndex() > index) {
            // keep the edited index pointing to the edited script
            this.editedIndex.set(this.editedIndex() - 1);
          }
          const scripts = [...this.form.scripts().value()];
          scripts.splice(index, 1);
          this.setScripts(scripts);
        }
      });
  }

  /**
   * Keep the edited index pointing to the edited script when the scripts
   * at the specified indexes are swapped.
   */
  private swapEditedIndex(a: number, b: number): void {
    if (this.editedIndex() === a) {
      this.editedIndex.set(b);
    } else if (this.editedIndex() === b) {
      this.editedIndex.set(a);
    }
  }

  public moveScriptUp(index: number): void {
    if (index < 1) {
      return;
    }
    const scripts = [...this.form.scripts().value()];
    const script = scripts[index];
    scripts.splice(index, 1);
    scripts.splice(index - 1, 0, script);
    this.swapEditedIndex(index, index - 1);
    this.setScripts(scripts);
  }

  public moveScriptDown(index: number): void {
    const scripts = [...this.form.scripts().value()];
    if (index + 1 >= scripts.length) {
      return;
    }
    const script = scripts[index];
    scripts.splice(index, 1);
    scripts.splice(index + 1, 0, script);
    this.swapEditedIndex(index, index + 1);
    this.setScripts(scripts);
  }
}
