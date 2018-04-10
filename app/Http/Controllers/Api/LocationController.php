<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use App\Models\Location;
use App\Models\State;

class LocationController extends Controller
{
    public function states(Request $request)
    {
        $states = State::all();
        return response()->json(['states' => $states->toArray()]);
    }

    public function locations(Request $request)
    {
        $locations = Location::whereState($request->input('state'))
        ->orderBy('name')
        ->get();
        return response()->json(['locations' => $locations->toArray()]);
    }
}
