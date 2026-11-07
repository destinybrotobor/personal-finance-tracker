<x-mail::message>
# Feedback Submitted

This is a feedback Submitted by {{ $feedback->user->firstname }}.:

- **Type:** {{ $feedback->type }}
- **Title:** {{ $feedback->title }}
- **Description:** {{ $feedback->description }}

@if($feedback->attachment)
    - **Attachments:**
    @foreach($feedback->attachment as $file)
        - [{{ basename($file) }}]({{ storage_url($file) }})
    @endforeach
@endif

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
