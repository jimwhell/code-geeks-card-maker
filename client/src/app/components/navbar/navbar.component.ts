import {
  Component,
  InputSignal,
  OutputEmitterRef,
  output,
  input,
} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  animations: [
    trigger('openClose', [
      state('closed', style({ transform: 'translateX(-120%)' })),
      state('open', style({ transform: 'translateX(0)' })),
      transition('closed <=> open', [animate('1s ease-in-out')]),
    ]),
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  isLoading: boolean = false;
  menuStateInput: InputSignal<'open' | 'closed'> = input<'open' | 'closed'>(
    'closed'
  );
  emitToggle: OutputEmitterRef<'open' | 'closed'> = output<'open' | 'closed'>();
  linkClick: OutputEmitterRef<string> = output<string>();
  constructor(private authService: AuthService, private router: Router) {}

  toggleMenuState(): void {
    const newState = this.menuStateInput() === 'closed' ? 'open' : 'closed';
    this.emitToggle.emit(newState);
  }

  emitLinkClick(link: string, event: MouseEvent): void {
    this.linkClick.emit(link);
  }

  logout() {
    this.isLoading = true;
    this.authService.logout().subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Admin logged out');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error in logging out admin: ', err);
      },
    });
  }
}
