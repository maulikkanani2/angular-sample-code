import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef } from "@angular/material";
import { LOCAL_STORAGE, WebStorageService } from 'angular-webstorage-service';

@Component({
  selector: 'app-check-process-st-login',
  templateUrl: './check-process-st-login.component.html',
  styleUrls: ['./check-process-st-login.component.scss']
})
export class CheckProcessStLoginComponent implements OnInit {

  constructor(
    private route: Router, 
    public dialogRef: MatDialogRef<CheckProcessStLoginComponent>,
    @Inject(LOCAL_STORAGE) private storage: WebStorageService,) { }

  ngOnInit() {
  }

  checkLogin() {
    this.storage.set('process_stIsLogin', true);
    this.dialogRef.close('User login with process.st successfully');
    this.route.navigate(['/']);
    setTimeout(() => {
      location.reload();
    }, 500);
  }

}
