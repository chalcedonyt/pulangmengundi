<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CarpoolNeed extends Model
{
    protected $table = 'need_carpool';
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function locationFrom()
    {
        return $this->belongsTo(\App\Models\Location::class, 'location_id_from');
    }

    public function locationPoll()
    {
        return $this->belongsTo(\App\Models\Location::class, 'location_id_poll');
    }

    public function scopeFromStateIs($query, string $state)
    {
        $query->whereHas('locationFrom.locationState', function ($q) use ($state) {
            $q->where('name', '=', $state);
        });
    }

    public function scopePollStateIs($query, string $state)
    {
        $query->whereHas('locationPoll.locationState', function ($q) use ($state) {
            $q->where('name', '=', $state);
        });
    }

}
