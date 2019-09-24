import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './task-notification-popup.component.html',
  styleUrls: ['./task-notification-popup.component.scss']
})

export class TaskNotificationPopupComponent implements OnInit {
  taskId: any;
  taskData: any;

  constructor(
    private route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private routes: Router
  ) {
    if (data) {
      this.taskData = data;
    }
    // this.taskId = this.route.snapshot.paramMap.get('taskId');
  }

  ngOnInit() {
    // this.route.params.subscribe(params => {
    //   console.log(params) //log the entire params object
    //   console.log(params['taskId']) //log the value of id
    // });
  }

}