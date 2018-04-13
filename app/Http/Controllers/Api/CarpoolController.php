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
        $cp = CarpoolOffer::firstOrCreate([
           'information' => $request->input('information'),
           'gender_preference' => $request->input('preferredGender'),
           'location_id_from' => $request->input('fromLocationId'),
           'location_id_to' => $request->input('toLocationId'),
           'leave_at' => \Carbon\Carbon::parse($request->input('datetime'))->addHours(8),
           'user_id' => \Auth::user()->getKey()
        ]);
        $user = \Auth::user();
        $user->allow_email = (int)$request->input('allowEmail');
        $user->allow_fb = (int)$request->input('allowFb');
        $user->save();

        $data = fractal()->item($cp, new \App\Transformers\CarpoolOfferTransformer)->toArray();
        return response()->json($data);
    }

    public function need(Request $request)
    {
        $cp = CarpoolNeed::firstOrCreate([
           'information' => $request->input('information'),
           'gender' => $request->input('gender'),
           'location_id_from' => $request->input('fromLocationId'),
           'location_id_poll' => $request->input('pollLocationId'),
           'user_id' => \Auth::user()->getKey()
        ]);
        $user = \Auth::user();
        $user->allow_email = (int)$request->input('allowEmail');
        $user->allow_fb = (int)$request->input('allowFb');
        $user->save();

        return response()->json($cp->toArray());
    }

    public function matches(Request $request)
    {
        $user = \Auth::user();
        if (!$user->need) {
            return response('You have no requests', 404);
        }

        $need = $user->need;
        $gender = $need->gender;
        $matches_from = CarpoolOffer::with('user', 'fromLocation.locationState', 'toLocation.locationState')
        ->where('location_id_from', '=', $need->fromLocation->getKey())
        ->where('location_id_to', '=', $need->pollLocation->getKey())
        ->where('hidden', '=', 0)
        ->where(function ($q) use ($gender) {
            $q->whereNull('gender_preference')
            ->orWhere('gender_preference', '=', $gender);
        })
        ->get();

        $matches_to = CarpoolOffer::with('user', 'fromLocation.locationState', 'toLocation.locationState')
        ->where('location_id_to', '=', $need->fromLocation->getKey())
        ->where('location_id_from', '=', $need->pollLocation->getKey())
        ->where('hidden', '=', 0)
        ->where(function ($q) use ($gender) {
            $q->whereNull('gender_preference')
            ->orWhere('gender_preference', '=', $gender);
        })
        ->get();

        $partial_matches_from = CarpoolOffer::with('user', 'fromLocation.locationState', 'toLocation.locationState')
        ->fromStateIs($need->fromLocation->state)
        ->toStateIs($need->pollLocation->state)
        ->where(function ($q) use ($gender) {
            $q->whereNull('gender_preference')
            ->orWhere('gender_preference', '=', $gender);
        })
        ->where('hidden', '=', 0)
        ->get();

        $partial_matches_to = CarpoolOffer::with('user', 'fromLocation.locationState', 'toLocation.locationState')
        ->toStateIs($need->fromLocation->state)
        ->fromStateIs($need->pollLocation->state)
        ->where(function ($q) use ($gender) {
            $q->whereNull('gender_preference')
            ->orWhere('gender_preference', '=', $gender);
        })
        ->where('hidden', '=', 0)
        ->get();

        $matches = $matches_from->concat($matches_to)->concat($partial_matches_from)->concat($partial_matches_to);
        $data = fractal()->collection($matches, new \App\Transformers\CarpoolOfferTransformer, 'offers')->toArray();
        return response()->json($data);
    }

    public function myOffers(Request $request)
    {
        $offers = CarpoolOffer::with('user', 'fromLocation.locationState', 'toLocation.locationState')
        ->where('user_id', '=', \Auth::user()->getKey())
        ->get();

        $data = fractal()->collection($offers, new \App\Transformers\CarpoolOfferTransformer, 'offers')->toArray();
        return response()->json($data);
    }

    public function myNeed(Request $request)
    {
        $need = CarpoolNeed::with('user', 'fromLocation.locationState', 'pollLocation.locationState')
        ->where('user_id', '=', \Auth::user()->getKey())
        ->first();

        $data = fractal()->item($need, new \App\Transformers\CarpoolNeedTransformer)->toArray();
        return response()->json($data);
    }

    public function updateNeed(Request $request, \App\Models\CarpoolNeed $need)
    {
        if ($need->user_id !== \Auth::user()->getKey()) {
            return response("You can't do this", 403);
        }
        $need->information = $request->input('information');
        $need->gender = $request->input('gender');
        $need->location_id_from = $request->input('fromLocationId');
        $need->location_id_poll = $request->input('pollLocationId');
        $need->save();

        $user = \Auth::user();
        $user->allow_email = (int)$request->input('allowEmail');
        $user->allow_fb = (int)$request->input('allowFb');
        $user->save();

        $data = fractal()->item($need, new \App\Transformers\CarpoolNeedTransformer)->toArray();
        return response()->json($data);
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

    public function cancel(Request $request, \App\Models\CarpoolOffer $offer)
    {
        if (\Auth::user()->getKey() !== $offer->user_id)
            return response("You can't do this", 403);

        $offer->delete();
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


    public function offers(Request $request) {
        $query = CarpoolOffer::with('user', 'fromLocation.locationState', 'toLocation.locationState');
        if (!empty($request->input('state_from')) || !empty($request->input('state_to'))) {
            $state_from = $request->input('state_from');
            $state_to = $request->input('state_to');
            if ($state_to && $state_from) {
                $query->toStateIs($state_to)->fromStateIs($state_from);
            } else {
                $state = $state_from ?: $state_to;
                $query->where(function ($q) use ($state) {
                    $q->where(function ($q) use ($state) {
                        $q->toStateIs($state);
                    })->orWhere(function ($q) use ($state) {
                        $q->fromStateIs($state);
                    });
                });
            }
        }

        $total = $query->count();
        $offers = $query->orderBy('created_at', 'desc')
        ->where('hidden', '=', 0)
        ->limit(20)
        ->get();


        $data = fractal()->collection($offers, new \App\Transformers\CarpoolOfferTransformer, 'offers')->toArray();
        $data['meta'] = [
            'count' => $total
        ];
        return response()->json($data);
    }

    public function needs(Request $request) {
        $query = CarpoolNeed::with('user', 'fromLocation.locationState', 'pollLocation.locationState');
        if (!empty($request->input('state_from')) || !empty($request->input('state_to'))) {
            $state_from = $request->input('state_from');
            $state_to = $request->input('state_to');
            if ($state_from && $state_to) {
                $query->where(function ($q) use ($state_from, $state_to) {
                    $q->where(function ($q) use ($state_from, $state_to) {
                        $q->pollStateIs($state_to)->fromStateIs($state_from);
                    })->orWhere(function ($q) use ($state_from, $state_to) {
                        $q->pollStateIs($state_from)->fromStateIs($state_to);
                    });
                });
            } else {
                $state = $state_from ?: $state_to;
                $query->where(function ($q) use ($state) {
                    $q->where(function ($q) use ($state) {
                        $q->pollStateIs($state);
                    })->orWhere(function ($q) use ($state) {
                        $q->fromStateIs($state);
                    });
                });
            }
        }

        $total = $query->count();
        $needs = $query
        // ->where('hidden', '=', 0)
        ->orderBy('created_at', 'desc')
        ->limit(20)
        ->get();


        $data = fractal()->collection($needs, new \App\Transformers\CarpoolNeedTransformer, 'needs')->toArray();
        $data['meta'] = [
            'count' => $total
        ];
        return response()->json($data);
    }
}
