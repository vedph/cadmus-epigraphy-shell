import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';

import { EpiSupportPartComponent } from '../epi-support-part/epi-support-part.component';

@Component({
  selector: 'cadmus-epi-support-part-feature',
  templateUrl: './epi-support-part-feature.component.html',
  styleUrl: './epi-support-part-feature.component.scss',
  imports: [CurrentItemBarComponent, EpiSupportPartComponent],
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
      'epi-support-materials',
      'epi-support-functions',
      'epi-support-types',
      'epi-support-object-types',
      'epi-support-count-types',
      'epi-support-features',
      'physical-size-units',
      'physical-size-tags',
      'physical-size-dim-tags',
      'decorated-count-ids',
      'decorated-count-tags',
      'epi-support-text-area-types',
      'epi-support-text-area-layouts',
      'epi-support-text-area-features',
      'epi-support-text-area-frame-types'
    ];
  }
}
