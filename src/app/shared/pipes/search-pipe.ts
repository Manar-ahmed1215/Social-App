import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

 transform(arr: any[], data: string): any {
    if(!data) return arr;
    return arr.filter(item => item.name.toLowerCase().includes(data.toLowerCase()));
}
}
