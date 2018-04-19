<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddParliSeatCsvToNeeds extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('need_carpool', function (Blueprint $table) {
            $table->string('parli_seat_id_string')->default('');
        });
        \App\Models\CarpoolNeed::with('fromLocation', 'pollLocation')
        ->get()->each(function ($n) {
            $parli_seat_ids = [
                $n->fromLocation->parli_seat_id,
                $n->pollLocation->parli_seat_id
            ];
            if (!empty($parli_seat_ids) && !in_array('', $parli_seat_ids)) {
                $n->parli_seat_id_string = implode('%', $parli_seat_ids);
                $n->save();
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('need_carpool', function (Blueprint $table) {
            $table->dropColumn('parli_seat_id_string');
        });
    }
}
