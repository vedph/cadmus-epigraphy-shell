import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';

@Component({
  selector: 'cadmus-epi-support-old-part-feature',
  templateUrl: './epi-support-old-part-feature.component.html',
  styleUrls: ['./epi-support-old-part-feature.component.css'],
})
export class EpiSupportOldPartFeatureComponent
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
      'epi-support-functions',
      'epi-support-object-types',
      'epi-support-types',
      'epi-support-materials',
      'epi-support-states',
      'physical-size-units',
      'physical-size-tags',
      'physical-size-dim-tags',
    ];
  }
}
