import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { LibraryRouteService } from '@myrmidon/cadmus-core';
import {
  EditFragmentFeatureBase,
  FragmentEditorService,
} from '@myrmidon/cadmus-state';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';

import { EpiLigaturesFragmentComponent } from '../epi-ligatures-fragment/epi-ligatures-fragment.component';

@Component({
  selector: 'cadmus-epi-ligatures-fragment-feature',
  templateUrl: './epi-ligatures-fragment-feature.component.html',
  styleUrls: ['./epi-ligatures-fragment-feature.component.css'],
  imports: [CadmusUiPgModule, CadmusUiModule, EpiLigaturesFragmentComponent],
})
export class EpiLigaturesFragmentFeatureComponent
  extends EditFragmentFeatureBase
  implements OnInit
{
  constructor(
    router: Router,
    route: ActivatedRoute,
    snackbar: MatSnackBar,
    editorService: FragmentEditorService,
    libraryRouteService: LibraryRouteService
  ) {
    super(router, route, snackbar, editorService, libraryRouteService);
  }

  protected override getReqThesauriIds(): string[] {
    return ['epi-ligature-types'];
  }
}
