import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiFormulaPatternsPartComponent } from './epi-formula-patterns-part.component';

describe('EpigraphyFormulaPatternsPartComponent', () => {
  let component: EpiFormulaPatternsPartComponent;
  let fixture: ComponentFixture<EpiFormulaPatternsPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EpiFormulaPatternsPartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpiFormulaPatternsPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
