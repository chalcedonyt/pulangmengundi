<?php
namespace App\Gateways;

use App\Models\CarpoolOffer;
use App\Models\CarpoolNeed;
use App\Models\User;
use Carbon\Carbon;
use Firebase\JWT\JWT;

class MatchGateway
{
    /**
     * User has a CarpoolNeed that has been matched
     *
     * @param \App\Models\User $user
     * @param \DateTime The need must be older than this date
     * @return boolean
     */
    public function userHasMatchedNeed(\App\Models\User $user, \DateTime $max_time = null): bool {
        if ($user->need && !$user->need->fulfilled) {
            if ($max_time && Carbon::parse($user->need->created_at)->gt($max_time)) {
                return false;
            }
            $matched_offers = $this->matchNeed($user->need);
            return $matched_offers->count() > 0;
        }
        return false;
    }

    /**
     * User has a CarpoolOffer that has been matched
     *
     * @param \App\Models\User $user
     * @return boolean
     */
    public function userHasMatchedOffer(\App\Models\User $user, \DateTime $max_time = null): bool {
        $offer = CarpoolOffer::where('user_id', '=', $user->getKey())
        ->where('hidden', 0)
        ->where('fulfilled', 0)
        ->where('offer_order', '=', 1)
        ->first();
        if ($offer) {
            if ($max_time && Carbon::parse($offer->created_at)->gt($max_time)) {
                return false;
            }
            $matched_needs = $this->matchOffer($offer);
            return $matched_needs->count() > 0;
        }
        return false;
    }

    public function getEmailForUser (\App\Models\User $user, \DateTime $last_sent_at = null, $check_sponsors = false) {
        //if user is new, don't need to check whether only to show fresh matches
        if ($last_sent_at && Carbon::parse($user->created_at)->gt($last_sent_at)) {
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
                //hack since i screwed up the consolidation and now this logic is also in a transformer
                if (!$offer->information && $offer->correspondingOffer && $offer->correspondingOffer->information) {
                    $offer->information = $offer->correspondingOffer->information;
                }
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
                if ($offer->hidden || $offer->fulfilled || $offer->offer_order > 1)
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
            $is_driver = ($matched_offers->count()) ? false : true;
            // $match_stats['msgs'][]=$msg;
            // $match_stats['users']++;
            return [
                new \App\Mail\DailyMatchEmail($user, $matched_offers, $matched_needs, $matched_sponsors, $is_driver),
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
        $matches_from = $query->get();

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
        $partial_matches_from = $query->get();

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
        ->where('offer_order', '=', 1)
        ->where('hidden', '=', 0)
        ->where(function ($q) use ($need) {
            $q->whereNull('gender_preference')
            ->orWhere('gender_preference', '=', $need->gender);
        })
        ->orderBy('updated_at', $order)
        ->get();

        $partial_matches_from = CarpoolOffer::with('user', 'fromLocation.locationState', 'toLocation.locationState')
        ->fromStateIs($need->fromLocation->state)
        ->toStateIs($need->pollLocation->state)
        ->where('offer_order', '=', 1)
        ->where(function ($q) use ($need) {
            $q->whereNull('gender_preference')
            ->orWhere('gender_preference', '=', $need->gender);
        })
        ->orderBy('updated_at', $order)
        ->where('hidden', '=', 0)
        ->get();

        $matches = $matches_from->concat($partial_matches_from);
        $matches = $matches->map(function ($offer) {
            $corresponding_offer = CarpoolOffer::where('user_id', '=', $offer->user_id)
            ->where('offer_order', '=', 2)
            ->first();
            $offer->correspondingOffer = $corresponding_offer;
            return $offer;
        });
        return $matches;
    }
}