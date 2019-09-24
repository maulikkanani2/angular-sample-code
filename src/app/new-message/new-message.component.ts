import { Component, ViewEncapsulation, OnInit, NgModule } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatSnackBar } from "@angular/material";

import { AirtableService } from '../airtable.service';
import { EncrDecrService } from '../EncrDecr.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-new-message',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="new-message-toolbar" mat-dialog-title>
      <mat-icon>perm_identity</mat-icon> Invite a Collaborator
      <button mat-icon-button mat-dialog-close>
        <mat-icon>clear</mat-icon>
      </button>
    </div>
    <form [formGroup]="workerForm" (ngSubmit)="onSubmit()">

      <mat-dialog-content class="new-message-content">

      <div class="col-sm-8 form-group">
        <label>Email address</label>
        <input type="text" name="email" placeholder="Enter Email address" class="form-control"
          formControlName="email" [ngClass]="{ 'is-invalid': submitted && f.email.errors }" />
        <div *ngIf="submitted && f.email.errors" class="invalid-feedback">
          <div *ngIf="f.email.errors.required"><span style="color:red;">Email is required</span></div>
          <div *ngIf="f.email.errors.email"><span style="color:red;">also add valid email address</span></div>
        </div>
      </div>

      <div class="col-sm-8 form-group">
        <label>First name</label>
        <input type="text" name="firstName" placeholder="Enter first Name" class="form-control"
          formControlName="firstName" [ngClass]="{ 'is-invalid': submitted && f.firstName.errors }" />
        <div *ngIf="submitted && f.firstName.errors" class="invalid-feedback">
          <div *ngIf="f.firstName.errors.required"><span style="color:red;">First Name is required</span></div>
        </div>
      </div>

      <div class="col-sm-8 form-group">
        <label>Last name</label>
        <input type="text" name="lastName" placeholder="Enter last Name" class="form-control"
          formControlName="lastName" [ngClass]="{ 'is-invalid': submitted && f.lastName.errors }" />
        <div *ngIf="submitted && f.lastName.errors" class="invalid-feedback">
          <div *ngIf="f.lastName.errors.required"><span style="color:red;">Last Name is required</span></div>
        </div>
      </div>

      <div class="col-sm-8 form-group">
        <label>Select collaborator type</label>
        <select formControlName="collType" class="form-control"
          [ngClass]="{ 'is-invalid': submitted && f.collType.errors }">
          <option *ngFor="let collaboratortype of collaboratorTypes" [value]="collaboratortype">{{collaboratortype}}</option>
        </select>
        <div *ngIf="submitted && f.collType.errors" class="invalid-feedback">
          <div *ngIf="f.collType.errors.required"><span style="color:red;">please, select collaborator type</span></div>
        </div>
      </div>

      <div class="col-sm-8 form-group">
        <label>Collaborator rate</label>
        <div class="input-group">
          <div class="input-group-prepend"><span class="input-group-text">$</span></div>
          <input type="number" name="collRate" placeholder="Enter collaborator rate" class="form-control" 
          formControlName="collRate" [ngClass]="{ 'is-invalid': submitted && f.collRate.errors }" />
          <div *ngIf="submitted && f.collRate.errors" class="invalid-feedback">
            <div *ngIf="f.collRate.errors.required"><span style="color:red;">Collaborator rate is required</span></div>
          </div>
        </div>
      </div>

      <div class="col-sm-8 form-group">
        <label>Select collaborator unit</label>
        <select formControlName="collUnit" class="form-control"
          [ngClass]="{ 'is-invalid': submitted && f.collUnit.errors }">
          <option *ngFor="let collaboratorUnit of collaboratorUnits" [value]="collaboratorUnit">{{collaboratorUnit}}</option>
        </select>
        <div *ngIf="submitted && f.collUnit.errors" class="invalid-feedback">
          <div *ngIf="f.collUnit.errors.required"><span style="color:red;">please, select collaborator unit</span></div>
        </div>
      </div>

      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-raised-button color="primary" [disabled]="loading">
          Submit
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styleUrls: ['./new-message.component.scss']
})

export class NewMessageComponent implements OnInit {
  workerForm: FormGroup;
  loading = false;
  submitted = false;
  pass: object;
  emailVerify: object;
  collaboratorTypes = ['Contact', 'Freelancer', 'Independent Contractor', 'Employee', 'Manager', 'Client'];
  collaboratorUnits = ['Hour'];

  constructor(private formBuilder: FormBuilder,
    private _airservice: AirtableService,
    private _encrDecrService: EncrDecrService,
    private snackbar: MatSnackBar,
    public dialogRef: MatDialogRef<NewMessageComponent>) {
  }

  ngOnInit() {
    this.workerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      collType: ['', Validators.required],
      collRate: ['', Validators.required],
      collUnit: ['', Validators.required]
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.workerForm.controls; }

  async onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.workerForm.invalid) {
      return;
    }
    this.loading = true;
    await this._encrDecrService.set("password", "test123").then(async results => {
      this.pass = results;
    });
    await this._encrDecrService.set("emailVerify", this.f.email.value).then(async results => {
      this.emailVerify = results;
    });

    let payload = {
      "fields": {
        "First Name": this.f.firstName.value,
        "Last Name": this.f.lastName.value,
        "Email": this.f.email.value,
        "Business Email": this.f.email.value,
        "Password": this.pass,
        "Type": this.f.collType.value,
        "Compensation Rate": this.f.collRate.value,
        "Compensation Unit": this.f.collUnit.value,
        "Status": "Active",
        "inboxEnabled": "true",
        "isVerify": "false"
      }
    }

    await this._airservice.addCollaborators(payload).then(async results => {
      this.loading = false;
      let data = {
        "to": this.f.email.value,
        "url": environment.serverUrl,
        "type": "verify",
        "email": this.emailVerify
      }
      await this._airservice.sendMailToInviteUSer(data).subscribe(
        data => {
          if (data && results) {
            this.snackbar.open("Collaborator invite successfully", null, {
              duration: 2000
            });
          } else {
            this.snackbar.open("somthing wan't wroong to invite Collaborator", null, {
              duration: 2000
            });
          }
        },
        error => {
          this.snackbar.open(error, null, {
            duration: 2000
          });
        });
      this.close();
    });

  }

  close() {
    this.dialogRef.close('');
  }
}
