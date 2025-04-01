import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// cadmus
import { PendingChangesGuard } from '@myrmidon/cadmus-core';

// parts
import {
  EpiSupportPartFeatureComponent,
  EPI_SUPPORT_PART_TYPEID,
} from '@myrmidon/cadmus-part-epigraphy-support';
import {
  EpiScriptsPartFeatureComponent,
  EPI_SCRIPTS_PART_TYPEID,
} from '@myrmidon/cadmus-part-epigraphy-scripts';
import {
  EpiLigaturesFragmentFeatureComponent,
  EPI_LIGATURES_FRAGMENT_TYPEID,
} from '@myrmidon/cadmus-fr-epigraphy-ligatures';
import {
  EpiFormulaPatternsPartFeatureComponent,
  EPI_FORMULA_PATTERNS_PART_TYPEID,
} from '@myrmidon/cadmus-part-epigraphy-formula-patterns';
import {
  EPI_SIGNS_PART_TYPEID,
  EpiSignsPartFeatureComponent,
} from '@myrmidon/cadmus-part-epigraphy-signs';
import {
  EPI_SUPPORT_FRR_PART_TYPEID,
  EpiSupportFrrPartFeatureComponent,
} from '@myrmidon/cadmus-part-epigraphy-support-frr';
import { NgeMonacoModule } from '@cisstech/nge/monaco';
import {
  EPI_TECHNIQUE_PART_TYPEID,
  EpiTechniquePartFeatureComponent,
} from '@myrmidon/cadmus-part-epigraphy-technique';

export const RouterModuleForChild = RouterModule.forChild([
  {
    path: `${EPI_SUPPORT_FRR_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: EpiSupportFrrPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: `${EPI_SUPPORT_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: EpiSupportPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: `${EPI_SCRIPTS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: EpiScriptsPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: `${EPI_SIGNS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: EpiSignsPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: `${EPI_FORMULA_PATTERNS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: EpiFormulaPatternsPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: `${EPI_TECHNIQUE_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: EpiTechniquePartFeatureComponent,
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
    NgeMonacoModule,
    // Cadmus
    RouterModuleForChild,
  ],
  exports: [],
})
export class CadmusPartEpigraphyPgModule {}
