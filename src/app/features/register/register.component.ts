import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule ],
  templateUrl: './register.component.html',
  // styleUrl: './register.component.css',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit{
   msgError:string="";
  loading:boolean=false
  registerSubscribe:Subscription = new Subscription()
  private readonly authService = inject(AuthService)
  private readonly router = inject(Router)

  ngOnInit(): void {
  this.registerForm.valueChanges.subscribe(() => {
    this.msgError = "";
  });

}

registerForm: FormGroup =new FormGroup({
  name: new FormControl("", [Validators.required , Validators.minLength(3)]),
  username : new FormControl(""),
  email : new FormControl("" , [Validators.required , Validators.email]),
  dateOfBirth:new FormControl("", Validators.required),
  gender:new FormControl("" , Validators.required),
  password:new FormControl("", [Validators.required , Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)]),
  rePassword:new FormControl("", Validators.required)
  
}, {validators:this.confirmPassword} )

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
  if (this.registerForm.valid) {
    this.loading = true;
    this.registerSubscribe.unsubscribe()
  this.registerSubscribe = this.authService.signUp(this.registerForm.value).subscribe({
      next: (res) => {
        console.log(res);
        this.loading = false;
        this.router.navigate(['/login'])
      },

      error: (err: HttpErrorResponse) => {
        this.msgError = err.error.message;
        this.loading = false;
      }

    });

  } 
  else {
    this.registerForm.markAllAsTouched();
  }
}
confirmPassword(group:AbstractControl){
  const password =  group.get("password")?.value
  const rePassword =  group.get("rePassword")?.value
  if(rePassword != password && rePassword !==''){
    group.get("rePassword")?.setErrors({mismatch:true})
    return {mismatch:true}
  }
  else{
    return null
  }
}
}

