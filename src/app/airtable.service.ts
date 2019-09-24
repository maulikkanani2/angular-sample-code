import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Base } from 'ngx-airtable/src/node-port/base';
import { Airtable } from 'ngx-airtable/src/node-port/airtable';
import { Table } from 'ngx-airtable/src/node-port/table';

import { environment } from '../environments/environment';

@Injectable()
export class AirtableService {

  private _taskTable: Table;
  private _collaboratorsTable: Table;
  private _notificationsTable: Table;
  private _projectTable: Table;

  constructor(private _airtable: Airtable, private http: HttpClient, ) {
    this._initAirtable();
  }

  private _initAirtable(): void {
    const base: Base = this._airtable
      .base(environment.airTableBase);

    this._taskTable = base.table({
      tableId: 'Tasks'
    });

    this._collaboratorsTable = base.table({
      tableId: 'collaborators'
    });

    this._notificationsTable = base.table({
      tableId: 'notifications'
    });

    this._projectTable = base.table({
      tableId: 'Projects'
    });

  }

  public getTasks(formula: string) {
    let complete = false;
    let records: Array<any>;
    return new Promise((resolve, reject) => {
      this._taskTable
        .select({ filterByFormula: formula })
        .all().subscribe(tasks => {
          records.push(tasks)
        }, reject, () => {
          resolve(records);
          complete = true;
        });
    })
  }
  public getTasks1(formula: string) {
    return this._taskTable
      .select({ filterByFormula: formula, sort: [{ field: "Priority Score", direction: "desc" }] })
      .all()
  }

  public updateTasks(recordId: string, fields: {}) {
    return this._taskTable.update(recordId, fields);
  }

  public getWorkerStatus(formula: string) {
    let complete = false;
    let records = [];
    return new Promise((resolve, reject) => {
      this._taskTable
        .select({ filterByFormula: formula })
        .all().subscribe(workerStatus => {
          if (workerStatus.length > 0)
            records.push(workerStatus[0])
        }, reject, () => {
          resolve(records);
          complete = true;
        });
    })
  }

  public getCollaborators(formula: string) {
    let complete = false;
    let records = [];
    return new Promise((resolve, reject) => {
      this._collaboratorsTable
        .select({ filterByFormula: formula })
        .all().subscribe(workerStatus => {
          if (workerStatus.length > 0)
            records.push(workerStatus[0])
        }, reject, () => {
          resolve(records);
          complete = true;
        });
    })
  }

  public getProjects() {
    return this._projectTable.select().all().pipe((data) => { return data; });
  }

  public getProject(formula: string) {
    return this._projectTable.select({ filterByFormula: formula }).all()
  }

  public updateCollaborators(recordId: string, fields: {}) {
    return this._collaboratorsTable.update(recordId, fields);
  }

  public getWorkers(formula: string) {
    let complete = false;
    let records = [];
    return new Promise((resolve, reject) => {
      this._collaboratorsTable
        .select({ filterByFormula: formula })
        .all().subscribe(workerStatus => {
          if (workerStatus.length > 0)
            records.push(workerStatus)
        }, reject, () => {
          resolve(records);
          complete = true;
        });
    })
  }

  public getClockifyBaseWorkerStatus(clokifyApiKey: string) {
    let headers = new HttpHeaders().set('X-Api-Key', clokifyApiKey ? clokifyApiKey : environment.clokifyApiKey);
    return this.http.get<any>(`https://api.clockify.me/api/workspaces/${environment.clockifyWorkSpace}/timeEntries/inProgress`, { headers })
      .pipe(map((data) => { return data; }));
  }

  public addCollaborators(payload) {
    return new Promise((resolve, reject) => {
      this._collaboratorsTable.create(payload).subscribe(data => {
        resolve(data);
      });
    })
  }

  public userLogin(formula: string) {
    let complete = false;
    let records = [];
    return new Promise((resolve, reject) => {
      this._collaboratorsTable
        .select({ filterByFormula: formula })
        .all().subscribe(userData => {
          if (userData.length > 0)
            records.push(userData[0])
        }, reject, () => {
          resolve(records);
          complete = true;
        });
    })
  }

  public getNotifications(formula: string, sorting = []) {
    let complete = false;
    let records = [];
    // sort: [{ field: "created date", direction: "desc" }]
    return this._notificationsTable
      .select({ filterByFormula: formula, sort: [{ field: "Created Date", direction: "desc" }] })
      .all().pipe(map((NotificationData) => { return NotificationData; }));
  }

  public addNotification(payload) {
    return new Promise((resolve, reject) => {
      this._notificationsTable.create(payload).subscribe(data => {
        resolve(data);
      });
    })
  }

  public updateNotification(recordId: string, fields: {}) {
    return this._notificationsTable.update(recordId, fields);
  }

  public sendMailToInviteUSer(data) {
    return this.http.post<any>("https://7hmrq1opoj.execute-api.us-east-2.amazonaws.com/v1/", data)
      .pipe((data) => { return data; });
    // return this.http.post<any>("https://localhost:3000/sendMail", data)
    //   .pipe((data) => { return data; });
  }

}
