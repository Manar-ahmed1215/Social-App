import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo'
})
export class TimeAgoPipe implements PipeTransform {

 transform(value: string | Date): string {
    if (!value) return '';

    const seconds = Math.floor((+new Date() - +new Date(value)) / 1000);

    if (seconds < 60) return 'now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + 'm';
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + 'h';
    
    const days = Math.floor(hours / 24);
    if (days < 7) return days + 'd';

    const weeks = Math.floor(days / 7);
    if (weeks < 4) return weeks + 'w';

    return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

}
