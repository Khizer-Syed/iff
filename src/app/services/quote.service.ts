import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

const apiUrl = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class QuoteService {
    endpointUrl = `${apiUrl}/api/quotes`;

    constructor(public http: HttpClient) {
    }

    sendQuote(value: any): Observable<void> {
        return this.http.post<void>(this.endpointUrl, value);
    }
}
