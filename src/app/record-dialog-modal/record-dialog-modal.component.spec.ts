import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordDialogModalComponent } from './record-dialog-modal.component';

describe('RecordDialogModalComponent', () => {
  let component: RecordDialogModalComponent;
  let fixture: ComponentFixture<RecordDialogModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecordDialogModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordDialogModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
