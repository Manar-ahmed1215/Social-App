import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from '../../../../core/auth/services/auth.service';
import { initFlowbite } from 'flowbite';
import { MyProfileDetails } from '../../../../core/models/my-profile-details.interface';
import { ProfileService } from '../../../../core/services/profile.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit{
private readonly authService=inject(AuthService)
private readonly profileService=inject(ProfileService)
private readonly notificationService=inject(NotificationService)
userPhoto: string | null = null;
unreadCount:number=0
myProfile: MyProfileDetails = {} as MyProfileDetails;

ngOnInit(): void {
    initFlowbite()
    this.getMyProfileData()
    this.profileService.userProfile$.subscribe({
      next: (user) => {
        if (user && user.photo) {
          this.userPhoto = user.photo;
        }
      }
    });
    this.getUnreadCount()
}
logout():void{
  this.authService.signOut()
}
  getMyProfileData(): void {
    this.profileService.getMyprofile().subscribe({
      next: (res) => {
        console.log(res)
        this.myProfile = res.data.user
        console.log(this.myProfile)
      },
      error: (err) => {
        console.log(err)
      }
    })
  }
  getUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (res) => {
        this.unreadCount = res.data.unreadCount
      }
    })
  }

}
