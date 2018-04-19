<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateDjkLocationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('djk_parli_seats', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('parli_seat_id_from');
            $table->integer('parli_seat_id_to');
        });
        $path = __DIR__.'/../seeds/artifacts/djk_parli_seats.sql';
        DB::unprepared(file_get_contents($path));
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('djk_parli_seats');
    }
}
