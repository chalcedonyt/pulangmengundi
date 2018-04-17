<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Gateways\MatchGateway;
use App\Mail\DailyMatchEmail;
use App\Models\EmailsSent;

use Carbon\Carbon;
class SendEmailUpdatesCommandApr17 extends Command
{
    protected $lastSentAt;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:match-updates-apr17';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sends updates + undirabu stuff';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
        $this->lastSentAt = Carbon::parse(\App\Models\EmailsSent::orderBy('id', 'desc')->first()->sent_at);
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $match_stats = [
            'users' => 0,
            'matched_drivers' => 0,
            'matched_riders' => 0,
            'msgs' => []
        ];
        \App\Models\User::with(
            'need',
            'need.user',
            'need.fromLocation.locationState',
            'need.pollLocation.locationState',
            'offers',
            'offers.user',
            'offers.fromLocation.locationState',
            'offers.toLocation.locationState'
        )
        ->orderBy('id')->chunk(50, function ($users) use (&$match_stats) {
            foreach ($users as $user) {
                list($mail, $msg) = (new \App\Gateways\MatchGateway)->getEmailForUser($user, $this->lastSentAt);
                if ($mail)
                    $this->info($msg);
            }
        });
        // $msg = sprintf('Email batch run on %s found %d potential user matches', date('r'), $match_stats['users']);
        // $this->info($msg);
        // $es = new EmailsSent;
        // $es->sent_at = date('Y-m-d H:i:s');
        // $es->emails_sent = $match_stats['users'];
        // $es->message = implode("\n", $match_stats['msgs']);
        // $es->save();
    }
}
