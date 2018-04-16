<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LocationSponsor extends Model
{
    public function states() {
        return $this->hasMany(\App\Models\LocationSponsorState::class);
    }

    public function scopeStatesMatching($query, string $state_from, string $state_to) {
        return $query->whereHas('states', function ($q) use ($state_from, $state_to) {
            $q->where('state_from', '=', $state_from)
            ->where('state_to', '=', $state_to);
        });
    }
}
