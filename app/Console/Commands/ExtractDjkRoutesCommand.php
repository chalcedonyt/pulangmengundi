<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ExtractDjkRoutesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'adhoc:extract-djk-routes';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Extract djk routes';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $fp = fopen(base_path('database/seeds/artifacts/djk_routes.csv'), 'r');
        $i = 1;
        while ($row = fgetcsv($fp)) {
            $values = array_filter($row, function ($col) {
                return !empty($col);
            });
            $values = array_map(function ($col) {
                return (int)$col;
            }, $values);
            $djk_route = new \App\Models\DjkRoute;
            $djk_route->id = $i;
            $djk_route->routes = json_encode($values);
            $djk_route->save();
            $i++;
        }
    }
}
