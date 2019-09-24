import { Component, HostBinding, ViewEncapsulation, Input, Output, EventEmitter, Inject } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';

import { AirtableService } from '../airtable.service';
import { TaskViewportComponent } from '../task-viewport/task-viewport.component';
import { async } from '@angular/core/testing';

@Component({
  selector: 'app-message',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent {

  @HostBinding('class.message-opened')
  @Input() opened = false;

  @Input() task = {};
  @Input() id = '';
  @Input() avatar = '';
  @Input() from = '';
  @Input() subject = '';
  @Input() body = '';
  @Input() recieved = new Date();

  @Output() removed = new EventEmitter<void>();

  @Output() assisted = new EventEmitter<void>();
  @Output() clientAssisted = new EventEmitter<void>();
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
  colorClass = '';

  constructor(
    @Inject('shared') private shared,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private _airtable: AirtableService) {
    // this.taskId = this.route.snapshot.paramMap.get('taskId');
    // console.log("taskId: ", this.taskId);
    // this.getTaskData();
  }

  getTaskData = async () => {
    await this._airtable.getTasks1(`{Task ID}=${this.taskId}`).toPromise().then((record) => {
      record[0].fields.isAvailable = false;
      this.task = record[0];
      this.onOpenToggle(true);
    });
  }

  ngOnInit() {
    let state = this.states[Math.floor(Math.random() * (7 - 0 + 1)) + 0];
    this.colorClass = state;
  }

  onOpenToggle(flag: boolean): void {
    if (flag) {
      this.iframeUrl = this.body;
      let data = {
        isTaskDetail: true,
        iframeUrl: this.iframeUrl,
        opened: flag,
        task: this.task,
        id: this.id,
        from: this.from,
        subject: this.subject,
        recieved: this.recieved,
        removed: this.removed,
        assisted: this.assisted,
        clientAssisted: this.clientAssisted,
        inputted: this.inputted,
        done: this.done,
        reply: this.reply,
        snoozed: this.snoozed,
        headerclick: this.headerclick
      }
      this.onNewMessage(data);
    }
    this.opened = flag;
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

  onNewMessage = async (data)=> {
    await this._airtable.getProject(`({ID}="${data.task.fields['Project ID']}")`).toPromise().then(async (results) => {
      if (results.length > 0) {
        let data1 = results[0];
        data.project = data1;
        this.dialog.open(TaskViewportComponent, {
          panelClass: 'my-full-screen-dialog',
          data
        });
      }
    });
    
  }

}
