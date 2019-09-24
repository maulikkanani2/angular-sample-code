import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-popup-email-error',
  templateUrl: './popup-email-error.component.html',
  styleUrls: ['./popup-email-error.component.scss']
})
export class PopupEmailErrorComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PopupEmailErrorComponent>,
  ) { }

  ngOnInit() {
  }
  
  onNoClick(): void {
    this.dialogRef.close();
  }
}
