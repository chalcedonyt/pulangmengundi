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
Route::get('login/google', 'Auth\LoginController@redirectToProvider');
Route::get('google/callback', 'Auth\LoginController@handleProviderCallback');

Route::get('need/carpool', function() {
    return view('carpool');
});
Route::get('offer/carpool', function() {
   return view('carpool');
});

Route::middleware('auth')->prefix('api')->group(function() {
    Route::get('/states', ['uses' => 'Api\\LocationController@states']);
    Route::get('/locations', ['uses' => 'Api\\LocationController@locations']);
    Route::post('/carpool/offer', ['uses' => 'Api\\CarpoolController@offer']);
    Route::post('/carpool/need', ['uses' => 'Api\\CarpoolController@need']);

    Route::get('/carpool/match', ['uses' => 'Api\\CarpoolController@match']);
});