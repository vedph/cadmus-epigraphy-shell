import { Component, OnInit } from '@angular/core';
import {
  MatCard,
  MatCardHeader,
  MatCardTitle,
  MatCardContent,
} from '@angular/material/card';
import { UserListComponent } from '@myrmidon/auth-jwt-admin';

@Component({
  selector: 'app-manage-users-page',
  templateUrl: './manage-users-page.component.html',
  styleUrls: ['./manage-users-page.component.css'],
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    UserListComponent,
  ],
})
export class ManageUsersPageComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
