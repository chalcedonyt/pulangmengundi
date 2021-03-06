<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateLocationSponsorStatesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('location_sponsor_states', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('location_sponsor_id');
            $table->string('state_from', 150);
            $table->string('state_to', 150);
            $table->index('location_sponsor_id');
            $table->index('state_from');
            $table->index('state_to');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('location_sponsor_states');
    }
}
