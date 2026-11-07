<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BudgetNotification extends Notification
{
    use Queueable;

    protected $category;
    protected $notification_type;
    protected $budgettedAmount;
    protected $remainingBudget;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $category, float $budgettedAmount, float $remainingBudget, string $notification_type)
    {
        $this->category = $category;
        $this->budgettedAmount = $budgettedAmount;
        $this->remainingBudget = $remainingBudget;
        $this->notification_type = $notification_type;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)->markdown('emails.budget_notitfication', [
            'category' => $this->category,
            'notification_type' => $this->notification_type,
            'budgetted_amount' => $this->budgettedAmount,
            'remaining_budget' => $this->remainingBudget
        ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $message = "You have spent " . ($this->budgettedAmount - $this->remainingBudget) . " of your budgetted " . $this->budgettedAmount;
        return [
            'message' => $message,
            'category' => $this->category,
            'notification_type' => $this->notification_type,
            'budgetted_amount' => $this->budgettedAmount,
            'remaining_budget' => $this->remainingBudget
        ];
    }
}
