import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { ProfileService } from '../../../../core/services/profile.service';
import { Posts } from '../../../../core/models/posts.interface';
import { RouterLink } from "@angular/router";
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago-pipe';
import { DatePipe } from '../../../../shared/pipes/date-pipe';

@Component({
  selector: 'app-my-posts-saved',
  imports: [RouterLink, TimeAgoPipe, DatePipe],
  templateUrl: './my-posts-saved.component.html',
  styleUrl: './my-posts-saved.component.css',
})
export class MyPostsSavedComponent implements OnInit {
  private readonly profileService = inject(ProfileService)
  @Output() countChanged = new EventEmitter<number>();
  savedList: Posts[] = []
  myPostsSavedCount: number = 0
  selectedImage: string | null = null;
  ngOnInit(): void {
    this.getSaved()
  }
  getSaved(): void {
    this.profileService.getPostsSaved().subscribe({
      next: (res) => {
        console.log(res)
        this.savedList = res.data.bookmarks
        const total = this.savedList.length;
        this.myPostsSavedCount = total;
        this.countChanged.emit(total);
      },
      error: (err) => {
        console.log(err)
      }

    })
  }
  openImage(imgUrl: string) {
    this.selectedImage = imgUrl;
  }

  closeImage() {
    this.selectedImage = null;
  }
}
