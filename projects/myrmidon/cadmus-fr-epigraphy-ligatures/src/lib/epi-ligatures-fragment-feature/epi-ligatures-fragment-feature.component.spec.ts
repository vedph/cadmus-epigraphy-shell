import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, of } from 'rxjs';

import { AuthJwtService, User } from '@myrmidon/auth-jwt-login';
import {
  EditedObject,
  LibraryRouteService,
  TextLayerPart,
} from '@myrmidon/cadmus-core';
import { AppRepository, FragmentEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-item-editor';

import {
  EPI_LIGATURES_FRAGMENT_TYPEID,
  EpiLigaturesFragment,
} from '../epi-ligatures-fragment';
import { EpiLigaturesFragmentComponent } from '../epi-ligatures-fragment/epi-ligatures-fragment.component';
import { EpiLigaturesFragmentFeatureComponent } from './epi-ligatures-fragment-feature.component';

@Component({
  selector: 'cadmus-current-item-bar',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MockCurrentItemBarComponent {}

const LAYER_TYPEID = 'it.vedph.token-text-layer';

function createLayerPart(): TextLayerPart {
  return {
    id: 'p1',
    itemId: 'i1',
    typeId: LAYER_TYPEID,
    roleId: 'fr.' + EPI_LIGATURES_FRAGMENT_TYPEID,
    timeCreated: new Date(),
    creatorId: 'zeus',
    timeModified: new Date(),
    userId: 'zeus',
    fragments: [
      { location: '1.1', types: ['inl'] } as EpiLigaturesFragment,
      { location: '1.2', types: ['lig'], eid: 'e1' } as EpiLigaturesFragment,
    ],
  };
}

describe('EpiLigaturesFragmentFeatureComponent', () => {
  let component: EpiLigaturesFragmentFeatureComponent;
  let fixture: ComponentFixture<EpiLigaturesFragmentFeatureComponent>;
  let editorService: {
    loading$: BehaviorSubject<boolean>;
    saving$: BehaviorSubject<boolean>;
    load: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let snackbar: { open: ReturnType<typeof vi.fn> };
  let data: EditedObject<EpiLigaturesFragment>;

  beforeEach(async () => {
    const part = createLayerPart();
    data = {
      value: part.fragments[1] as EpiLigaturesFragment,
      layerPart: part,
      baseText: 'hello world',
      thesauri: {
        'epi-ligature-types': {
          id: 'epi-ligature-types@en',
          language: 'en',
          entries: [
            { id: 'lig', value: 'ligature' },
            { id: 'inl', value: 'inlay' },
          ],
        },
      },
    } as EditedObject<EpiLigaturesFragment>;

    editorService = {
      loading$: new BehaviorSubject<boolean>(false),
      saving$: new BehaviorSubject<boolean>(false),
      load: vi.fn().mockResolvedValue(data),
      save: vi.fn().mockImplementation((p) => Promise.resolve(p)),
    };
    router = { navigate: vi.fn() };
    snackbar = { open: vi.fn() };
    const user = { userName: 'zeus', roles: ['editor'] } as unknown as User;
    vi.spyOn(console, 'log').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [EpiLigaturesFragmentFeatureComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { iid: 'i1', pid: 'p1', loc: '1.2' },
              url: [
                { path: 'i1' },
                { path: 'p1' },
                { path: EPI_LIGATURES_FRAGMENT_TYPEID },
              ],
              queryParams: {},
            },
          },
        },
        { provide: MatSnackBar, useValue: snackbar },
        { provide: FragmentEditorService, useValue: editorService },
        {
          provide: LibraryRouteService,
          useValue: {
            getEditorKeyFromPartType: () => ({
              partKey: 'general',
              fragmentKeys: {},
            }),
          },
        },
        {
          provide: AuthJwtService,
          useValue: { currentUserValue: user, currentUser$: of(user) },
        },
        {
          provide: AppRepository,
          useValue: {
            getTypeThesaurus: () => undefined,
            getSettingFor: () => Promise.resolve(undefined),
          },
        },
      ],
    })
      .overrideComponent(EpiLigaturesFragmentFeatureComponent, {
        remove: { imports: [CurrentItemBarComponent] },
        add: { imports: [MockCurrentItemBarComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(EpiLigaturesFragmentFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  function getEditor(): EpiLigaturesFragmentComponent {
    return fixture.debugElement.query(
      (de) => de.componentInstance instanceof EpiLigaturesFragmentComponent,
    ).componentInstance;
  }

  it('should build identity from route', () => {
    expect(component.identity()).toEqual({
      itemId: 'i1',
      typeId: '',
      partId: 'p1',
      roleId: EPI_LIGATURES_FRAGMENT_TYPEID,
      frTypeId: EPI_LIGATURES_FRAGMENT_TYPEID,
      frRoleId: undefined,
      loc: '1.2',
    });
    expect(component.frLoc()?.toString()).toBe('1.2');
  });

  it('should load data requesting ligature types thesaurus', () => {
    expect(editorService.load).toHaveBeenCalledWith(component.identity(), [
      'epi-ligature-types',
    ]);
    expect(component.data()).toBe(data);
  });

  it('should pass loaded data to the editor', () => {
    const editor = getEditor();
    expect(editor.eid.value).toBe('e1');
    expect(editor.types.value).toEqual(['lig']);
    expect(editor.typeFlags().length).toBe(2);
  });

  it('should render the base text', () => {
    const text = fixture.nativeElement.querySelector(
      'cadmus-decorated-token-text',
    ) as HTMLElement;
    expect(text.textContent).toContain('hello');
  });

  it('should track editor dirty state', () => {
    const editor = getEditor();
    editor.eid.setValue('e2');
    editor.eid.markAsDirty();
    expect(component.dirty()).toBe(true);
    expect(component.canDeactivate()).toBe(false);
  });

  it('should save the edited fragment into its layer part', async () => {
    const editor = getEditor();
    editor.eid.setValue('e2');
    editor.save();
    await fixture.whenStable();

    expect(editorService.save).toHaveBeenCalledTimes(1);
    const saved = editorService.save.mock.calls[0][0] as TextLayerPart;
    expect(saved.fragments.length).toBe(2);
    expect((saved.fragments[1] as EpiLigaturesFragment).eid).toBe('e2');
    expect(saved.fragments[0]).toEqual(data.layerPart!.fragments[0]);
    await vi.waitFor(() =>
      expect(snackbar.open).toHaveBeenCalledWith('Fragment saved', 'OK', {
        duration: 3000,
      }),
    );
  });

  it('should navigate back to the layer part on close', () => {
    getEditor().close();
    expect(router.navigate).toHaveBeenCalledWith(
      [`/items/i1/general/${LAYER_TYPEID}/p1`],
      { queryParams: { rid: EPI_LIGATURES_FRAGMENT_TYPEID } },
    );
  });

  it('should report load errors', async () => {
    editorService.load.mockRejectedValue(new Error('boom'));
    component.ngOnInit();
    await vi.waitFor(() =>
      expect(snackbar.open).toHaveBeenCalledWith('boom', 'OK'),
    );
  });
});
