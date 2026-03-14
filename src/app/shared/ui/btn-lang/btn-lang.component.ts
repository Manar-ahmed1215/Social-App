import { Component, inject, OnInit } from '@angular/core';
import { MyTranslateService } from '../../../core/auth/services/my-translate.service';


@Component({
  selector: 'btnLang',
  imports: [],
  templateUrl: './btn-lang.component.html',
  styleUrl: './btn-lang.component.css',
})
export class BtnLangComponent implements OnInit {
  private readonly myTranslateService = inject(MyTranslateService)
  currentLang: string = ""
  ngOnInit(): void {
    this.currentLang = localStorage.getItem("lang") || 'en';
  }
  changeLang(lang: string): void {
    this.myTranslateService.changeLanguage(lang)
    this.currentLang = lang
    const toggle = document.getElementById('lang_dropdown_toggle') as HTMLInputElement;
    if (toggle){
      toggle.checked = false;
    } 
  }
}
