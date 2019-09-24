import { Component, ViewEncapsulation, OnInit, Inject, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { LOCAL_STORAGE, WebStorageService } from 'angular-webstorage-service';
import * as moment from 'moment';

import { ClockifyService } from '../clockify.service';
import { AirtableService } from '../airtable.service';
import { TaskConfirmComponent } from '../task-confirm/task-confirm.component';
import { TaskNotificationPopupComponent } from '../task-notification-popup/task-notification-popup.component';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-new-message',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="task-viewport-toolbar" mat-dialog-title>

      <div class="row">
        <div class="col-8" style="line-height: 40px;">
          {{subject | stringWordFilter:5}} > <button (click)="doExpand($event)">{{projectDetail.fields.Name | stringWordFilter:5}}</button>
        </div>
        <div class="col-4" style="text-align: right;bottom: 5px;">
          <div class="btn-col" [fxShow]="opened">
            <a *ngIf="iframeUrl" [href]="iframeUrl" mat-icon-button matTooltip="open Proccess.st" 
               [target]="_blank" (click)="doExpand($event)">
              <mat-icon>list_alt</mat-icon>
            </a>
            <button *ngIf="(task.fields['Status'] != 'Working on it' && task.fields.isAvailable == false)" (click)="shared.doStartTracker($event,task)"
              mat-icon-button matTooltip="Start Tracker" matTooltipPosition="above">
              <mat-icon>play_arrow</mat-icon>
            </button>
            <button *ngIf="task.fields.isAvailable == true" (click)="onConfirmMessage(task)"
              mat-icon-button matTooltip="Add task" matTooltipPosition="above">
              <mat-icon>add</mat-icon>
            </button>

            <button (click)="doExpand($event)" [matMenuTriggerFor]="snoozeMenu" mat-icon-button
              matTooltip="Remind Me..." matTooltipPosition="above">
              <mat-icon>alarm</mat-icon>
            </button>

            <mat-menu class="snooze-menu" #snoozeMenu="matMenu" [overlapTrigger]="false" xPosition="before">
              <h3>Snooze until...</h3>
              <hr />
              <button mat-menu-item (click)="onSnoozed(task.id, 'LT')">
                <mat-icon>brightness_6</mat-icon>
                Later Today
              </button>
              <button mat-menu-item (click)="onSnoozed(task.id, 'TM')">
                <mat-icon>brightness_5</mat-icon>
                Tomorrow
              </button>
              <button mat-menu-item (click)="onSnoozed(task.id, 'TM')">
                <mat-icon>brightness_5</mat-icon>
                Later This Week
              </button>
              <button mat-menu-item (click)="onSnoozed(task.id, 'NW')">
                <mat-icon>today</mat-icon>
                Next week
              </button>
            </mat-menu>

            <a *ngIf="task.fields['Campaign Folder Url']" mat-icon-button matTooltip="Campign Folder Url"
              matTooltipPosition="above" [href]="task.fields['Campaign Folder Url'][0]" [target]="_blank"
              (click)="doExpand($event)">
              <mat-icon>folder</mat-icon>
            </a>
            <button matTooltip="Mark as Done" matTooltipPosition="above" mat-icon-button (click)="isTaskDetail ? onTaskUpdate(task, 'D') : done.emit()">
              <mat-icon>done</mat-icon>
            </button>
            <button (click)="openNotification(task.fields['Task ID'])"
              mat-icon-button matTooltip="Task info" matTooltipPosition="above">
              <mat-icon>info</mat-icon>
            </button>
            <button [matMenuTriggerFor]="menu" mat-icon-button matTooltip="More..." matTooltipPosition="above"
              (click)="doExpand($event)">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu style="width:100%;" class="message-more-menu" #menu="matMenu" [overlapTrigger]="false"
              xPosition="before">

              <md-toolbar class="md-theme-light">
                <h5 class="md-toolbar-tools"><hr>
                  <mat-icon style="margin-left:5px;vertical-align: middle;">link</mat-icon>
                  <span style="vertical-align: middle;">Quicklinks</span><hr>
                </h5>
              </md-toolbar>
              <a *ngIf="task.fields['Admin Panel URL (Dev)']" mat-menu-item title="Admin Panel URL (Dev)" 
                [href]="task.fields['Admin Panel URL (Dev)']" [target]="_blank" (click)="doExpand($event)">
                <mat-icon>code</mat-icon> Admin Panel URL
              </a>
              <a *ngIf="task.fields['Document']" mat-menu-item title="Document 1"
                [href]="task.fields['Document']" [target]="_blank" (click)="doExpand($event)">
                <mat-icon>filter_1</mat-icon> Document 1
              </a>
              <a *ngIf="task.fields['Document 2']" mat-menu-item title="Document 2"
                [href]="task.fields['Document 2']" [target]="_blank" (click)="doExpand($event)">
                <mat-icon>filter_2</mat-icon> Document 2
              </a>
              <a *ngIf="task.fields['Website URL']" mat-menu-item title="Wibsite"
                [href]=" 'http://' + task.fields['Website URL'][0]" [target]="_blank" (click)="doExpand($event)">
                <mat-icon>web</mat-icon> Production website
              </a>
              <a *ngIf="task.fields['CMS Login URL']" mat-menu-item title="Production admin panel"
                [href]="task.fields['CMS Login URL'][0]" [target]="_blank" (click)="doExpand($event)">
                <mat-icon>code</mat-icon> Production admin panel
              </a>
              <a *ngIf="task.fields['Dev Site URL']" mat-menu-item title="Development site"
                [href]="task.fields['Dev Site URL'][0]" [target]="_blank" (click)="doExpand($event)">
                <mat-icon>code</mat-icon> Development site
              </a>
              <a *ngIf="task.fields['Dev Admin Panel URL']" mat-menu-item title="Development admin panel"
                [href]="task.fields['Dev Admin Panel URL'][0]" [target]="_blank" (click)="doExpand($event)">
                <mat-icon>code</mat-icon> Development admin panel
              </a>
              <a *ngIf="task.fields['Project Folder URL']" mat-menu-item title="Project Folder URL"
                [href]="task.fields['Project Folder URL']" [target]="_blank" (click)="doExpand($event)">
                <mat-icon>folder</mat-icon> Project Folder
              </a>

              <md-toolbar class="md-theme-light">
                <h5 class="md-toolbar-tools"><hr>
                  <mat-icon style="margin-left:5px;vertical-align: middle;">link</mat-icon>
                  <span style="vertical-align: middle;">Priority</span><hr>
                </h5>
              </md-toolbar>
              <button title="Increase priority" mat-menu-item (click)="increasePriority(task)">
                <mat-icon>reply</mat-icon> Increase priority
              </button>
              <button title="Decrease prioritye" mat-menu-item (click)="decreasePrioritye(task)">
                <mat-icon>reply</mat-icon> Decrease priority
              </button>

              <md-toolbar class="md-theme-light">
                <h5 class="md-toolbar-tools"><hr>
                  <mat-icon style="margin-left:5px;vertical-align: middle;">link</mat-icon>
                  <span style="vertical-align: middle;">Other</span><hr>
                </h5>
              </md-toolbar>
              <button title="Copy task URL" mat-menu-item (click)="copyToClipboard(sharableLink)">
                <mat-icon>new_releases</mat-icon> Copy task URL
              </button>
              <button title="Request Manager's Assistance" mat-menu-item (click)="isTaskDetail ? onTaskUpdate(task, 'A') : assisted.emit()">
                <mat-icon>reply</mat-icon>
                Request Manager's Assistance
              </button>
              <button title="Request Clenit's Assistance" mat-menu-item (click)="isTaskDetail ? onTaskUpdate(task, 'CA') : clientAssisted.emit()">
                <mat-icon>reply</mat-icon>
                Request Client's Assistance
              </button>
              <button title="Mark as Input Received" mat-menu-item (click)="isTaskDetail ? onTaskUpdate(task, 'I') : inputted.emit()">
                <mat-icon>reply</mat-icon>
                Mark as Input Received
              </button>
              <button title="Unassign yourself" mat-menu-item (click)="onTaskUpdate(task, 'UY')">
                <mat-icon>reply</mat-icon> Unassign yourself
              </button>
              <button title="Mark as started" mat-menu-item (click)="onTaskUpdate(task, 'MS')">
                <mat-icon>reply</mat-icon> Mark as started
              </button>
              <button title="Mark as approved" mat-menu-item (click)="onTaskUpdate(task, 'MA')">
                <mat-icon>reply</mat-icon> Mark as approved
              </button>
              <button title="Mark as rejected" mat-menu-item (click)="onTaskUpdate(task, 'MR')">
                <mat-icon>reply</mat-icon> Mark as rejected
              </button>
              <button title="Mark as Cancelled" mat-menu-item (click)="onTaskUpdate(task, 'C')">
                <mat-icon>cancel</mat-icon> Mark as cancelled
              </button>
              <input type="text" style="opacity: 0;height: 0;" value="{{serverUrl}}task/{{task.fields['Task ID']}}" #sharableLink>
            
              </mat-menu>
              <button mat-icon-button mat-dialog-close (click)="closeModel()">
                <mat-icon>clear</mat-icon>
              </button>
          </div>
        </div>
      </div>
    </div>
    <mat-dialog-content class="task-viewport-content">
      <div class="holds-the-iframe">
        <mat-spinner *ngIf="loader" class="spinner-class"></mat-spinner>
        <iframe id="iframeId" *ngIf="iframeUrl" [src]="iframeUrl | safe"></iframe>
      </div>
    </mat-dialog-content>
  `,
  styleUrls: ['./task-viewport.component.scss']
})
export class TaskViewportComponent implements OnInit {
  iframeUrl: string;
  loader: boolean;
  isTaskDetail: boolean;
  title = '';
  serverUrl: string;
  projectDetail = [];

  @HostBinding('class.message-opened')
  @Input() opened = false;

  @Input() task = {};
  @Input() id = '';
  @Input() avatar = '';
  @Input() from = '';
  @Input() subject = '';
  @Input() body = '';
  @Input() recieved = new Date();

  @Output() removed = new EventEmitter<void>();

  @Output() assisted = new EventEmitter<void>();
  @Output() clientAssisted = new EventEmitter<void>();
  @Output() inputted = new EventEmitter<void>();
  @Output() done = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();


  @Output() reply = new EventEmitter<{ to: string, subject: string }>();
  @Output() snoozed = new EventEmitter<{ recordId: string, type: string }>();
  @Output() headerclick = new EventEmitter<{ recordId: string }>();

  constructor(
    @Inject('shared') private shared,
    @Inject(LOCAL_STORAGE) private storage: WebStorageService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _airtable: AirtableService,
    private _clokify: ClockifyService,
    public dialog: MatDialog,
    private routes: Router,
    private snackbar: MatSnackBar) {
    if (data) {
      this.isTaskDetail = data.isTaskDetail;
      this.iframeUrl = data.iframeUrl;
      this.opened = data.opened;
      this.task = data.task;
      this.projectDetail = data.project;
      this.id = data.id;
      this.from = data.from;
      this.subject = data.subject;
      this.recieved = data.recieved;
      this.removed = data.removed;
      this.assisted = data.assisted;
      this.clientAssisted = data.clientAssisted;
      this.inputted = data.inputted;
      this.done = data.done;
      this.reply = data.reply;
      this.snoozed = data.snoozed;
      this.headerclick = data.headerclick;
    }
    this.loader = true;
    this.serverUrl = environment.serverUrl;
    setTimeout(() => {
      this.loader = false;
    }, 4000);
  }

  ngOnInit() {
  }

  onReply(): void {
    this.reply.emit({
      to: this.from,
      subject: `RE: ${this.subject}`
    });
  }

  doExpand(event): void {
    event.stopPropagation();
  }

  onConfirmMessage(data: any = {}): void {
    const dialogRef = this.dialog.open(TaskConfirmComponent, {
      width: '25%',
      data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackbar.open('Task add successfully', null, {
          duration: 2000
        });
      }
    });
  }

  public onTaskUpdate = async (task: any, type: string) => {
    let data = {};
    switch (type) {
      case 'A':
        data = { "fields": { "Status": "Need Manager's Assistance" } };
        break;
      case 'CA':
        data = { "fields": { "Status": "Need Client's Assistance" } };
        break;
      case 'I':
        data = { "fields": { "Status": "Input Recieved" } };
        break;
      case 'D':
        data = { 'fields': { "Status": "Done" } };
        break;
      case 'UY':
        data = { 'fields': { 'Owner': [] } };
        break;
      case 'MS':
        data = { 'fields': { 'Status': "Started" } };
        break;
      case 'MA':
        data = { 'fields': { 'Status': "Started" } };
        break;
      case 'MR':
        data = { 'fields': { 'Status': "Rejected" } };
        break;
      case 'C':
        data = { 'fields': { 'Status': "Cancelled" } };
        break;
    }

    let descriptorCount;
    if (task.fields['Descriptor'] && task.fields['Descriptor'].length > 499) {
      descriptorCount = task.fields['Descriptor'].substr(0, 495);
    } else {
      descriptorCount = task.fields['Descriptor']
    }

    if ((this.shared.currentRunningTask != undefined && (this.shared.currentRunningTask.description != descriptorCount)) && (data['fields'].Status != "Input Recieved")) {
      this._airtable.updateTasks(task.id, data).toPromise().then(rec => {
        if (data['fields'].Owner && data['fields'].Owner.length == 0) {
          this.snackbar.open(`Task Unassign yourself successfully`, null, {
            duration: 2000
          });
        } else {
          this.snackbar.open(`Task ${data['fields'].Status} successfully`, null, {
            duration: 2000
          });
        }
        this.dialog.closeAll();
        this.shared.moveTask(rec);
        this.routes.navigate(['/']);
      })
      return;
    }

    let collaborators;
    await this._airtable.getCollaborators(`AND({email}="${this.storage.get('email')}")`)
      .then(async results => (collaborators = results));
    if (collaborators.length > 0) {
      this._clokify.stopTimeEntry(collaborators[0]).subscribe(() => {
        this.shared.enableButton = true;
        this.shared.enableStopButton = false;
      }, (error: any) => {
        if (error.status === 200) {
          this.title = 'Inbox';
          this.shared.currentRunningTask = '';
          this.shared.timeEntry = '';
          this.shared.enableButton = true;
          this.shared.enableStopButton = false;

          this._airtable.updateTasks(task.id, data).toPromise().then(rec => {
            if (data['fields'].Owner && data['fields'].Owner.length == 0) {
              this.snackbar.open(`Task Unassign yourself successfully`, null, {
                duration: 2000
              });
            } else {
              this.snackbar.open(`Task ${data['fields'].Status} successfully`, null, {
                duration: 2000
              });
            }
            rec.fields.isAvailable = false;
            this.shared.moveTask(rec);
            this.shared.task = {};
            this.routes.navigate(['/']);
            this.dialog.closeAll();
          });
        } else {
          this.snackbar.open('Something went wrong. Please try again!', null, {
            duration: 2000
          });
        }
      }, () => {
        this.snackbar.open('Tracker stopped!', null, {
          duration: 2000
        });
        // this.routes.navigate(['/']);
        this.dialog.closeAll();
      })
    } else {
      this.snackbar.open('oops, No worker found for this task!', null, {
        duration: 2000
      });
    }
  }

  public onSnoozed(recordId, type) {
    let data = {
      fields: {
        Status: 'Snoozed',
        'Snoozed Until': Date.now().toString()
      }
    }

    let myMoment: moment.Moment;
    switch (type) {
      case 'LT':
        myMoment = moment().add(4, 'hours');
        data.fields["Snoozed Until"] = myMoment.format();
        break;
      case 'TM':
        myMoment = moment().add(24, 'hours');
        data.fields["Snoozed Until"] = myMoment.format();
        break;
      case 'LV':
        myMoment = moment().add(48, 'hours');
        data.fields["Snoozed Until"] = myMoment.format();
        break;
      case 'NW':
        myMoment = moment().day(1 + 7);
        data.fields["Snoozed Until"] = myMoment.format();
        break;
      default:
        break;
    }
    this._airtable.updateTasks(recordId, data).subscribe((record) => {
      console.log("updateTasks Snoozed sucessfully");
    }, (error) => {
      this.snackbar.open('Something went wrong!', null, {
        duration: 2000
      });
    }, () => {
      this.snackbar.open('Task updated!', null, {
        duration: 2000
      });
      // this.getTasks();
    });
  }

  openNotification(taskId: any): void {
    this.getTaskData(taskId);
  }

  getTaskData = async (taskId) => {
    await this._airtable.getTasks1(`{Task ID}=${taskId}`).toPromise().then((record) => {
      let data = record[0];
      this.dialog.open(TaskNotificationPopupComponent, {
        width: '55%',
        height: '80%',
        data
      });
    });
  }

  closeModel() {
    this.routes.navigate(['/']);
    this.dialog.closeAll();
  }

  copyToClipboard(element) {
    element.select();
    document.execCommand('copy');
    this.snackbar.open('Copied to Clipboard', null, {
      duration: 2000
    });
  }

  increasePriority(task) {
    let data = {};
    if (task.fields.Priority == "Top") {
      this.snackbar.open('Your task already in top priority', null, {
        duration: 2000
      });
    } else {
      if (task.fields.Priority == "High") {
        data = { "fields": { "Priority": "Top" } }
      } else if (task.fields.Priority == "Medium") {
        data = { "fields": { "Priority": "High" } }
      } else if (task.fields.Priority == "Low") {
        data = { "fields": { "Priority": "Medium" } }
      }
      this._airtable.updateTasks(task.id, data).toPromise().then(rec => {
        this.snackbar.open(`Increase task priority successfully`, null, {
          duration: 2000
        });
        this.dialog.closeAll();
        this.shared.moveTask(rec);
        this.routes.navigate(['/']);
      })
    }
  }

  decreasePrioritye(task) {
    let data = {};
    if (task.fields.Priority == "Low") {
      this.snackbar.open('Your task already in Low priority', null, {
        duration: 2000
      });
    } else {
      if (task.fields.Priority == "Top") {
        data = { "fields": { "Priority": "High" } }
      } else if (task.fields.Priority == "High") {
        data = { "fields": { "Priority": "Medium" } }
      } else if (task.fields.Priority == "Medium") {
        data = { "fields": { "Priority": "Low" } }
      }
      this._airtable.updateTasks(task.id, data).toPromise().then(rec => {
        this.snackbar.open(`Decrease task priority successfully`, null, {
          duration: 2000
        });
        this.dialog.closeAll();
        this.shared.moveTask(rec);
        this.routes.navigate(['/']);
      })
    }
  }

}
