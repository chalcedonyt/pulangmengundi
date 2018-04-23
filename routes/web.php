<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
Route::get('500', function () {
    return view('errors.500');
});
Route::group([
    'prefix' => LaravelLocalization::setLocale(),
    'middleware' => [
        'localeSessionRedirect',
        'localizationRedirect',
        'localeViewPath'
    ]
], function() {
    Route::get('login', function(Request $request) {
        return view('login');
    })->name('login');
    Route::get('google/login', 'Auth\LoginController@redirectToProvider');
    Route::get('google/callback', 'Auth\LoginController@handleProviderCallback');

    Route::get('facebook/login', 'Auth\LoginController@redirectToFbProvider');
    Route::get('facebook/callback', 'Auth\LoginController@handleFbProviderCallback');

    Route::get('/logout', function() {
       \Auth::logout();
       return redirect('/');
    });

    Route::middleware('accept-terms')->group(function (){
        Route::get('/', function() {
            return view('carpool');
        });
    });
    Route::get('/u/{jwt}', function($jwt) {
        $payload = \Firebase\JWT\JWT::decode($jwt, env('APP_KEY'), array('HS256'));
        $user = \App\Models\User::find($payload->sub);
        if (!$user) {
            return response('Unauthorized', 403);
        }
        \Auth::login($user, $remember = true);
        return view('carpool');
    });

    Route::middleware(['auth', 'accept-terms'])->group(function() {
        Route::get('/need', function() {
            $prev = str_replace(url('/'), '', url()->previous());
            if (\Auth::user()->need && strpos($prev, 'my-need') === false ) {
                return redirect('/my-need');
            }
            return view('carpool');
        });
        Route::get('/offer', function() {
            if (\Auth::user()->offers->count()) {
                return redirect('my-offers');
            }
            return view('carpool');
        });
        Route::get('/my-offers', function() {
            if (!\Auth::user()->offers->count()) {
                return redirect('offer');
            }
            return view('carpool');
        });
        Route::get('/my-need', function() {
            if (!\Auth::user()->need) {
                return redirect('need');
            }
            return view('carpool');
        });
    });

});
Route::get('/email-preview/user/{id}', function ($id) {
    $user = \App\Models\User::find($id);
    $last_sent_at = \Carbon\Carbon::parse(\App\Models\EmailsSent::find(2)->sent_at);
    $last_sent_at = null;
    list($email, $output) = (new \App\Gateways\MatchGateway)->getEmailForUser($user, $last_sent_at, $sponsors = true);
    return $email;
});

Route::prefix('api')->group(function() {
    Route::get('/states', ['uses' => 'Api\\LocationController@states']);
    Route::get('/locations', ['uses' => 'Api\\LocationController@locations']);
    Route::get('/offers', ['uses' => 'Api\\CarpoolController@offers']);
    Route::get('/needs', ['uses' => 'Api\\CarpoolController@needs']);
});

Route::middleware('auth')->prefix('api')->group(function() {
    Route::get('/u/{jwt}', ['uses' => 'Api\\UserController@showByToken']);
    Route::post('/offer/{offer}/success', ['uses' => 'Api\\CarpoolController@success']);
    Route::post('/offer/{offer}/unhide', ['uses' => 'Api\\CarpoolController@unhide']);
    Route::post('/offer/{offer}/cancel', ['uses' => 'Api\\CarpoolController@cancel']);
    Route::post('/offer', ['uses' => 'Api\\CarpoolController@offer']);

    Route::post('/need', ['uses' => 'Api\\CarpoolController@need']);
    Route::put('/need/{need}', ['uses' => 'Api\\CarpoolController@updateNeed']);
    Route::post('/need/{need}/success', ['uses' => 'Api\\CarpoolController@needSuccess']);
    Route::post('/need/{need}/cancel', ['uses' => 'Api\\CarpoolController@needCancel']);

    Route::get('/my-offers', ['uses' => 'Api\\CarpoolController@myOffers']);
    Route::get('/my-need', ['uses' => 'Api\\CarpoolController@myNeed']);
    Route::get('/matches', ['uses' => 'Api\\CarpoolController@matches']);
    Route::get('/match-my-offers', ['uses' => 'Api\\CarpoolController@matchMyOffers']);

    Route::get('/user/{uuid}', ['uses' => 'Api\\UserController@show']);
    Route::post('/user/survey-status', ['uses' => 'Api\\UserController@updateSurveyStatus']);
});