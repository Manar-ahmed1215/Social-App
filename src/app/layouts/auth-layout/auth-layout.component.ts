import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { initFlowbite } from 'flowbite';
import { BtnLangComponent } from "../../shared/ui/btn-lang/btn-lang.component";

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, RouterLinkWithHref, RouterLinkActive, TranslatePipe, BtnLangComponent],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css',
})
export class AuthLayoutComponent implements OnInit{
  ngOnInit(): void {
    initFlowbite();
  }
}
