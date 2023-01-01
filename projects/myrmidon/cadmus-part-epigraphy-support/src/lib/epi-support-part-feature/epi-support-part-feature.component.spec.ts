import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiSupportPartFeatureComponent } from './epi-support-part-feature.component';

describe('EpiSupportPartFeatureComponent', () => {
  let component: EpiSupportPartFeatureComponent;
  let fixture: ComponentFixture<EpiSupportPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EpiSupportPartFeatureComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpiSupportPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
