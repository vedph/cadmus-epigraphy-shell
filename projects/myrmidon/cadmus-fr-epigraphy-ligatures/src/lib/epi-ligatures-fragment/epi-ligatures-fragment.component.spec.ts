import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiLigaturesFragmentComponent } from './epi-ligatures-fragment.component';

describe('EpiLigaturesFragmentComponent', () => {
  let component: EpiLigaturesFragmentComponent;
  let fixture: ComponentFixture<EpiLigaturesFragmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [EpiLigaturesFragmentComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(EpiLigaturesFragmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
