import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/auth/services/auth.service';



@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  msgError: string = "";
  loading: boolean = false
  loginSubscribe: Subscription = new Subscription()
  private readonly authService = inject(AuthService)
  private readonly router = inject(Router)
  private readonly formBuilder = inject(FormBuilder)


  ngOnInit(): void {
    this.loginForm.valueChanges.subscribe(() => {
      this.msgError = "";
    });

  }
loginForm: FormGroup =this.formBuilder.nonNullable.group({
  login:["" , [Validators.required, Validators.minLength(3)]],
  password:["" , [Validators.required, Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)] ]
})

  showPassword(ele:HTMLInputElement):void{
  if(ele.type === "password"){
    ele.type = "text"
  }
  else{
    ele.type = "password"
  }
}

  submitForm(): void {
    this.msgError = "";
    if (this.loginForm.valid) {
      this.loading = true;
      this.loginSubscribe.unsubscribe()
      this.loginSubscribe = this.authService.signIn(this.loginForm.value).subscribe({
        next: (res) => {
          console.log(res);
          this.loading = false;
          localStorage.setItem("socailToken", res.data.token);
          localStorage.setItem("userData", JSON.stringify(res.data.user))
          this.router.navigate(['/feed'])
        },

        error: (err: HttpErrorResponse) => {
          this.msgError = err.error.message;
          this.loading = false;
        }

      });

    }
    else {
      this.loginForm.markAllAsTouched();
    }
  }

}

