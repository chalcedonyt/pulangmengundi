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
    return view('need');
});
Route::get('need/subsidy', function() {
    return view('need');
});
Route::get('offer/carpool', function() {
   return view('offer');
});
Route::get('offer/subsidy', function() {
   return view('offer');
});