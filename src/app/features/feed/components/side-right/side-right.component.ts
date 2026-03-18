import { Component, inject, OnInit } from '@angular/core';
import { FollowersService } from '../../../../core/services/followers.service';
import { Followers } from '../../../../core/models/followers.interface';
import { debounceTime } from 'rxjs';
import { FormControl, FormsModule } from '@angular/forms';
import { RouterLink } from "@angular/router";


@Component({
  selector: 'app-side-right',
  imports: [FormsModule, RouterLink],
  templateUrl: './side-right.component.html',
  styleUrl: './side-right.component.css',
})
export class SideRightComponent implements OnInit {

  private readonly followersService = inject(FollowersService)
  searchControl = new FormControl('');
  follower: Followers[] = []
  page: number = 1
  loadingMore: boolean = false;
  loadingSuggestions: boolean = false;
  updatingFollow: string | null = null;
  searchText: string = ""

  ngOnInit(): void {
    this.getFollowSuggestions()
    this.inputChange()
  }
getFollowSuggestions(): void {
  if (this.loadingSuggestions) return;
  this.loadingSuggestions = true;

  this.followersService.getFollowSuggestions(this.page, this.searchText).subscribe({
    next: (res) => {
      this.follower.push(...res.data.suggestions);
      this.loadingSuggestions = false;
    },
    error: (err) => {
      console.log(err);
      this.loadingSuggestions = false;
    }
  });
}
 loadMore(): void {
  if (this.loadingMore || this.loadingSuggestions) return;

  this.page++;
  this.loadingMore = true;

  this.followersService.getFollowSuggestions(this.page, this.searchText).subscribe({
    next: (res) => {
      this.follower.push(...res.data.suggestions);
      this.loadingMore = false;
    },
    error: (err) => {
      console.log(err);
      this.loadingMore = false;
    }
  });
}

  followOrUnFollow(userId: string): void {
    this.updatingFollow = userId
    this.followersService.followOrUnfollow(userId).subscribe({
      next: (res) => {
        console.log(res)
        this.follower = this.follower.filter(user => user._id !== userId);
        this.updatingFollow = null

      },
      error: (err) => {
        console.log(err)
        this.updatingFollow = null
      }
    })
  }

  search() {
    this.page = 1;
    this.follower = [];
    this.getFollowSuggestions();
  }
inputChange(): void {
  this.searchControl.valueChanges
    .pipe(debounceTime(700)) 
    .subscribe(value => {
      this.page = 1;
      this.follower = [];
      this.searchText = value ?? '';
      if (this.loadingSuggestions) return;

      this.getFollowSuggestions();
    });
}
}
