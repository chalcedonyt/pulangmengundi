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
    public $user;
    public $subject = '';

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(User $user, $matched_offers, $matched_needs)
    {
        $this->user = $user;
        $this->matchedOffers = $matched_offers;
        $this->matchedNeeds = $matched_needs;
        if ($matched_needs->count() || $matched_offers->count()) {
            $this->subject = $matched_needs->count()
            ? sprintf('We have found %d potential rider(s) for you', $matched_needs->count())
            : sprintf('We have found %d potential driver(s) for you', $matched_offers->count());
        }
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->view('emails.matches');
    }
}
