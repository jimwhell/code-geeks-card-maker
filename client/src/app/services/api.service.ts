import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private httpClient: HttpClient) {}

  private baseUrl: string = `http://localhost:3000`;

  post<TResponse, TRequest>(
    url: string,
    body: TRequest
  ): Observable<TResponse> {
    return this.httpClient.post<TResponse>(`${this.baseUrl}${url}`, body, {
      withCredentials: true,
    });
  }

  delete<TResponse>(url: string): Observable<TResponse> {
    return this.httpClient.delete<TResponse>(`${this.baseUrl}${url}`, {
      withCredentials: true,
    });
  }

  get<TResponse>(
    url: string,
    options?: { params?: HttpParams }
  ): Observable<TResponse> {
    return this.httpClient.get<TResponse>(`${this.baseUrl}${url}`, {
      withCredentials: true,
      ...options,
    });
  }
}
