import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// cadmus
import { CadmusCoreModule, PendingChangesGuard } from '@myrmidon/cadmus-core';
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';

// parts
import {
  EpiSupportPartFeatureComponent,
  EPI_SUPPORT_PART_TYPEID,
} from '@myrmidon/cadmus-part-epigraphy-support';
import {
  EpiWritingPartFeatureComponent,
  EPI_WRITING_PART_TYPEID,
} from '@myrmidon/cadmus-part-epigraphy-writing';
import {
  EpiLigaturesFragmentFeatureComponent,
  EPI_LIGATURES_FRAGMENT_TYPEID,
} from '@myrmidon/cadmus-fr-epigraphy-ligatures';

export const RouterModuleForChild = RouterModule.forChild([
  {
    path: `${EPI_SUPPORT_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: EpiSupportPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: `${EPI_WRITING_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: EpiWritingPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
  // fragments
  {
    path: `fragment/:pid/${EPI_LIGATURES_FRAGMENT_TYPEID}/:loc`,
    pathMatch: 'full',
    component: EpiLigaturesFragmentFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
]);

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // Cadmus
    RouterModuleForChild,
    CadmusCoreModule,
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
  ],
  exports: [],
})
export class CadmusPartEpigraphyPgModule {}
