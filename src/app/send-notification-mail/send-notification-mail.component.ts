import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog } from "@angular/material";
import { LOCAL_STORAGE, WebStorageService } from 'angular-webstorage-service';

import { MailNotificationPopupComponent } from '../mail-notification-popup/mail-notification-popup.component';

@Component({
  selector: 'app-send-notification-mail',
  templateUrl: './send-notification-mail.component.html',
  styleUrls: ['./send-notification-mail.component.scss']
})
export class SendNotificationMailComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    @Inject(LOCAL_STORAGE) private storage: WebStorageService,) {
    this.openDialog();
    this.storage.set('dialog', 1);
  }

  ngOnInit() {

  }

  openDialog() {
    if(this.storage.get('dialog') <= 0) {
      this.dialog.open(MailNotificationPopupComponent, {
        width: '60%',
        height: '80%',
        disableClose: true
      });
    }
  }

}
