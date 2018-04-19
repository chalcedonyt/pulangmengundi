<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddParliToLocationTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('location', function (Blueprint $table) {
            $table->dropColumn('dun_code');
            $table->integer('parli_seat_id')->nullable();
            $table->string('parli_seat_name')->nullable();
            $table->index('parli_seat_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('location', function (Blueprint $table) {
            $table->string('dun_code');
            $table->dropColumn('parli_seat_id');
            $table->dropColumn('parli_seat_name');
        });
    }
}
