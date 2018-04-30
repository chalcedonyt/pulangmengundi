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
            //only show survey if has listing older than this amt of days
            $threshold_days = 2;
            $threshold_datetime = new \DateTime(date('Y-m-d', strtotime("-".$threshold_days." days")));
            if ($user && $user->survey_status == 0) {
                // $gw = new \App\Gateways\MatchGateway;
                // if ($gw->userHasMatchedNeed($user, $max_time = $threshold_datetime)) {
                //     $survey_status = [
                //         'showRiderSurvey' => true
                //     ];
                // } else if ($gw->userHasMatchedOffer($user, $max_time = $threshold_datetime)) {
                //     $survey_status = [
                //         'showDriverSurvey' => true
                //     ];
                // }
            }
            $view->with('user_status', [
                'hasDriverListing' => $has_offers,
                'hasRiderListing' => $has_need,
            ]);
            $view->with('survey_status', $survey_status);
            if ($user)
                $view->with('user', $user->toArray());
            else {
                $view->with('user', null);
            }
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
