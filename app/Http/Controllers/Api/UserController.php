<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class UserController extends Controller
{
    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($uuid)
    {
        if (\Auth::user()->requests->count() > 30) {
            return response('You have requested too many contacts', 403);
        }
        $user = \App\Models\User::where('uuid', '=', $uuid)->first();
        if (!$user) {
            return response('Not found', 404);
        }
        \App\Models\InfoRequest::create([
            'user_id' => \Auth::user()->getKey(),
            'requested_user_id' => $user->getKey()
        ]);

        $social_urls = [
            'facebook' => 'https://facebook.com/'.$user->fb_id,
            'email' => $user->email,
        ];

        return response()->json($social_urls);
    }

}
