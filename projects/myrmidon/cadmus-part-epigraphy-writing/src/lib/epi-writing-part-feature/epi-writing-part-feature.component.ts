import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';

@Component({
  selector: 'cadmus-epi-writing-part-feature',
  templateUrl: './epi-writing-part-feature.component.html',
  styleUrl: './epi-writing-part-feature.component.scss',
  standalone: false,
})
export class EpiWritingPartFeatureComponent
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
      'epi-writing-systems',
      'epi-writing-scripts',
      'epi-writing-casings',
      'epi-writing-features',
    ];
  }
}
