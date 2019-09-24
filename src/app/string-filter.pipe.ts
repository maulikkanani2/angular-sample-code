import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'stringWordFilter' })
export class stringWordFilter implements PipeTransform {
    transform(name: string, maxWords: number): string {
        if (name) {
            var a = name.split(' ');
            var words = 0, i = 0;
            for (; (i < a.length) && (words < maxWords); ++i)
                if (a[i].length)++words;
            if(maxWords < words) {
                return name;
            } else {
               return a.splice(0, i).join(' ')+'...';
            }
        } else {
            return '';
        }
    }
}