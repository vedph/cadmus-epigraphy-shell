import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiSignComponent } from './epi-sign.component';

describe('EpiSignComponent', () => {
  let component: EpiSignComponent;
  let fixture: ComponentFixture<EpiSignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpiSignComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpiSignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
