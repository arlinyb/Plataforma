
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';

import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment';


const httpOptions = {
    headers: new HttpHeaders({
        
        'Content-Type': environment.httpOptionsElasticQuery.ContentType,
        'Authorization': environment.httpOptionsElasticQuery.Authorization
    })
};


@Injectable()
export class PostsService {

    constructor(private _http: HttpClient) { }


   
    getListPost(query: any,index:string) {

       const url = environment.httpOptionsElasticQuery.UrlElastic + index + "posts/_search";
       

        return this._http.post(url, JSON.stringify(query), httpOptions).pipe(
            map(res => res));
    }

    getSearchTopics(query: any,indexType:string) {
        const url = environment.httpOptionsElasticQuery.UrlElastic +  environment.user.currentProfile.current_index  + indexType+ "/_search";
    
        return this._http.post(url, JSON.stringify(query), httpOptions).pipe(
            map(res => res));
    }


    getListSources(query: any,index:string) {
        const url = environment.httpOptionsElasticQuery.UrlElastic + index + "posts/_search";

         return this._http.post(url, JSON.stringify(query), httpOptions).pipe(
             map(res => res));
     }
 

}
