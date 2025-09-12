import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FileInfo } from '../models/file-info.model';

@Injectable({
  providedIn: 'root'
})
export class IfsService {
 private baseUrl = 'http://localhost:8080/api/ifs';

  constructor(private http: HttpClient) { }

  listFiles(path: string): Observable<FileInfo[]> {
    const params = new HttpParams().set('path', path);
    return this.http.get<FileInfo[]>(`${this.baseUrl}/files`, { params });
  }

  downloadFile(path: string): Observable<HttpResponse<Blob>> {
    const params = new HttpParams().set('path', path);
    return this.http.get(`${this.baseUrl}/download`, {
      params,
      responseType: 'blob',
      observe: 'response'
    });
  }

  readFile(path: string): Observable<any[]> {
    const params = new HttpParams().set('path', path);
    return this.http.get<any[]>(`${this.baseUrl}/file/read`, { params });
  }

  uploadFile(formData: FormData): Observable<any> {
  return this.http.post(`${this.baseUrl}/upload`, formData, {
    reportProgress: true,
    observe: 'events'
  });
}
  
}
