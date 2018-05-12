<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

use App\Models\User;

class SendOffEmail extends Mailable
{
    // use Queueable, SerializesModels;
    public $emailUser;//prevent clashes with global "user"
    public $subject = '';

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(User $user)
    {
        $this->emailUser = $user;
        $this->subject = 'Thank you for being part of #pulangmengundi!';
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->view('emails.sendoff');
    }
}
