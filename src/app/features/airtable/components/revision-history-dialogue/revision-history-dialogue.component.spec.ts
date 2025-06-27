import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevisionHistoryDialogueComponent } from './revision-history-dialogue.component';

describe('RevisionHistoryDialogueComponent', () => {
  let component: RevisionHistoryDialogueComponent;
  let fixture: ComponentFixture<RevisionHistoryDialogueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevisionHistoryDialogueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevisionHistoryDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
