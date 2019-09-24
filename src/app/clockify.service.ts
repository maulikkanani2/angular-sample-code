import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const CLOCKIFY_API_URL = `${environment.clokifyApiUrl}${environment.clockifyWorkSpace}/`;

@Injectable()
export class ClockifyService {

  constructor(private http: HttpClient) { }

  getTimeEntry(worker): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'X-Api-Key': worker.fields['Clockify API Key'],
      }),
    };
    return this.http.get(`${CLOCKIFY_API_URL}timeEntries/inProgress`, httpOptions);
  }

  postTimeEntry(worker, data): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'X-Api-Key': worker.fields['Clockify API Key'],
      }),
    };
    /*let data = {
      start: new Date (),
      billable: 'false'
    }*/
    return this.http.post(`${CLOCKIFY_API_URL}timeEntries/`, data, httpOptions);
  }

  stopTimeEntry(worker): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'X-Api-Key': worker.fields['Clockify API Key'],
      }),
    };
    let data = {
      end: new Date(),
    }
    return this.http.put(`${CLOCKIFY_API_URL}timeEntries/endStarted`, data, httpOptions);
  }

  deleteTimeEntry(worker, timeEntry): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'X-Api-Key': worker.fields['Clockify API Key'],
      }),
    };
    return this.http.delete(`${CLOCKIFY_API_URL}timeEntries/${timeEntry['id']}`, httpOptions);
  }

}
