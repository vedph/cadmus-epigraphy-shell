import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiWritingPartFeatureComponent } from './epi-writing-part-feature.component';

describe('EpiWritingPartFeatureComponent', () => {
  let component: EpiWritingPartFeatureComponent;
  let fixture: ComponentFixture<EpiWritingPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EpiWritingPartFeatureComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpiWritingPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
