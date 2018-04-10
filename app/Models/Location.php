<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    protected $table = 'location';

    public function locationState()
    {
        return $this->belongsTo(\App\Models\State::class, 'state', 'name');
    }
}
