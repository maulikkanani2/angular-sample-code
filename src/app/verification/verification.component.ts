import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from "@angular/material";

import { EncrDecrService } from '../EncrDecr.service';
import { AirtableService } from '../airtable.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.scss']
})
export class VerificationComponent implements OnInit {
  emailId: any;
  constructor(
    private route: ActivatedRoute,
    private _encrDecrService: EncrDecrService,
    private _airservice: AirtableService,
    private snackbar: MatSnackBar,
    private routes: Router) {
    this.emailId = this.route.snapshot.paramMap.get('verifyId');
    this.verifyUser();
  }

  verifyUser = async () => {
    await this._encrDecrService.get("emailVerify", this.emailId).then(async emailResults => {
      let payload = `AND({Email}="${emailResults}")`;
      await this._airservice.getCollaborators(payload).then(async results => {
        await this._airservice.updateCollaborators(results[0].id, { fields: { isVerify: "true" } }).toPromise().then(async (rec) => {
          this.routes.navigate(['/']);
          let data = {
            "to": emailResults,
            "url": environment.serverUrl,
          }
          await this._airservice.sendMailToInviteUSer(data).subscribe(
            data => {
              if (data && results) {
                this.snackbar.open("verify your account successfully, please check your mail-box", null, {
                  duration: 5000
                });
              } else {
                this.snackbar.open("somthing wan't wroong to verify your account, please contect your manager", null, {
                  duration: 5000
                });
              }
            },
            error => {
              this.snackbar.open(error, null, {
                duration: 2000
              });
            });
        });
      });
    });
  }

  ngOnInit() {

  }

}
