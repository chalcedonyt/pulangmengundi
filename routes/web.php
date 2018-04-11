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

Route::get('/', function () {
    return view('home');
});
Route::get('login', function() {
    return view('login');
})->name('login');
Route::get('google/login', 'Auth\LoginController@redirectToProvider');
Route::get('google/callback', 'Auth\LoginController@handleProviderCallback');

Route::get('facebook/login', 'Auth\LoginController@redirectToFbProvider');
Route::get('facebook/callback', 'Auth\LoginController@handleFbProviderCallback');

Route::get('/logout', function() {
   \Auth::logout();
   return redirect('/carpool');
});

Route::get('carpool', function() {
    $user = \Auth::user() ? \Auth::user()->toArray() : null;
    return view('carpool')->with(['user' => $user]);
});
Route::middleware('auth')->group(function() {
    Route::get('carpool/need', function() {
        $user = \Auth::user()->toArray();
        return view('carpool')->with(['user' => $user]);
    });
    Route::get('carpool/offer', function() {
        if (\Auth::user()->offers->count()) {
            return redirect('carpool/my-offers');
        }
        $user = \Auth::user()->toArray();
        return view('carpool')->with(['user' => $user]);
    });
    Route::get('carpool/my-offers', function() {
        if (!\Auth::user()->offers->count()) {
            return redirect('carpool/offer');
        }
        $user = \Auth::user()->toArray();
        return view('carpool')->with(['user' => $user]);
    });
    Route::get('carpool/my-need', function() {
        if (!\Auth::user()->need) {
            return redirect('carpool/need');
        }
        $user = \Auth::user()->toArray();
        return view('carpool')->with(['user' => $user]);
    });
    Route::prefix('api')->group(function() {
        Route::get('/states', ['uses' => 'Api\\LocationController@states']);
        Route::get('/locations', ['uses' => 'Api\\LocationController@locations']);
        Route::get('/carpool/offers', ['uses' => 'Api\\CarpoolController@offers']);
        Route::get('/carpool/needs', ['uses' => 'Api\\CarpoolController@needs']);
    });
});
Route::middleware('auth')->prefix('api')->group(function() {

    Route::post('/carpool/offer/{offer}/hide', ['uses' => 'Api\\CarpoolController@hide']);
    Route::post('/carpool/offer/{offer}/unhide', ['uses' => 'Api\\CarpoolController@unhide']);
    Route::post('/carpool/offer/{offer}/cancel', ['uses' => 'Api\\CarpoolController@cancel']);
    Route::post('/carpool/offer', ['uses' => 'Api\\CarpoolController@offer']);

    Route::post('/carpool/need', ['uses' => 'Api\\CarpoolController@need']);
    Route::put('/carpool/need/{need}', ['uses' => 'Api\\CarpoolController@updateNeed']);

    Route::get('/carpool/my-offers', ['uses' => 'Api\\CarpoolController@myOffers']);
    Route::get('/carpool/my-need', ['uses' => 'Api\\CarpoolController@myNeed']);
    Route::get('/carpool/matches', ['uses' => 'Api\\CarpoolController@matches']);
});