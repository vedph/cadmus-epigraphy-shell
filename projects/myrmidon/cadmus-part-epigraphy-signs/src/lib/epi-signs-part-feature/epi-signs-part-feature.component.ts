import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';

import { EpiSignsPartComponent } from '../epi-signs-part/epi-signs-part.component';

@Component({
  selector: 'cadmus-epi-signs-part-feature',
  imports: [CurrentItemBarComponent, EpiSignsPartComponent],
  templateUrl: './epi-signs-part-feature.component.html',
  styleUrl: './epi-signs-part-feature.component.scss',
})
export class EpiSignsPartFeatureComponent
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
      'epi-signs-measure-names',
      'physical-size-units',
      'physical-size-dim-tags',
      'epi-signs-features',
    ];
  }
}
