
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';

import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment';


const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': environment.httpOptionsElasticQuery.ContentType,
        'Authorization': environment.httpOptionsElasticQuery.Authorization,
    })
};

@Injectable()
export class ElasticService {

    constructor(private _http: HttpClient) { 


    }

    getSearch(query: any,indexType:string) {

        const url = environment.httpOptionsElasticQuery.UrlElastic +  environment.user.currentProfile.current_index  + indexType+ "/_search";
    
        return this._http.post(url, JSON.stringify(query), httpOptions).pipe(
            map(res => res));
    }

    getSearchTopics(query: any,indexType:string) {

        const url = environment.httpOptionsElasticQuery.UrlElastic +  environment.user.currentProfile.current_index  + indexType+ "/_search";
    
        return this._http.post(url, JSON.stringify(query), httpOptions).pipe(
            map(res => res));
    }

    getXpackGraph(query: any,indexType:string) {

        const url = environment.httpOptionsElasticQuery.UrlElastic + environment.user.currentProfile.current_index + indexType+ "/_xpack/_graph/_explore";
    
        return this._http.post(url, JSON.stringify(query), httpOptions).pipe(
            map(res => res));
    }


    getTokens(query: any,indexType:string) {
        const url = environment.httpOptionsElasticQuery.UrlElastic + environment.user.currentProfile.current_index + indexType+ "/_analyze";
    
        return this._http.post(url, JSON.stringify(query), httpOptions).pipe(
            map(res => res));
    }

}
