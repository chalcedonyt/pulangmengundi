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
        if ($user->getKey() != \Auth::user()->getKey()) {
            \App\Models\InfoRequest::firstOrCreate([
                'user_id' => \Auth::user()->getKey(),
                'requested_user_id' => $user->getKey()
            ]);
        }

        $social_urls = [];
        if ($user->allow_fb) {
            $social_urls['facebook'] = 'https://facebook.com/'.$user->fb_id;
        }

        if ($user->allow_email) {
            $social_urls['email'] = $user->email;
        }
        if (!empty($user->contact_number)) {
            $social_urls['contact_number'] = $user->contact_number;
        }

        return response()->json($social_urls);
    }

}
