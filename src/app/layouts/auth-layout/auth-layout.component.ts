import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, RouterLinkActive } from '@angular/router';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, RouterLinkWithHref, RouterLinkActive],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css',
})
export class AuthLayoutComponent implements OnInit{
  ngOnInit(): void {
    initFlowbite();
  }
}
