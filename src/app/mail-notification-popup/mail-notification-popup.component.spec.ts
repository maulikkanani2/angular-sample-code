import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MailNotificationPopupComponent } from './mail-notification-popup.component';

describe('MailNotificationPopupComponent', () => {
  let component: MailNotificationPopupComponent;
  let fixture: ComponentFixture<MailNotificationPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MailNotificationPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailNotificationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
