import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEmailErrorComponent } from './popup-email-error.component';

describe('PopupEmailErrorComponent', () => {
  let component: PopupEmailErrorComponent;
  let fixture: ComponentFixture<PopupEmailErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupEmailErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupEmailErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
