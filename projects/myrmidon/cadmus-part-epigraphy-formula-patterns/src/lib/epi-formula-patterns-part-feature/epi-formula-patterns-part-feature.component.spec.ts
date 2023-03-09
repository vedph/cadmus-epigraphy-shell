import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiFormulaPatternsPartFeatureComponent } from './epi-formula-patterns-part-feature.component';

describe('EpiFormulaPatternsPartFeatureComponent', () => {
  let component: EpiFormulaPatternsPartFeatureComponent;
  let fixture: ComponentFixture<EpiFormulaPatternsPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EpiFormulaPatternsPartFeatureComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpiFormulaPatternsPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
