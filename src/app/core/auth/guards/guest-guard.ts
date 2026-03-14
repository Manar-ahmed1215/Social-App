import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const guestGuard: CanActivateFn = (route, state) => {
  const router= inject(Router)
  if(localStorage.getItem("socailToken")){
    return router.parseUrl("/feed")
  }
  else{
    // router.navigate(["/login"])
    // return false
    return true
  }
};
