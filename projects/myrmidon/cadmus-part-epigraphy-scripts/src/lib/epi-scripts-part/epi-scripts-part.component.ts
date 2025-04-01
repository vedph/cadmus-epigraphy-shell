import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

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

import { FlatLookupPipe, NgxToolsValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  EditedObject,
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
} from '@myrmidon/cadmus-ui';

import {
  EPI_SCRIPTS_PART_TYPEID,
  EpiScript,
  EpiScriptsPart,
} from '../epi-scripts-part';
import { EpiScriptComponent } from '../epi-script/epi-script.component';

/**
 * EpiScripts part editor component.
 * Thesauri: epi-script-systems, epi-scripts, epi-script-casings,
 * epi-script-features.
 */
@Component({
  selector: 'cadmus-epi-scripts-part',
  templateUrl: './epi-scripts-part.component.html',
  styleUrl: './epi-scripts-part.component.scss',
  imports: [
    FormsModule,
    ReactiveFormsModule,
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
  ],
})
export class EpiScriptsPartComponent
  extends ModelEditorComponentBase<EpiScriptsPart>
  implements OnInit
{
  public editedIndex: number = -1;
  public edited: EpiScript | undefined;

  // thesauri entries
  // epi-script-systems
  public systemEntries?: ThesaurusEntry[];
  // epi-scripts
  public scriptEntries?: ThesaurusEntry[];
  // epi-script-casings
  public casingEntries?: ThesaurusEntry[];
  // epi-script-features
  public featEntries?: ThesaurusEntry[];

  public scripts: FormControl<EpiScript[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    // form
    this.scripts = formBuilder.control([], {
      // at least 1 entry
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      scripts: this.scripts,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'epi-script-systems';
    if (this.hasThesaurus(key)) {
      this.systemEntries = thesauri[key].entries;
    } else {
      this.systemEntries = undefined;
    }
    key = 'epi-scripts';
    if (this.hasThesaurus(key)) {
      this.scriptEntries = thesauri[key].entries;
    } else {
      this.scriptEntries = undefined;
    }
    key = 'epi-script-casings';
    if (this.hasThesaurus(key)) {
      this.casingEntries = thesauri[key].entries;
    } else {
      this.casingEntries = undefined;
    }
    key = 'epi-script-features';
    if (this.hasThesaurus(key)) {
      this.featEntries = thesauri[key].entries;
    } else {
      this.featEntries = undefined;
    }
  }

  private updateForm(part?: EpiScriptsPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.scripts.setValue(part.scripts || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<EpiScriptsPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): EpiScriptsPart {
    let part = this.getEditedPart(EPI_SCRIPTS_PART_TYPEID) as EpiScriptsPart;
    part.scripts = this.scripts.value || [];
    return part;
  }

  public addScript(): void {
    const entry: EpiScript = {
      script: this.scriptEntries?.[0]?.id || '',
    };
    this.editScript(entry, -1);
  }

  public editScript(script: EpiScript, index: number): void {
    this.editedIndex = index;
    this.edited = script;
  }

  public closeScript(): void {
    this.editedIndex = -1;
    this.edited = undefined;
  }

  public saveScript(script: EpiScript): void {
    const scripts = [...this.scripts.value];
    if (this.editedIndex === -1) {
      scripts.push(script);
    } else {
      scripts.splice(this.editedIndex, 1, script);
    }
    this.scripts.setValue(scripts);
    this.scripts.markAsDirty();
    this.scripts.updateValueAndValidity();
    this.closeScript();
  }

  public deleteScript(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete Script?')
      .subscribe((yes: boolean | undefined) => {
        if (yes) {
          if (this.editedIndex === index) {
            this.closeScript();
          }
          const scripts = [...this.scripts.value];
          scripts.splice(index, 1);
          this.scripts.setValue(scripts);
          this.scripts.markAsDirty();
          this.scripts.updateValueAndValidity();
        }
      });
  }

  public moveScriptUp(index: number): void {
    if (index < 1) {
      return;
    }
    const script = this.scripts.value[index];
    const scripts = [...this.scripts.value];
    scripts.splice(index, 1);
    scripts.splice(index - 1, 0, script);
    this.scripts.setValue(scripts);
    this.scripts.markAsDirty();
    this.scripts.updateValueAndValidity();
  }

  public moveScriptDown(index: number): void {
    if (index + 1 >= this.scripts.value.length) {
      return;
    }
    const script = this.scripts.value[index];
    const scripts = [...this.scripts.value];
    scripts.splice(index, 1);
    scripts.splice(index + 1, 0, script);
    this.scripts.setValue(scripts);
    this.scripts.markAsDirty();
    this.scripts.updateValueAndValidity();
  }
}
