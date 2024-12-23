import { CommonModule } from '@angular/common';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// material
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

// bricks
import { PhysicalSizeComponent } from '@myrmidon/cadmus-mat-physical-size';
import { DecoratedCountsComponent } from '@myrmidon/cadmus-refs-decorated-counts';
import { FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

// cadmus
import { CadmusCoreModule } from '@myrmidon/cadmus-core';
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';

import { EpiLigaturesFragmentComponent } from './epi-ligatures-fragment/epi-ligatures-fragment.component';
import { EpiLigaturesFragmentFeatureComponent } from './epi-ligatures-fragment-feature/epi-ligatures-fragment-feature.component';

@NgModule({
  declarations: [
    EpiLigaturesFragmentComponent,
    EpiLigaturesFragmentFeatureComponent,
  ],
  exports: [
    EpiLigaturesFragmentComponent,
    EpiLigaturesFragmentFeatureComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    // material
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTabsModule,
    MatTooltipModule,
    // cadmus
    CadmusCoreModule,
    CadmusStateModule,
    CadmusUiModule,
    PhysicalSizeComponent,
    DecoratedCountsComponent,
    FlagSetComponent,
    CadmusUiPgModule,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class CadmusFrEpigraphyLigaturesModule {}
