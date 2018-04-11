<?php

namespace App\Transformers;

use League\Fractal\TransformerAbstract;

class LocationTransformer extends TransformerAbstract
{
    /**
     * A Fractal transformer.
     *
     * @return array
     */
    public function transform($location)
    {
        return $location->toArray();
    }
}
