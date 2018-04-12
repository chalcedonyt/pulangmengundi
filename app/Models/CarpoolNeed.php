<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CarpoolNeed extends Model
{
    protected $table = 'need_carpool';
    protected $guarded = [];
    protected $hidden = ['poll_location', 'from_location'];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function fromLocation()
    {
        return $this->belongsTo(\App\Models\Location::class, 'location_id_from');
    }

    public function pollLocation()
    {
        return $this->belongsTo(\App\Models\Location::class, 'location_id_poll');
    }

    public function scopeFromStateIs($query, string $state)
    {
        $query->whereHas('fromLocation.locationState', function ($q) use ($state) {
            $q->where('name', '=', $state);
        });
    }

    public function scopePollStateIs($query, string $state)
    {
        $query->whereHas('pollLocation.locationState', function ($q) use ($state) {
            $q->where('name', '=', $state);
        });
    }

}
