<?php
namespace App\Gateways;

use App\Models\CarpoolOffer;
use App\Models\CarpoolNeed;
use App\Models\User;
use Carbon\Carbon;
use Firebase\JWT\JWT;

class MatchGateway
{
    public function getEmailForUser (\App\Models\User $user, \DateTime $last_sent_at = null, $check_sponsors = false) {
        //if user is new, don't need to check whether only to show fresh matches
        if (Carbon::parse($user->created_at)->gt($last_sent_at)) {
            $min_time = null;
        } else {
            $min_time = $last_sent_at;
        }

        $matched_offers = collect([]);
        $matched_sponsors = collect([]);
        if ($user->need && !$user->need->fulfilled) {
            $matched_offers = $this->matchNeed($user->need, $min_time, 'desc');
            //append jwt link
            $matched_offers = $matched_offers->map(function ($offer) use ($user) {
                $jwt = JWT::encode([
                    'iss' => 'email',
                    'iat' => time(),
                    'exp' => time()+(60*60*24*30),
                    'sub' => $user->getKey(),
                    'uuid' => $offer->user->uuid
                ], env('APP_KEY'));
                $offer->jwt_link = env('APP_URL')."/u/$jwt";
                return $offer;
            });
            if ($check_sponsors) {
                $sponsor_matches = \App\Models\LocationSponsor::statesMatching($user->need->fromLocation->locationState->name, $user->need->pollLocation->locationState->name)->get();
                if ($sponsor_matches->count()) {
                    $matched_sponsors = $sponsor_matches;
                }
            }
        }

        $matched_needs = collect([]);
        if ($user->offers) {
            foreach ($user->offers as $offer) {
                if ($offer->hidden || $offer->fulfilled)
                    continue;
                $needs = $this->matchOffer($offer, $min_time, 'desc');
                if ($needs->count()) {
                    $needs = $needs->map(function ($need) use ($user) {
                        $jwt = JWT::encode([
                            'iss' => 'email',
                            'iat' => time(),
                            'exp' => time()+(60*60*24*30),
                            'sub' => $user->getKey(),
                            'uuid' => $need->user->uuid
                        ], env('APP_KEY'));
                        $need->jwt_link = env('APP_URL')."/u/$jwt";
                        return $need;
                    });
                    $matched_needs = $matched_needs->concat($needs);
                }
            }
        }

        if ($matched_needs->count() || $matched_offers->count() || $matched_sponsors->count()) {
            $msg = sprintf('Found %d riders, %d drivers, %d sponsor routes for user %d %s (%s)',
                $matched_needs->count(),
                $matched_offers->count(),
                $matched_sponsors->count(),
                $user->getKey(),
                $user->name,
                $user->email
            );
            // $match_stats['msgs'][]=$msg;
            // $match_stats['users']++;
            return [
                new \App\Mail\DailyMatchEmail($user, $matched_offers, $matched_needs, $matched_sponsors),
                $msg,
                // $match_stats
            ];
        }
        return [
            null,
            null
        ];
    }
    /**
     * Matches an offer to needs
     * @param CarpoolOffer $offer
     * @param \Datetime $min_time
     * @param string $order asc or desc
     * @return Collection<CarpoolNeed>
     */
    public function matchOffer(CarpoolOffer $offer, \Datetime $min_time = null, $order = 'asc') {
        if (is_null($min_time)) {
            $min_time = '2018-01-01 00:00:00';
        }
        $query = CarpoolNeed::with('user', 'fromLocation.locationState', 'pollLocation.locationState')
        ->where('location_id_from', '=', $offer->fromLocation->getKey())
        ->where('location_id_poll', '=', $offer->toLocation->getKey())
        ->where('fulfilled', '=', '0')
        ->orderBy('updated_at', $order);
        if ($offer->gender_preference) {
            $query->where('gender', '=', $offer->gender_preference);
        }
        $matches_from = $query->where('updated_at', '>=', $min_time)
        ->get();

        //don't match reverse any more
        // $query = CarpoolNeed::with('user', 'fromLocation.locationState', 'pollLocation.locationState')
        // ->where('location_id_poll', '=', $offer->fromLocation->getKey())
        // ->where('location_id_from', '=', $offer->toLocation->getKey())
        // ->where('fulfilled', '=', '0');
        // // ->where('hidden', '=', 0)
        // if ($offer->gender_preference) {
        //     $query->whereHas('user', function ($q) use ($offer) {
        //         $q->where('gender', '=', $offer->gender_preference);
        //     });
        // }
        // $matches_to = $query->where('updated_at', '>=', $min_time)
        // ->get();

        $query = CarpoolNeed::with('user', 'fromLocation.locationState', 'pollLocation.locationState')
        ->fromStateIs($offer->fromLocation->state)
        ->pollStateIs($offer->toLocation->state)
        ->where('fulfilled', '=', '0')
        ->orderBy('updated_at', $order);
        if ($offer->gender_preference) {
            $query->where('gender', '=', $offer->gender_preference);
        }
        $partial_matches_from = $query->where('updated_at', '>=', $min_time)
        ->get();

        //don't match reverse any more
        // $query = CarpoolNeed::with('user', 'fromLocation.locationState', 'pollLocation.locationState')
        // ->pollStateIs($offer->fromLocation->state)
        // ->fromStateIs($offer->toLocation->state)
        // ->where('fulfilled', '=', '0');
        // if ($offer->gender_preference) {
        //     $query->whereHas('user', function ($q) use ($offer) {
        //         $q->where('gender', '=', $offer->gender_preference);
        //     });
        // }
        // $partial_matches_to = $query->where('updated_at', '>=', $min_time)
        // // ->where('hidden', '=', 0)
        // ->get();

        $matches = $matches_from->concat($partial_matches_from);
        return $matches;
    }

