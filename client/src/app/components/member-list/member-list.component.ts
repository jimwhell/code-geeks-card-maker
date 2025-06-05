import { Component, OnInit } from '@angular/core';
import { MemberService } from '../../services/member.service';
import { filter, Observable } from 'rxjs';
import { Member } from '../../interfaces/member';
import { AsyncPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [AsyncPipe, CommonModule],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.css',
})
export class MemberListComponent implements OnInit {
  //variable to hold the value of total pages
  range!: number[];

  //observable to hold the value of members
  $members!: Observable<Member[]>;

  //observable to hold the total pages
  $totalPages!: Observable<Number>;

  //variable to hold the current page
  currentPage!: number;

  //property to hold the value of total pages
  totalPages!: number;

  constructor(private memberService: MemberService) {}

  ngOnInit(): void {
    this.getMembers();

    this.$members = this.memberService.members.pipe(
      filter((member) => member !== null)
    );

    this.$totalPages = this.memberService.totalPages.pipe(
      filter((total) => total !== null)
    );

    this.$totalPages.subscribe((total: Number) => {
      this.range = Array.from({ length: Number(total) }, (_, i) => i + 1);
      this.totalPages = this.range.length;
    });

    this.getCurrentPage();
  }

  //method to get all members
  getMembers() {
    this.memberService.getMembers(1, 10).subscribe({
      next: (res) => {
        // console.log('Members: ', res);
      },
      error: (err) => {
        console.error('Error in retrieving members: ', err);
      },
    });
  }

  //method to get the current page
  getCurrentPage() {
    this.memberService.currentPage$
      .pipe(filter((value) => value != null))
      .subscribe((page) => {
        this.currentPage = page;
        console.log('Current page is: ', this.currentPage);
      });
  }

  //method to get the members from a specified page
  getPage(pageNumber: number) {
    // console.log('Page number: ', pageNumber);
    this.memberService.getMembers(pageNumber, 10).subscribe({
      next: (response) => {
        // console.log('Response: ', response);
      },
      error: (err) => {
        console.error('Error retrieving page: ', pageNumber, ' ', err);
      },
    });
  }
}
