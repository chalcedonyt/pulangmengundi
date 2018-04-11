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
Route::get('login', 'Auth\LoginController@redirectToProvider')->name('login');
Route::get('google/callback', 'Auth\LoginController@handleProviderCallback');

Route::get('carpool', function() {
    return view('carpool');
});
Route::middleware('auth')->group(function() {
    Route::get('carpool/need', function() {
        return view('carpool');
    });
    Route::get('carpool/offer', function() {
       return view('carpool');
    });
    Route::get('carpool/my-offers', function() {
       return view('carpool');
    });
    Route::get('carpool/my-need', function() {
       return view('carpool');
    });
});
Route::middleware('auth')->prefix('api')->group(function() {
    Route::get('/states', ['uses' => 'Api\\LocationController@states']);
    Route::get('/locations', ['uses' => 'Api\\LocationController@locations']);

    Route::post('/carpool/offer/{offer}/hide', ['uses' => 'Api\\CarpoolController@hide']);
    Route::post('/carpool/offer/{offer}/unhide', ['uses' => 'Api\\CarpoolController@unhide']);
    Route::post('/carpool/offer', ['uses' => 'Api\\CarpoolController@offer']);
    Route::post('/carpool/need', ['uses' => 'Api\\CarpoolController@need']);

    Route::get('/carpool/my-offers', ['uses' => 'Api\\CarpoolController@myOffers']);
    Route::get('/carpool/matches', ['uses' => 'Api\\CarpoolController@matches']);
});