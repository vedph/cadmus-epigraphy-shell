import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiSupportFrrPartFeatureComponent } from './epi-support-frr-part-feature.component';

describe('EpiSupportFrrPartFeatureComponent', () => {
  let component: EpiSupportFrrPartFeatureComponent;
  let fixture: ComponentFixture<EpiSupportFrrPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpiSupportFrrPartFeatureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpiSupportFrrPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
