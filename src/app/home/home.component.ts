import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'cadmus-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink],
})
export class HomeComponent {
  public logged: boolean;

  constructor(authService: AuthJwtService) {
    this.logged = authService.currentUserValue !== null;
  }
}
