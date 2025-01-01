import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  MatCard,
  MatCardHeader,
  MatCardAvatar,
  MatCardTitle,
  MatCardContent,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { AuthJwtRegistrationComponent } from '@myrmidon/auth-jwt-admin';

@Component({
  selector: 'app-register-user-page',
  templateUrl: './register-user-page.component.html',
  styleUrls: ['./register-user-page.component.css'],
  imports: [
    MatCard,
    MatCardHeader,
    MatIcon,
    MatCardAvatar,
    MatCardTitle,
    MatCardContent,
    AuthJwtRegistrationComponent,
  ],
})
export class RegisterUserPageComponent {
  constructor(private _router: Router) {}

  public onRegistered(): void {
    this._router.navigate(['/home']);
  }
}
