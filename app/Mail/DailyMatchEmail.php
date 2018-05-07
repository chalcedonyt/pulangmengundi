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
        // $this->matchedSponsors = $matched_sponsors;
        $this->matchedSponsors = collect([]);
        $this->isDriver = $is_driver;
        if ($matched_needs->count() || $matched_offers->count() || $matched_sponsors->count()) {
            $sponsor_string = $matched_sponsors->count() ? 'and sponsors ' : '';
            $this->subject = $matched_needs->count()
            ? sprintf('#GE14 is TOMORROW! We have found %d new potential rider(s) %sfor you', $matched_needs->count(), $sponsor_string)
            : sprintf('#GE14 is TOMORROW! We have found %d new potential driver(s) %sfor you', $matched_offers->count(), $sponsor_string);
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
