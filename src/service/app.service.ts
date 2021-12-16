import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  API = `${ environment.API_URL }/api/tasks`;

  rows: any;

  constructor(private http: HttpClient) { }

  fetchAll(): any {
    return this.http.get(this.API);
  }
}
