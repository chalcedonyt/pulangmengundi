<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;

class CarpoolOffer extends Model
{
    use SoftDeletes;

    protected $table = 'offer_carpool';
    protected $guarded = [];
    protected $hidden = ['to_location', 'from_location'];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function fromLocation()
    {
        return $this->belongsTo(\App\Models\Location::class, 'location_id_from');
    }

    public function toLocation()
    {
        return $this->belongsTo(\App\Models\Location::class, 'location_id_to');
    }

    public function scopeFromStateIs($query, string $state)
    {
        $query->whereHas('fromLocation.locationState', function ($q) use ($state) {
            $q->where('name', '=', $state);
        });
    }

    public function scopeToStateIs($query, string $state)
    {
        $query->whereHas('toLocation.locationState', function ($q) use ($state) {
            $q->where('name', '=', $state);
        });
    }
}
