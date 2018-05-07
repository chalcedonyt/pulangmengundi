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
        if (\Auth::user()->requests->count() > 150) {
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

    public function showByToken(Request $request, string $jwt) {
        $payload = \Firebase\JWT\JWT::decode($jwt, env('APP_KEY'), array('HS256'));
        $subject = \App\Models\User::where('uuid', '=', $payload->uuid)->first();
        if (!$subject) {
            return response('Not found', 404);
        }
        $data = fractal()->item($subject, new \App\Transformers\UserTransformer)->toArray();
        return response()->json($data);
    }

    public function updateSurveyStatus(Request $request) {
        $user = \Auth::user();
        $user->survey_status = $request->input('status');
        $user->save();
        return response()->json([
            'success' => 1
        ]);
    }

    public function updateEmail(Request $request) {
        $user = \Auth::user();
        $user->email = $request->input('email');
        $user->save();
        return response()->json([
            'success' => 1
        ]);
    }
}
