
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
export class CommentsService {

    constructor(private _http: HttpClient) { 


    }

    getListComments(query: any,index:string) {

        const url = environment.httpOptionsElasticQuery.UrlElastic + index + "comments/_search";
    
        return this._http.post(url, JSON.stringify(query), httpOptions).pipe(
            map(res => res));
    }


    getXpackGraph(query: any) {

        const url = environment.httpOptionsElasticQuery.UrlElastic + environment.user.currentProfile.current_index + "comments/_xpack/_graph/_explore";
    
        return this._http.post(url, JSON.stringify(query), httpOptions).pipe(
            map(res => res));
    }


    getGraphTokens(query: any) {
        const url = environment.httpOptionsElasticQuery.UrlElastic + environment.user.currentProfile.current_index + "comments/_analyze";
    
        return this._http.post(url, JSON.stringify(query), httpOptions).pipe(
            map(res => res));
    }

}
