import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';

import { EpiScriptsPartComponent } from '../epi-scripts-part/epi-scripts-part.component';

@Component({
  selector: 'cadmus-epi-scripts-part-feature',
  templateUrl: './epi-scripts-part-feature.component.html',
  styleUrl: './epi-scripts-part-feature.component.scss',
  imports: [CurrentItemBarComponent, EpiScriptsPartComponent],
})
export class EpiScriptsPartFeatureComponent
  extends EditPartFeatureBase
  implements OnInit
{
  constructor(
    router: Router,
    route: ActivatedRoute,
    snackbar: MatSnackBar,
    itemService: ItemService,
    thesaurusService: ThesaurusService,
    editorService: PartEditorService
  ) {
    super(
      router,
      route,
      snackbar,
      itemService,
      thesaurusService,
      editorService
    );
  }

  protected override getReqThesauriIds(): string[] {
    return [
      'epi-script-systems',
      'epi-scripts',
      'epi-script-casings',
      'epi-script-features',
    ];
  }
}
