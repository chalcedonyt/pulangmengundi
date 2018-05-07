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
           'offer_order' => $request->input('offerOrder'),
           'user_id' => \Auth::user()->getKey()
        ]);
        $user = \Auth::user();
        $user->contact_number = (string)$request->input('contactNumber');
        $user->allow_email = (int)$request->input('allowEmail');
        $user->allow_fb = (int)$request->input('allowFb');
        $user->accepted_contact_terms = 1;
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
        $parli_seat_ids = [
            $cp->fromLocation->parli_seat_id,
            $cp->pollLocation->parli_seat_id
        ];
        if (!empty($parli_seat_ids) && !in_array('', $parli_seat_ids)) {
            $cp->parli_seat_id_string = implode('%', $parli_seat_ids);
            $cp->save();
        }
        $user = \Auth::user();
        $user->contact_number = (string)$request->input('contactNumber');
        $user->allow_email = (int)$request->input('allowEmail');
        $user->allow_fb = (int)$request->input('allowFb');
        $user->accepted_contact_terms = 1;
        $user->save();

        return response()->json($cp->toArray());
    }

    public function matchMyOffers(Request $request)
    {
        $user = \Auth::user();
        if (!$user->offers->count()) {
            return response('You have no offers', 404);
        }
        $matches = collect([]);
        $matcher = new \App\Gateways\MatchGateway();
        foreach ($user->offers as $offer) {
            if ($offer->offer_order != 1)
                continue;
            $offer_matches = $matcher->matchOffer($offer);
            if ($offer_matches->count()) {
                $matches = $matches->concat($offer_matches);
            }
        }
        $matches = $matches->unique(function ($offer) {
           return $offer->id;
        });
        $data = fractal()->collection($matches, new \App\Transformers\CarpoolNeedTransformer, 'needs')->toArray();
        return response()->json($data);
    }
    /**
     * Match needs
     *
     * @param Request $request
     * @return void
     */
    public function matches(Request $request)
    {
        $user = \Auth::user();
        if (!$user->need) {
            return response('You have no requests', 404);
        }

        $need = $user->need;

        $matcher = new \App\Gateways\MatchGateway();
        $offers = $matcher->matchNeed($need);
        $offers = $offers->unique(function ($offer) {
           return $offer->id;
        });
        $data = fractal()->collection($offers, new \App\Transformers\CarpoolOfferTransformer, 'offers')->toArray();
        return response()->json($data);
    }

    public function myOffers(Request $request)
    {
        $offer = CarpoolOffer::with('user', 'fromLocation.locationState', 'toLocation.locationState')
        ->where('user_id', '=', \Auth::user()->getKey())
        ->where('offer_order', '=', 1)
        ->first();

        $corresponding_offer = CarpoolOffer::where('user_id', '=', \Auth::user()->getKey())
        ->where('offer_order', '=', 2)
        ->first();
        if ($offer->correspondingOffer)
            $offer->correspondingOffer = $corresponding_offer;

        $data = fractal()->item($offer, new \App\Transformers\CarpoolOfferTransformer)->toArray();
        return response()->json($data);
    }

    public function myNeed(Request $request)
    {
        $need = CarpoolNeed::with('user', 'fromLocation.locationState', 'pollLocation.locationState')
        ->where('user_id', '=', \Auth::user()->getKey())
        ->first();

        if (!$need) {
            return response('Not found', 404);
        }

        $data = fractal()->item($need, new \App\Transformers\CarpoolNeedTransformer)->toArray();
        $data['user']['contact_number'] = \Auth::user()->contact_number;
        $data['user']['allow_email'] = \Auth::user()->allow_email;
        $data['user']['allow_fb'] = \Auth::user()->allow_fb;
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
        $need->parli_seat_id_string = ''; //reset first
        $need->save();

        $parli_seat_ids = [
            $need->fromLocation->parli_seat_id,
            $need->pollLocation->parli_seat_id
        ];
        if (!empty($parli_seat_ids) && !in_array('', $parli_seat_ids)) {
            $need->parli_seat_id_string = implode('%', $parli_seat_ids);
            $need->save();
        }

        $user = \Auth::user();
        $user->allow_email = (int)$request->input('allowEmail');
        $user->allow_fb = (int)$request->input('allowFb');
        $user->contact_number = (string)$request->input('contactNumber');
        $user->save();

        $data = fractal()->item($need, new \App\Transformers\CarpoolNeedTransformer)->toArray();
        return response()->json($data);
    }

    public function success(Request $request, \App\Models\CarpoolOffer $offer)
    {
        if (\Auth::user()->getKey() !== $offer->user_id)
            return response("You can't do this", 403);

        \Auth::user()->offers->each(function ($offer) {
            $offer->hidden = 1;
            $offer->fulfilled = 1;
            $offer->save();
        });
        return response()->json([
            'success' => 1
        ]);
    }

    public function cancel(Request $request, \App\Models\CarpoolOffer $offer)
    {
        if (\Auth::user()->getKey() !== $offer->user_id)
            return response("You can't do this", 403);

        //delete any outstanding offers
        \Auth::user()->offers->each(function ($offer) {
            $offer->delete();
        });
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
        $limit = 15;
        $offset = $request->input('offset', 0);
        $query = CarpoolOffer::with('user', 'fromLocation.locationState', 'toLocation.locationState')
        ->where('offer_order', '=', 1);
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
        ->offset($offset)
        ->limit($limit)
        ->get()->map(function ($offer) {
            //when the user is travelling back
           $corresponding_offer = CarpoolOffer::where('user_id', '=', $offer->user_id)
           ->where('offer_order', '=', 2)
           ->first();
           $offer->correspondingOffer = $corresponding_offer;
           return $offer;
        });


        $data = fractal()->includeCorrespondingOffer()
        ->collection($offers, new \App\Transformers\CarpoolOfferTransformer, 'offers')->toArray();
        $data['meta'] = [
            'count' => $total
        ];
        return response()->json($data);
    }

    public function needs(Request $request) {
        $limit = 15;
        $offset = $request->input('offset', 0);
        $query = CarpoolNeed::with('user', 'fromLocation.locationState', 'pollLocation.locationState');
        if (!empty($request->input('state_from')) || !empty($request->input('state_to'))) {
            $state_from = $request->input('state_from');
            $state_to = $request->input('state_to');
            if ($state_from && $state_to) {
                $query->where(function ($q) use ($state_from, $state_to) {
                    $q->where(function ($q) use ($state_from, $state_to) {
                        $q->fromStateIs($state_from)->pollStateIs($state_to);
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
        ->where('fulfilled', '=', 0)
        ->orderBy('created_at', 'desc')
        ->limit($limit)
        ->offset($offset)
        ->get();


        $data = fractal()->collection($needs, new \App\Transformers\CarpoolNeedTransformer, 'needs')->toArray();
        $data['meta'] = [
            'count' => $total,
            'sponsor_matches' => []
        ];
        if ($request->input('state_from') && $request->input('state_to')) {
            $sponsor_matches = \App\Models\LocationSponsor::statesMatching($request->input('state_from'), $request->input('state_to'))->get();
            if ($sponsor_matches->count()) {
                $data['meta']['sponsor_matches'] = $sponsor_matches->toArray();
            }
        }
        $data['meta']['connections_count'] = \App\Models\InfoRequest::count()*2;
        return response()->json($data);
    }

    public function needSuccess(Request $request, \App\Models\CarpoolNeed $need)
    {
        if (\Auth::user()->getKey() !== $need->user_id)
            return response("You can't do this", 403);

        $need->fulfilled = 1;
        $need->save();
        return response()->json([
            'success' => 1
        ]);
    }

    public function needCancel(Request $request, \App\Models\CarpoolNeed $need)
    {
        if (\Auth::user()->getKey() !== $need->user_id)
            return response("You can't do this", 403);

        $need->delete();
        return response()->json([
            'success' => 1
        ]);
    }
}
