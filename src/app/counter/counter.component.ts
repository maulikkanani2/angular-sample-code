import { Component, ElementRef, OnInit, OnDestroy, Input, Inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable, Subscription } from 'rxjs/Rx';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss']
})
export class CounterComponent implements OnInit, OnDestroy {

  @Input() inputDate: string;

  private future: Date;
  private futureString: string;
  private counter$: Observable<number>;
  private subscription: Subscription;
  private message: string;

  constructor(elm: ElementRef, private title: Title, @Inject('shared') private shared,
  ) {
    this.futureString = this.inputDate;
  }

  dhms(t) {
    var days, hours, minutes, seconds;
    days = Math.floor(t / 86400);
    t -= days * 86400;
    hours = Math.floor(t / 3600) % 24;
    t -= hours * 3600;
    minutes = Math.floor(t / 60) % 60;
    t -= minutes * 60;
    seconds = t % 60;
    
    this.title.setTitle([
      this.getDigit(hours) + ':',
      this.getDigit(minutes) + ':',
      this.getDigit(seconds) + ''
      ].join(' ') +'::'+this.shared.currentRunningTask.description);

    return [
    //  days + ':',
    this.getDigit(hours) + ':',
    this.getDigit(minutes) + ':',
    this.getDigit(seconds) + ''
    ].join(' ');
  }

  getDigit(digit : any): string {
    if (digit.toString().length == 1) {
      digit  = "0" + digit;
    }
    return digit.toString();
  }

  ngOnInit() {
    this.future = new Date(this.inputDate);
    this.counter$ = Observable.interval(1000).map((x) => {
      return Math.floor((new Date().getTime() - this.future.getTime()) / 1000);
    });

    this.subscription = this.counter$.subscribe((x) => this.message = this.dhms(x));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
