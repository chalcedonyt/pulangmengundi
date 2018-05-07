<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

use App\Models\User;

class DailyMatchEmail extends Mailable
{
    // use Queueable, SerializesModels;

    public $matchedOffers;
    public $matchedNeeds;
    public $matchedSponsors;
    public $emailUser;//prevent clashes with global "user"
    public $subject = '';
    public $isDriver = false;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(User $user, $matched_offers, $matched_needs, $matched_sponsors, $is_driver)
    {
        $this->emailUser = $user;
        $this->matchedOffers = $matched_offers;
        $this->matchedNeeds = $matched_needs;
        $matched_sponsors = collect([]);
        $this->matchedSponsors = $matched_sponsors;
        $this->isDriver = $is_driver;
        if ($matched_needs->count() || $matched_offers->count() || $matched_sponsors->count()) {
            $sponsor_string = $matched_sponsors->count() ? 'and sponsors ' : '';
            switch (true) {
                case $matched_needs->count():
                    $this->subject = sprintf('#GE14 is TOMORROW! We have found %d new potential rider(s) for you', $matched_needs->count());
                    break;
                case $matched_offers->count():
                    $this->subject = sprintf('#GE14 is TOMORROW! We have found %d new potential driver(s) for you', $matched_offers->count());
                    break;
                default:
                    $this->subject = sprintf('#GE14 is TOMORROW! Have you found a carpool?');
            }
        }
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->view('emails.matches-may8');
    }
}
