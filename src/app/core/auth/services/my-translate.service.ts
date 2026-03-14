import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class MyTranslateService {
  private readonly translateService = inject(TranslateService)
  changeDirection():void{
    if(localStorage.getItem('lang') === 'en'){
      document.documentElement.setAttribute('dir' , 'ltr')
      document.documentElement.setAttribute('lang' , 'en')

    }
    else if(localStorage.getItem('lang') === 'ar'){
      document.documentElement.setAttribute('dir' , 'rtl')
      document.documentElement.setAttribute('lang' , 'ar')
    }
  }
  changeLanguage(lang:string) :void{
  localStorage.setItem("lang" , lang)
  this.translateService.use(lang)
  this.changeDirection()
}
}
