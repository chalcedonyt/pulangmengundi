<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class State extends Model
{
    public function locations()
    {
        return $this->hasMany(\App\Models\Location::class, 'state', 'name');
    }
}
