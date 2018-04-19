<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DjkParliSeat extends Model
{
    public $timestamps = false;

    public function djkRoute()
    {
        return $this->hasOne(\App\Models\DjkRoute::class, 'id');
    }
}
