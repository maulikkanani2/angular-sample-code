import { Component, ViewEncapsulation, OnInit, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-message',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="task-confirm-toolbar" mat-dialog-title>
      Task Confirmation
      <button mat-icon-button mat-dialog-close>
        <mat-icon>clear</mat-icon>
      </button>
    </div>
    <mat-dialog-content class="task-confirm-content">
      <div>
        <span class="font-weight-bold">
          I agree that I will give my best effort to complete it in a timely and quality manner
        </span>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="center">
      <button mat-raised-button color="primary" (click)="onSubmit($event)">I agree</button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./task-confirm.component.scss']
})
export class TaskConfirmComponent implements OnInit {
  task: object;

  constructor(
    @Inject('shared') private shared,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private routes: Router,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<TaskConfirmComponent>) {
    if (data) {
      this.task = data;
    }
  }

  ngOnInit() {
  }

  async onSubmit(event) {
    this.shared.doStartTracker(event, this.task);
    this.routes.navigate(['/']);
    this.dialog.closeAll();
  }

}