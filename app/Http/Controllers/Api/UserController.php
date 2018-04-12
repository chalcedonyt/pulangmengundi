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
        $user = \App\Models\User::where('uuid', '=', $uuid)->first();
        if (!$user) {
            return response('Not found', 404);
        }

        $social_urls = [
            'facebook' => 'https://facebook.com/'.$user->fb_id
        ];

        return response()->json($social_urls);
    }

}
