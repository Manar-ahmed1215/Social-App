import { Component, EventEmitter, inject, Output } from '@angular/core';
import { ProfileService } from '../../../../core/services/profile.service';
import { MyProfileDetails } from '../../../../core/models/my-profile-details.interface';
import { Posts } from '../../../../core/models/posts.interface';
import { RouterLink } from "@angular/router";
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago-pipe';
import { DatePipe } from '../../../../shared/pipes/date-pipe';

@Component({
  selector: 'app-my-posts',
  imports: [RouterLink , TimeAgoPipe , DatePipe],
  templateUrl: './my-posts.component.html',
  styleUrl: './my-posts.component.css',
})
export class MyPostsComponent {
 constructor(private profileService: ProfileService) {}
  userDetails: MyProfileDetails = {} as MyProfileDetails;
  @Output() countChanged = new EventEmitter<number>();
  myPosts:Posts[]=[]
  selectedImage: string | null = null;
  myPostsCount:number=0
  ngOnInit() {
    const storedData = localStorage.getItem('userData');
    if (storedData) {
      this.userDetails = JSON.parse(storedData);
      this.getMyPosts(); 
    }
  }

getMyPosts(): void {
    if (!this.userDetails._id) return;
    this.profileService.getUserPosts(this.userDetails._id).subscribe({
      next: (res) => {
        this.myPosts = res.data.posts;
        const total = res.meta.pagination.total;
        this.myPostsCount = total;
        this.countChanged.emit(total);
        
      },
      error: (err) => {
        console.log(err)
      }

    });
  }

    openImage(imgUrl: string) {
    this.selectedImage = imgUrl;
  }

  closeImage() {
    this.selectedImage = null;
  }

  
}