    /**
     * Matches a need to offers
     * @param CarpoolNeed $need
     * @param \Datetime $min_time
     * @param string $order asc or desc
     * @return Collection<CarpoolOffer>
     */
    public function matchNeed($need, \Datetime $min_time = null, $order = 'asc') {
        if (is_null($min_time)) {
            $min_time = '2018-01-01 00:00:00';
        }
        $matches_from = CarpoolOffer::with('user', 'fromLocation.locationState', 'toLocation.locationState')
        ->where('location_id_from', '=', $need->fromLocation->getKey())
        ->where('location_id_to', '=', $need->pollLocation->getKey())
        ->where('hidden', '=', 0)
        ->where(function ($q) use ($need) {
            $q->whereNull('gender_preference')
            ->orWhere('gender_preference', '=', $need->gender);
        })
        ->orderBy('updated_at', $order)
        ->get();

        //don't match reverse
        // $matches_to = CarpoolOffer::with('user', 'fromLocation.locationState', 'toLocation.locationState')
        // ->where('location_id_to', '=', $need->fromLocation->getKey())
        // ->where('location_id_from', '=', $need->pollLocation->getKey())
        // ->where('hidden', '=', 0)
        // ->where(function ($q) use ($need) {
        //     $q->whereNull('gender_preference')
        //     ->orWhere('gender_preference', '=', $need->user->gender);
        // })
        // ->get();

        $partial_matches_from = CarpoolOffer::with('user', 'fromLocation.locationState', 'toLocation.locationState')
        ->fromStateIs($need->fromLocation->state)
        ->toStateIs($need->pollLocation->state)
        ->where(function ($q) use ($need) {
            $q->whereNull('gender_preference')
            ->orWhere('gender_preference', '=', $need->gender);
        })
        ->orderBy('updated_at', $order)
        ->where('hidden', '=', 0)
        ->get();

        //don't match reverse
        // $partial_matches_to = CarpoolOffer::with('user', 'fromLocation.locationState', 'toLocation.locationState')
        // ->toStateIs($need->fromLocation->state)
        // ->fromStateIs($need->pollLocation->state)
        // ->where(function ($q) use ($need) {
        //     $q->whereNull('gender_preference')
        //     ->orWhere('gender_preference', '=', $need->user->gender);
        // })
        // ->where('hidden', '=', 0)
        // ->get();

        $matches = $matches_from->concat($partial_matches_from);
        return $matches;
    }
}