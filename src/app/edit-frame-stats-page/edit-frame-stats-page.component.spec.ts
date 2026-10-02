import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideEchartsCore } from 'ngx-echarts';

import { EditFrameStatsPageComponent } from './edit-frame-stats-page.component';

describe('EditFrameStatsPageComponent', () => {
  let component: EditFrameStatsPageComponent;
  let fixture: ComponentFixture<EditFrameStatsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditFrameStatsPageComponent],
      providers: [
        provideNativeDateAdapter(),
        provideEchartsCore({ echarts: () => import('echarts') }),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditFrameStatsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
