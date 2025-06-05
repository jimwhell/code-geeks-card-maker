import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Member } from '../interfaces/member';
import { PaginatedMemberResponse } from '../interfaces/paginated-member-response';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private baseUrl: string = '/api/members';

  constructor(private apiService: ApiService) {}

  //holds the value of members
  private membersSubject: BehaviorSubject<Member[] | null> =
    new BehaviorSubject<Member[] | null>(null);

  //declare an observable to hold the value of members behaviour subject
  members: Observable<Member[] | null> = this.membersSubject.asObservable();

  //total pages subject
  private totalPagesSubject: BehaviorSubject<number | null> =
    new BehaviorSubject<number | null>(null);

  //declare an observable to hold the value of total pages from response
  totalPages: Observable<number | null> = this.totalPagesSubject.asObservable();

  private currentPageSubject: BehaviorSubject<number | null> =
    new BehaviorSubject<number | null>(null);

  currentPage$: Observable<number | null> =
    this.currentPageSubject.asObservable();

  //method to fetch all members
  getMembers(page: number, limit: number): Observable<PaginatedMemberResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.apiService
      .get<PaginatedMemberResponse>(`${this.baseUrl}`, {
        params,
      })
      .pipe(
        tap((response: PaginatedMemberResponse) => {
          this.totalPagesSubject.next(response.totalPages);
          this.membersSubject.next(response.members);
          this.currentPageSubject.next(response.currentPage);
          console.log(
            'Current page from service: ',
            this.currentPageSubject.value
          );
        })
      );
  }
}
