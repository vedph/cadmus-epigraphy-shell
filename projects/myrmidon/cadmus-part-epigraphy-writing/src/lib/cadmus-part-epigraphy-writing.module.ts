import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
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

// cadmus
import { CadmusCoreModule } from '@myrmidon/cadmus-core';
import { CadmusMatPhysicalSizeModule } from '@myrmidon/cadmus-mat-physical-size';
import { CadmusRefsDecoratedCountsModule } from '@myrmidon/cadmus-refs-decorated-counts';
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiFlagsPickerModule } from '@myrmidon/cadmus-ui-flags-picker';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';
import { EpiWritingPartComponent } from './epi-writing-part/epi-writing-part.component';
import { EpiWritingPartFeatureComponent } from './epi-writing-part-feature/epi-writing-part-feature.component';

@NgModule({
  declarations: [
    EpiWritingPartComponent,
    EpiWritingPartFeatureComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
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
    CadmusUiFlagsPickerModule,
    CadmusMatPhysicalSizeModule,
    CadmusRefsDecoratedCountsModule,
    CadmusUiPgModule,
  ],
  exports: [
    EpiWritingPartComponent,
    EpiWritingPartFeatureComponent
  ],
})
export class CadmusPartEpigraphyWritingModule {}
