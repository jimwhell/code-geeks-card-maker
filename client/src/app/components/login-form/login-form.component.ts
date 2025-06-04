import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css',
})
export class LoginFormComponent {
  isSubmitted: boolean = false;
  serverError: string | null = null;

  private formBuilder = inject(FormBuilder);

  constructor(private authService: AuthService, private router: Router) {}

  loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  get email() {
    const emailValue = this.loginForm.get('email');
    if (emailValue !== null) {
      return emailValue;
    }
    return;
  }

  get password() {
    const passwordValue = this.loginForm.get('password');
    if (passwordValue !== null) {
      return passwordValue;
    }
    return;
  }

  onSubmit(): void {
    this.isSubmitted = true;
    if (this.loginForm.valid) {
      const email: string = this.loginForm.value.email as string;
      const password: string = this.loginForm.value.password as string;

      this.loginForm.reset();
      this.loginForm.markAsPristine();
      this.loginForm.markAsUntouched();

      this.authService.login(email, password).subscribe({
        next: (response) => {
          console.log(response);
          this.isSubmitted = false;
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isSubmitted = false;
          console.error('Error in logging in admin: ', err);
          if (err.status === 401) {
            this.serverError = 'Invalid email or password';
            return;
          }
          this.serverError = 'Something went wrong. Please try again.';
        },
      });
      return;
    }
    this.isSubmitted = false;
  }
}
