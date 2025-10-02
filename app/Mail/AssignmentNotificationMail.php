<?php

namespace App\Mail;

use App\Models\Assignment;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AssignmentNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public Assignment $assignment;
    public User $recipient;

    /**
     * Create a new message instance.
     */
    public function __construct(Assignment $assignment, User $recipient)
    {
        $this->assignment = $assignment;
        $this->recipient  = $recipient;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '📢 Pemberitahuan Penugasan Baru/Perbarui Penugasan - ' . $this->assignment->destination,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.assignment-notification',
            with: [
                'assignment' => $this->assignment,
                'recipient'  => $this->recipient,
                'url' => route('assignments.show', $this->assignment->id),
            ]
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
