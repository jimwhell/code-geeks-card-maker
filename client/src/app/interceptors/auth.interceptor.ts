import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  //retrieve access token from local storage
  const accessToken = localStorage.getItem('access_token');
  console.log('Interceptor running: ', accessToken);

  //set the access token in the request headers
  if (accessToken) {
    const newReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return next(newReq);
  }

  return next(req);
};
