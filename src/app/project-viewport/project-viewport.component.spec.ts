import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectViewportComponent } from './project-viewport.component';

describe('ProjectViewportComponent', () => {
  let component: ProjectViewportComponent;
  let fixture: ComponentFixture<ProjectViewportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectViewportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectViewportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
