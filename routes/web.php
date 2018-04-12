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
   return redirect('/');
});

Route::get('/', function() {
    $user = \Auth::user() ? \Auth::user()->toArray() : null;
    return view('carpool')->with(['user' => $user]);
});
Route::prefix('api')->group(function() {
    Route::get('/states', ['uses' => 'Api\\LocationController@states']);
    Route::get('/locations', ['uses' => 'Api\\LocationController@locations']);
    Route::get('/offers', ['uses' => 'Api\\CarpoolController@offers']);
    Route::get('/needs', ['uses' => 'Api\\CarpoolController@needs']);
});

Route::middleware('auth')->group(function() {
    Route::get('need', function() {
        $user = \Auth::user()->toArray();
        return view('carpool')->with(['user' => $user]);
    });
    Route::get('offer', function() {
        if (\Auth::user()->offers->count()) {
            return redirect('my-offers');
        }
        $user = \Auth::user()->toArray();
        return view('carpool')->with(['user' => $user]);
    });
    Route::get('my-offers', function() {
        if (!\Auth::user()->offers->count()) {
            return redirect('offer');
        }
        $user = \Auth::user()->toArray();
        return view('carpool')->with(['user' => $user]);
    });
    Route::get('my-need', function() {
        if (!\Auth::user()->need) {
            return redirect('carpool/need');
        }
        $user = \Auth::user()->toArray();
        return view('carpool')->with(['user' => $user]);
    });

});
Route::middleware('auth')->prefix('api')->group(function() {

    Route::post('/offer/{offer}/hide', ['uses' => 'Api\\CarpoolController@hide']);
    Route::post('/offer/{offer}/unhide', ['uses' => 'Api\\CarpoolController@unhide']);
    Route::post('/offer/{offer}/cancel', ['uses' => 'Api\\CarpoolContropller@cancel']);
    Route::post('/offer', ['uses' => 'Api\\CarpoolController@offer']);

    Route::post('/need', ['uses' => 'Api\\CarpoolController@need']);
    Route::put('/need/{need}', ['uses' => 'Api\\CarpoolController@updateNeed']);

    Route::get('/my-offers', ['uses' => 'Api\\CarpoolController@myOffers']);
    Route::get('/my-need', ['uses' => 'Api\\CarpoolController@myNeed']);
    Route::get('/matches', ['uses' => 'Api\\CarpoolController@matches']);

    Route::get('/user/{uuid}', ['uses' => 'Api\\UserController@show']);
});