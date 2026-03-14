import { CommonModule, NgClass , Location} from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Component, inject, OnInit } from '@angular/core';
import { Posts } from '../../../core/models/posts.interface';
import { ProfileService } from '../../../core/services/profile.service';

import { UserProfileDetails } from '../../../core/models/user-profile-details.interface';
import { FollowersService } from '../../../core/services/followers.service';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago-pipe';


@Component({
  selector: 'app-profile-user',
  imports: [NgClass, CommonModule, RouterLink, TimeAgoPipe],
  templateUrl: './profile-user.component.html',
  styleUrl: './profile-user.component.css',
})
export class ProfileUserComponent implements OnInit {
  private readonly profileService = inject(ProfileService);
  private readonly followersService = inject(FollowersService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly location = inject(Location)

  targetId: string = ""; 
  myId: string = ""; 
  userDetails: UserProfileDetails = {} as UserProfileDetails;
  userPosts: Posts[] = [];

  ngOnInit(): void {
    const data = localStorage.getItem('userData');
    if (data) {
      const userData = JSON.parse(data);
      this.myId = userData._id;
    }
    this.activatedRoute.paramMap.subscribe((param) => {
      this.targetId = param.get('id')!;
      if (this.targetId) {
        this.getUserProfile();
        this.getUserPosts();
      }
    });
  }

  getUserProfile(): void {
    this.profileService.getUserProfile(this.targetId).subscribe({
      next: (res) => {
        this.userDetails = res.data;
      },
      error: (err) => console.error(err)
    });
  }

  getUserPosts(): void {
    this.profileService.getUserPosts(this.targetId).subscribe({
      next: (res) => {
        this.userPosts = res.data.posts;
      },
      error: (err) => console.error(err)
    });
  }

  followOrUnfollow(): void {
    this.followersService.followOrUnfollow(this.targetId).subscribe({
      next: (res) => {
        this.userDetails.isFollowing = !this.userDetails.isFollowing;
      }
    });
  }
    backPage(): void {
    this.location.back()
  }
}
