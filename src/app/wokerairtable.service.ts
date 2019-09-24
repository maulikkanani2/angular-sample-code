import { Injectable } from '@angular/core';
import { Base } from 'ngx-airtable/src/node-port/base';
import { Airtable } from 'ngx-airtable/src/node-port/airtable';
import { Table } from 'ngx-airtable/src/node-port/table';

import { environment } from '../environments/environment';

@Injectable()
export class WokerairtableService {

  private _workerTable: Table;

  constructor(private _airtable: Airtable) {
    this._initAirtable();
  }

  private _initAirtable(): void {
    const base: Base = this._airtable
      .base(environment.airWorkerTableBase);

    this._workerTable = base.table({
      tableId: 'Workers'
    });
  }

  public getUsers(formula : string) {
    return this._workerTable
      .select({filterByFormula: formula})
      .all()
  }

}
