import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs';

export const loadingScreenInterceptor: HttpInterceptorFn = (req, next) => {

   const ngxSpinnerService = inject(NgxSpinnerService);

  return next(req).pipe(finalize(() => {

  }));
};
