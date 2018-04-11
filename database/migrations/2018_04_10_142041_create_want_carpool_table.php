<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateWantCarpoolTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('need_carpool', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('user_id');
            $table->integer('location_id_from');
            $table->integer('location_id_poll');
            $table->string('gender');
            $table->text('information')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('location_id_from');
            $table->index('location_id_poll');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('need_carpool');
    }
}
