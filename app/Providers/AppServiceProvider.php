<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Carbon\Carbon;

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
            $user = \Auth::user() ?: null;
            $has_need = $user && $user->need;
            $has_offers = $user && $user->offers->count();

            $survey_status = [];
            if ($user && Carbon::now()->diffInDays($user->created_at) > 4 && $user->survey_status == 0) {
                $gw = new \App\Gateways\MatchGateway;
                if ($gw->userHasMatchedNeed($user)) {
                    $survey_status = [
                        'showRiderSurvey' => true
                    ];
                } else if ($gw->userHasMatchedOffer($user)) {
                    $survey_status = [
                        'showDriverSurvey' => true
                    ];
                }
            }
            $view->with('user_status', [
                'hasDriverListing' => $has_offers,
                'hasRiderListing' => $has_need,
            ]);
            $view->with('survey_status', $survey_status);
            $view->with('user', $user->toArray());
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
