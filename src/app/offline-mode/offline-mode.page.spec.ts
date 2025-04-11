import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OfflineModePage } from './offline-mode.page';

describe('OfflineModePage', () => {
  let component: OfflineModePage;
  let fixture: ComponentFixture<OfflineModePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OfflineModePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
