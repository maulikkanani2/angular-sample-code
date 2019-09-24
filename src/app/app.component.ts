import { Component, ViewEncapsulation, Inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute, NavigationEnd, Event, NavigationExtras } from '@angular/router';
import { LOCAL_STORAGE, WebStorageService } from 'angular-webstorage-service';
import * as moment from 'moment';
import * as $ from 'jquery';

import { environment } from '../environments/environment';
import { PushNotificationsService } from "./push.notification.service";
import { NewMessageComponent } from './new-message/new-message.component';
import { ClockifyService } from './clockify.service';
import { WokerairtableService } from './wokerairtable.service'
import { AirtableService } from './airtable.service';
import { CheckProcessStLoginComponent } from './check-process-st-login/check-process-st-login.component';

@Component({
  selector: 'app-root',
  template: `
    <mat-sidenav-container class="sidenav-container">
    <mat-sidenav #usernav class="sidenav-nav" align="end">
      <mat-list *ngIf="shared.workers">
        <mat-list-item *ngFor="let w of shared.workers; let i = index;">
          <button mat-button *ngIf="storage.get('isManager')" (click)="shared.changeWorkerEmail(w.fields['Business Email'])">
            <div *ngIf="w.fields.workerStatus == 'online'">
              <span class="onlineUser"></span> {{w.fields['Full Name']}}
            </div>
            <div *ngIf="w.fields.workerStatus == 'offline'">
              <span class="offlineUser"></span> {{w.fields['Full Name']}}
            </div>
          </button>
          <button mat-button *ngIf="!storage.get('isManager')">
            <div *ngIf="w.fields.workerStatus == 'online'">
              <span class="onlineUser"></span> {{w.fields['Full Name']}}
            </div>
            <div *ngIf="w.fields.workerStatus == 'offline'">
              <span class="offlineUser"></span> {{w.fields['Full Name']}}
            </div>
          </button>
        </mat-list-item>
      </mat-list>
    </mat-sidenav>
      <mat-sidenav #sidenav class="sidenav-nav">
      <mat-list>
      <mat-list-item>
        <button mat-button (click)="assign('/')" routerLinkActive>
          <mat-icon>inbox</mat-icon>
          Inbox
        </button>
      </mat-list-item>
      <mat-list-item>
        <button mat-button (click)="assign('waiting')" routerLinkActive>
          <mat-icon>alarm</mat-icon>
          Waiting
        </button>
      </mat-list-item>
      <mat-list-item>
        <button mat-button (click)="assign('closed')" routerLinkActive>
          <mat-icon>done</mat-icon>
          Done
        </button>
      </mat-list-item>
      <!-- <mat-list-item>
        <button mat-button (click)="assign('project')" routerLinkActive>
          <mat-icon>view_carousel</mat-icon>
          Project
        </button>
      </mat-list-item> -->
      <mat-list-item>
        <button mat-button (click)="logout()" routerLinkActive>
          <mat-icon>logout</mat-icon>
          Logout
        </button>
      </mat-list-item>
   <!--   <mat-list-item>
        <hr />
      </mat-list-item>
      <mat-list-item>
        <button mat-button routerLink="/drafts" routerLinkActive>
          <mat-icon>drafts</mat-icon>
          Drafts
        </button>
      </mat-list-item>
      <mat-list-item>
        <button mat-button routerLink="/sent" routerLinkActive>
          <mat-icon>send</mat-icon>
          Sent
        </button>
      </mat-list-item>
      <mat-list-item>
        <button mat-button routerLink="/spam" routerLinkActive>
          <mat-icon>report_problem</mat-icon>
          Spam
        </button>
      </mat-list-item> -->
    </mat-list>
      </mat-sidenav>
      <div class="sidenav-content">
        <mat-toolbar color="primary" role="header" fxLayout="row" class="primary-toolbar custom-color-toolbar show-toolbar">
        <div fxFlex="100px">
          <button type="button" class="menu-btn" mat-icon-button (click)="sidenav.open()">
            <mat-icon>menu</mat-icon>
          </button>
        </div>
          <div fxFlex fxFill class="search-col">
            <button *ngIf="shared.enableButton" color="red" title="Start Tracker" class="button-center" style="color:white;"  mat-icon-button	(click)="startTracker()"><mat-icon>play_circle_filled</mat-icon></button>
            <button *ngIf="shared.enableStopButton" title="Stop Tracker"  mat-icon-button	color="red" style="color:white;" (click)="stopTracker()"><mat-icon>pause_circle_filled</mat-icon></button>
            <app-counter *ngIf="shared.enableStopButton && shared.timeEntry" inputDate={{shared.timeEntry}}>Loading...</app-counter>
            <button *ngIf="shared.enableStopButton && shared.timeEntry" mat-icon-button style="color:white;" (dblclick)="onDelete()"><mat-icon>delete</mat-icon></button>
          </div>
          <div fxFlex="200px" class="avatar-col">
            <mat-list-item>
              <button (click)="this.getNotification()" mat-button [matMenuTriggerFor]="menu" style="min-width: 0px;">
                <mat-icon>notifications</mat-icon>
                <span class="badge" *ngIf="badgeCount > 0">{{badgeCount}}</span>
              </button>
            </mat-list-item>
            <mat-menu #menu="matMenu" [overlapTrigger]="false" class="my-full-width-menu">
              <div class="container">
                <div class="notification-title">Notifications</div>
                <div class="row search-results"
                infiniteScroll
                [infiniteScrollDistance]="2"
                [infiniteScrollThrottle]="50"
                [scrollWindow]="false"
                (scrolled)="onScroll()">
                  <div *ngIf="notifications.length == 0">
                    <img src="../assets/bell-crossed.png" class="rounded-circle img-circle">  
                    You have no notification yet
                  </div>

                  <mat-list-item *ngFor="let notification of notifications; let i = index;">
                  <!--  -->  
                  <a *ngIf="notification.fields['Task ID']" class="textMode" [routerLink]="['/task', notification.fields['Task ID']]" (click)="redirectToTask(notification.fields && notification.fields['Task ID'], notification.id)" >
                    <!-- (click)="notification.fields['Task ID'] && redirectToTask(notification.fields['Task ID'])" -->
                      <div class="row hover-effect" [ngStyle]="{'background-color':(notification.fields.Opened === 'false' || notification.fields.Opened == undefine) && '#d4e2ff' }" style="margin:2px; border:0; border-radius:5px;">
                        <img src="../assets/notification.jpg" class="rounded-circle img-circle">
                        <div class="col-md-9 notification-text">
                          <h6 class="card-title">{{notification.fields.Title}}</h6>
                          <p>{{notification.fields.Message}}</p>
                          <h6 class="card-subtitle mb-2 text-muted notification-time">{{notification.time}}</h6>
                        </div>
                        <!-- <div class="col-md-1" style="padding: 0;margin-top: 21px;">
                          <button mat-button [matMenuTriggerFor]="menuOption" id="moreMenu" style="min-width: 0px;display:none;" (click)="$event.stopPropagation();">
                            <mat-icon>more_vert</mat-icon>
                          </button>
                          <mat-menu #menuOption="matMenu">
                            <button mat-menu-item>Open Task</button>
                            <button mat-menu-item>Dismiss</button>
                          </mat-menu>
                        </div> -->
                      </div>
                    </a>
                  </mat-list-item>

                </div>
              </div>
            </mat-menu>
            <span class="avatar accent-1 large" *ngIf="!storage.get('isManager')" (click)="usernav.open()">
              {{shared.workerEmail && shared.workerEmail.substring(0, 2).toUpperCase()}}
            </span>
            <span class="avatar accent-1 large" *ngIf="storage.get('isManager')" (click)="usernav.open()">
              {{storage.get('isManager') && storage.get('manager').substring(0, 2).toUpperCase()}}
            </span>
          </div>
        </mat-toolbar>
        <content>
          <router-outlet></router-outlet>
        </content>
        <!-- *ngIf="storage.get('isManager')" -->
        <button 
        mat-fab
        color="accent"
        class="new-fab show-toolbar"
        (click)="onNewMessage()"
        matTooltip="Invite a Collaborator"
        matTooltipPosition="before"
        style="position: fixed;">
        <mat-icon>add</mat-icon>
      </button>
      </div>
    </mat-sidenav-container>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./app.component.scss']
})


export class AppComponent {
  workerEmail = '';
  enableButton: boolean;
  enableStopButton: boolean;
  worker: any = {};
  task: any = {};
  timeEntry: string;
  workerStatus = [];
  finalData = [];
  notifications: any = [];
  notificationsData = [];
  badgeCount = 0;
  start = 5;

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private service: ClockifyService,
    private _wairtable: WokerairtableService,
    private snackbar: MatSnackBar,
    private _airservice: AirtableService,
    private _notificationService: PushNotificationsService,
    @Inject('shared') private shared,
    @Inject(LOCAL_STORAGE) private storage: WebStorageService,
    private title: Title
  ) {
    // if (!this.storage.get('token')) {
    //   this.router.navigate(['login']);
    // }
    this.shared.workerEmail = this.storage.get('email');
    this._notificationService.requestPermission();

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        if (event.url.lastIndexOf('waiting') > -1) {
          this.shared.currentView = 'waiting';
          this.shared.enableButton = false;
          this.shared.enableStopButton = false;
        } else if (event.url.lastIndexOf('closed') > -1) {
          this.shared.enableButton = false;
          this.shared.enableStopButton = false;
          this.shared.currentView = 'closed';
        } else {
          this.shared.currentView = 'inbox';
          if (this.storage.get('token')) {
            this.getTimer();
          }
        }
      }
    })
  }

  async ngOnInit() {
  }

  notifyPopup = async () => {
    await this._airservice.getNotifications(`{To}="${this.storage.get('email')}"`).subscribe(
      data => {
        data.map(async (notify) => {
          if (notify.fields['pending Notify'] == 0 || notify.fields['pending Notify'] == undefined) {
            this.badgeCount += 1;
            let data: Array<any> = [];
            data.push({
              'title': notify.fields.Title,
              'alertContent': notify.fields.Message
            });
            this._notificationService.generateNotification(data);
            await this._airservice.updateNotification(notify.id, { fields: { "pending Notify": 1 } }).toPromise().then(async (rec) => { });
          }
        });
      });
  }

  showMenu() {
    $(document).ready(function () {
      $('.show-toolbar').attr('style', 'display: block !important');
    });
  }

  private getTimer = async () => {
    if (!this.storage.get('token')) {
      this.router.navigate(['login']);
    } else {
      this.getNotification();
      this.showMenu();
      if (!this.storage.get('process_stIsLogin')) {
        this.openDialog();
      }
      this.checkSession();
      if (this.shared.workerEmail && this.shared.workerEmail.length > 0) {
        let collaborators;
        await this._airservice.getWorkers('AND({inboxEnabled}="true",{isVerify}="true")')
          .then(async results => (collaborators = results));

        this.shared.workers = collaborators[0];
        this.getWorkerStatusIndicator(); // 300000
        setInterval(() => {
          this.notifyPopup();
        }, 60000); // 60000
        this.shared.worker = collaborators[0].find((user) => {
          return user.fields['Business Email'] && user.fields['Business Email'].toLowerCase() === this.shared.workerEmail.toLowerCase()
        });
        this.shared.currentWorker = this.shared.worker;
        if (this.shared.worker.fields['Type'] === 'Manager') {
          this.storage.set('isManager', true);
          this.storage.set('manager', this.shared.worker.fields['Business Email']);
        }
        this.service.getTimeEntry(this.shared.worker).subscribe(record => {
          this.shared.enableStopButton = true;
          this.shared.enableButton = false;
          this.shared.currentRunningTask = record;
          this.shared.timeEntry = record.timeInterval['start'];
          this._airservice.getTasks1(`({Clockify Task ID}="${record['taskId']}")`).toPromise().then(results => {
            this.shared.task = results[0];
          });
        }, (error) => {
          this.shared.enableButton = true;
          this.shared.enableStopButton = false;
        });
      }
    }
  }

  openDialog() {
    this.dialog.open(CheckProcessStLoginComponent, {
      width: '50%',
      height: '40%',
      disableClose: true
    });
  }

  checkSession() {
    const currentTime = new Date().valueOf();
    let expiryTime = this.storage.get('expiryTime');
    if (currentTime > expiryTime) {
      this.logout();
    }
  }

  public logout(): void {
    this.storage.remove('token');
    this.storage.remove('email');
    this.storage.remove('isManager');
    this.storage.remove('manager');
    this.storage.remove('id');
    this.storage.remove('name');
    this.storage.remove('image_url');
    this.storage.remove('process_stIsLogin');
    this.storage.remove('expiryTime');
    this.storage.remove('dialog');
    this.router.navigate(["login"]);
    window.location.reload();
  }

  public getWorkerStatusIndicator(): void {
    this.shared.workers.map(async (workerData) => {
      await this._airservice.getWorkerStatus(`AND({State}="3. Running", {Owner}="${workerData.fields['Business Email']}")`).then(async results => {
        if (results[0]) { workerData.fields.workerStatus = "online" }
        else { workerData.fields.workerStatus = "offline" }
      });
      await this._airservice.getClockifyBaseWorkerStatus(workerData.fields['Clockify API Key']).subscribe(
        data => {
          // console.log("getClockifyBaseWorkerStatus data: ", data);
          if (data) { workerData.fields.workerStatus = "online" }
          else { workerData.fields.workerStatus = "offline" }
        },
        error => {
          let data = error;
          // console.log("getClockifyBaseWorkerStatus error: ", error);
        });
      if (workerData.fields['Business Email'] && this.shared.workerEmail.toLowerCase() === workerData.fields['Business Email'].toLowerCase()) {
        workerData.fields.workerStatus = "online"
      }
    });
    setTimeout(() => { this.getWorkerStatusIndicator(); }, 300000);
  }

  getNotification = async () => {
    if (this.badgeCount > 0) {
      this.badgeCount = 0
    }
    let notifyData = [];
    const currentTime = new Date().valueOf();
    await this._airservice.getNotifications(`{To}="${this.storage.get('email')}"`).subscribe(
      data => {
        data.map((notify) => {
          // notify.div = notify.fields.Message.length >= 45 ? 2 : 3
          if (notify.fields.Message && notify.fields.Message.length > 50) {
            notify.fields.Message = `${notify.fields.Message.substr(0, 45)}...`;
          } else {
            notify.fields.Message = `${notify.fields.Message}...`;
          }
          notify.time = moment(notify.fields['Created Date']).fromNow();
          notifyData.push(notify);
        });
        this.notificationsData = notifyData;
        this.notifications = this.notificationsData.slice(0, 5);
      },
      error => {
        let data = error;
        // console.log("getNotifications error: ", error);
      });
  }

  onScroll() {
    this.start += 2;
    this.notifications = this.notificationsData.slice(0, this.start);
  }

  public redirectToTask(taskId, notificationId): void {
    if (taskId) {
      this.router.navigate([`/task/${taskId}`]);
    }
    this._airservice.updateNotification(notificationId, { fields: { Opened: 'true' } }).toPromise().then(result => {
      console.log('Notification updated!');
    })
  }

  public assign(path): void {
    let navigationExtras: NavigationExtras = {
      queryParams: { 'email': this.workerEmail },
      fragment: 'anchor'
    };
    this.router.navigate([path]);
  }

  public async startTracker() {
    if (this.shared.worker.id) {
      let task;
      const snackBar = this.snackBar.open('Loading', null);
      await this.shared.getTasks(this.shared.workerEmail).then(res => task = res);
      if (task) {
        this.shared.task = task;
        let descriptorCount;
        if (task.fields['Descriptor'] && task.fields['Descriptor'].length > 499) {
          descriptorCount = task.fields['Descriptor'].substr(0, 495);
        } else {
          descriptorCount = task.fields['Descriptor']
        }
        let workData = {
          start: new Date(),
          billable: 'false',
          description: typeof task.fields['Descriptor'] != 'undefined'
            ? descriptorCount
            : '',
          projectId: task.fields['Clockify Project ID'][0],
          taskId: task.fields['Clockify Task ID'],
        };
        console.log("workData: ", workData);

        let started = false;
        await this.service.postTimeEntry(this.shared.worker, workData).toPromise().then(res => {
          console.log("res: ", res);
          this.shared.timeEntry = res.timeInterval['start'];
          this.shared.enableButton = false;
          this.shared.enableStopButton = true;
          this.shared.currentRunningTask = res;
          this.snackbar.open('Tracker started!', null, {
            duration: 2000
          });
          started = true;
          this.shared.task.fields.Status = 'Working on it';
          this.shared.moveTask(this.shared.task);
          this.shared.openTaskPanel(this.shared.task);
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
      } else {
        this.snackBar.open('No task available!', null, {
          duration: 2000
        });
      }
    }
  }

  public stopTracker(): void {
    if (this.shared.worker.id) {
      this.service.stopTimeEntry(this.shared.worker).subscribe(() => {
        this.shared.enableButton = true;
        this.shared.enableStopButton = false;
      }, (error: any) => {
        if (error.status === 200) {
          this.title.setTitle('Inbox');
          this.shared.currentRunningTask = '';
          this.shared.timeEntry = '';
          this.shared.enableButton = true;
          this.shared.enableStopButton = false;
          this.snackbar.open('Tracker stopped!', null, {
            duration: 2000
          });

          if (this.shared.task && !this.shared.task.updated) {
            this.shared.task.fields.Status = 'Started';
            this.shared.task.fields.isAvailable = false;
            this.shared.moveTask(this.shared.task);
            this._airservice.updateTasks(this.shared.task.id, { fields: { Status: "Started" } }).toPromise().then(rec => {
              console.log('Task updated - stop tracker');
              this.shared.task = {};
            })
          }
          setTimeout(() => {
            this.assign('/');
          }, 2000);
        } else {
          this.snackbar.open('Something went wrong. Please try again!', null, {
            duration: 2000
          });
        }
      }, () => {
        this.snackbar.open('Tracker stopped!', null, {
          duration: 2000
        });
        this.getTimer();
        setTimeout(() => {
          this.assign('/');
        }, 2000);
      })
    }
  }

  public onDelete(): void {
    var r = confirm("Really?");
    if (r == true) {
      this.snackBar.open('Loading', null);
      this.shared.deleteTimeEntry(this.shared.worker).then(res => {
        this.shared.timeEntry = '';
        this.shared.enableStopButton = false;
        this.shared.enableButton = true;
        this.shared.currentRunningTask = '';
        this.title.setTitle('Inbox');
        this._airservice.updateTasks(this.shared.task.id, { fields: { Status: "Started" } }).toPromise().then(rec => {
          this.shared.task.fields.Status = "Started";
          this.shared.moveTask(this.shared.task);
          this.shared.task = {};
        });
        this.snackbar.open('Time Entry deleted successfully!', null, {
          duration: 2000,
        });
      }).catch(error => {
        this.snackbar.open('Something went wrong!', null, {
          duration: 2000,
        });
      })
    }
  }

  onNewMessage(data: any = {}): void {
    const dialogRef = this.dialog.open(NewMessageComponent, {
      width: '45%',
      panelClass: 'new-message-dialog',
      data
    });
  }

}
