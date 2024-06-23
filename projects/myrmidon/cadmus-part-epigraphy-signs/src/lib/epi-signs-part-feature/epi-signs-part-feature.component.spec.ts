import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiSignsPartFeatureComponent } from './epi-signs-part-feature.component';

describe('EpiSignsPartFeatureComponent', () => {
  let component: EpiSignsPartFeatureComponent;
  let fixture: ComponentFixture<EpiSignsPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpiSignsPartFeatureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpiSignsPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
