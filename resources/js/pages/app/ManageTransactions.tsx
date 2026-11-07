import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { Transaction, SharedData, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import {
    ArrowDownCircle,
    ArrowLeft,
    ArrowUpCircle,
    CalendarIcon,
    Eye,
    Fence,
    Filter,
    MoreVertical,
    PiggyBank,
    Plus,
    ReceiptText,
    Repeat,
    Trash2,
    Edit,
    Download,
    Search,
    X,
    TrendingUp,
    TrendingDown,
    Wallet
} from 'lucide-react';
import { format } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import httpClient from '@/lib/axios';
import { useInitials } from '@/hooks/use-initials';
import { Skeleton } from '@/components/ui/skeleton';
import CustomModal from '@/components/custom/CustomModal';
import TransactionForm from '@/components/custom/TransactionForm';
import TransactionDetails from '@/components/custom/TransactionDetails';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormattedValue } from '@/hooks/useFormattedValue';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Manage Transactions',
        href: '/manage-transactions'
    }
];

export interface TransactionPagination {
    current_page: number;
    data: Transaction[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export default function ManageTransactions() {
    const props = usePage<SharedData>().props;
    const user = props.auth.user;

    const urlSearchParams = new URLSearchParams(window.location.search);
    const type = urlSearchParams.get('type');

    const [transactions, setTransactions] = useState<TransactionPagination>();
    const [fetching, setFetching] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

    type Category = { id: number; name: string, type: string };
    const [categories, setCategories] = useState<Category[]>([]);
    const [showCategories, setShowCategories] = useState(false);
    const [currentType, setCurrentType] = useState(type || 'all');
    const formattedValue = useFormattedValue();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const [showTransactionDetails, setShowTransactionDetails] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    // Stats
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        totalSavings: 0,
        netAmount: 0
    });

    // Handler for adding a transaction
    const handleAddTransaction = async (formData: FormData) => {
        setProcessing(true);
        try {
            await httpClient.post(route('api.add-transaction'), formData)
                .then(response => {
                    if (response.status === 200) {
                        setShowAddModal(false);
                        fetchTransactions();
                        setErrors({});
                        toast.success('Transaction added successfully');
                    }
                })
                .catch(error => {
                    if (error.response && error.response.status === 422) {
                        setErrors(error.response?.data?.errors || {});
                    }
                    toast.error('Failed to add transaction. Please check the form and try again.');
                });
        } catch (error: any) {
            setErrors(error.response?.data?.errors || {});
        }
        setProcessing(false);
    };

    // Handler for editing a transaction
    const handleEditTransaction = async (formData: FormData) => {
        if (!editingTransaction) return;

        setProcessing(true);
        try {
            await httpClient.post(route('api.update-transaction', { id: editingTransaction.id }), formData)
                .then(response => {
                    if (response.status === 200) {
                        setShowEditModal(false);
                        setEditingTransaction(null);
                        fetchTransactions();
                        setErrors({});
                        toast.success('Transaction updated successfully');
                    }
                })
                .catch(error => {
                    if (error.response && error.response.status === 422) {
                        setErrors(error.response?.data?.errors || {});
                    }
                    toast.error('Failed to update transaction. Please check the form and try again.');
                });
        } catch (error: any) {
            setErrors(error.response?.data?.errors || {});
        }
        setProcessing(false);
    };

    // Handler for deleting a transaction
    const handleDeleteTransaction = async () => {
        if (!transactionToDelete) return;

        setProcessing(true);
        try {
            await httpClient.delete(route('api.delete-transaction', { id: transactionToDelete.id }))
                .then(response => {
                    if (response.status === 200) {
                        setDeleteDialogOpen(false);
                        setTransactionToDelete(null);
                        fetchTransactions();
                        toast.success('Transaction deleted successfully');
                    }
                })
                .catch(error => {
                    toast.error('Failed to delete transaction. Please try again.');
                });
        } catch (error) {
            toast.error('Failed to delete transaction. Please try again.');
        }
        setProcessing(false);
    };

