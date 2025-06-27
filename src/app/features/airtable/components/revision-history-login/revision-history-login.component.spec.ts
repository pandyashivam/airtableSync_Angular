import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevisionHistoryLoginComponent } from './revision-history-login.component';

describe('RevisionHistoryLoginComponent', () => {
  let component: RevisionHistoryLoginComponent;
  let fixture: ComponentFixture<RevisionHistoryLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevisionHistoryLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevisionHistoryLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
