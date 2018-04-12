<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password'
    ];
    protected $visible = [
        'name',
        'avatar_url',
        'uuid'
    ];

    public function need()
    {
        return $this->hasOne(\App\Models\CarpoolNeed::class);
    }

    public function offers()
    {
        return $this->hasMany(\App\Models\CarpoolOffer::class);
    }

    public function requests()
    {
        return $this->hasMany(\App\Models\InfoRequest::class);
    }
}
