import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';

import { EpiSupportFrrPartComponent } from '../epi-support-frr-part/epi-support-frr-part.component';

@Component({
  selector: 'cadmus-epi-support-frr-part-feature',
  imports: [CommonModule, CurrentItemBarComponent, EpiSupportFrrPartComponent],
  templateUrl: './epi-support-frr-part-feature.component.html',
  styleUrl: './epi-support-frr-part-feature.component.scss',
})
export class EpiSupportFrrPartFeatureComponent
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
      'physical-size-units',
      'physical-size-tags',
      'physical-size-dim-tags',
    ];
  }
}
