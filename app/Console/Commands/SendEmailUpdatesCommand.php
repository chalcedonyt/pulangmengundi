<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Gateways\MatchGateway;
use App\Mail\DailyMatchEmail;
use App\Models\EmailsSent;

class SendEmailUpdatesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:match-updates';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sends information to drivers and riders about their updates';

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
                $matched_offers = collect([]);
                if ($user->need) {
                    $matched_offers = (new MatchGateway)->matchNeed($user->need);
                }

                $matched_needs = collect([]);
                if ($user->offers) {
                    foreach ($user->offers as $offer) {
                        $needs = (new MatchGateway)->matchOffer($offer);
                        if ($needs->count()) {
                            $matched_needs = $matched_needs->concat($needs);
                        }
                    }
                }
                if ($matched_needs->count() || $matched_offers->count()) {
                    $msg = sprintf('Found %d drivers, %d offers for user %d %s',
                        $matched_needs->count(),
                        $matched_offers->count(),
                        $user->getKey(),
                        $user->name
                    );
                    $this->info($msg);
                    $match_stats['msgs'][]=$msg;
                    $match_stats['users']++;
                    $mail = new DailyMatchEmail($user, $matched_offers, $matched_needs);
                    \Mail::to($user->email)
                    ->send($mail);
                }
            }
        });
        $msg = sprintf('Email batch run on %s found %d potential user matches', date('r'), $match_stats['users']);
        $this->info($msg);
        $es = new EmailsSent;
        $es->sent_at = date('Y-m-d H:i:s');
        $es->emails_sent = $match_stats['users'];
        $es->message = implode("\n", $match_stats['msgs']);
        $es->save();
    }
}
