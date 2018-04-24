<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Gateways\MatchGateway;
use App\Mail\DailyMatchEmail;
use App\Models\EmailsSent;

use Carbon\Carbon;
class SendEmailUpdatesCommandApr24 extends Command
{
    protected $lastSentAt = null;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:match-updates-apr24 {--fromid= : User id to start from} {--toid= : User id to end at}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sends updates with undirabu + survey information (only for non-hotmail)';

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
        // $this->lastSentAt = Carbon::parse(\App\Models\EmailsSent::find(1)->sent_at); //using 1 because of the matching bug :(
        $from_id = $this->option('fromid') ?: null;
        $to_id = $this->option('toid') ?: null;

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
        )
        // ->doesntHave('failedEmails')
        ->where('email', 'NOT LIKE', '%hotmail.com%')
        ->where('email', 'NOT LIKE', '%live.com%')
        ->orderBy('id', 'asc');

        if ($from_id) {
            $query->where('id', '>=', $from_id);
        }
        if ($to_id) {
            $query->where('id', '<=', $to_id);
        }
        $this->info(sprintf("Executing emails with sql query %s | args %s, %s", $query->toSql(), $from_id, $to_id));

        $emails_sent = 0;
        $msgs = [];
        $from_id = $query->first()->getKey();
        $to_id = null;
        $query->chunk(50, function ($users) use (&$emails_sent, &$msgs, &$to_id) {
            foreach ($users as $user) {
                list($mail, $msg) = (new \App\Gateways\MatchGateway)->getEmailForUser($user, $this->lastSentAt, $check_sponsors = true);
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
