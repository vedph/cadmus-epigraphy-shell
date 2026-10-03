import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, of } from 'rxjs';

import { AuthJwtService, User } from '@myrmidon/auth-jwt-login';
import { EditedObject } from '@myrmidon/cadmus-core';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { AppRepository, PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-item-editor';

import {
  EPI_SUPPORT_PART_TYPEID,
  EpiSupportPart,
} from '../epi-support-part';
import { EpiSupportPartComponent } from '../epi-support-part/epi-support-part.component';
import { EpiSupportPartFeatureComponent } from './epi-support-part-feature.component';

@Component({
  selector: 'cadmus-current-item-bar',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MockCurrentItemBarComponent {}

describe('EpiSupportPartFeatureComponent', () => {
  let component: EpiSupportPartFeatureComponent;
  let fixture: ComponentFixture<EpiSupportPartFeatureComponent>;
  let editorService: {
    loading$: BehaviorSubject<boolean>;
    saving$: BehaviorSubject<boolean>;
    load: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let snackbar: { open: ReturnType<typeof vi.fn> };
  let data: EditedObject<EpiSupportPart>;

  async function setup(pid: string, rid?: string): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [EpiSupportPartFeatureComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { iid: 'i1', pid },
              routeConfig: { path: EPI_SUPPORT_PART_TYPEID + '/:pid' },
              queryParams: rid ? { rid } : {},
            },
          },
        },
        { provide: MatSnackBar, useValue: snackbar },
        { provide: ItemService, useValue: {} },
        { provide: ThesaurusService, useValue: {} },
        { provide: PartEditorService, useValue: editorService },
        {
          provide: AuthJwtService,
          useValue: {
            currentUserValue: { userName: 'zeus', roles: ['editor'] },
            currentUser$: of({ userName: 'zeus', roles: ['editor'] } as User),
          },
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
      .overrideComponent(EpiSupportPartFeatureComponent, {
        remove: { imports: [CurrentItemBarComponent] },
        add: { imports: [MockCurrentItemBarComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(EpiSupportPartFeatureComponent);
    component = fixture.componentInstance;
    // the snackbar may come from the standalone injector (MatSnackBarModule
    // imported by the editor), so spy on the instance actually injected
    const injectedSnackbar = fixture.debugElement.injector.get(MatSnackBar);
    if (injectedSnackbar !== (snackbar as unknown)) {
      vi.spyOn(injectedSnackbar, 'open').mockImplementation(
        snackbar.open as any,
      );
    }
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function getEditor(): EpiSupportPartComponent {
    return fixture.debugElement.query(
      (de) => de.componentInstance instanceof EpiSupportPartComponent,
    ).componentInstance;
  }

  beforeEach(() => {
    data = {
      value: {
        id: 'p1',
        itemId: 'i1',
        typeId: EPI_SUPPORT_PART_TYPEID,
        timeCreated: new Date(),
        creatorId: 'zeus',
        timeModified: new Date(),
        userId: 'zeus',
        material: 'marble',
      },
      thesauri: {},
    };
    editorService = {
      loading$: new BehaviorSubject<boolean>(false),
      saving$: new BehaviorSubject<boolean>(false),
      load: vi.fn().mockResolvedValue(data),
      save: vi.fn().mockImplementation((p) => Promise.resolve(p)),
    };
    router = { navigate: vi.fn() };
    snackbar = { open: vi.fn() };
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should build identity from route', async () => {
    await setup('p1');
    expect(component.identity()).toEqual({
      itemId: 'i1',
      typeId: EPI_SUPPORT_PART_TYPEID,
      partId: 'p1',
      roleId: undefined,
    });
  });

  it('should set null part ID and role for new default part', async () => {
    await setup('new', 'default');
    expect(component.identity().partId).toBeNull();
    expect(component.identity().roleId).toBeNull();
  });

  it('should load data requesting support thesauri', async () => {
    await setup('p1');
    expect(editorService.load).toHaveBeenCalledWith(component.identity(), [
      'epi-support-materials',
      'epi-support-object-types',
      'epi-support-count-types',
      'epi-support-count-tags',
      'epi-support-features',
      'physical-size-units',
      'physical-size-tags',
      'physical-size-dim-tags',
      'epi-support-text-area-types',
      'epi-support-text-area-layouts',
      'epi-support-text-area-features',
      'epi-support-text-area-frame-types',
    ]);
    expect(component.data()).toBe(data);
  });

  it('should pass data and identity to the editor', async () => {
    await setup('p1');
    const editor = getEditor();
    expect(editor.identity()).toEqual(component.identity());
    expect(editor.form.material().value()).toBe('marble');
  });

  it('should track editor dirty state', async () => {
    await setup('p1');
    const editor = getEditor();
    editor.form.material().value.set('stone');
    editor.form.material().markAsDirty();
    // dirtyChange is emitted by an effect
    fixture.detectChanges();
    expect(component.dirty()).toBe(true);
    expect(component.canDeactivate()).toBe(false);
  });

  it('should save the edited part', async () => {
    await setup('p1');
    const editor = getEditor();
    editor.form.material().value.set('stone');
    editor.form.material().markAsDirty();
    editor.save();
    await fixture.whenStable();

    expect(editorService.save).toHaveBeenCalledTimes(1);
    const saved = editorService.save.mock.calls[0][0] as EpiSupportPart;
    expect(saved.id).toBe('p1');
    expect(saved.material).toBe('stone');
    await vi.waitFor(() =>
      expect(snackbar.open).toHaveBeenCalledWith('Part saved', 'OK', {
        duration: 3000,
      }),
    );
  });

  it('should update part ID after saving a new part', async () => {
    data.value!.id = '';
    editorService.save.mockImplementation((p: EpiSupportPart) =>
      Promise.resolve({ ...p, id: 'p2' }),
    );
    await setup('new');
    getEditor().save();
    await vi.waitFor(() => expect(component.identity().partId).toBe('p2'));
  });

  it('should restore dirty state when save fails', async () => {
    editorService.save.mockRejectedValue(new Error('boom'));
    await setup('p1');
    getEditor().save();
    await vi.waitFor(() =>
      expect(snackbar.open).toHaveBeenCalledWith('boom', 'OK'),
    );
    expect(component.dirty()).toBe(true);
  });

  it('should navigate to item on close', async () => {
    await setup('p1');
    getEditor().close();
    expect(router.navigate).toHaveBeenCalledWith(['items', 'i1']);
  });
});
