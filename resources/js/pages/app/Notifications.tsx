import AppLayout from '@/layouts/app-layout';
import httpClient from '@/lib/axios';
import { Head } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Bell,
    BellOff,
    Eye,
    EyeOff,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Info
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Notifications', href: '/notifications' },
];

interface Notification {
    id: number;
    data: {
        category: string;
        notification_type: string;
        message: string;
        budgetted_amount: number;
        remaining_budget: number;
    };
    read_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: null;
}

const Notifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [fetching, setFetching] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [activeTab, setActiveTab] = useState('all');

    const fetchNotifications = async () => {
        setFetching(true);
        try {
            const response = await httpClient.get(route('api.fetch-unread-notifications'));
            setNotifications(response.data.body.notifications);
            if (!selectedNotification && response.data.body.notifications.length > 0) {
                setSelectedNotification(response.data.body.notifications[0]);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
        setFetching(false);
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleNotificationClick = async (notification: Notification) => {
        setSelectedNotification(notification);

        if (!notification.read_at) {
            try {
                await httpClient.post(route('api.mark-as-read', { id: notification.id }));
                setNotifications(prev =>
                    prev.map(n =>
                        n.id === notification.id
                            ? { ...n, read_at: new Date().toISOString() }
                            : n
                    )
                );
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        }
    };

    const markAllAsRead = async () => {
        try {
            await httpClient.post(route('api.mark-all-as-read'));
            setNotifications(prev =>
                prev.map(notification => ({
                    ...notification,
                    read_at: notification.read_at || new Date().toISOString()
                }))
            );
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getNotificationIcon = (category: string) => {
        const icons = {
            budget: AlertCircle,
            system: Info,
            alert: Bell,
            default: Bell,
        };
        return icons[category as keyof typeof icons] || icons.default;
    };

    const getNotificationBadgeVariant = (notificationType: string) => {
        const variants = {
            warning: 'warning',
            info: 'secondary',
            success: 'success',
            error: 'destructive',
            default: 'outline',
        };
        return variants[notificationType as keyof typeof variants] || variants.default;
    };

    const filteredNotifications = notifications.filter(notification => {
        if (activeTab === 'all') return true;
        if (activeTab === 'unread') return !notification.read_at;
        return notification.read_at;
    });

    const unreadCount = notifications.filter(n => !n.read_at).length;

    if (fetching && notifications.length === 0) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Notifications" />
                <div className="container mx-auto p-4 space-y-6">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-9 w-32" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-40" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />

            <div className="container mx-auto p-4 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                        <p className="text-muted-foreground">
                            Manage and view your system notifications
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchNotifications}
                            disabled={fetching}
                        >
                            <RefreshCw className={cn("h-4 w-4 mr-2", fetching && "animate-spin")} />
                            Refresh
                        </Button>
                        {unreadCount > 0 && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={markAllAsRead}
                            >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Mark all as read
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Notifications List */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5" />
                                    Notifications
                                    {unreadCount > 0 && (
                                        <Badge variant="destructive" className="ml-2">
                                            {unreadCount} unread
                                        </Badge>
                                    )}
                                </CardTitle>
                            </div>
                            <CardDescription>
                                Click on a notification to view details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <div className="px-6">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="all" className="flex items-center gap-2">
                                            All
                                        </TabsTrigger>
                                        <TabsTrigger value="unread" className="flex items-center gap-2">
                                            <Eye className="h-4 w-4" />
                                            Unread
                                        </TabsTrigger>
                                        <TabsTrigger value="read" className="flex items-center gap-2">
                                            <EyeOff className="h-4 w-4" />
                                            Read
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value={activeTab} className="m-0">
                                    <ScrollArea className="h-[500px]">
                                        {filteredNotifications.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                                                <BellOff className="h-8 w-8 mb-2" />
                                                <p>No notifications found</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-1 p-2">
                                                {filteredNotifications.map((notification) => {
                                                    const IconComponent = getNotificationIcon(notification.data.category);
                                                    const isSelected = selectedNotification?.id === notification.id;
                                                    const isUnread = !notification.read_at;

                                                    return (
                                                        <div
                                                            key={notification.id}
                                                            className={cn(
                                                                "p-4 rounded-lg cursor-pointer transition-all border border-transparent",
                                                                isSelected
                                                                    ? "bg-primary/5 border-primary/20 shadow-sm"
                                                                    : "hover:bg-muted/50",
                                                                isUnread && "bg-blue-50/50 border-blue-200"
                                                            )}
                                                            onClick={() => handleNotificationClick(notification)}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div className={cn(
                                                                    "p-2 rounded-full",
                                                                    isUnread ? "bg-blue-100 text-blue-600" : "bg-muted text-muted-foreground"
                                                                )}>
                                                                    <IconComponent className="h-4 w-4" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-sm font-medium text-foreground truncate">
                                                                                {notification.data.category}
                                                                            </span>
                                                                            <Badge
                                                                                variant={getNotificationBadgeVariant(notification.data.notification_type) as any}
                                                                                className="text-xs"
                                                                            >
                                                                                {notification.data.notification_type}
                                                                            </Badge>
                                                                        </div>
                                                                        {isUnread && (
                                                                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                                                        )}
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                                        {notification.data.message}
                                                                    </p>
                                                                    <div className="flex items-center justify-between mt-2">
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {new Date(notification.created_at).toLocaleDateString()}
                                                                        </span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {new Date(notification.created_at).toLocaleTimeString()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </ScrollArea>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Notification Details */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="h-5 w-5" />
                                Notification Details
                            </CardTitle>
                            <CardDescription>
                                {selectedNotification ? "View notification information" : "Select a notification to view details"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!selectedNotification ? (
                                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                    <Bell className="h-12 w-12 mb-4 opacity-50" />
                                    <p className="text-lg font-medium mb-2">No notification selected</p>
                                    <p className="text-sm text-center">
                                        Choose a notification from the list to view its details
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "p-3 rounded-full",
                                                !selectedNotification.read_at
                                                    ? "bg-blue-100 text-blue-600"
                                                    : "bg-muted text-muted-foreground"
                                            )}>
                                                {React.createElement(getNotificationIcon(selectedNotification.data.category), {
                                                    className: "h-6 w-6"
                                                })}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">
                                                    {selectedNotification.data.category}
                                                </h3>
                                                <Badge
                                                    variant={getNotificationBadgeVariant(selectedNotification.data.notification_type) as any}
                                                    className="mt-1"
                                                >
                                                    {selectedNotification.data.notification_type}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="text-right text-sm text-muted-foreground">
                                            <div>{new Date(selectedNotification.created_at).toLocaleDateString()}</div>
                                            <div>{new Date(selectedNotification.created_at).toLocaleTimeString()}</div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Message */}
                                    <div>
                                        <h4 className="font-medium mb-2">Message</h4>
                                        <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
                                            {selectedNotification.data.message}
                                        </p>
                                    </div>

                                    {/* Budget Information */}
                                    {(selectedNotification.data.budgetted_amount > 0) && (
                                        <>
                                            <Separator />
                                            <div>
                                                <h4 className="font-medium mb-3">Budget Information</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-muted-foreground">Budgeted Amount:</span>
                                                            <span className="font-medium">
                                                                ₦{selectedNotification.data.budgetted_amount.toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-muted-foreground">Remaining Budget:</span>
                                                            <span className={cn(
                                                                "font-medium",
                                                                selectedNotification.data.remaining_budget < 0
                                                                    ? "text-destructive"
                                                                    : "text-success"
                                                            )}>
                                                                ₦{selectedNotification.data.remaining_budget.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-muted/30 p-4 rounded-lg">
                                                        <div className="text-sm space-y-1">
                                                            <div className="flex justify-between">
                                                                    <span>Status:</span>
                                                                    <Badge
                                                                        variant={
                                                                            selectedNotification.data.remaining_budget >= 0
                                                                                ? 'secondary'
                                                                                : 'destructive'
                                                                        }
                                                                    >
                                                                        {selectedNotification.data.remaining_budget >= 0
                                                                            ? 'Within Budget'
                                                                            : 'Over Budget'
                                                                        }
                                                                    </Badge>
                                                                </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Meta Information */}
                                    <Separator />
                                    <div className="text-sm text-muted-foreground space-y-2">
                                        <div className="flex justify-between">
                                            <span>Read Status:</span>
                                            <Badge variant={selectedNotification.read_at ? 'secondary' : 'default'}>
                                                {selectedNotification.read_at ? 'Read' : 'Unread'}
                                            </Badge>
                                        </div>
                                        {selectedNotification.read_at && (
                                            <div className="flex justify-between">
                                                <span>Read At:</span>
                                                <span>{new Date(selectedNotification.read_at).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default Notifications;