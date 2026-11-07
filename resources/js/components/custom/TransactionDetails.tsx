import { Transaction } from '@/types';
import React, { FC } from 'react';
import { Button } from '../ui/button';
import {
    Edit2,
    ArrowLeft,
    Calendar,
    Tag,
    CreditCard,
    FileText,
    Download,
    Share2,
    Copy,
    CheckCircle2,
    X,
    PiggyBank,
    TrendingUp,
    TrendingDown,
    Wallet
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface TransactionDetailsProps {
    transaction: Transaction;
    onClose: () => void;
    onEdit?: (transaction: Transaction) => void;
}

export default function TransactionDetails({ transaction, onClose, onEdit }: TransactionDetailsProps) {
    const { toast } = useToast();

    const getTypeConfig = (type: string) => {
        const config = {
            income: {
                color: 'text-green-600 bg-green-50 border-green-200',
                icon: TrendingUp,
                label: 'Income',
                symbol: '+'
            },
            expenses: {
                color: 'text-red-600 bg-red-50 border-red-200',
                icon: TrendingDown,
                label: 'Expense',
                symbol: '-'
            },
            savings: {
                color: 'text-blue-600 bg-blue-50 border-blue-200',
                icon: PiggyBank,
                label: 'Savings',
                symbol: '→'
            }
        };
        return config[type as keyof typeof config] || config.income;
    };

    const getPaymentMethodIcon = (method: string) => {
        const icons: { [key: string]: any } = {
            'Cash': Wallet,
            'Credit Card': CreditCard,
            'Debit Card': CreditCard,
            'Bank Transfer': Download,
            'Wallet': Wallet,
            'Mobile Payment': Share2
        };
        return icons[method] || CreditCard;
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied to clipboard",
            description: `${label} copied successfully`,
            duration: 2000,
        });
    };

    const handleShare = async () => {
        const shareData = {
            title: `Transaction: ${transaction.amount}`,
            text: `Check out this ${transaction.type} transaction from ${format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            handleCopyToClipboard(window.location.href, 'Transaction link');
        }
    };

    const handleEdit = () => {
        if (onEdit) {
            onEdit(transaction);
        }
    };

    const typeConfig = getTypeConfig(transaction.type);
    const TypeIcon = typeConfig.icon;
    const PaymentMethodIcon = getPaymentMethodIcon(transaction.payment_method);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="flex items-center gap-2 hover:bg-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Transactions
                        </Button>
                        <div className="hidden sm:block">
                            <h1 className="text-2xl font-bold text-gray-900">Transaction Details</h1>
                            <p className="text-gray-600">Complete information about this transaction</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleShare}
                            className="flex items-center gap-2"
                        >
                            <Share2 className="h-4 w-4" />
                            Share
                        </Button>
                        {onEdit && (
                            <Button
                                onClick={handleEdit}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                                size="sm"
                            >
                                <Edit2 className="h-4 w-4" />
                                Edit
                            </Button>
                        )}
                    </div>
                </div>

                {/* Mobile Title */}
                <div className="sm:hidden">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Transaction Details</h1>
                    <p className="text-gray-600">Complete information about this transaction</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Amount Card */}
                        <Card className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <TypeIcon className="h-6 w-6 text-blue-600" />
                                            <Badge className={typeConfig.color}>
                                                {typeConfig.label}
                                            </Badge>
                                        </div>
                                        <div className="text-3xl lg:text-4xl font-bold text-gray-900">
                                            {typeConfig.symbol} {transaction.amount.toLocaleString('en-US', {
                                                style: 'currency',
                                                currency: 'USD'
                                            })}
                                        </div>
                                        <p className="text-gray-600 mt-2">
                                            {format(new Date(transaction.transaction_date), 'EEEE, MMMM dd, yyyy')}
                                        </p>
                                    </div>
                                    {transaction.category && (
                                        <div className="text-right">
                                            <div className="text-sm text-gray-500 mb-1">Category</div>
                                            <Badge variant="secondary" className="text-sm">
                                                <Tag className="h-3 w-3 mr-1" />
                                                {transaction.category.name}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Details Tabs */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Transaction Information</CardTitle>
                                <CardDescription>
                                    Complete details and metadata
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="details" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="details">Details</TabsTrigger>
                                        <TabsTrigger value="metadata">Metadata</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="details" className="space-y-6 pt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Basic Information */}
                                            <div className="space-y-4">
                                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    Basic Information
                                                </h3>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center py-2 border-b">
                                                        <span className="text-sm font-medium text-gray-500">Type</span>
                                                        <Badge className={typeConfig.color}>
                                                            {transaction.type}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex justify-between items-center py-2 border-b">
                                                        <span className="text-sm font-medium text-gray-500">Category</span>
                                                        <span className="text-sm font-medium capitalize">
                                                            {transaction.category?.name || 'Uncategorized'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-2 border-b">
                                                        <span className="text-sm font-medium text-gray-500">Payment Method</span>
                                                        <div className="flex items-center gap-2">
                                                            <PaymentMethodIcon className="h-4 w-4 text-gray-400" />
                                                            <span className="text-sm font-medium">
                                                                {transaction.payment_method}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Financial Details */}
                                            <div className="space-y-4">
                                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4" />
                                                    Financial Details
                                                </h3>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center py-2 border-b">
                                                        <span className="text-sm font-medium text-gray-500">Amount</span>
                                                        <span className="text-lg font-bold text-gray-900">
                                                            {transaction.amount.toLocaleString('en-US', {
                                                                style: 'currency',
                                                                currency: 'USD'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-2 border-b">
                                                        <span className="text-sm font-medium text-gray-500">Date</span>
                                                        <span className="text-sm font-medium">
                                                            {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-2 border-b">
                                                        <span className="text-sm font-medium text-gray-500">Status</span>
                                                        <Badge variant="outline" className="text-green-600 border-green-200">
                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                            Completed
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        {transaction.description && (
                                            <div className="space-y-3">
                                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    Description
                                                </h3>
                                                <div className="bg-gray-50 rounded-lg p-4 border">
                                                    <p className="text-gray-700 leading-relaxed">
                                                        {transaction.description}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="metadata" className="space-y-4 pt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <h4 className="font-medium text-gray-900">Timeline</h4>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Created</span>
                                                        <span className="font-medium">
                                                            {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Last Updated</span>
                                                        <span className="font-medium">
                                                            {format(new Date(transaction.updated_at), 'MMM dd, yyyy HH:mm')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="font-medium text-gray-900">Technical</h4>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Transaction ID</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                                                #{transaction.id}
                                                            </span>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCopyToClipboard(transaction.id.toString(), 'Transaction ID')}
                                                                className="h-6 w-6 p-0"
                                                            >
                                                                <Copy className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={handleEdit}
                                >
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Edit Transaction
                                </Button>
                                {/* <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={handleShare}
                                >
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Share Details
                                </Button> */}
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => handleCopyToClipboard(
                                        `${transaction.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} - ${transaction.type} - ${format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}`,
                                        'Transaction summary'
                                    )}
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Summary
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Transaction Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Type</span>
                                    <Badge className={typeConfig.color}>
                                        {transaction.type}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Category</span>
                                    <span className="text-sm font-medium capitalize">
                                        {transaction.category?.name || '—'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Payment Method</span>
                                    <span className="text-sm font-medium">
                                        {transaction.payment_method}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-sm font-medium text-gray-900">Total</span>
                                    <span className={`text-lg font-bold ${transaction.type === 'income' ? 'text-green-600' :
                                            transaction.type === 'expenses' ? 'text-red-600' : 'text-blue-600'
                                        }`}>
                                        {typeConfig.symbol} {transaction.amount.toLocaleString('en-US', {
                                            style: 'currency',
                                            currency: 'USD'
                                        })}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Attachments (if any) */}
                        {transaction.attachments && transaction.attachments.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Attachments</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {transaction.attachments.map((attachment, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                                            <span className="truncate flex-1">{attachment.file_name}</span>
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                <Download className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}