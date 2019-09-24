import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from "@angular/material";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { EncrDecrService } from '../EncrDecr.service';
import { AirtableService } from '../airtable.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  userId: string;
  restForm: FormGroup;
  loading = false;
  submitted = false;
  pass: object;

  constructor(
    private route: ActivatedRoute,
    private _encrDecrService: EncrDecrService,
    private _airservice: AirtableService,
    private snackbar: MatSnackBar,
    private routes: Router,
    private formBuilder: FormBuilder,
  ) {
    this.userId = this.route.snapshot.paramMap.get('id');
    console.log("log: ", this.userId);
  }

  ngOnInit() {
    this.restForm = this.formBuilder.group({
      password: ['', Validators.required],
      confirmPass: ['', Validators.required]
    }, { validator: this.checkIfMatchingPasswords('password', 'confirmPass') });
  }

  checkIfMatchingPasswords(passwordKey: string, passwordConfirmationKey: string) {
    return (group: FormGroup) => {
      let passwordInput = group.controls[passwordKey],
        passwordConfirmationInput = group.controls[passwordConfirmationKey];
      if (passwordInput.value !== passwordConfirmationInput.value) {
        return passwordConfirmationInput.setErrors({ notEquivalent: true })
      }
      else {
        return passwordConfirmationInput.setErrors(null);
      }
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.restForm.controls; }

  async onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.restForm.invalid) {
      return;
    }
    this.loading = true;
    await this._encrDecrService.set("password", this.f.password.value).then(async results => {
      this.pass = results;
    });
    let payload = `AND({ID}="${this.userId}")`;
    await this._airservice.getCollaborators(payload).then(async results => {
      await this._airservice.updateCollaborators(results[0].id, { fields: { Password: this.pass } }).toPromise().then(async (rec) => {
        this.snackbar.open('your password reset successfully, now you can login with you new password', null, {
          duration: 5000
        });
        this.routes.navigate(['login']);
      });
    });
  }

}
