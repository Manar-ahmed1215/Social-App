import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  private readonly httpClient =inject(HttpClient)
//   header: object = {
//   headers: {
//     Authorization: `Bearer ${localStorage.getItem('socailToken')}`
//   }
// }
 getAllComments(postId: string, page: number, limit: number):Observable<any>{
  return this.httpClient.get(environment.baseUrl + `/posts/${postId}/comments?page=${page}&limit=${limit}`)
}
  getRepliesComments(postId:string ,commentId:string):Observable<any>{
    return this.httpClient.get(environment.baseUrl +`/posts/${postId}/comments/${commentId}/replies?page=1&limit=10`)
  }
  createComment(postId:string , data:object):Observable<any>{
    return this.httpClient.post(environment.baseUrl + `/posts/${postId}/comments` ,data )
  }
  createReplyComment(postId:string ,commentId:string, data:object):Observable<any>{
    return this.httpClient.post(environment.baseUrl + `/posts/${postId}/comments/${commentId}/replies` ,data )
  }
  deleteComment(commentId:string , postId:string ):Observable<any>{
    return this.httpClient.delete(environment.baseUrl +`/posts/${postId}/comments/${commentId}`)
  }
  updateComment(commentId:string , postId:string  , body:object):Observable<any>{
    return this.httpClient.put(environment.baseUrl +`/posts/${postId}/comments/${commentId}` , body)
  }
   likeOrUnlikeComment(commentId:string , postId:string ):Observable<any>{
    return this.httpClient.put(environment.baseUrl +`/posts/${postId}/comments/${commentId}/like` ,null)
   }
}
