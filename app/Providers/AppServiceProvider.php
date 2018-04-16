<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        if($this->app->environment() === 'production'){
            $this->app['request']->server->set('HTTPS', true);
            \URL::forceScheme('https');
        }
        \View::composer('*', function($view) {
            $user = \Auth::user() ? \Auth::user()->toArray() : null;
            $has_need = \Auth::user() && \Auth::user()->need;
            $has_offers = \Auth::user() && \Auth::user()->offers->count();
            $view->with('user_status', [
                'hasDriverListing' => $has_offers,
                'hasRiderListing' => $has_need,
            ]);
            $view->with('user', $user);
            $view->with('locale', \LaravelLocalization::getCurrentLocale());
        });
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {

    }
}
