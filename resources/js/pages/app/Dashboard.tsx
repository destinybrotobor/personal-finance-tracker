import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { SharedData, Transaction, type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowDownCircle, ArrowUpCircle, Bell, CalendarIcon, Handshake, Phone, PieChart, PiggyBank, ReceiptText, Repeat, Target, User, Plus, Settings, ArrowLeft, X } from 'lucide-react';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import BudgetSummaryChart from '@/components/custom/BudgetSummaryChart';
import { use, useEffect, useState } from 'react';
import httpClient from '@/lib/axios';
import { useFormattedValue } from '@/hooks/useFormattedValue';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartAreaGradient } from '@/components/charts/ChartAreaGradient';
import CustomModal from '@/components/custom/CustomModal';
import TransactionForm from '@/components/custom/TransactionForm';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const user = usePage<SharedData>().props.auth.user;
    const [transactions, setTransactions] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [fetching, setFetching] = useState(false);
    const [notifications, setNotifications] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedType, setSelectedType] = useState<'income' | 'expenses' | 'savings'>('income');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const formattedValue = useFormattedValue();

    const fetchAnalysis = async () => {
        setFetching(true);
        const response = await httpClient.get(route('api.fetch-dashboard-analysis'));
        setChartData(response.data.body.analysis);
        setNotifications(response.data.body.unread_notifications);
        const transactionsResponse = await httpClient.get(route('api.fetch-dashboard-transactions'));
        setTransactions(transactionsResponse.data.body.transactions);
        setFetching(false);
    };

    useEffect(() => {
        fetchAnalysis();
    }, []);

    const handleAddTransaction = async (formData: FormData) => {
        setProcessing(true);
        try {
            await httpClient.post(route('api.add-transaction'), formData)
                .then(response => {
                    if (response.status === 200) {
                        setShowAddModal(false);
                        fetchAnalysis();
                        setErrors({});
                    }
                })
                .catch(error => {
                    if (error.response && error.response.status === 422) {
                        setErrors(error.response?.data?.errors || {});
                    }
                    alert('Failed to add transaction. Please check the form and try again.');
                    console.log('Error adding transaction:', error.response?.data?.errors);
                });
        } catch (error: any) {
            setErrors(error.response?.data?.errors || {});
        }
        setProcessing(false);
    };

    const goToAdd = (type: 'income' | 'expenses' | 'savings') => {
        // navigate to the transactions page with type filter (adjust route as needed)
        router.visit(route('manage_transactions'), { data: { type } });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <section className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex gap-3 items-start justify-start">
                            <Handshake className="h-6 w-6 md:h-8 md:w-8 mt-1 text-corporate-blue" />
                            <div>
                                <h2 className="text-2xl md:text-3xl mb-2">Hello, <strong className="font-black">{user.firstname}</strong></h2>
                            </div>
                        </div>
                    </div>
                    <aside className="flex items-center justify-end w-full gap-2">
                        <div className="flex gap-2">
                            <button type="button" onClick={() => {setSelectedType('income'); setShowAddModal(true)}} className="inline-flex items-center gap-2 p-1 md:p-2 md:px-4 rounded-lg bg-green-50 border border-green-200 text-sm">
                                <Plus className="h-4 w-4 text-green-600" /> <span className="hidden md:inline-block">Add</span> Income
                            </button>
                            <button type="button" onClick={() => {setSelectedType('expenses'); setShowAddModal(true)}} className="inline-flex items-center gap-2 p-1 md:p-2 md:px-4 rounded-lg bg-red-50 border border-red-200 text-sm">
                                <Plus className="h-4 w-4 text-red-600" /> <span className="hidden md:inline-block">Add</span>  Expense
                            </button>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="border border-corporate-blue/50 backdrop-blur-2xl bg-white/50 rounded-sm md:rounded-lg p-1 md:p-2 md:px-4 shadow-sm">
                                    <div className="flex gap-3 items-center justify-center space-x-2">
                                        <CalendarIcon className="h-5 w-5 text-corporate-blue mx-auto" />
                                        <span className="hidden md:block text-sm font-medium text-slate-900">
                                            {format(new Date(), 'PPP')}
                                        </span>
                                    </div>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-full md:w-auto backdrop-blur-2xl block md:hidden">
                                <DropdownMenuItem>
                                    <div className="flex items-center space-x-2">
                                        <CalendarIcon className="h-5 w-5 text-corporate-blue" />
                                        <span className="text-sm font-medium text-slate-900">
                                            {format(new Date(), 'PPP')}
                                        </span>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </aside>
                </section>

                <section className='flex gap-3 flex-wrap md:flex-nowrap mb-3 md:mb-5'>
                    <Link href={route('manage_transactions')} className="border inline-flex flex-grow md:flex-grow-0 items-center justify-between gap-2 py-2 px-4 rounded-lg bg-white/50 backdrop-blur-2xl shadow-sm">
                        <Repeat className="h-5 w-5 text-corporate-blue" />
                        <div className="flex-1">
                            <h3 className="text-xs md:text-sm font-medium">Transactions</h3>
                        </div>
                    </Link>
                    <Link href={route('budgeting')} className="border inline-flex flex-grow md:flex-grow-0 items-center justify-between gap-2 py-2 px-4 rounded-lg bg-white/50 backdrop-blur-2xl shadow-sm">
                        <PieChart className="h-5 w-5 text-corporate-blue" />
                        <div className="flex-1">
                            <h3 className="text-xs md:text-sm font-medium">Budgeting</h3>
                        </div>
                    </Link>
                    <Link href={route('notifications')} className="border inline-flex flex-grow md:flex-grow-0 items-center justify-between gap-2 py-2 px-4 rounded-lg bg-white/50 backdrop-blur-2xl shadow-sm relative">
                        <Bell className="h-5 w-5 text-corporate-blue" />
                        <div className="flex-1">
                            <h3 className="text-xs md:text-sm font-medium">Notifications</h3>
                            {notifications > 0 && (
                                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                    {notifications}
                                </span>
                            )}
                        </div>
                    </Link>
                </section>
                <section className='grid gap-5 lg:grid-cols-5'>
                    <aside className='lg:col-span-3 min-h-10 rounded-xl shadow-2xl bg-white/50 backdrop-blur-2xl border border-corporate-blue/50 mb-4 lg:mb-10'>
                        {(chartData && chartData != null) ? (
                            <div>
                                <ChartAreaGradient refresh={fetching} />
                            </div>
                        ) : <div className="flex flex-col items-center justify-center h-full p-4 py-10">
                            <span className="text-4xl mb-4">📊</span>
                            <h4 className="text-lg font-semibold mb-2 text-slate-700">No Analysis and Report</h4>
                            <p className="text-sm text-slate-500 text-center">
                                You have not generated any reports yet. Your analysis and reports will be displayed here once available.
                            </p>
                        </div>}
                    </aside>

                    <aside className='lg:col-span-2 min-h-10 mb-4 lg:mb-10'>
                        <BudgetSummaryChart refresh={fetching} />
                    </aside>

                    {transactions.length === 0 ? (
                        <div className='lg:col-span-5'>
                            {fetching ? (
                                <section className="flex flex-col gap-4 p-4 md:py-8 lg:col-span-3 min-h-10 rounded-xl shadow-2xl bg-white/50 backdrop-blur-2xl border border-corporate-blue/50 max-w-full overflow-x-auto">
                                    <table className="w-full">
                                        <tbody>
                                            {Array.from({ length: 2 }).map((_, i) => (
                                                <tr key={i} className="border-b border-corporate-blue/50">
                                                    <td className="pl-4 pr-2 py-2">
                                                        <Skeleton className="h-4 w-28" />
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        <Skeleton className="h-4 w-28" />
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        <Skeleton className="h-4 w-28" />
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        <Skeleton className="h-4 w-28" />
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        <Skeleton className="h-4 w-28" />
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        <Skeleton className="h-4 w-28" />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </section>
                            ) : (
                                <aside className='lg:col-span-5 min-h-10 rounded-xl shadow-2xl bg-white/50 backdrop-blur-2xl border border-corporate-blue/50 p-4'>
                                    <div className="flex flex-col items-center justify-center h-full py-10">
                                        <span className="text-4xl mb-4">🔄</span>
                                        <h4 className="text-lg font-semibold mb-2 text-slate-700">No transaction yet</h4>
                                        <p className="text-sm text-slate-500 text-center">
                                            You have not recorded any transactions yet. Once you do, your transaction history will appear here.
                                        </p>
                                    </div>
                                </aside>)}
                        </div>
                    ) : (<section className='lg:col-span-5 flex flex-col'>
                        <div className='flex justify-between items-center pb-4 px-2 w-full'>
                            <span className='text-sm font-bold'>
                                Recent Transaction Records
                            </span>
                            <span className='text-sm'>
                                <Link href={route('manage_transactions')} className="text-corporate-blue">
                                    View All
                                </Link>
                            </span>
                        </div>

                        {transactions && transactions.length > 0 && (<aside className='min-h-10 flex-grow rounded-xl shadow-2xl bg-white/50 backdrop-blur-2xl border border-corporate-blue/50'>
                            <table className="w-full table-auto hidden md:table">
                                <thead className="text-left border-b border-corporate-blue/50">
                                    <tr>
                                        <th className="py-2 px-4">Type</th>
                                        <th className="py-2 px-4">Amount</th>
                                        <th className="py-2 px-4 hidden md:table-cell">Transaction Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((transaction: Transaction) => <tr key={transaction.id} className="not-last:border-b border-corporate-blue/50 text-left">
                                        <td className="py-2 px-4">
                                            <div className="flex items-center">
                                                {transaction.type === 'income' && (
                                                    <ArrowDownCircle className="h-5 w-5 text-green-500 capitalize flex-shrink-0" />
                                                )}
                                                {transaction.type === 'expenses' && (
                                                    <ArrowUpCircle className="h-5 w-5 text-red-500 capitalize flex-shrink-0" />
                                                )}
                                                {transaction.type === 'savings' && (
                                                    <PiggyBank className="h-5 w-5 text-corporate-blue capitalize flex-shrink-0" />
                                                )}
                                                <div className="ml-2 font-medium capitalize">
                                                    {transaction.type} {transaction?.category && (<span className="text-corporate-blue lowercase text-xs">({transaction?.category.name})</span>)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-2 px-4">{formattedValue(transaction.amount, true, "GBP")}</td>
                                        <td className="py-2 px-4 line-clamp-1 hidden md:table-cell">{new Date(transaction.transaction_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                    </tr>)}
                                </tbody>
                            </table>
                            <div className="md:hidden text-left text-sm overflow-x-auto">
                                {transactions.map((transaction: Transaction) => (
                                    <div key={transaction.id} className="flex items-center justify-between gap-4 py-2 px-4 not-last:border-b border-corporate-blue/50">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 items-center flex gap-2">
                                                {transaction.type === 'income' && (
                                                    <ArrowDownCircle className="h-5 w-5 text-green-500 capitalize flex-shrink-0" />
                                                )}
                                                {transaction.type === 'expenses' && (
                                                    <ArrowUpCircle className="h-5 w-5 text-red-500 capitalize flex-shrink-0" />
                                                )}
                                                {transaction.type === 'savings' && (
                                                    <PiggyBank className="h-5 w-5 text-corporate-blue capitalize flex-shrink-0" />
                                                )}
                                                <div className="ml-2 font-medium capitalize leading-3">
                                                    {transaction.type} {transaction?.category && (<span className="text-corporate-blue lowercase text-xs">({transaction?.category.name})</span>)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <span className="font-medium">{formattedValue(transaction.amount, true, "GBP")}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </aside>)}
                    </section>)}
                </section>
            </div>

            <section>
                <CustomModal show={showAddModal} maxWidth="2xl">
                    <section className="flex flex-col max-h-screen sm:max-h-[90vh]">
                        <header className="">
                            <div className="py-2 px-4 flex justify-between items-center">
                                <div className="flex items-center gap-2 ">
                                    <button
                                        className="flex items-center gap-2 text-slate-700 hover:text-airnex-blue-500 md:hidden mr-10"
                                        onClick={() => setShowAddModal(false)}
                                    >
                                        <ArrowLeft />{" "}
                                        <span className="text-sm">Back</span>
                                    </button>
                                    <h1 className="text-base font-bold">
                                        Add Transaction
                                    </h1>
                                </div>
                                <button
                                    className="text-slate-700 hover:text-airnex-blue-500 hidden md:block"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    <X />
                                </button>
                            </div>
                        </header>

                        <section className="flex-grow overflow-y-auto">
                            {/* Content Here */}
                            <TransactionForm onSubmit={handleAddTransaction} errors={errors} processing={processing} defaultType={selectedType} />
                        </section>
                    </section>
                </CustomModal>
            </section>
        </AppLayout>
    );
}
