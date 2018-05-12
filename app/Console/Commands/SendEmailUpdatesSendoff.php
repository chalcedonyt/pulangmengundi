<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Gateways\MatchGateway;
use App\Mail\DailyMatchEmail;
use App\Models\EmailsSent;

use Carbon\Carbon;

class SendEmailUpdatesSendoff extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:sendoff {--fromid= : User id to start from} {--toid= : User id to end at}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'The sendoff email';

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
        $from_id = $this->option('fromid') ?: null;
        $to_id = $this->option('toid') ?: null;

        $query = \App\Models\User::doesntHave('failedEmails')
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
                $mail = new \App\Mail\SendOffEmail($user);
                if ($mail) {
                    $this->info(sprintf("Sending email to %s", $user->email));
                    $emails_sent++;
                    $to_id = $user->getKey();
                    \Mail::to($user->email)
                    ->send($mail);
                }
            }
        });
    }
}
