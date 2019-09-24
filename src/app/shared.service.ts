import { Injectable, Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { LOCAL_STORAGE, WebStorageService } from 'angular-webstorage-service';
import { Title } from '@angular/platform-browser';

import { ClockifyService } from './clockify.service';
import { AirtableService } from './airtable.service';
import { WokerairtableService } from './wokerairtable.service';

@Injectable()
export class SharedService {
  workerEmail = '';
  task: any;
  tasks: any;
  currentRunningTask: any;
  workers: any;
  currentWorker: any;
  enableButton: boolean;
  enableStopButton: boolean;
  timeEntry: string;
  worker: any = {};
  messagePanels: any = {};
  currentView: string;

  constructor(
    private _clokify: ClockifyService,
    private _airservice: AirtableService,
    private _wairtabe: WokerairtableService,
    private snackbar: MatSnackBar,
    @Inject(LOCAL_STORAGE) private storage: WebStorageService,
    private title: Title
  ) { }

  public async getTasks(workerEmail) {
    let preAssignedTasks = []
    await this._airservice.getTasks1(`AND({State}="2. Assigned", {Owner}="${workerEmail}")`).toPromise().then(tasks => {
      preAssignedTasks = tasks;
      // tasks.map((task) => (
      //   (task.fields['Owner [OLD]'][0].email.toLowerCase() === workerEmail.toLowerCase()) ?
      //     preAssignedTasks.push(task) : ''
      // ));
    });
    if (preAssignedTasks.length > 0) {
      return preAssignedTasks[0];
    }

    let readyTasks = [];

    await this._airservice.getTasks1(`AND({State}="1. Ready", {Owner}="workerEmail")`).toPromise().then(tasks => {
      readyTasks = tasks;
      // tasks.map((task) => (
      //   (task.fields['Owner [OLD]'][0].email.toLowerCase() === workerEmail.toLowerCase()) ?
      //     readyTasks.push(task) : ''
      // ));
    });
    if (readyTasks.length > 0) {
      return readyTasks[0];
    }
    return undefined;
  }

  public deleteTimeEntry(worker) {
    return this._clokify.deleteTimeEntry(worker, this.currentRunningTask).toPromise();
  }

  public moveTask(task) {
    this.tasks.map(t => {
      var findIndex = t.tasks.findIndex(st => st.id == task.id)
      if (findIndex >= 0) {
        t.tasks.splice(findIndex, 1);
      }
    });
    let index = -1;
    if (this.currentView === 'inbox') {
      if (task.fields.Status === 'Working on it') {
        index = this.tasks.findIndex((t) => t.group == task.fields.Status);
      } else if (task.fields.State == "1. Ready" || task.fields.Status === "Rejected" || task.fields.Status === "Done" || task.fields.Status === "Cancelled" || task.fields.Status === "Need Manager's Assistance" || task.fields.Status === "Need Client's Assistance") {
        index = -1;
      } else {
        index = this.tasks.findIndex((t) => t.group == 'Assigned');
      }
    } else {
      console.log("else moveTask... inbox");
      index = this.tasks.findIndex((t) => t.group == task.fields.Status);
    }
    console.log("index....: ", index);
    if (index >= 0)
      this.tasks[index].tasks.push(task);
  }

  /* backup
  public moveTask(task) {
    this.tasks.map(t => {
      var findIndex = t.tasks.findIndex(st => st.id == task.id)
      if (findIndex >= 0) {
        t.tasks.splice(findIndex, 1);
      }
    });
    let index = -1;
    if (this.currentView === 'inbox') {
      if (task.fields.Status === 'Working on it') {
        index = this.tasks.findIndex((t) => t.group == task.fields.Status);
      } else if (task.fields.Owner.length == 0 || task.fields.Status === "Rejected" || task.fields.Status === "Done" || task.fields.Status === "Cancelled" || task.fields.Status === "Need Manager's Assistance" || task.fields.Status === "Need Client's Assistance") {
        index = -1;
      } else {
        index = this.tasks.findIndex((t) => t.group == task.fields.Priority);
      }
    } else {
      console.log("else moveTask... inbox");
      index = this.tasks.findIndex((t) => t.group == task.fields.Status);
    }
    console.log("index....: ", index);
    if (index >= 0)
      this.tasks[index].tasks.push(task);
  }
  */

  public async doStartTracker(event, task) {
    event.stopPropagation();

    let collaborators, descriptorCount;
    if (this.currentWorker) {
      const snackBar = this.snackbar.open('Loading', null);
      if (task) {
        if (task.fields.State == "1. Ready") {
          task.fields.isAvailable = false;
          task.fields.State = "2. Assigned";
          this.task = task;
          this.moveTask(this.task);
          await this._airservice.getCollaborators(`AND({email}="${this.storage.get('email')}")`)
            .then(async results => (collaborators = results));

          if (collaborators.length > 0) {
            this._airservice.updateTasks(task.id, { fields: { Owner: [collaborators[0].id] } }).toPromise().then(result => {
              console.log('Task updated!', result);
              this.snackbar.open('Task Move in your priority', null, {
                duration: 2000
              });
            })
          } else {
            console.log("collaborators not found...");
          }
        } else {
          if (this.currentRunningTask) {
            this.snackbar.open('You have already task running. Please stop it first!', null, {
              duration: 2000
            });
            return;
          }
          this.task = task;
          if (task.fields['Descriptor'] && task.fields['Descriptor'].length > 499) {
            descriptorCount = task.fields['Descriptor'].substr(0, 495);
          } else {
            descriptorCount = task.fields['Descriptor']
          }
          console.log("descriptorCount: ", descriptorCount);
          let workData = {
            start: new Date(),
            billable: 'false',
            description: typeof task.fields['Descriptor'] != 'undefined'
              ? descriptorCount
              : '',
            projectId: task.fields['Clockify Project ID'][0],
            taskId: task.fields['Clockify Task ID'],
          };
          let started = false;
          await this._clokify.postTimeEntry(this.currentWorker, workData).toPromise().then(res => {
            this.timeEntry = res.timeInterval['start'];
            this.enableButton = false;
            this.enableStopButton = true;
            this.currentRunningTask = res;
            this.snackbar.open('Tracker started!', null, {
              duration: 2000
            });
            started = true;
            this.task.fields.Status = 'Working on it';
            this.moveTask(this.task);
            this.openTaskPanel(this.task);
          }).catch(error => {
            this.snackbar.open('Something went wrong. Please try again!', null, {
              duration: 2000
            });
          });
          if (started) {
            this._airservice.updateTasks(task.id, { fields: { Status: 'Working on it' } }).toPromise().then(result => {
              console.log('Task updated!');
            })
          }
        }
      } else {
        this.snackbar.open('No task available!', null, {
          duration: 2000
        });
      }
    }
  }

  changeWorkerEmail(workerEmail) {
    let isManager = this.storage.get('isManager');
    if (isManager) {
      this.storage.set('email', workerEmail);
      location.reload();
    }
  }

  openTaskPanel(task) {
    this.messagePanels.map((message) => {
      if (task.id === message.id) {
        message.opened = true;
      }
    })
  }

  async getLiveTasks() {
    let filter = '';
    switch (this.currentView) {
      case 'inbox':
        filter = `OR({State}="3. Running",{State}="2. Assigned")`;
        break;
      case 'waiting':
        filter = `AND({State}="4. Waiting", {Owner}!="")`;
        break;
      case 'closed':
        filter = `AND({State}="5. Closed", {Owner}!="")`;
        break;
    }
    this._airservice.getTasks1(filter).subscribe(async (tasks: Array<any>) => {
      // task.fields['Owner [OLD]'][0].email
      let records = tasks;
      if (this.currentView === 'inbox') {
        let tasks = this.groupByPriority(records);
        let filterTasks = [];
        const running = ['Working on it', 'Top', 'High', 'Medium', 'Low', 'Available'];
        running.filter((run) => {
          let obj = tasks.find((t) => t.group.toLowerCase() === run.toLowerCase());
          if (obj) {
            filterTasks.push(obj);
          } else {
            filterTasks.push({ group: run, isOpen: true, tasks: [] });
          }
        })
        this.tasks = filterTasks;
        // filter = `({Owner}="")`;
        filter = `AND({State}="1. Ready", {Owner}="",FIND("${this.storage.get('email')}", {Qualified Processors}))`;
        await this._airservice.getTasks1(filter).toPromise().then((records) => {
          this.tasks[5].tasks = records;
        });
      } else {
        this.tasks = this.groupBy(records);
      }
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
          return ra.group === a.fields.Priority;
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
              group: a.fields.Priority ? a.fields.Priority : 'Not Started',
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
}
