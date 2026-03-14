import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly httpClient = inject(HttpClient)
  private userProfileSubject = new BehaviorSubject<any>(null);
  userProfile$ = this.userProfileSubject.asObservable();
  updateUserProfile(userData: any) {
    this.userProfileSubject.next(userData);
  }

  getMyprofile(): Observable<any> {
    return this.httpClient.get(environment.baseUrl + `/users/profile-data`).pipe(
      tap((res: any) => {
        if (res.data?.user) {
          this.updateUserProfile(res.data.user);
        }
      })
    );
  }

  uploadMyprofilePhoto(data: object): Observable<any> {
    return this.httpClient.put(environment.baseUrl + `/users/upload-photo`, data).pipe(
      tap((res: any) => {
        if (res.user) {
          this.updateUserProfile(res.user);
        }
      })
    );
  }
  uploadMyCoverPhoto(data: object): Observable<any> {
    return this.httpClient.put(environment.baseUrl + `/users/upload-cover`, data).pipe(
      tap((res: any) => {
        if (res.user) {
          this.updateUserProfile(res.user);
        }
      })
    );
  }
  getUserPosts(postId: string, page: number = 1, limit: number = 40): Observable<any> {
    return this.httpClient.get(environment.baseUrl + `/users/${postId}/posts?${page}&limit=${limit}`)
  }
  getPostsSaved(page: number = 1, limit: number = 40): Observable<any> {
    return this.httpClient.get(environment.baseUrl + `/users/bookmarks?${page}&limit=${limit}`)
  }
  getUserProfile(uesrId: string): Observable<any> {
    return this.httpClient.get(environment.baseUrl + `/users/${uesrId}/profile`)
  }


}