    const fetchTransactions = async (type: string = currentType) => {
        setFetching(true);
        try {
            const response = await httpClient.get(route('api.fetch-transactions', {
                type,
                search: searchQuery,
                start_date: startDate,
                end_date: endDate
            }));
            if (response.status === 200) {
                setTransactions(response.data.body.transactions);
                calculateStats(response.data.body.transactions?.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch transactions');
            toast.error('Failed to fetch transactions');
        }
        setFetching(false);
    };

    const calculateStats = (transactions: Transaction[]) => {
        const stats = {
            totalIncome: 0,
            totalExpenses: 0,
            totalSavings: 0,
            netAmount: 0
        };

        transactions.forEach(transaction => {
            const amount = typeof transaction.amount === 'string'
                ? parseFloat(transaction.amount)
                : Number(transaction.amount);

            if (transaction.type === 'income') {
                stats.totalIncome += amount;
            } else if (transaction.type === 'expenses') {
                stats.totalExpenses += amount;
            } else if (transaction.type === 'savings') {
                stats.totalSavings += amount;
            }
        });

        stats.netAmount = stats.totalIncome - stats.totalExpenses - stats.totalSavings;
        setStats(stats);
    };

    useEffect(() => {
        fetchTransactions();
    }, [searchQuery]);

    const fetchCategories = async () => {
        try {
            const response = await httpClient.get(route('api.fetch-transaction-categories'));
            if (response.status === 200) {
                setCategories(response.data.body.categories);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const addCategory = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setProcessing(true);
        try {
            event.currentTarget.reset();
            await httpClient.post(route('api.add-transaction-category'), formData)
                .then(response => {
                    if (response.status === 200) {
                        fetchCategories();
                        setErrors({});
                        toast.success('Category added successfully');
                    }
                })
                .catch(error => {
                    if (error.response && error.response.status === 422) {
                        setErrors(error.response?.data?.errors || {});
                    }
                    toast.error('Failed to add category. Please check the form and try again.');
                });
        } catch (error: any) {
            setErrors(error.response?.data?.errors || {});
        }
        setProcessing(false);
    };

    async function deleteCategory(id: any): Promise<void> {
        if (!window.confirm('You are about to delete this category. Click OK to proceed.')) return;
        setProcessing(true);
        try {
            const response = await httpClient.delete(route('api.delete-transaction-category', { id }));
            if (response.status === 200) {
                fetchCategories();
                toast.success('Category deleted successfully');
            } else {
                toast.error('Failed to delete category.');
            }
        } catch (error) {
            toast.error('Failed to delete category.');
        }
        setProcessing(false);
    }

    useEffect(() => {
        fetchCategories();
    }, []);

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'income': return <ArrowDownCircle className="h-5 w-5 text-green-500" />;
            case 'expenses': return <ArrowUpCircle className="h-5 w-5 text-red-500" />;
            case 'savings': return <PiggyBank className="h-5 w-5 text-blue-500" />;
            default: return <ReceiptText className="h-5 w-5 text-gray-500" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'income': return 'text-green-600 bg-green-50 border-green-200';
            case 'expenses': return 'text-red-600 bg-red-50 border-red-200';
            case 'savings': return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Transactions" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
                <div className="container mx-auto p-4 space-y-6">
                    {/* Header Section */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm border">
                                    <Repeat className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Manage Transactions</h1>
                                    <p className="text-gray-600">Track and manage your income, expenses, and savings</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <Button
                                variant="outline"
                                onClick={() => setShowCategories(true)}
                                className="flex items-center gap-2"
                            >
                                <ReceiptText className="h-4 w-4" />
                                <span>Categories</span>
                            </Button>
                            <Button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-2 bg-corporate-gold text-white"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add Transaction</span>
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-gradient-to-r from-green-50 to-green-100/50 border-green-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-green-700">Total Income</CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-600 absolute top-4 right-4" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-900">{formattedValue(stats.totalIncome, true, "NGN")}</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-red-50 to-red-100/50 border-red-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-red-700">Total Expenses</CardTitle>
                                <TrendingDown className="h-4 w-4 text-red-600 absolute top-4 right-4" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-900">{formattedValue(stats.totalExpenses, true, "NGN")}</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-blue-700">Total Savings</CardTitle>
                                <PiggyBank className="h-4 w-4 text-blue-600 absolute top-4 right-4" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-900">{formattedValue(stats.totalSavings, true, "NGN")}</div>
                            </CardContent>
                        </Card>

                        <Card className={`bg-gradient-to-r from-${stats.netAmount >= 0 ? 'green' : 'red'}-50 to-${stats.netAmount >= 0 ? 'green' : 'red'}-100/50 border-${stats.netAmount >= 0 ? 'green' : 'red'}-200`}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-700">Net Amount</CardTitle>
                                <Wallet className="h-4 w-4 text-gray-600 absolute top-4 right-4" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${stats.netAmount >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                                    {formattedValue(Math.abs(stats.netAmount), true, "NGN")}
                                    {stats.netAmount < 0 && ' (-)'}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters and Search Section */}
                    {!showTransactionDetails && <Card>
                        <CardHeader>
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div className="space-y-1">
                                    <CardTitle>Transaction History</CardTitle>
                                    <CardDescription>View and manage your transaction records</CardDescription>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search transactions..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 w-full lg:w-64"
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-32"
                                        />
                                        <Input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-32"
                                        />
                                        <Button
                                            onClick={() => fetchTransactions()}
                                            variant="outline"
                                            className="flex items-center gap-2"
                                        >
                                            <Filter className="h-4 w-4" />
                                            Filter
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {/* Type Tabs */}
                            <Tabs value={currentType} onValueChange={(value) => { setCurrentType(value); fetchTransactions(value); }} className="w-full">
                                <TabsList className="grid w-full grid-cols-4 mb-6">
                                    <TabsTrigger value="all" className="flex items-center gap-2">
                                        <Repeat className="h-4 w-4" />
                                        All
                                    </TabsTrigger>
                                    <TabsTrigger value="income" className="flex items-center gap-2">
                                        <ArrowDownCircle className="h-4 w-4 text-green-500" />
                                        Income
                                    </TabsTrigger>
                                    <TabsTrigger value="expenses" className="flex items-center gap-2">
                                        <ArrowUpCircle className="h-4 w-4 text-red-500" />
                                        Expenses
                                    </TabsTrigger>
                                    <TabsTrigger value="savings" className="flex items-center gap-2">
                                        <PiggyBank className="h-4 w-4 text-blue-500" />
                                        Savings
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value={currentType} className="m-0">
                                    {/* Transactions Table */}
                                    {fetching ? (
                                        <div className="space-y-4">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                                                    <Skeleton className="h-12 w-12 rounded-full" />
                                                    <div className="space-y-2 flex-1">
                                                        <Skeleton className="h-4 w-1/4" />
                                                        <Skeleton className="h-3 w-1/3" />
                                                    </div>
                                                    <Skeleton className="h-4 w-20" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : transactions?.data && transactions.data.length > 0 ? (
                                        <div className="space-y-3">
                                            {transactions.data.map((transaction) => (
                                                <div
                                                    key={transaction.id}
                                                    className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-shadow duration-200"
                                                >
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className={`p-3 rounded-full ${getTypeColor(transaction.type).split(' ')[1]}`}>
                                                            {getTransactionIcon(transaction.type)}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-semibold text-gray-900 capitalize">
                                                                    {transaction.type}
                                                                </h3>
                                                                {transaction.category && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        {transaction.category.name}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600 line-clamp-1">
                                                                {transaction.description || 'No description'}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {new Date(transaction.transaction_date).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <div className={`text-lg font-semibold ${transaction.type === 'income' ? 'text-green-600' :
                                                                transaction.type === 'expenses' ? 'text-red-600' : 'text-blue-600'
                                                                }`}>
                                                                {transaction.type === 'income' ? '+' : '-'}
                                                                {formattedValue(transaction.amount, true, "NGN")}
                                                            </div>
                                                        </div>

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setSelectedTransaction(transaction);
                                                                        setShowTransactionDetails(true);
                                                                    }}
                                                                >
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    View Details
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setEditingTransaction(transaction);
                                                                        setShowEditModal(true);
                                                                    }}
                                                                >
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-red-600"
                                                                    onClick={() => {
                                                                        setTransactionToDelete(transaction);
                                                                        setDeleteDialogOpen(true);
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Pagination */}
                                            {transactions.last_page > 1 && (
                                                <div className="flex items-center justify-between pt-4 border-t">
                                                    <div className="text-sm text-gray-600">
                                                        Showing {transactions.from} to {transactions.to} of {transactions.total} results
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={transactions.current_page === 1}
                                                            onClick={() => fetchTransactions(currentType)}
                                                        >
                                                            Previous
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={transactions.current_page === transactions.last_page}
                                                            onClick={() => fetchTransactions(currentType)}
                                                        >
                                                            Next
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <ReceiptText className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
                                            <p className="text-gray-600 mb-6">Get started by creating your first transaction.</p>
                                            <Button onClick={() => setShowAddModal(true)}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Transaction
                                            </Button>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>}

                    {/* Transaction Details Modal */}
                    {(selectedTransaction && showTransactionDetails) && (
                        <TransactionDetails
                            transaction={selectedTransaction}
                            onClose={() => {
                                setShowTransactionDetails(false);
                                setSelectedTransaction(null);
                            }}
                            onEdit={(transaction) => {
                                setEditingTransaction(transaction);
                                setShowEditModal(true);
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Add Transaction Modal */}
            <CustomModal show={showAddModal} onClose={() => setShowAddModal(false)} maxWidth="2xl">
                <div className="flex flex-col max-h-[90vh]">
                    <div className="flex items-center justify-between p-6 border-b">
                        <h2 className="text-xl font-semibold">Add New Transaction</h2>
                        <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        <TransactionForm
                            onSubmit={handleAddTransaction}
                            errors={errors}
                            processing={processing}
                        />
                    </div>
                </div>
            </CustomModal>

            {/* Edit Transaction Modal */}
            <CustomModal show={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="2xl">
                <div className="flex flex-col max-h-[90vh]">
                    <div className="flex items-center justify-between p-6 border-b">
                        <h2 className="text-xl font-semibold">Edit Transaction</h2>
                        <Button variant="ghost" size="sm" onClick={() => setShowEditModal(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        {editingTransaction && (
                            <TransactionForm
                                transaction={editingTransaction}
                                onSubmit={handleEditTransaction}
                                errors={errors}
                                processing={processing}
                                isEditing
                            />
                        )}
                    </div>
                </div>
            </CustomModal>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the transaction
                            {transactionToDelete && ` for ${formattedValue(transactionToDelete.amount, true, "NGN")}`}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteTransaction}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={processing}
                        >
                            {processing ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Categories Modal */}
            <CustomModal show={showCategories} onClose={() => setShowCategories(false)} maxWidth="md">
                <div className="flex flex-col max-h-[90vh]">
                    <div className="flex items-center justify-between p-6 border-b">
                        <h2 className="text-xl font-semibold">Manage Categories</h2>
                        <Button variant="ghost" size="sm" onClick={() => setShowCategories(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        <form onSubmit={addCategory} className="mb-6">
                            <div className="flex gap-2">
                                <Select name="type" defaultValue="Expenses">
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Income">Income</SelectItem>
                                        <SelectItem value="Expenses">Expenses</SelectItem>
                                        <SelectItem value="Savings">Savings</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    name="category"
                                    placeholder="Enter category name"
                                    className="flex-1"
                                />
                                <Button type="submit" disabled={processing}>
                                    Add
                                </Button>
                            </div>
                        </form>

                        <div className="space-y-3">
                            {categories.map((category) => (
                                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <span className="font-medium capitalize">{category.name}</span>
                                        <Badge variant="outline" className="ml-2">
                                            {category.type}
                                        </Badge>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteCategory(category.id)}
                                        disabled={processing}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CustomModal>
        </AppLayout>
    );
}