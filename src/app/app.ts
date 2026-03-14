import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MyTranslateService } from './core/auth/services/my-translate.service';
import { BtnLangComponent } from "./shared/ui/btn-lang/btn-lang.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSpinnerModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('socialApp');
  private translate = inject(TranslateService);
  private myTranslateService = inject(MyTranslateService);
  private spinner = inject(NgxSpinnerService);

    constructor() {
       this.spinner.show();
        this.translate.addLangs(['ar', 'en']);
        // this.translate.setFallbackLang('en');
        if(localStorage.getItem('lang')){
          this.translate.use(localStorage.getItem('lang')!);
          this.myTranslateService.changeDirection(   
          )
          
        }
        setTimeout(() => {
      this.spinner.hide();
    }, 1000); 
    }
}
