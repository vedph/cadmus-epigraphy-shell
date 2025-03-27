import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiTextAreaComponent } from './epi-text-area.component';

describe('EpiTextAreaComponent', () => {
  let component: EpiTextAreaComponent;
  let fixture: ComponentFixture<EpiTextAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpiTextAreaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpiTextAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
