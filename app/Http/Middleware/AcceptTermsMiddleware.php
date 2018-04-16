<?php

namespace App\Http\Middleware;

use Closure;

class AcceptTermsMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if (\Auth::user() && !\Auth::user()->accepted && \Route::currentRouteName() != 'login') {
            return redirect('/login');
        } else {
            // dd(\Route::currentRouteName());
        }
        return $next($request);
    }
}
