<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Carbon\Carbon;
use Socialite;
use App\Models\User;

class LoginController extends Controller
{
    /**
     * Redirect the user to the GitHub authentication page.
     *
     * @return \Illuminate\Http\Response
     */
    public function redirectToProvider()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }
    public function redirectToFbProvider()
    {
        return Socialite::driver('facebook')->stateless()->redirect();
    }

    /**
     * Obtain the user information from GitHub.
     *
     * @return \Illuminate\Http\Response
     */
    public function handleProviderCallback(Request $request)
    {
        $google_user = Socialite::driver('google')->stateless()->user();
        $user = User::firstOrNew(['email' => $google_user->getEmail()]);
        $user->google_id = $google_user->getId();
        $user->email = $google_user->getEmail();
        $user->name = $google_user->getName();
        $user->social_token_added_at = Carbon::now();
        $user->social_token_expires_at = Carbon::now()->addSeconds($google_user->expiresIn-1);
        $user->social_token = '';
        $user->avatar_url = $google_user->avatar;

        if (!$user->exists()) {
            $user->password = '';
        }
        if (empty($user->uuid))
            $user->uuid = str_random(40);
        $user->save();
        //assign a cookie that is less than the google expiry for now
        \Auth::login($user, $remember = true);

        $redirect = '/';

        if ($request->session()->has('redirect')) {
            $redirect = $request->session()->get('redirect');
        }
        $request->session()->forget('redirect');
        return redirect($redirect);
    }

    public function handleFbProviderCallback(Request $request)
    {
        $facebook_user = Socialite::driver('facebook')->stateless()->user();
        $user = User::firstOrNew(['email' => $facebook_user->getEmail()]);
        $user->fb_id = $facebook_user->getId();
        $user->name = $facebook_user->getName();
        $user->email = $facebook_user->getEmail();
        $user->social_token_added_at = Carbon::now();
        $user->social_token_expires_at = Carbon::now()->addSeconds($facebook_user->expiresIn-1);
        $user->social_token = '';
        $user->avatar_url = $facebook_user->avatar;

        if (!$user->exists()) {
            $user->password = '';
        }
        if (empty($user->uuid))
            $user->uuid = str_random(40);
        $user->save();
        //assign a cookie that is less than the google expiry for now
        \Auth::login($user, $remember = true);

        $redirect = '/';

        if ($request->session()->has('redirect')) {
            $redirect = $request->session()->get('redirect');
        }
        $request->session()->forget('redirect');
        return redirect($redirect);
    }
}
