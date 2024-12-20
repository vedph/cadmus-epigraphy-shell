import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';

@Component({
  selector: 'cadmus-epi-writing-old-part-feature',
  templateUrl: './epi-writing-old-part-feature.component.html',
  styleUrls: ['./epi-writing-old-part-feature.component.css'],
  standalone: false,
})
export class EpiWritingOldPartFeatureComponent
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
      'epi-writing-types',
      'epi-writing-languages',
      'epi-writing-techniques',
      'epi-writing-tools',
      'epi-writing-fig-types',
      'epi-writing-fig-features',
      'epi-writing-script-features',
      'epi-writing-frame-types',
      'epi-writing-metres',
      'decorated-count-ids',
      'decorated-count-tags',
    ];
  }
}
