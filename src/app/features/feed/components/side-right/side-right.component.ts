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

    const currentSearch = this.searchText; 
    this.loadingSuggestions = true;

    this.followersService.getFollowSuggestions(this.page, this.searchText).subscribe({
      next: (res) => {
        if (currentSearch !== this.searchText) return;

        const newFollower = res.data.suggestions;

        for (let i = 0; i < newFollower.length; i++) {
          this.follower.push(newFollower[i]);
        }

        this.loadingSuggestions = false;
      },
      error: (err) => {
        console.log(err);
        this.loadingSuggestions = false;
      }
    });
  }
  loadMore(): void {
    this.page++
    this.loadingMore = true
    this.followersService.getFollowSuggestions(this.page, this.searchText).subscribe({
      next: (res) => {

        const newFollower = res.data.suggestions

        for (let i = 0; i < newFollower.length; i++) {
          this.follower.push(newFollower[i])
        }
        this.loadingMore = false
      },
      error: (err) => {
        console.log(err)
        this.loadingMore = false
      }
    })
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
    .pipe(debounceTime(300))
    .subscribe(value => {
      this.page = 1;
      this.follower = [];
      this.searchText = value ?? '';
      this.loadingSuggestions=true
      this.getFollowSuggestions();
    });
}
}
