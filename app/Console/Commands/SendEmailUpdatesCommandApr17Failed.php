<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Gateways\MatchGateway;
use App\Mail\DailyMatchEmail;
use App\Models\EmailsSent;

use Carbon\Carbon;

class SendEmailUpdatesCommandApr17Failed extends Command
{
    protected $lastSentAt;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:match-updates-apr17-failed';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sends updates + undirabu stuff for failures';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
        $this->lastSentAt = Carbon::parse(\App\Models\EmailsSent::find(1)->sent_at);
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
        $query = \App\Models\User::with(
            'need',
            'need.user',
            'need.fromLocation.locationState',
            'need.pollLocation.locationState',
            'offers',
            'offers.user',
            'offers.fromLocation.locationState',
            'offers.toLocation.locationState'
        )->whereHas('failedEmails', function ($q) {
            $q->where('message', 'LIKE', '%block%');
        })->orderBy('id', 'asc');

        $this->info(sprintf("Executing emails with sql query %s", $query->toSql()));

        $emails_sent = 0;
        $msgs = [];
        $from_id = $query->first()->getKey();
        $to_id = null;
        $query->chunk(50, function ($users) use (&$emails_sent, &$msgs, &$to_id) {
            foreach ($users as $user) {
                list($mail, $msg) = (new \App\Gateways\MatchGateway)->getEmailForUser($user, $this->lastSentAt);
                if ($mail) {
                    $this->info($msg);
                    $msgs[]=$msg;
                    $emails_sent++;
                    $to_id = $user->getKey();
                    \Mail::to($user->email)
                    ->send($mail);
                }
            }
        });
        $es = new EmailsSent;
        $es->sent_at = date('Y-m-d H:i:s');
        $es->emails_sent = $emails_sent;
        $es->message = implode("\n", $msgs);
        $es->from_user_id = $from_id;
        $es->to_user_id = $to_id;
        $es->save();
    }
}
