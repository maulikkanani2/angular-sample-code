import { Component, OnInit, Inject } from '@angular/core';
import { LOCAL_STORAGE, WebStorageService } from 'angular-webstorage-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatSnackBar } from "@angular/material";
import { Router } from '@angular/router';
import * as moment from 'moment';


import { AirtableService } from '../airtable.service';

@Component({
  selector: 'app-mail-notification-popup',
  templateUrl: './mail-notification-popup.component.html',
  styleUrls: ['./mail-notification-popup.component.scss']
})
export class MailNotificationPopupComponent implements OnInit {
  notificatioForm: FormGroup;
  loading = false;
  submitted = false;
  mailto: string;
  cc: string;
  body: any;
  subject: any;

  constructor(
    private routes: Router,
    private formBuilder: FormBuilder,
    private _airservice: AirtableService,
    private snackbar: MatSnackBar,
    public dialogRef: MatDialogRef<MailNotificationPopupComponent>,
    @Inject(LOCAL_STORAGE) private storage: WebStorageService, ) {
    let url = decodeURIComponent(decodeURIComponent(this.routes.url))
    this.mailto = url.split(":").join(",").split("?")[1].split(",")[1];
    this.cc = url.split(":").join(",").split("?")[2].split("&")[0].split("=")[1];
    this.subject = url.split(":").join(",").split("?")[2].split("&")[1].split("=")[1];
    // this.subject = url.split(":").join(",").split("?")[2].split("&");
    if ((url.indexOf("&subject") + 1)) {
      this.subject = url.split(":").join(",").split("?")[2].split("&subject")[1].split("=")[1];
      this.body = url.split(":").join(",").split("?")[2].split("&body")[1].split("=")[1];
    } else {
      this.subject = "--";
      this.body = url.split(":").join(",").split("?")[2].split("&")[1].split("=")[1];
    }
  }

  ngOnInit() {
    this.notificatioForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      ccEmail: ['', Validators.required],
      subject: ['', Validators.required],
      body: ['', Validators.required],
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.notificatioForm.controls; }

  async onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.notificatioForm.invalid) {
      return;
    }
    this.loading = true;

    if ((this.f.email.value.indexOf("{{") + 1) || (this.f.ccEmail.value.indexOf("{{") + 1) || (this.f.subject.value.indexOf("{{") + 1) || (this.f.body.value.indexOf("{{") + 1) || (this.f.email.value.indexOf("}}") + 1) || (this.f.ccEmail.value.indexOf("}}") + 1) || (this.f.subject.value.indexOf("}}") + 1) || (this.f.body.value.indexOf("}}") + 1)) {
      this.snackbar.open('Please fill all the variable value', null, {
        duration: 2000
      });
      this.loading = false;
    } else {
      try {
        let ccData = [];
        let toCollaborators, fromCollaborators, CC_Collaborators;
        let ccmail = this.f.ccEmail.value.split("; ");
        ccmail.map(async (data) => {
          await this._airservice.getCollaborators(`AND({email}="${data}")`)
            .then(async results => (CC_Collaborators = results))
            .catch((error) => {
              this.snackbar.open('Please add comma and space between 2 CC email address', null, {
                duration: 2000
              });
              this.loading = false;
            });
          if (CC_Collaborators.length > 0) {
            ccData.push(CC_Collaborators[0].id);
          } else {
            this.snackbar.open('Please add comma and space between 2 CC email address', null, {
              duration: 2000
            });
            this.loading = false;
          }
          if (ccmail.length == ccData.length) {
            console.log("ccData: ", ccData);
            await this._airservice.getCollaborators(`AND({email}="${this.f.email.value}")`)
              .then(async results => (toCollaborators = results));
            await this._airservice.getCollaborators(`AND({email}="${this.storage.get('email')}")`)
              .then(async results => (fromCollaborators = results));
            if (toCollaborators.length) {
              // austin@phoenixseolab.com maulik.kanani@phoenixseolab.com
              var check = moment(new Date(), 'YYYY/MM/DD').add(1, 'days');
              var month = check.format('M');
              var day = check.format('D');
              var year = check.format('YYYY');
              let payload = {
                "fields": {
                  "From": [fromCollaborators && fromCollaborators[0].id],
                  "To": [toCollaborators && toCollaborators[0].id],
                  "CC": ccData,
                  "Subject": this.f.subject.value,
                  "Message": this.f.body.value,
                  "Type": "New Mention",
                  "SendEmailNotification": "true",
                  "SendNotificationTime": moment(`${month}/${day}/${year} 08:00 AM`, 'MM/DD/YYYY hh:mm A'),
                  "Created Date": new Date().toISOString(),
                  "pending Notify": 0,
                  "Opened": "false"
                }
              }

              await this._airservice.addNotification(payload).then(async results => {
                this.snackbar.open('Notification send successfully', null, {
                  duration: 2000
                });
                this.loading = false;
                this.close();
              }).catch((error) => {
                this.snackbar.open(error, null, {
                  duration: 2000
                });
                this.loading = false;
              });
            } else {
              this.snackbar.open('Please check To and CC email address is correct', null, {
                duration: 2000
              });
              this.loading = false;
            }
          }
        });
      } catch (err) {
        console.log(err);
      }
    }
  }

  close() {
    this.dialogRef.close();
    this.storage.set('dialog', 0)
    this.routes.navigate(['/']);
  }

}
