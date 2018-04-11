<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateOfferCarpoolTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('offer_carpool', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('user_id');
            $table->integer('location_id_from');
            $table->integer('location_id_to');
            $table->string('gender_preference')->nullable();
            $table->datetime('leave_at');
            $table->tinyInteger('hidden')->default(0);
            $table->text('information')->nullable();
            $table->timestamps();

            $table->softDeletes();
            $table->index('user_id');
            $table->index('location_id_from');
            $table->index('location_id_to');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('offer_carpool');
    }
}
