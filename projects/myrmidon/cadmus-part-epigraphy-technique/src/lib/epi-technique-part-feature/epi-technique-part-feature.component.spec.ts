import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiTechniquePartFeatureComponent } from './epi-technique-part-feature.component';

describe('EpiTechniquePartFeatureComponent', () => {
  let component: EpiTechniquePartFeatureComponent;
  let fixture: ComponentFixture<EpiTechniquePartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpiTechniquePartFeatureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpiTechniquePartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
