import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
} from '@angular/forms';
import { take } from 'rxjs/operators';

import { NgToolsValidators } from '@myrmidon/ng-tools';
import { DialogService } from '@myrmidon/ng-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { EditedObject, ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';

@Component({
  selector: 'cadmus-epi-support-frr-part',
  standalone: true,
  imports: [],
  templateUrl: './epi-support-frr-part.component.html',
  styleUrl: './epi-support-frr-part.component.scss'
})
export class EpiSupportFrrPartComponent {

}
