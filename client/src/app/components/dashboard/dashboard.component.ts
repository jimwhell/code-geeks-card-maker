import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  protected menuState: 'open' | 'closed' = 'closed';
  toggleMenuState(): void {
    this.menuState = this.menuState === 'closed' ? 'open' : 'closed';
  }

  toggleMenuStateFromChild(state: 'open' | 'closed'): void {
    this.menuState = state;
  }
}
