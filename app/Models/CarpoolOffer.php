<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CarpoolOffer extends Model
{
    protected $table = 'offer_carpool';
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function locationFrom()
    {
        return $this->belongsTo(\App\Models\Location::class, 'location_id_from');
    }

    public function locationTo()
    {
        return $this->belongsTo(\App\Models\Location::class, 'location_id_to');
    }

    public function scopeFromStateIs($query, string $state)
    {
        $query->whereHas('locationFrom.locationState', function ($q) use ($state) {
            $q->where('name', '=', $state);
        });
    }

    public function scopeToStateIs($query, string $state)
    {
        $query->whereHas('locationTo.locationState', function ($q) use ($state) {
            $q->where('name', '=', $state);
        });
    }
}
