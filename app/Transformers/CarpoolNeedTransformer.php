<?php

namespace App\Transformers;

use League\Fractal\TransformerAbstract;

class CarpoolNeedTransformer extends TransformerAbstract
{
    protected $defaultIncludes = ['user', 'fromLocation', 'pollLocation'];
    /**
     * A Fractal transformer.
     *
     * @return array
     */
    public function transform($need)
    {
        return $need->toArray();
    }

    public function includeUser($need)
    {
        return $this->item($need->user, new UserTransformer);
    }

    public function includePollLocation($need)
    {
        return $this->item($need->pollLocation, new LocationTransformer);
    }

    public function includeFromLocation($need)
    {
        return $this->item($need->fromLocation, new LocationTransformer);
    }
}
