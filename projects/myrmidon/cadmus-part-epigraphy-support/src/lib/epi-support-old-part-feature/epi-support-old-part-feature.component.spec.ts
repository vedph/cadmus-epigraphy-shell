import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiSupportOldPartFeatureComponent } from './epi-support-old-part-feature.component';

describe('EpiSupportOldPartFeatureComponent', () => {
  let component: EpiSupportOldPartFeatureComponent;
  let fixture: ComponentFixture<EpiSupportOldPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EpiSupportOldPartFeatureComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpiSupportOldPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
