import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  provideHttpClient,
  withInterceptors,
  withJsonpSupport,
} from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// material
import { ClipboardModule } from '@angular/cdk/clipboard';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';

// vendors
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { NgeMonacoModule } from '@cisstech/nge/monaco';
import { NgeMarkdownModule } from '@cisstech/nge/markdown';

// myrmidon
import { EnvServiceProvider, NgToolsModule } from '@myrmidon/ng-tools';
import { NgMatToolsModule } from '@myrmidon/ng-mat-tools';
import {
  AuthJwtLoginModule,
  authJwtInterceptor,
} from '@myrmidon/auth-jwt-login';
import { AuthJwtAdminModule } from '@myrmidon/auth-jwt-admin';

// cadmus bricks
import { DocReferencesComponent } from '@myrmidon/cadmus-refs-doc-references';
import { HistoricalDateComponent } from '@myrmidon/cadmus-refs-historical-date';
import { AssertedIdsComponent } from '@myrmidon/cadmus-refs-asserted-ids';
import { FlagsPickerComponent } from '@myrmidon/cadmus-ui-flags-picker';

// cadmus
import { CadmusApiModule } from '@myrmidon/cadmus-api';
import { CadmusCoreModule } from '@myrmidon/cadmus-core';
import { CadmusGraphPgModule } from '@myrmidon/cadmus-graph-pg';
import { CadmusGraphUiModule } from '@myrmidon/cadmus-graph-ui';
import { CadmusProfileCoreModule } from '@myrmidon/cadmus-profile-core';
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';
import { CadmusItemEditorModule } from '@myrmidon/cadmus-item-editor';
import { CadmusItemListModule } from '@myrmidon/cadmus-item-list';
import { CadmusItemSearchModule } from '@myrmidon/cadmus-item-search';
import { CadmusThesaurusEditorModule } from '@myrmidon/cadmus-thesaurus-editor';
import { CadmusThesaurusListModule } from '@myrmidon/cadmus-thesaurus-list';
import { CadmusThesaurusUiModule } from '@myrmidon/cadmus-thesaurus-ui';

// local components
import { HomeComponent } from './home/home.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { ManageUsersPageComponent } from './manage-users-page/manage-users-page.component';
import { RegisterUserPageComponent } from './register-user-page/register-user-page.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PART_EDITOR_KEYS } from './part-editor-keys';
import { INDEX_LOOKUP_DEFINITIONS } from './index-lookup-definitions';
import { ITEM_BROWSER_KEYS } from './item-browser-keys';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginPageComponent,
    ManageUsersPageComponent,
    RegisterUserPageComponent,
    ResetPasswordComponent,
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    // routing
    AppRoutingModule,
    // material
    ClipboardModule,
    DragDropModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatSnackBarModule,
    MatTableModule,
    MatTabsModule,
    MatTooltipModule,
    MatToolbarModule,
    MatTreeModule,
    // vendors
    LeafletModule,
    NgeMonacoModule.forRoot({}),
    NgeMarkdownModule,
    // myrmidon
    NgToolsModule,
    NgMatToolsModule,
    AuthJwtLoginModule,
    AuthJwtAdminModule,
    // cadmus bricks
    DocReferencesComponent,
    HistoricalDateComponent,
    AssertedIdsComponent,
    FlagsPickerComponent,
    // cadmus
    CadmusApiModule,
    CadmusCoreModule,
    CadmusProfileCoreModule,
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
    CadmusGraphPgModule,
    CadmusGraphUiModule,
    CadmusItemEditorModule,
    CadmusItemListModule,
    CadmusItemSearchModule,
    CadmusThesaurusEditorModule,
    CadmusThesaurusListModule,
    CadmusThesaurusUiModule,
  ],
  providers: [
    provideHttpClient(
      withInterceptors([authJwtInterceptor]),
      withJsonpSupport()
    ),
    // environment service
    EnvServiceProvider,
    // parts and fragments type IDs to editor group keys mappings
    // https://github.com/nrwl/nx/issues/208#issuecomment-384102058
    // inject like: @Inject('partEditorKeys') partEditorKeys: PartEditorKeys
    {
      provide: 'partEditorKeys',
      useValue: PART_EDITOR_KEYS,
    },
    // index lookup definitions
    {
      provide: 'indexLookupDefinitions',
      useValue: INDEX_LOOKUP_DEFINITIONS,
    },
    // item browsers IDs to editor keys mappings
    // inject like: @Inject('itemBrowserKeys') itemBrowserKeys: { [key: string]: string }
    {
      provide: 'itemBrowserKeys',
      useValue: ITEM_BROWSER_KEYS,
    },
    // HTTP interceptor
    // https://medium.com/@ryanchenkie_40935/angular-authentication-using-the-http-client-and-http-interceptors-2f9d1540eb8
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: AuthJwtInterceptor,
    //   multi: true,
    // },
  ],
})
export class AppModule {}
