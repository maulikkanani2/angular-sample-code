import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatDialog } from "@angular/material";

import { AirtableService } from '../airtable.service';
import { ProjectViewportComponent } from '../project-viewport/project-viewport.component';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {
  projects: Array<any>;
  opened = false;
  loader = true;

  constructor(
    private _airtable: AirtableService,
    private snackbar: MatSnackBar,
    public dialog: MatDialog) {
    this.getProject();
  }

  getProject = async () => {
    await this._airtable.getProjects().subscribe(
      data => {
        this.projects = data;
        this.loader = false;
      },
      error => {
        this.snackbar.open(error, null, {
          duration: 2000
        });
      });
  }

  ngOnInit() { }

  onOpenToggle(flag: boolean): void {
    this.opened = flag;
  }

  openProject = async (projectId) => {
    await this._airtable.getProject(`({Record ID}="${projectId}")`).toPromise().then(async (results) => {
      if (results.length > 0) {
        let data = results[0];
        this.dialog.open(ProjectViewportComponent, {
          data
        });
      }
    });
    setTimeout(() => {
      this.onOpenToggle(false);
    }, 1000);
  }

}
