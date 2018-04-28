<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Gateways\MatchGateway;

use Carbon\Carbon;
use GuzzleHttp\Client;
use App\Models\FailedEmail;

class GetMailgunErrors extends Command
{
    protected $lastSentAt;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mailgun:get-failed';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Get failed mailgun messages';

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
        $params = [
            'event' => 'failed',
            'ascending' => 'no',
            'from' => 'carpool@pulangmengundi.com',
            // 'begin' => 1524191014,
            'limit' => 200
        ];
        $client = new Client();
        $res = $client->request('GET', sprintf("https://api:%s@api.mailgun.net/v3/pulangmengundi.com/events?%s",
            env('MAILGUN_SECRET'),
            http_build_query($params))
        );
        $data = json_decode($res->getBody(), true);
        $latest_time = 0;
        foreach ($data['items'] as $item) {
            FailedEmail::create([
                'email' => $item['recipient'],
                'user_id' => \App\Models\User::whereEmail($item['recipient'])->first()->getKey(),
                'message' => $item['delivery-status']['message'] ?: json_encode($item['delivery-status']),
                'severity' => $item['severity'],
                'mailgun_unixtime' => $item['timestamp']
            ]);
            $latest_time = round($item['timestamp']);
        }
        $this->info(sprintf("Inserted %d errors into email table, last timestamp %d", count($data['items']), $latest_time));
    }
}
