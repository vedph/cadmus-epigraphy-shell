import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiScriptsPartFeatureComponent } from './epi-scripts-part-feature.component';

describe('EpiScriptsPartFeatureComponent', () => {
  let component: EpiScriptsPartFeatureComponent;
  let fixture: ComponentFixture<EpiScriptsPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpiScriptsPartFeatureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpiScriptsPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
