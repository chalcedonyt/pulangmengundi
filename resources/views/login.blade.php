@extends('shared.master')

@section('title', 'Home')

@section('content')
<div id='login'></div>
@endsection
@section('scripts')
<script src="{{mix('js/login.js')}}"></script>
@endsection