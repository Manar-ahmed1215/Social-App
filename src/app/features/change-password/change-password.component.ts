import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth/services/auth.service';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent implements OnInit {
  private readonly authService = inject(AuthService)
  private readonly router = inject(Router)
  toaster = inject(ToastrService)
  msgError: string = "";

  ngOnInit(): void { }

  ChangePasswordForm: FormGroup = new FormGroup({
    password: new FormControl("", [
      Validators.required,
      Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)
    ]),
    newPassword: new FormControl("", [
      Validators.required,
      Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)
    ]),
    reNewPassword: new FormControl("", Validators.required)
  }, { validators: this.confirmPassword })

  confirmPassword(group: AbstractControl) {
    const newPassword = group.get('newPassword')?.value;
    const confirm = group.get('reNewPassword');

    if (confirm?.value !== newPassword) {
      confirm?.setErrors({ mismatch: true });
    } else {
      confirm?.setErrors(null);
    }

    return null;
  }

  ChangePassword(): void {
    if (this.ChangePasswordForm.invalid) {
      this.ChangePasswordForm.markAllAsTouched();
      return;
    }

    const body = {
      password: this.ChangePasswordForm.value.password,
      newPassword: this.ChangePasswordForm.value.newPassword
    };

    this.msgError = "";

    this.authService.changePassword(body).subscribe({
      next: (res: any) => {
        console.log(res);

        this.toaster.success('Password updated successfully! Please login again.', 'Success', {
          timeOut: 3000,
          progressBar: true,
          progressAnimation: 'decreasing',
          closeButton: true,
          positionClass: 'toast-top-right'
        });

        localStorage.removeItem('token');
        this.authService.signOut(); 
        setTimeout(() => {
          this.router.navigateByUrl('/login');
        }, 1000);
      },
      error: (err) => {
        console.log(err);
        this.msgError = err.error.message;

        this.toaster.error(this.msgError, 'Error', {
          timeOut: 3000,
          progressBar: true,
          progressAnimation: 'decreasing',
          closeButton: true,
          positionClass: 'toast-top-right'
        });
      }
    });
  }

  showPassword(ele: HTMLInputElement): void {
    ele.type = ele.type === "password" ? "text" : "password";
  }
}