import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { finalize, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Posts } from '../models/posts.interface';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private readonly httpClient = inject(HttpClient)

  //   header: object = {
  //   headers: {
  //     Authorization: `Bearer ${localStorage.getItem('socailToken')}`
  //   }
  // }

  // Cache للبوستات
  private postsCache: Posts[] = [];
  private currentPageCache = 1;
  private allPostsLoadedCache = false;

  // جلب البوستات من الكاش
  getCachedPosts() {
    return {
      posts: this.postsCache,
      page: this.currentPageCache,
      allLoaded: this.allPostsLoadedCache
    };
  }

  // تحديث الكاش بعد أي تحميل جديد
  setCachedPosts(posts: Posts[], page: number, allLoaded: boolean) {
    this.postsCache = posts;
    this.currentPageCache = page;
    this.allPostsLoadedCache = allLoaded;
  }

  getAllPosts(page: number = 1, limit: number = 40): Observable<any> {
    return this.httpClient.get(environment.baseUrl +`/posts?page=${page}&limit=${limit}`);
  }
  getFeedPosts(page: number = 1, limit: number = 40):Observable<any>{
    return this.httpClient.get(environment.baseUrl +`/posts/feed?only=following&${page}&limit=${limit}`)
  }
  createPosts(data: object): Observable<any> {
    return this.httpClient.post(environment.baseUrl + `/posts`, data)
  }
  getSinglePost(postId: string): Observable<any> {
    return this.httpClient.get(environment.baseUrl + `/posts/${postId}`)
  }
  deletePost(postId: string): Observable<any> {
    return this.httpClient.delete(environment.baseUrl + `/posts/${postId}`)
  }
  updatePost(postId: string, data: object): Observable<any> {
    return this.httpClient.put(environment.baseUrl + `/posts/${postId}`, data)
  }
  likeOrUnlikePost(postId: string): Observable<any> {
    return this.httpClient.put(environment.baseUrl + `/posts/${postId}/like`, null)
  }

  getLikePost(postId: string): Observable<any> {
    return this.httpClient.get(environment.baseUrl + `/posts/${postId}/likes?page=1&limit=20`);
  }
  saveOrUnsavePost(postId: string): Observable<any> {
    return this.httpClient.put(environment.baseUrl + `/posts/${postId}/bookmark`, null)
  }
  sharePost(postId: string, body: object): Observable<any> {
    return this.httpClient.post(environment.baseUrl + `/posts/${postId}/share`, body)
  }

}
