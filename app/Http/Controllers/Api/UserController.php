<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Helpers\Utils;
use App\Models\Feedback;
use App\Models\Reference;
use Illuminate\Http\Request;
use App\Traits\ResponseTrait;
use App\Mail\FeedbackSubmitted;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    use ResponseTrait;

    public function submitFeedback(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'attachment' => 'nullable|file|max:2048',
        ]);

        // Process Attachments if any
        $attachments = [];
        if ($request->hasFile('attachment')) {
            foreach ($request->file('attachment') as $file) {
                $attachments[] = $file->store('feedback_attachments', 'public');
            }
        }

        $feedback = Feedback::create([
            'user_id' => $request->user()->id,
            'type' => $request->type ?? 'general',
            'title' => $request->title,
            'description' => $request->description,
            'attachment' => $attachments,
        ]);

        // Send same message as email to lucy@gmail.com
        // Mail::to('lucy@gmail.com')->send(new FeedbackSubmitted($feedback));

        return $this->successResponse('Feedback submitted successfully', [
            'feedback' => $feedback
        ]);
    }

    public function fetchFeedbacks(Request $request)
    {
        $feedbacks = Feedback::with('user')->orderBy('created_at', 'desc')->get();
        return $this->successResponse('Feedbacks fetched successfully', [
            'feedbacks' => $feedbacks
        ]);
    }

    public function fetchNotifications(Request $request)
    {
        $notifications = $request->user()->notifications()->get();
        return $this->successResponse('Notifications fetched successfully', [
            'notifications' => $notifications
        ]);
    }

    public function fetchUnreadNotifications(Request $request)
    {
        $notifications = $request->user()->notifications()->where('read_at', null)->get();
        return $this->successResponse('Unread notifications fetched successfully', [
            'notifications' => $notifications
        ]);
    }

    public function markAsRead(Request $request)
    {
        $notification = $request->user()->notifications()->find($request->id);
        if ($notification) {
            $notification->markAsRead();
            return $this->successResponse('Notification marked as read successfully');
        }
        return $this->errorResponse('Notification not found', [], 404);
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()->notifications()->where('read_at', null)->update(['read_at' => now()]);
        return $this->successResponse('All notifications marked as read successfully');
    }
}
