import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formattedDate'
})
export class DatePipe implements PipeTransform {

 transform(value: string | Date): string {
    if (!value) return '';

    const date = new Date(value);

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',   
      day: 'numeric',   
      hour: 'numeric',  
      minute: '2-digit',
      hour12: true    
    };

    return date.toLocaleString('en-US', options); 
  }

}
