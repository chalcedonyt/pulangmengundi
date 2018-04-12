<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name');
            $table->string('uuid', 40)->default('');
            $table->string('email', 100)->default('');
            $table->string('password')->default('');
            $table->integer('gender')->nullable();
            $table->string('google_id', 40)->nullable();
            $table->string('fb_id', 40)->nullable();
            $table->string('tw_id', 40)->nullable();
            $table->rememberToken();
            $table->timestamps();
            $table->index('uuid');
            $table->index('email');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
}
