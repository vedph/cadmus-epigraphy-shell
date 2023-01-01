import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';

@Component({
  selector: 'cadmus-gisarc-epi-support-part-feature',
  templateUrl: './epi-support-part-feature.component.html',
  styleUrls: ['./epi-support-part-feature.component.css'],
})
export class EpiSupportPartFeatureComponent
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
