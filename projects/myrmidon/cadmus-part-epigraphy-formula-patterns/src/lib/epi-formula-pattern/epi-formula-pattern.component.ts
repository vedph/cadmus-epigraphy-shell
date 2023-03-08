import { Component, Input } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { EpiFormulaPattern } from '../epi-formula-patterns-part';

@Component({
  selector: 'cadmus-epi-formula-pattern',
  templateUrl: './epi-formula-pattern.component.html',
  styleUrls: ['./epi-formula-pattern.component.css'],
})
export class EpiFormulaPatternComponent {
  private _pattern: EpiFormulaPattern | undefined;

  @Input()
  public get pattern(): EpiFormulaPattern | undefined | null {
    return this._pattern;
  }
  public set pattern(value: EpiFormulaPattern | undefined | null) {
    if (this._pattern === value) {
      return;
    }
    this._pattern = value || undefined;
  }

  public eid: FormControl<string | null>;
  public language: FormControl<string>;
  public tag: FormControl<string | null>;
  // TODO
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.eid = formBuilder.control(null, Validators.maxLength(500));
    this.language = formBuilder.control('', {
      validators: [Validators.required, Validators.maxLength(50)],
      nonNullable: true,
    });
    this.tag = formBuilder.control(null, Validators.maxLength(50));

    this.form = formBuilder.group({
      eid: this.eid,
      language: this.language,
      tag: this.tag,
    });
  }
}
