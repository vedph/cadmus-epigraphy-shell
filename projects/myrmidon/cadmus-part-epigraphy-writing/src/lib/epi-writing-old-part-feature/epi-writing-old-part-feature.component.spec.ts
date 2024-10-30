import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiWritingOldPartFeatureComponent } from './epi-writing-old-part-feature.component';

describe('EpiWritingOldPartFeatureComponent', () => {
  let component: EpiWritingOldPartFeatureComponent;
  let fixture: ComponentFixture<EpiWritingOldPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EpiWritingOldPartFeatureComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EpiWritingOldPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
