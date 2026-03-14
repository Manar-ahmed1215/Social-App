import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs';

export const loadingScreenInterceptor: HttpInterceptorFn = (req, next) => {

   const ngxSpinnerService = inject(NgxSpinnerService);
  // const urlsToShowSpinner = [
  //   '/comments',
  //   '/likes'
  // ];

  // const showSpinner = urlsToShowSpinner.some(url => req.url.includes(url));

  // if (showSpinner) {
  //   ngxSpinnerService.show();
  // }

  return next(req).pipe(finalize(() => {
    // if (showSpinner) {
    //   ngxSpinnerService.hide();
    // }
  }));
};
