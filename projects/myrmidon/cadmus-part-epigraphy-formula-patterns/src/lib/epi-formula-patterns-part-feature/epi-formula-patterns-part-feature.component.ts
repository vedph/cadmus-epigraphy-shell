import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';

@Component({
  selector: 'cadmus-epi-formula-patterns-part-feature',
  templateUrl: './epi-formula-patterns-part-feature.component.html',
  styleUrls: ['./epi-formula-patterns-part-feature.component.css'],
  standalone: false,
})
export class EpiFormulaPatternsPartFeatureComponent
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
      'epi-formula-pattern-languages',
      'epi-formula-pattern-tags',
      'epi-formula-token-tags',
    ];
  }
}
