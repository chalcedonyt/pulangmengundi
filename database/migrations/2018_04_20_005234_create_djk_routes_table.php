<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateDjkRoutesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('djk_routes', function (Blueprint $table) {
            $table->increments('id');
            $table->text('routes');
            $table->text('route_csv');
        });
        $path = __DIR__.'/../seeds/artifacts/djk_routes.sql';
        DB::unprepared(file_get_contents($path));
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('djk_routes');
    }
}
