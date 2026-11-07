{{-- resources/views/emails/budget_notification.blade.php --}}

<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Budget Notification</title>
</head>

<body style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; background-color:#f4f6f8;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background:#ffffff; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.1); overflow:hidden;">

                    {{-- Header --}}
                    <tr>
                        <td style="background:linear-gradient(135deg, #d1a401, #e4b200); padding:20px; color:#ffffff; text-align:center;">
                            <h1 style="margin:0; font-size:24px; color:#ffffff;">Budget Update</h1>
                        </td>
                    </tr>

                    {{-- Body --}}
                    <tr>
                        <td style="padding:30px;">
                            <p style="font-size:16px; color:#333333; margin-bottom:20px; line-height:1.5;">
                                Hello, <br><br>

                                @php
                                $spent = $budgetted_amount - $remaining_budget;
                                @endphp

                                @if(strtolower($category) === 'expenses')
                                    @if($notification_type === 'almost exceeded')
                                        You have spent <strong>₦{{ number_format($spent, 2) }}</strong> out of your
                                        expenses budget of <strong>₦{{ number_format($budgetted_amount, 2) }}</strong>.
                                        You’re getting close to exceeding your limit, with only
                                        <strong>₦{{ number_format($remaining_budget, 2) }}</strong> left.
                                    @elseif($notification_type === 'exceeded')
                                        You have exceeded your expenses budget.
                                        You spent <strong>₦{{ number_format($spent, 2) }}</strong>
                                        against the budgeted <strong>₦{{ number_format($budgetted_amount, 2) }}</strong>.
                                    @endif

                                @elseif(strtolower($category) === 'savings')
                                    You have saved <strong>₦{{ number_format($spent, 2) }}</strong> so far
                                    towards your savings goal of <strong>₦{{ number_format($budgetted_amount, 2) }}</strong>.
                                    You still need <strong>₦{{ number_format($remaining_budget, 2) }}</strong> to reach your goal.

                                    @if($notification_type === 'almost exceeded')
                                        <strong>Great job! You are close to reaching your savings goal.</strong>
                                    @elseif($notification_type === 'exceeded')
                                        <strong>Congratulations You’ve exceeded your savings target!</strong>
                                    @endif

                                @elseif(strtolower($category) === 'income')
                                    You have earned <strong>₦{{ number_format($spent, 2) }}</strong>
                                    out of your target income of <strong>₦{{ number_format($budgetted_amount, 2) }}</strong>.
                                    You have <strong>₦{{ number_format($remaining_budget, 2) }}</strong> left to meet your goal.

                                    @if($notification_type === 'almost exceeded')
                                        You are almost at your income target, keep it up!
                                    @elseif($notification_type === 'exceeded')
                                        Amazing! You have exceeded your income target.
                                    @endif
                                @endif
                            </p>

                            {{-- Data Table --}}
                            <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse:collapse; margin-top:10px; font-size:14px;">
                                <tr>
                                    <td style="border-bottom:1px solid #eee; font-weight:bold; width:40%;">Category</td>
                                    <td style="border-bottom:1px solid #eee;">
                                        @php
                                        $colors = [
                                        'income' => '#16a34a',
                                        'expenses' => '#dc2626',
                                        'savings' => '#2563eb'
                                        ];
                                        $bgColor = $colors[strtolower($category)] ?? '#6b7280';
                                        @endphp
                                        <span style="background:{{ $bgColor }}; color:#fff; padding:4px 10px; border-radius:6px; font-size:13px; text-transform:capitalize;">
                                            {{ $category }}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="border-bottom:1px solid #eee; font-weight:bold;">Notification Type</td>
                                    <td style="border-bottom:1px solid #eee;">{{ ucfirst($notification_type) }}</td>
                                </tr>
                                <tr>
                                    <td style="border-bottom:1px solid #eee; font-weight:bold;">
                                        @if(strtolower($category) === 'savings')
                                        Savings Goal
                                        @elseif(strtolower($category) === 'income')
                                        Income Target
                                        @else
                                        Budgeted Amount
                                        @endif
                                    </td>
                                    <td style="border-bottom:1px solid #eee;">₦{{ number_format($budgetted_amount, 2) }}</td>
                                </tr>
                                <tr>
                                    <td style="border-bottom:1px solid #eee; font-weight:bold;">
                                        @if(strtolower($category) === 'savings')
                                        Remaining to Save
                                        @elseif(strtolower($category) === 'income')
                                        Remaining to Earn
                                        @else
                                        Remaining Budget
                                        @endif
                                    </td>
                                    <td style="border-bottom:1px solid #eee;">₦{{ number_format($remaining_budget, 2) }}</td>
                                </tr>
                            </table>

                            {{-- Closing note --}}
                            <p style="margin-top:25px; font-size:14px; color:#666666; line-height:1.5;">
                                Keep tracking your {{ strtolower($category) }} to stay on top of your financial goals.
                                Smart budgeting today means peace of mind tomorrow!
                            </p>
                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td style="background:#f4f6f8; text-align:center; padding:15px; font-size:12px; color:#999999;">
                            © {{ date('Y') }} Finance Tracker By Lucy Oge. All rights reserved.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>