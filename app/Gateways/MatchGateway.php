<?php
namespace App\Gateways;

use App\Models\CarpoolOffer;
use App\Models\CarpoolNeed;
use App\Models\User;
use Carbon\Carbon;

class MatchGateway
{
    /**
     * Matches an offer to needs
     * @param CarpoolOffer $offer
     * @param \Datetime $min_time
     * @return Collection<CarpoolNeed>
     */
    public function matchOffer(CarpoolOffer $offer, \Datetime $min_time = null) {
        if (is_null($min_time)) {
            $min_time = '2018-01-01 00:00:00';
        }
        $query = CarpoolNeed::with('user', 'fromLocation.locationState', 'pollLocation.locationState')
        ->where('location_id_from', '=', $offer->fromLocation->getKey())
        ->where('location_id_poll', '=', $offer->toLocation->getKey())
        ->where('fulfilled', '=', '0');
        if ($offer->gender_preference) {
            $query->whereHas('user', function ($q) use ($offer) {
                $q->where('gender', '=', $offer->gender_preference);
            });
        }
        $matches_from = $query->where('updated_at', '>=', $min_time)
        ->get();


        $query = CarpoolNeed::with('user', 'fromLocation.locationState', 'pollLocation.locationState')
        ->where('location_id_poll', '=', $offer->fromLocation->getKey())
        ->where('location_id_from', '=', $offer->toLocation->getKey())
        ->where('fulfilled', '=', '0');
        // ->where('hidden', '=', 0)
        if ($offer->gender_preference) {
            $query->whereHas('user', function ($q) use ($offer) {
                $q->where('gender', '=', $offer->gender_preference);
            });
        }
        $matches_to = $query->where('updated_at', '>=', $min_time)
        ->get();

        $query = CarpoolNeed::with('user', 'fromLocation.locationState', 'pollLocation.locationState')
        ->fromStateIs($offer->fromLocation->state)
        ->pollStateIs($offer->toLocation->state)
        ->where('fulfilled', '=', '0');
        if ($offer->gender_preference) {
            $query->whereHas('user', function ($q) use ($offer) {
                $q->where('gender', '=', $offer->gender_preference);
            });
        }
        $partial_matches_from = $query->where('updated_at', '>=', $min_time)
        // ->where('hidden', '=', 0)
        ->get();

        $query = CarpoolNeed::with('user', 'fromLocation.locationState', 'pollLocation.locationState')
        ->pollStateIs($offer->fromLocation->state)
        ->fromStateIs($offer->toLocation->state)
        ->where('fulfilled', '=', '0');
        if ($offer->gender_preference) {
            $query->whereHas('user', function ($q) use ($offer) {
                $q->where('gender', '=', $offer->gender_preference);
            });
        }
        $partial_matches_to = $query->where('updated_at', '>=', $min_time)
        // ->where('hidden', '=', 0)
        ->get();

        $matches = $matches_from->concat($matches_to)->concat($partial_matches_from)->concat($partial_matches_to);
        return $matches;
    }

    /**
     * Matches a need to offers
     * @param CarpoolNeed $need
     * @param \Datetime $min_time
     * @return Collection<CarpoolOffer>
     */
    public function matchNeed($need, \Datetime $min_time = null) {
        if (is_null($min_time)) {
            $min_time = '2018-01-01 00:00:00';
        }
        $matches_from = CarpoolOffer::with('user', 'fromLocation.locationState', 'toLocation.locationState')
        ->where('location_id_from', '=', $need->fromLocation->getKey())
        ->where('location_id_to', '=', $need->pollLocation->getKey())
        ->where('hidden', '=', 0)
        ->where(function ($q) use ($need) {
            $q->whereNull('gender_preference')
            ->orWhere('gender_preference', '=', $need->user->gender);
        })
        ->get();

        $matches_to = CarpoolOffer::with('user', 'fromLocation.locationState', 'toLocation.locationState')
        ->where('location_id_to', '=', $need->fromLocation->getKey())
        ->where('location_id_from', '=', $need->pollLocation->getKey())
        ->where('hidden', '=', 0)
        ->where(function ($q) use ($need) {
            $q->whereNull('gender_preference')
            ->orWhere('gender_preference', '=', $need->user->gender);
        })
        ->get();

        $partial_matches_from = CarpoolOffer::with('user', 'fromLocation.locationState', 'toLocation.locationState')
        ->fromStateIs($need->fromLocation->state)
        ->toStateIs($need->pollLocation->state)
        ->where(function ($q) use ($need) {
            $q->whereNull('gender_preference')
            ->orWhere('gender_preference', '=', $need->user->gender);
        })
        ->where('hidden', '=', 0)
        ->get();

        $partial_matches_to = CarpoolOffer::with('user', 'fromLocation.locationState', 'toLocation.locationState')
        ->toStateIs($need->fromLocation->state)
        ->fromStateIs($need->pollLocation->state)
        ->where(function ($q) use ($need) {
            $q->whereNull('gender_preference')
            ->orWhere('gender_preference', '=', $need->user->gender);
        })
        ->where('hidden', '=', 0)
        ->get();

        $matches = $matches_from->concat($matches_to)->concat($partial_matches_from)->concat($partial_matches_to);
        return $matches;
    }
}