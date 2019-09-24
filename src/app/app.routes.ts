import { Routes } from '@angular/router';
import { TaskComponent } from './task/task.component';
import { LoginComponent } from './login/login.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { SendNotificationMailComponent } from './send-notification-mail/send-notification-mail.component';
import { VerificationComponent } from './verification/verification.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ProjectListComponent } from './project-list/project-list.component';
import { environment } from '../environments/environment';

export const routes: Routes = [
    {
        path: '',
        component: TaskComponent,
    },
    {
        path: 'task/:taskId',
        component: TaskDetailComponent,
    },
    {
        path: 'verify/:verifyId',
        component: VerificationComponent,
    },
    {
        path: 'reset/:id',
        component: ResetPasswordComponent,
    },
    // {
    //     path: 'project',
    //     component: ProjectListComponent,
    // },
    {
        path: `notification`,
        component: SendNotificationMailComponent,
    },
    {
        path: 'closed',
        component: TaskComponent
    },
    {
        path: 'waiting',
        component: TaskComponent
    },
    {
        path: 'login',
        component: LoginComponent
    }
];
