import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FollowersService {
  private readonly httpClient =inject(HttpClient)
  getFollowSuggestions(page:number , q:string):Observable<any>{
  return this.httpClient.get(environment.baseUrl + `/users/suggestions?limit=4&page=${page}&q=${q}`)
}
followOrUnfollow(userId:string):Observable<any>{
  return this.httpClient.put(environment.baseUrl +`/users/${userId}/follow` ,null)
}
}
