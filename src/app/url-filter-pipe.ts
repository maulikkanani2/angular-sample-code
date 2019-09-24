import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'

@Pipe({
    name: 'safe'
})

export class SafePipe implements PipeTransform {
    constructor(private santizer: DomSanitizer) {}
    transform(url: string) {
        return this.santizer.bypassSecurityTrustResourceUrl(url);
    }
}