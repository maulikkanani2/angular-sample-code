import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import {
  MatSidenavModule, MatToolbarModule, MatButtonModule, MatIconModule,
  MATERIAL_COMPATIBILITY_MODE, MatCardModule, MatMenuModule, MatTooltipModule,
  MatDialogModule, MatChipsModule, MatAutocompleteModule, MatFormFieldModule,
  MatInputModule, MatSnackBarModule, MatSlideToggleModule, MatExpansionModule, MatProgressSpinnerModule
} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxAirtableModule } from 'ngx-airtable/src/ngx-airtable.module';
import { StorageServiceModule } from 'angular-webstorage-service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { MessageComponent } from './message/message.component';
import { NewMessageComponent } from './new-message/new-message.component';
import { TaskViewportComponent } from './task-viewport/task-viewport.component';
import { TaskConfirmComponent } from './task-confirm/task-confirm.component';
import { routes } from './app.routes';
import { TaskFilterPipe } from './tasks-filter.pipe';
import { stringWordFilter } from './string-filter.pipe';
import { SafePipe } from './url-filter-pipe';
import { PopupEmailErrorComponent } from './popup-email-error/popup-email-error.component';
import { ClockifyService } from './clockify.service';
import { AirtableService } from './airtable.service';
import { EncrDecrService } from './EncrDecr.service';
import { WokerairtableService } from './wokerairtable.service';
import { PushNotificationsService } from "./push.notification.service";
import { TaskComponent } from './task/task.component';
import { CounterComponent } from './counter/counter.component';
import { SharedService } from './shared.service';
import { LoginComponent } from './login/login.component';
import { TaskNotificationPopupComponent } from './task-notification-popup/task-notification-popup.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { SendNotificationMailComponent } from './send-notification-mail/send-notification-mail.component';
import { MailNotificationPopupComponent } from './mail-notification-popup/mail-notification-popup.component';
import { CheckProcessStLoginComponent } from './check-process-st-login/check-process-st-login.component';
import { VerificationComponent } from './verification/verification.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectViewportComponent } from './project-viewport/project-viewport.component';

@NgModule({
  declarations: [
    AppComponent,
    MessageComponent,
    NewMessageComponent,
    TaskViewportComponent,
    TaskConfirmComponent,
    TaskFilterPipe,
    stringWordFilter,
    SafePipe,
    PopupEmailErrorComponent,
    TaskComponent,
    CounterComponent,
    LoginComponent,
    TaskNotificationPopupComponent,
    TaskDetailComponent,
    SendNotificationMailComponent,
    MailNotificationPopupComponent,
    CheckProcessStLoginComponent,
    VerificationComponent,
    ResetPasswordComponent,
    ProjectListComponent,
    ProjectViewportComponent
  ],
  imports: [
    BrowserModule,
    InfiniteScrollModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes, {
      useHash: false
    }),
    HttpModule,
    FlexLayoutModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    NgxAirtableModule.forRoot({ apiKey: environment.airTableApiKey }),
    StorageServiceModule
  ],
  exports: [
    MatFormFieldModule,
    MatInputModule,
  ],
  entryComponents: [
    NewMessageComponent,
    TaskViewportComponent,
    TaskConfirmComponent,
    TaskNotificationPopupComponent,
    PopupEmailErrorComponent,
    MailNotificationPopupComponent,
    CheckProcessStLoginComponent,
    ProjectViewportComponent
  ],
  providers: [
    { provide: MATERIAL_COMPATIBILITY_MODE, useValue: true },
    { provide: 'shared', useClass: SharedService },
    ClockifyService,
    AirtableService,
    EncrDecrService,
    WokerairtableService,
    PushNotificationsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule);