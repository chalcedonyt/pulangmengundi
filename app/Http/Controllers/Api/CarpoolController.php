<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use App\Models\CarpoolOffer;
use App\Models\CarpoolNeed;
use App\Models\Location;

class CarpoolController extends Controller
{
    public function offer(Request $request)
    {
        $cp = CarpoolOffer::create([
           'information' => $request->input('information'),
           'gender_preference' => $request->input('preferredGender'),
           'location_id_from' => $request->input('fromLocationId'),
           'location_id_to' => $request->input('toLocationId'),
           'leave_at' => \Carbon\Carbon::parse($request->input('datetime')),
           'user_id' => \Auth::user()->getKey()
        ]);

        return response()->json($cp->toArray());
    }

    public function need(Request $request)
    {
        $cp = CarpoolNeed::create([
           'information' => $request->input('information'),
           'gender' => $request->input('gender'),
           'location_id_from' => $request->input('fromLocationId'),
           'location_id_poll' => $request->input('pollLocationId'),
           'user_id' => \Auth::user()->getKey()
        ]);

        return response()->json($cp->toArray());
    }

    public function matches(Request $request)
    {
        $user = \Auth::user();
        if (!$user->need) {
            return response('You have no requests', 404);
        }

        $need = $user->need;
        $gender = $request->input('gender');
        $matches_from = CarpoolOffer::with('user')
        ->where('location_id_from', '=', $need->locationFrom->getKey())
        ->where('location_id_to', '=', $need->locationPoll->getKey())
        ->where('hidden', '=', 0)
        ->where(function ($q) use ($gender) {
            $q->whereNull('gender_preference')
            ->orWhere('gender_preference', '=', $gender);
        })
        ->get();

        $matches_to = CarpoolOffer::with('user')
        ->where('location_id_to', '=', $need->locationFrom->getKey())
        ->where('location_id_from', '=', $need->locationPoll->getKey())
        ->where('hidden', '=', 0)
        ->where(function ($q) use ($gender) {
            $q->whereNull('gender_preference')
            ->orWhere('gender_preference', '=', $gender);
        })
        ->get();

        $partial_matches_from = CarpoolOffer::with('user', 'locationFrom.locationState', 'locationTo.locationState')
        ->fromStateIs($need->locationFrom->state)
        ->toStateIs($need->locationPoll->state)
        ->where(function ($q) use ($gender) {
            $q->whereNull('gender_preference')
            ->orWhere('gender_preference', '=', $gender);
        })
        ->where('hidden', '=', 0)
        ->get();

        $partial_matches_to = CarpoolOffer::with('user', 'locationFrom.locationState', 'locationTo.locationState')
        ->toStateIs($need->locationFrom->state)
        ->fromStateIs($need->locationPoll->state)
        ->where(function ($q) use ($gender) {
            $q->whereNull('gender_preference')
            ->orWhere('gender_preference', '=', $gender);
        })
        ->where('hidden', '=', 0)
        ->get();

        return response()->json([
            'offers' => $matches_from->concat($matches_to)->concat($partial_matches_from)->concat($partial_matches_to)->toArray()
        ]);
    }

    public function myOffers(Request $request)
    {
        $offers = CarpoolOffer::with('user', 'locationFrom.locationState', 'locationTo.locationState')
        ->where('user_id', '=', \Auth::user()->getKey())
        ->get();

        return response()->json([
            'offers' => $offers->toArray()
        ]);
    }

    public function hide(Request $request, \App\Models\CarpoolOffer $offer)
    {
        if (\Auth::user()->getKey() !== $offer->user_id)
            return response("You can't do this", 403);

        $offer->hidden = 1;
        $offer->save();
        return response()->json([
            'success' => 1
        ]);
    }

    public function unhide(Request $request, \App\Models\CarpoolOffer $offer)
    {
        if (\Auth::user()->getKey() != $offer->user_id)
            return response("You can't do this", 403);

        $offer->hidden = 0;
        $offer->save();
        return response()->json([
            'success' => 1
        ]);
    }
}
