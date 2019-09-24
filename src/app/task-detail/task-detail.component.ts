import { Component, HostBinding, ViewEncapsulation, Input, Output, EventEmitter, Inject } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';

import { AirtableService } from '../airtable.service';
import { TaskViewportComponent } from '../task-viewport/task-viewport.component';

@Component({
  selector: 'app-root',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss']
})
export class TaskDetailComponent {

  @HostBinding('class.message-opened')
  task = {
    fields: {}
  };
  @Input() opened = false;

  @Input() id = '';
  @Input() avatar = '';
  @Input() from = '';
  @Input() subject = '';
  @Input() body = '';
  @Input() recieved = new Date();

  @Output() removed = new EventEmitter<void>();

  @Output() assisted = new EventEmitter<void>();
  @Output() inputted = new EventEmitter<void>();
  @Output() done = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();


  @Output() reply = new EventEmitter<{ to: string, subject: string }>();
  @Output() snoozed = new EventEmitter<{ recordId: string, type: string }>();
  @Output() headerclick = new EventEmitter<{ recordId: string }>();

  iframeUrl: string;
  taskId: any;

  states = [
    'success',
    'brand',
    'danger',
    'accent',
    'warning',
    'metal',
    'primary',
    'info'];

  constructor(
    @Inject('shared') private shared,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private _airtable: AirtableService) {
    this.taskId = this.route.snapshot.paramMap.get('taskId');
    this.getTaskData();
  }

  getTaskData = async () => {
    await this._airtable.getTasks1(`{Task ID}=${this.taskId}`).toPromise().then((record) => {
      if (record[0].fields.State == "1. Ready") {
        record[0].fields.isAvailable = true;
      } else {
        record[0].fields.isAvailable = false;
      }
      this.task = record[0];
      this.onNewMessage();
    });
  }

  ngOnInit() {
  }

  onReply(): void {
    this.reply.emit({
      to: this.from,
      subject: `RE: ${this.subject}`
    });
  }

  onSnoozed(recordId: string, type: string): void {
    this.snoozed.emit({
      recordId: recordId,
      type: type
    })
  }

  onTest(recordId: string) {
    this.headerclick.emit({
      recordId: recordId
    })
  }

  doExpand(event): void {
    event.stopPropagation();
  }

  decode(uri: string): string {
    return decodeURIComponent(uri);
  }

  onNewMessage(): void {
    let data = {
      isTaskDetail: true,
      iframeUrl: this.task.fields['Checklist'],
      opened: true,
      task: this.task,
      id: this.task['id'],
      from: this.from,
      subject: this.task.fields['Descriptor'],
      recieved: this.recieved,
      removed: this.removed,
      assisted: this.assisted,
      inputted: this.inputted,
      done: this.done,
      reply: this.reply,
      snoozed: this.snoozed,
      headerclick: this.headerclick
    }
    this.dialog.open(TaskViewportComponent, {
      panelClass: 'my-full-screen-dialog',
      data
    });
  }

}
