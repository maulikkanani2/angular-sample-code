import { Component, OnInit, ViewChildren, QueryList, ElementRef, HostListener, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';

import { ClockifyService } from '../clockify.service';
import { AirtableService } from '../airtable.service';
import { LOCAL_STORAGE, WebStorageService } from 'angular-webstorage-service';
import { WokerairtableService } from '../wokerairtable.service';
import { PopupEmailErrorComponent } from '../popup-email-error/popup-email-error.component';
import * as moment from 'moment';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit {

  taskFilter: string;
  workerEmail: string;
  title = '';
  loader = false;
  runningTasks = [];
  tasks = [];
  worker = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _airtable: AirtableService,
    private _clokify: ClockifyService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private _elementRef: ElementRef,
    @Inject('shared') private shared,
    @Inject(LOCAL_STORAGE) private storage: WebStorageService
  ) {
  }

  @HostListener('document:click', ['$event.target'])
  public onDocumentClick(targetElement: Element) {
    const classArray = ['message-subject', 'mat-menu-ripple mat-ripple', 'avatar-cla', 'avatar'];
    let findIndex = classArray.findIndex((c) => c === targetElement.getAttribute('class'));
    if (findIndex < 0) {
      this.onClick({ recordId: '' })
    }
  }

  ngOnInit() {
    if (this.route.snapshot.url.length > 0) {
      this.taskFilter = this.route.snapshot.url[0].path;
    } else {
      this.taskFilter = 'running';
    }

    if (this.shared.workerEmail && this.shared.workerEmail.length > 0) {
      this.getTasks();
    } else {
      this.router.navigate(["login"]);
    }
  }

  ngAfterViewChecked() {
    this.shared.messagePanels = this.viewPanels;
  }

  async getTasks() {
    let filter = '';
    this.shared.tasks = [];
    switch (this.taskFilter) {
      case 'running':
        filter = `AND({Owner}="${this.storage.get('email')}", OR({State}="3. Running",{State}="2. Assigned"))`;
        break;
      case 'waiting':
        this.title = 'Snoozed';
        filter = `AND({State}="4. Waiting", {Owner}="${this.storage.get('email')}")`;
        break;
      case 'closed':
        this.title = 'Closed';
        filter = `AND({State}="5. Closed", {Owner}="${this.storage.get('email')}")`;
        break;
    }
    this.loader = true;
    this._airtable.getTasks1(filter).subscribe(async (tasks: Array<any>) => {
      let records = [];
      await tasks.map((available) => {
        available.fields.isAvailable = false;
        records.push(available);
      });
      if (this.taskFilter === 'running') {
        let tasks = this.groupByPriority(records);
        let filterTasks = [];
        const running = ['Working on it', 'Assigned', 'Available'];
        running.filter((run) => {
          let obj = tasks.find((t) => t.group.toLowerCase() === run.toLowerCase());
          if (obj) {
            filterTasks.push(obj);
          } else {
            filterTasks.push({ group: run, isOpen: true, tasks: [] });
          }
        })
        this.shared.tasks = filterTasks;
        filter = `AND({State}="1. Ready", {Owner}="",FIND("${this.storage.get('email')}", {Qualified Processors}))`;
        await this._airtable.getTasks1(filter).toPromise().then(async (records) => {
          let data = [];
          await records.map((available) => {
            available.fields.isAvailable = true;
            data.push(available);
          });
          this.shared.tasks[2].tasks = data;
        });
      } else {
        this.shared.tasks = this.groupBy(records);
      }
      this.loader = false;
    });
  }

  groupBy = function (array) {
    var r = [];
    array.forEach(function (a) {
      let findIndex = r.findIndex((ra) => {
        if (a.fields.Status)
          return ra.group === a.fields.Status;
        else
          return ra.group === 'Not Started';
      });
      if (findIndex >= 0) {
        r[findIndex].tasks.push(a);
      } else {
        if (a.fields) {
          let obj = {
            group: a.fields.Status ? a.fields.Status : 'Not Started',
            isOpen: true,
            tasks: []
          };
          obj.tasks.push(a);
          r.push(obj);
        }
      }
    });
    return r;
  }

  groupByPriority = function (array) {
    var r = [];
    array.forEach(function (a) {
      let findIndex = r.findIndex((ra) => {
        if (a.fields.Status === 'Working on it')
          return ra.group === a.fields.Status;
        else 
          return ra.group === 'Assigned';
      });
      if (findIndex >= 0) {
        r[findIndex].tasks.push(a);
      } else {
        if (a.fields) {
          if (a.fields.Status === 'Working on it') {
            let obj = {
              group: a.fields.Status,
              isOpen: true,
              tasks: []
            };
            obj.tasks.push(a);
            r.push(obj);
          } else {
            let obj = {
              group: a.fields.Priority ? 'Assigned' : 'Not Started',
              isOpen: true,
              tasks: []
            };
            obj.tasks.push(a);
            r.push(obj);
          }
        }
      }
    });
    return r;
  }

  public onRemove(recordId: string) {
    alert(recordId);
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
      case 'C':
        data = { 'fields': { 'Status': "Cancelled" } };
        break;
    }

    if ((this.shared.currentRunningTask != undefined && (this.shared.currentRunningTask.description != task.fields.Description)) && (data['fields'].Status == "Done" || data['fields'].Status == "Cancelled" || data['fields'].Status == "Need Manager's Assistance" || data['fields'].Status == "Need Client's Assistance")) {
      // console.log("in if conndition...");
      this._airtable.updateTasks(task.id, data).toPromise().then(rec => {
        this.snackbar.open(`${data['fields'].Status} successfully`, null, {
          duration: 2000
        });
        this.shared.moveTask(rec);
        this.router.navigate(['/']);
        this.dialog.closeAll();
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
          this.snackbar.open(`${data['fields'].Status} successfully`, null, {
            duration: 2000
          });

          this._airtable.updateTasks(task.id, data).toPromise().then(rec => {
            this.shared.moveTask(rec);
            this.shared.task = {};
            this.router.navigate(['/']);
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
        // this.router.navigate(['/']);
        this.dialog.closeAll();
      })
    } else {
      this.snackbar.open('oops, No worker found for this task!', null, {
        duration: 2000
      });
    }
  }

  public onSnoozeClick(fdata: any = {}) {
    let data = {
      fields: {
        Status: 'Snoozed',
        'Snoozed Until': Date.now().toString()
      }
    }
    this.viewPanels.map((message) => {
      if (fdata.recordId === message.id) {
        message.opened = false;
      }
    })
    let myMoment: moment.Moment;
    switch (fdata.type) {
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
    this._airtable.updateTasks(fdata.recordId, data).subscribe((record) => {
      if (this.shared.task)
        this.shared.task.updated = true;
      this.shared.moveTask(record);
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
  @ViewChildren(MessageComponent) viewPanels: QueryList<MessageComponent>;

  public onClick(fdata: any = {}) {
    this.viewPanels.map((message) => {
      if (fdata.recordId !== message.id) {
        message.opened = false;
      }
    })
  }

  public onToggle(index: number): void {
    this.shared.tasks[index].isOpen = !this.shared.tasks[index].isOpen;
  }
}
