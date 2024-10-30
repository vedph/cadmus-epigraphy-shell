import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';

import { EpiTechniquePartComponent } from '../epi-technique-part/epi-technique-part.component';

@Component({
  selector: 'cadmus-epi-technique-part-feature',
  standalone: true,
  imports: [CadmusUiPgModule, EpiTechniquePartComponent],
  templateUrl: './epi-technique-part-feature.component.html',
  styleUrl: './epi-technique-part-feature.component.scss',
})
export class EpiTechniquePartFeatureComponent
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
    return ['epi-technique-types', 'epi-technique-tools'];
  }
}
