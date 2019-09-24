import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';

@Pipe({name: 'tasksFilter'})
export class TaskFilterPipe implements PipeTransform {
  transform(tasks: Observable<any>, email: string): Observable<any> {
    return email && tasks && tasks.filter( task =>
      typeof task.fields['Owner [OLD]'] != 'undefined' &&
      task.fields['Owner [OLD]'][0].email.toLowerCase() === email.toLowerCase()
    )
  }
}