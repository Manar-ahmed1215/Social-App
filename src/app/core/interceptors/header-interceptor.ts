import { HttpInterceptorFn } from '@angular/common/http';

export const headerInterceptor: HttpInterceptorFn = (req, next) => {

 if(localStorage.getItem('socailToken')){
   req = req.clone({
     setHeaders:{
      'AUTHORIZATION' : `Bearer ${localStorage.getItem('socailToken')}`
    }
  })
 }
  // const v =req.clone({
  //   setHeader:{
  //     'AUTHORIZATION' : `Bearer ${localStorage.getItem('socailToken')}`
  //   }
  // })

  return next(req);
};
