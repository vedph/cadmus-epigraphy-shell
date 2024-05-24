import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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

// bricks
import { DecoratedCountsComponent } from '@myrmidon/cadmus-refs-decorated-counts';
import { FlagsPickerComponent } from '@myrmidon/cadmus-ui-flags-picker';
import {
  PhysicalSizeComponent,
  PhysicalSizePipe,
} from '@myrmidon/cadmus-mat-physical-size';

// cadmus
import { CadmusCoreModule } from '@myrmidon/cadmus-core';
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';

import { EpiFormulaPatternsPartComponent } from './epi-formula-patterns-part/epi-formula-patterns-part.component';
import { EpiFormulaTokenPipe } from './epi-formula-token.pipe';
import { EpiFormulaPatternComponent } from './epi-formula-pattern/epi-formula-pattern.component';
import { EpiFormulaTokenComponent } from './epi-formula-token/epi-formula-token.component';
import { EpiFormulaPatternsPartFeatureComponent } from './epi-formula-patterns-part-feature/epi-formula-patterns-part-feature.component';

@NgModule({ declarations: [
        EpiFormulaPatternsPartComponent,
        EpiFormulaTokenPipe,
        EpiFormulaPatternComponent,
        EpiFormulaTokenComponent,
        EpiFormulaPatternsPartFeatureComponent,
    ],
    exports: [
        EpiFormulaPatternsPartComponent,
        EpiFormulaTokenPipe,
        EpiFormulaPatternComponent,
        EpiFormulaTokenComponent,
        EpiFormulaPatternsPartFeatureComponent,
    ], imports: [CommonModule,
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
        FlagsPickerComponent,
        PhysicalSizeComponent,
        PhysicalSizePipe,
        DecoratedCountsComponent,
        CadmusUiPgModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class CadmusPartEpigraphyFormulaPatternsModule {}
