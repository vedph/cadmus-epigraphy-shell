import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiLigaturesFragmentFeatureComponent } from './epi-ligatures-fragment-feature.component';

describe('EpiLigaturesFragmentFeatureComponent', () => {
  let component: EpiLigaturesFragmentFeatureComponent;
  let fixture: ComponentFixture<EpiLigaturesFragmentFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [EpiLigaturesFragmentFeatureComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(EpiLigaturesFragmentFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
