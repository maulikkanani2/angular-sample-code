import { Component, OnInit, ElementRef, AfterViewInit, VERSION, Inject } from '@angular/core';
import { LOCAL_STORAGE, WebStorageService } from 'angular-webstorage-service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { MatDialog } from "@angular/material";

import { AirtableService } from '../airtable.service';
import { EncrDecrService } from '../EncrDecr.service';
import { CheckProcessStLoginComponent } from '../check-process-st-login/check-process-st-login.component';
import { environment } from '../../environments/environment';

declare const gapi: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements AfterViewInit {

  loginForm: FormGroup;
  forgotForm: FormGroup;
  collaboratorTypes = ['Contact', 'Freelancer', 'Independent Contractor', 'Employee', 'Manager', 'Client'];
  collaboratorUnits = ['Hour'];
  loading = false;
  submitted = false;
  pass: object;
  login: string;
  signup: string;

  title = 'app';
  private clientId: string = '1036954053681-e7493tqr2sn8sbnb944qprrc7pssv3cd.apps.googleusercontent.com';
  private scope = [
    'profile',
    'email',
    'https://www.googleapis.com/auth/plus.me',
    //'https://www.googleapis.com/auth/contacts.readonly',
    // 'https://www.googleapis.com/auth/admin.directory.user.readonly'
  ].join(' ');
  public auth2: any;

  constructor(
    private element: ElementRef,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private _airservice: AirtableService,
    private _encrDecrService: EncrDecrService,
    @Inject(LOCAL_STORAGE) private storage: WebStorageService,
    private route: Router) { }

  ngOnInit() {
    this.login = "block";
    this.signup = "none";
    if (this.storage.get('token')) {
      this.route.navigate(['/'])
    }
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.forgotForm = this.formBuilder.group({
      forgotEmail: ['', [Validators.required, Validators.email]],
    });
  }

  // convenience getter for easy access to form fields
  get f1() { return this.loginForm.controls; }

  // convenience getter for easy access to form fields
  get f() { return this.forgotForm.controls; }

  ngAfterViewInit() {
    this.googleInit();
  }

  public googleInit() {
    setTimeout(() => {
      gapi.load('auth2', () => {
        this.auth2 = gapi.auth2.init({
          client_id: this.clientId,
          cookiepolicy: 'single_host_origin',
          scope: this.scope
        });
      });
    }, 1000);
  }

  public attachSignin(event) {
    event.preventDefault();
    const element = event.target;

    // this.storage.set('token', "eyJhbGciOiJSUzI1NiIsImtpZCI6IjZmYjA1Zjc0MjM2NmVlNGNmNGJjZjQ5Zjk4NGM0ODdlNDVjOGM4M2QiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiMTAzNjk1NDA1MzY4MS1lNzQ5M3RxcjJzbjhzYm5iOTQ0cXBycmM3cHNzdjNjZC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF1ZCI6IjEwMzY5NTQwNTM2ODEtZTc0OTN0cXIyc244c2JuYjk0NHFwcnJjN3Bzc3YzY2QuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDI1MTA4NDEzOTM4NjMyMzk2OTMiLCJoZCI6InBob2VuaXhzZW9sYWIuY29tIiwiZW1haWwiOiJjaGlyYWcua2h1bnRAcGhvZW5peHNlb2xhYi5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6InBIZWlwX2pkWk93TjVvUnJ1R0EzX1EiLCJuYW1lIjoiQ2hpcmFnIEtodW50IiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS8tUnp6WldWRS1UV28vQUFBQUFBQUFBQUkvQUFBQUFBQUFBQUEvQUNldm9RT21tRlphYV9nSFlTaG5PNHc5RjJoa1cwV3RzUS9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoiQ2hpcmFnIiwiZmFtaWx5X25hbWUiOiJLaHVudCIsImxvY2FsZSI6ImVuIiwiaWF0IjoxNTQ5NDUwNDMwLCJleHAiOjE1NDk0NTQwMzAsImp0aSI6IjUxYTlkNjAyYWU1NGRjMmM1MzU1OWVjYWYzYjZmZGEwYjA5ZWFlZjMifQ.3TVgIHP5pk0UuU-_dpdSk1F2qEycAElPIv3Hkigyme-XRy7m0rdCgXVgsqpYPKIuAS2al7NvCT7k_vObBGBc0_N7VqAJGSc-tCUk5JgT_aJOVeCi9B_95ntVL0D1NkVNauoH6PckKn0lasdYMY9KnGuzxV4905KzHtkE9Pia3AOsWE_l01KpGoTXxKCYO_dkY0dqKSJPeNB82ofdQL2lpx2zFK4RrifPeyWj6zVHPN-LgylI7BsLoVWGIgEh_2iyXLLcG7iRFLqQrD-cGxlgnq2GWkw8hdu9UNCfOECIA34zQoqkEBEkdFPewhV-wljk-2X35QG860niAt6bgSC-gg");
    // this.storage.set('id', "102510841393863239693");
    // this.storage.set('name', "Chirag Khunt");
    // this.storage.set('image_url', "https://lh3.googleusercontent.com/-RzzZWVE-TWo/AAAAAAAAAAI/AAAAAAAAAAA/ACevoQOmmFZaa_gHYShnO4w9F2hkW0WtsQ/s96-c/photo.jpg");
    // this.storage.set('email', "chirag.khunt@phoenixseolab.com"); // austin@phoenixseolab.com maulik.kanani@phoenixseolab.com
    // let dt = new Date();
    // dt.setHours(dt.getHours() + 8); // getSeconds() + 15 getHours() + 8
    // this.storage.set('expiryTime', dt.valueOf());
    // this.openDialog();
    // // this.route.navigate(['/']);
    // // setTimeout(() => {
    // //   // location.reload();
    // // }, 5000);

    this.auth2.attachClickHandler(element, {},
      (googleUser) => {
        let profile = googleUser.getBasicProfile();
        if (/@phoenixseolab.com\s*$/.test(profile.getEmail())) {
          this.storage.set('token', googleUser.getAuthResponse().id_token);
          this.storage.set('id', profile.getId());
          this.storage.set('name', profile.getName());
          this.storage.set('image_url', profile.getImageUrl());
          this.storage.set('email', profile.getEmail());
          let dt = new Date();
          dt.setHours(dt.getHours() + 8); // getSeconds() + 15 getHours() + 8
          this.storage.set('expiryTime', dt.valueOf());
          this.openDialog();
          // this.route.navigate(['/']);
          // setTimeout(() => {
          //   // location.reload();
          // }, 5000);
        } else {
          this.snackbar.open('Valid email address required to access this screen!', null, {
            duration: 2000
          });
        }
      }, function (error) {
        console.log(JSON.stringify(error, undefined, 2));
      });

  }

  async onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    this.loading = true;
    let payload = `AND({Email}="${this.f1.email.value}")`;

    await this._airservice.userLogin(payload).then(async results => {
      this.loading = false;
      if (results[0].fields.isVerify == "true") {
        await this._encrDecrService.get("password", results[0].fields.Password).then(async loginResults => {
          if (loginResults == this.f1.password.value) {
            this.storage.set('token', results[0].fields.Password);
            this.storage.set('id', results[0].id);
            this.storage.set('name', results[0].fields['Full Name']);
            this.storage.set('image_url', "https://www.qualiscare.com/wp-content/uploads/2017/08/default-user.png");
            this.storage.set('email', results[0].fields.Email);
            let dt = new Date();
            dt.setHours(dt.getHours() + 8); // getSeconds() + 15 getHours() + 8
            this.storage.set('expiryTime', dt.valueOf());
            this.openDialog();
          } else {
            this.snackbar.open('you have enter wrong password, this is case sensitive field!', null, {
              duration: 2000
            });
          }
        });
      } else {
        this.snackbar.open('Please verify your email address first!', null, {
          duration: 2000
        });
      }
    });
  }

  async onForgotSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.forgotForm.invalid) {
      return;
    }
    this.loading = true;
    let payload = `AND({Email}="${this.f.forgotEmail.value}")`;

    await this._airservice.userLogin(payload).then(async results => {
      this.loading = false;
      if (results[0]) {
        console.log("results[0]: ", results[0]);
        let data = {
          "to": results[0].fields.Email,
          "id": results[0].fields.ID,
          "name":results[0].fields['Full Name'],
          "url": environment.serverUrl,
          "type": "resetPassword",
        }
        await this._airservice.sendMailToInviteUSer(data).subscribe(
          data => {
            if (data && results) {
              this.snackbar.open("send reset-password link successfully, please check your mail-box", null, {
                duration: 5000
              });
            } else {
              this.snackbar.open("somthing wan't wrong to send reset-password link to your mail account, please contect your manager", null, {
                duration: 5000
              });
            }
          },
          error => {
            this.snackbar.open(error, null, {
              duration: 2000
            });
          });
      } else {
        this.snackbar.open('User not found with this email address, please contect your manager', null, {
          duration: 5000
        });
      }
    });
  }

  openDialog() {
    this.dialog.open(CheckProcessStLoginComponent, {
      width: '50%',
      height: '40%',
      disableClose: true
    });
  }

  showModel(type) {
    if (type == "forgot") {
      this.element.nativeElement.querySelector('.is-login').style.display = 'none';
      this.element.nativeElement.querySelector('.is-forgot').style.display = 'block';
    } else if (type == "login") {
      this.element.nativeElement.querySelector('.is-forgot').style.display = 'none';
      this.element.nativeElement.querySelector('.is-login').style.display = 'block';
    }
  }

}
