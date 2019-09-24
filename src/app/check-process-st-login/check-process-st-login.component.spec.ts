import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckProcessStLoginComponent } from './check-process-st-login.component';

describe('CheckProcessStLoginComponent', () => {
  let component: CheckProcessStLoginComponent;
  let fixture: ComponentFixture<CheckProcessStLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckProcessStLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckProcessStLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
