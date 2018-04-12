<?php

namespace App\Transformers;

use League\Fractal\TransformerAbstract;

class CarpoolOfferTransformer extends TransformerAbstract
{
    protected $defaultIncludes = ['user', 'fromLocation', 'toLocation'];

    /**
     * A Fractal transformer.
     *
     * @return array
     */
    public function transform($offer)
    {
        $data = $offer->toArray();
        $data['leave_at_formatted'] = \Carbon\Carbon::parse($offer->leave_at)->format('D jS M Y, g:ia');
        unset($data['from_location']);
        unset($data['to_location']);
        return $data;
    }

    public function includeUser($offer)
    {
        return $this->item($offer->user, new UserTransformer);
    }

    public function includeToLocation($offer)
    {
        return $this->item($offer->toLocation, new LocationTransformer);
    }

    public function includeFromLocation($offer)
    {
        return $this->item($offer->fromLocation, new LocationTransformer);
    }
}
