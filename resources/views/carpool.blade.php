@extends('shared.master')

@section('title', 'Carpool')

@section('content')
<div id="carpool"></div>
@endsection
@section('scripts')
<script>
window.user = {!!json_encode($user)!!}
window.userStatus = {!!json_encode($user_status)!!}
window.surveyStatus = {!!json_encode($survey_status)!!}
</script>
<script src="{{mix('js/carpool.js')}}"></script>
@endsection