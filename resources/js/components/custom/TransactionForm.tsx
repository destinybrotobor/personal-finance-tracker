import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Attachment, Transaction } from '@/types';
import InputError from '../input-error';
import httpClient from '@/lib/axios';
import { LoaderCircle, ReceiptText, Calendar, PoundSterling, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TransactionFormProps {
    onSubmit: (formData: FormData) => void;
    errors: { [key: string]: string };
    processing: boolean;
    defaultType?: string;
    transaction?: Transaction | null;
    isEditing?: boolean;
}

interface TransactionFormData {
    id?: number;
    transaction_date: string;
    amount: number | string;
    type: string;
    category: string;
    payment_method: string;
    description?: string;
    attachments?: File[];
}

export default function TransactionForm({
    onSubmit,
    errors,
    processing,
    defaultType,
    transaction,
    isEditing = false
}: TransactionFormProps) {
    const [formData, setFormData] = useState<TransactionFormData>({
        transaction_date: '',
        amount: '',
        type: defaultType || 'income',
        category: '',
        payment_method: '',
        description: '',
    });
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    // Initialize form with transaction data when editing
    useEffect(() => {
        if (transaction && isEditing) {
            setFormData({
                id: transaction.id,
                transaction_date: transaction.transaction_date.split('T')[0], // Format date for input
                amount: transaction.amount,
                type: transaction.type,
                category: transaction.category?.name || '',
                payment_method: transaction.payment_method || '',
                description: transaction.description || '',
            });
        }
    }, [transaction, isEditing]);

    useEffect(() => {
        fetchCategories();
    }, []);

    // Update categories when type changes
    useEffect(() => {
        if (formData.type && categories.length > 0) {
            // Reset category if it doesn't match the current type
            const currentCategory = categories.find(cat =>
                cat.name === formData.category && cat.type.toLowerCase() === formData.type.toLowerCase()
            );
            if (!currentCategory && formData.category) {
                setFormData(prev => ({ ...prev, category: '' }));
            }
        }
    }, [formData.type, categories]);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newFiles = Array.from(files);
            setSelectedFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const data = new FormData();

        // Append all form data
        Object.keys(formData).forEach(key => {
            const value = formData[key as keyof TransactionFormData];
            if (value !== undefined && value !== null && value !== '') {
                if (key === 'amount' && typeof value === 'number') {
                    data.append(key, value.toString());
                } else {
                    data.append(key, value as string);
                }
            }
        });

        // Append files
        selectedFiles.forEach((file, index) => {
            data.append(`attachments[${index}]`, file);
        });

        // Add _method for PUT if editing
        if (isEditing) {
            data.append('_method', 'PUT');
        }

        onSubmit(data);
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'income': return 'text-green-600 bg-green-50 border-green-200';
            case 'expenses': return 'text-red-600 bg-red-50 border-red-200';
            case 'savings': return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'income': return '💰';
            case 'expenses': return '💸';
            case 'savings': return '🏦';
            default: return '📊';
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-2">
            <Card className="border-0 shadow-none">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <ReceiptText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">
                                {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
                            </CardTitle>
                            <CardDescription>
                                {isEditing
                                    ? 'Update your transaction details below.'
                                    : 'Fill in the transaction details to track your finances.'
                                }
                            </CardDescription>
                        </div>
                    </div>

                    {isEditing && transaction && (
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className={getTypeColor(transaction.type)}>
                                {getTypeIcon(transaction.type)} {transaction.type.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-gray-500">
                                Created {new Date(transaction.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </CardHeader>

                <CardContent className="p-0">
                    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Transaction Date */}
                            <div className="grid gap-2">
                                <Label htmlFor="transaction_date" className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Transaction Date*
                                </Label>
                                <Input
                                    id="transaction_date"
                                    name="transaction_date"
                                    type="date"
                                    max={new Date().toISOString().split('T')[0]}
                                    required
                                    value={formData.transaction_date}
                                    onChange={handleChange}
                                    className="h-11"
                                />
                                <InputError message={errors.transaction_date} />
                            </div>

                            {/* Amount */}
                            <div className="grid gap-2">
                                <Label htmlFor="amount" className="flex items-center gap-2">
                                    <PoundSterling className="h-4 w-4" />
                                    Amount (&#8358;)*
                                </Label>
                                <Input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    value={formData.amount}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="h-11"
                                />
                                <InputError message={errors.amount} />
                            </div>

                            {/* Type */}
                            <div className="grid gap-2">
                                <Label htmlFor="type">Type*</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value, category: '' }))}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="income" className="flex items-center gap-2">
                                            <span className="text-green-600">💰</span>
                                            Income
                                        </SelectItem>
                                        <SelectItem value="expenses" className="flex items-center gap-2">
                                            <span className="text-red-600">💸</span>
                                            Expenses
                                        </SelectItem>
                                        <SelectItem value="savings" className="flex items-center gap-2">
                                            <span className="text-blue-600">🏦</span>
                                            Savings
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.type} />
                            </div>

                            {/* Category */}
                            <div className="grid gap-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                                >
                                    <SelectTrigger className="h-11 capitalize">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent className="capitalize">
                                        {categories
                                            .filter(category => category.type.toLowerCase() === formData.type.toLowerCase())
                                            .map((category) => (
                                                <SelectItem key={category.id} value={category.name} className="capitalize">
                                                    {category.name}
                                                </SelectItem>
                                            ))
                                        }
                                        {categories.filter(cat => cat.type.toLowerCase() === formData.type.toLowerCase()).length === 0 && (
                                            <SelectItem value=" " disabled>
                                                No categories available for {formData.type}
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.category} />
                            </div>

                            {/* Payment Method */}
                            <div className="grid gap-2">
                                <Label htmlFor="payment_method">Payment Method</Label>
                                <Select
                                    value={formData.payment_method}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cash">💵 Cash</SelectItem>
                                        <SelectItem value="Credit Card">💳 Credit Card</SelectItem>
                                        <SelectItem value="Bank Transfer">🏦 Bank Transfer</SelectItem>
                                        <SelectItem value="Wallet">👛 Wallet</SelectItem>
                                        <SelectItem value="Debit Card">💳 Debit Card</SelectItem>
                                        <SelectItem value="Mobile Payment">📱 Mobile Payment</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.payment_method} />
                            </div>

                            {/* Attachments */}
                            <div className="grid gap-2">
                                <Label className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Attachments
                                </Label>
                                <Input
                                    type="file"
                                    multiple
                                    accept="image/*,.pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                    className="h-11"
                                />
                                <InputError message={errors.attachments} />

                                {/* Selected files preview */}
                                {selectedFiles.length > 0 && (
                                    <div className="space-y-2 mt-2">
                                        <Label className="text-sm text-gray-600">Selected files:</Label>
                                        {selectedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                                                <span className="truncate flex-1">{file.name}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFile(index)}
                                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="grid gap-2">
                            <Label htmlFor="description" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Description/Note
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter transaction details, notes, or purpose..."
                                rows={4}
                                className="resize-none"
                            />
                            <InputError message={errors.description} />
                        </div>

                        {/* Existing attachments for editing */}
                        {isEditing && transaction?.attachments && transaction.attachments.length > 0 && (
                            <div className="grid gap-2">
                                <Label className="text-sm text-gray-600">Current Attachments:</Label>
                                <div className="space-y-2">
                                    {transaction.attachments.map((attachment, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm">
                                            <span className="truncate flex-1">{attachment.file_name}</span>
                                            <Badge variant="outline" className="text-xs">
                                                Existing
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-4 border-t">
                            <div className="text-sm text-gray-500">
                                {isEditing ? 'Make changes and update your transaction.' : 'All fields marked with * are required.'}
                            </div>
                            <Button
                                type="submit"
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8"
                                disabled={processing}
                                size="lg"
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                {isEditing ? 'Update Transaction' : 'Add Transaction'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}