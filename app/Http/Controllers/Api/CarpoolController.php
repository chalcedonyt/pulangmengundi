<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use App\Models\CarpoolOffer;
use App\Models\CarpoolNeed;
use App\Models\Location;

class CarpoolController extends Controller
{
    public function offer (Request $request)
    {
        $cp = CarpoolOffer::create([
           'information' => $request->input('information'),
           'gender_preference' => $request->input('preferredGender'),
           'location_id_from' => $request->input('fromLocationId'),
           'location_id_to' => $request->input('toLocationId'),
           'carpool_qty' => $request->input('carpoolQty'),
           'leave_at' => \Carbon\Carbon::parse($request->input('datetime')),
           'user_id' => \Auth::user()->getKey()
        ]);

        return response()->json($cp->toArray());
    }

    public function match (Request $request)
    {
        $location_start = Location::find($request->input('startLocationId'));
        $location_end = Location::find($request->input('endLocationId'));
        $gender = $request->input('gender');

        $matches = CarpoolOffer::with('user')
        ->where('location_id_from', '=', $location_start->getKey())
        ->where('location_id_to', '=', $location_end->getKey())
        ->where(function ($q) use ($gender) {
            $q->whereNull('gender_preference')
            ->orWhere('gender_preference', '=', $gender);
        })
        ->get();

        $partial_matches = CarpoolOffer::with('user', 'locationFrom.locationState', 'locationTo.locationState')
        ->fromStateIs($location_start->state)
        ->toStateIs($location_end->state)
        ->where(function ($q) use ($gender) {
            $q->whereNull('gender_preference')
            ->orWhere('gender_preference', '=', $gender);
        })
        ->get();
        return response()->json([
            'matches' => $matches->toArray(),
            'partial_matches' => $partial_matches->toArray()
        ]);
    }

    public function myOffers (Request $request)
    {
        $offers = CarpoolOffer::with('user', 'locationFrom.locationState', 'locationTo.locationState')
        ->where('user_id', '=', \Auth::user()->getKey())
        ->get();

        return response()->json([
            'offers' => $offers->toArray()
        ]);
    }
}
