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
        return Socialite::driver('google')->redirect();
    }
    public function redirectToFbProvider()
    {
        return Socialite::driver('facebook')->redirect();
    }

    /**
     * Obtain the user information from GitHub.
     *
     * @return \Illuminate\Http\Response
     */
    public function handleProviderCallback(Request $request)
    {
        $google_user = Socialite::driver('google')->user();
        $user = User::firstOrNew(['google_id' => $google_user->getId()]);
        if ($user) {
            $user->google_id = $google_user->getId();
            $user->name = $google_user->getName();
            $user->social_token_added_at = Carbon::now();
            $user->social_token_expires_at = Carbon::now()->addSeconds($google_user->expiresIn-1);
            $user->social_token = $google_user->token;
            $user->avatar_url = $google_user->avatar;

            if (!$user->exists())
                $user->password = '';
            $user->save();
            //assign a cookie that is less than the google expiry for now
            \Auth::login($user, $remember = true);

            $redirect = '/carpool';

            if ($request->session()->has('redirect')) {
                $redirect = $request->session()->get('redirect');
            }
            $request->session()->forget('redirect');
            return redirect($redirect);
        }
    }
}
