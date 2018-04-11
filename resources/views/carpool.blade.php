@extends('shared.master')

@section('title', 'Carpool')

@section('content')
<div id="carpool"></div>
@endsection
@section('scripts')
<script>
window.user = {!!json_encode($user)!!}
</script>
<script src="{{mix('js/carpool.js')}}"></script>
@endsection