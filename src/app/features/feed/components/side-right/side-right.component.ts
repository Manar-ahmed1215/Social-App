import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FollowersService } from '../../../../core/services/followers.service';
import { Followers } from '../../../../core/models/followers.interface';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs'; // أضف هذه
import { FormsModule } from '@angular/forms';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-side-right',
  standalone: true, // تأكد من وجودها إذا كنت تستخدم Angular 14+
  imports: [FormsModule, RouterLink],
  templateUrl: './side-right.component.html',
  styleUrl: './side-right.component.css',
})
export class SideRightComponent implements OnInit, OnDestroy {
  private readonly followersService = inject(FollowersService);
  private searchSubject = new Subject<string>();

  follower: Followers[] = [];
  page: number = 1;
  loadingMore: boolean = false;
  loadingSuggestions: boolean = false;
  updatingFollow: string | null = null;
  searchText: string = "";


  ngOnInit(): void {
   this.inputChange()

    this.getFollowSuggestions();
  }


  getFollowSuggestions(): void {
    if (this.loadingSuggestions) return;
    this.loadingSuggestions = true;

    this.followersService.getFollowSuggestions(this.page, this.searchText).subscribe({
      next: (res) => {
        if (this.page === 1) {
          this.follower = res.data.suggestions;
        } else {
          this.follower.push(...res.data.suggestions);
        }
        this.loadingSuggestions = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingSuggestions = false;
      }
    });
  }
  followOrUnFollow(userId: string): void {
    this.updatingFollow = userId;
    this.followersService.followOrUnfollow(userId).subscribe({
      next: () => {
        this.follower = this.follower.filter(user => user._id !== userId);
        this.updatingFollow = null;
      },
      error: () => {
        this.updatingFollow = null
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
        this.loadingMore = false;
      }
    });
  }

  search(): void {
    this.searchSubject.next(this.searchText);
  }
  ngOnDestroy(): void {
    this.searchSubject.complete();
  }
 inputChange(): void{
   this.searchSubject.pipe(
      debounceTime(500), 
      distinctUntilChanged() 
    ).subscribe(value => {
      this.searchText = value; 
      this.page = 1;      
      this.follower = [];      
      this.getFollowSuggestions(); 
    });
 }

  
}