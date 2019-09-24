import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import * as $ from 'jquery';

import { AirtableService } from '../airtable.service';
import { async } from 'q';

@Component({
  selector: 'app-project-viewport',
  templateUrl: './project-viewport.component.html',
  styleUrls: ['./project-viewport.component.scss']
})
export class ProjectViewportComponent implements OnInit {

  project = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _airservice: AirtableService,
    public dialog: MatDialog,
    private routes: Router
  ) {
    this.showModel();
    this.project = data;
  }

  ngOnInit() {
  }

  showModel() {
    $(document).ready(function () {
      $('.mat-dialog-container').attr('style', 'max-width: none;width: 100vw;height: 100vh;');
    });
  }

  closeModel() {
    this.routes.navigate(['/project']);
    this.dialog.closeAll();
  }

}
