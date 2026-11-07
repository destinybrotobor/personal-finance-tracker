import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import InputError from '../input-error';
import httpClient from '@/lib/axios';
import { LoaderCircle, Save } from 'lucide-react';

interface BudgetFormProps {
    onSubmit: (formData: FormData) => void;
    errors: { [key: string]: string };
    processing: boolean;
}

interface BudgetFormState {
    user_id?: number;
    category_id: number;
    amount: number;
    period: string;
    purpose: string;
    start_date: string;
    end_date: string;
    auto_reset: boolean;
    description: string;
}

export default function BudgetForm({ onSubmit, errors, processing }: BudgetFormProps) {
    const [formData, setFormData] = useState<BudgetFormState>({
        user_id: undefined,
        category_id: 0,
        amount: 0,
        period: '',
        purpose: '',
        start_date: '',
        end_date: '',
        auto_reset: false,
        description: '',
    });
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

    useEffect(() => {
        httpClient.get(route('api.fetch-transaction-categories')).then((response) => {
            if (response.status === 200) {
                setCategories(response.data.body.categories);
            }
        });
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSelectChange = (name: keyof BudgetFormState, value: string | number | boolean) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value?.toString() ?? '');
        });
        onSubmit(data);
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <p className="mb-6">Please fill in the budget details below.</p>
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="category_id">Category*</Label>
                        <Select
                            name="category_id"
                            value={formData.category_id ? String(formData.category_id) : ''}
                            onValueChange={(value) =>
                                handleSelectChange('category_id', Number(value))
                            }
                            required
                        >
                            <SelectTrigger className="capitalize">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="capitalize">
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={String(category.id)}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.category_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount (£)*</Label>
                        <Input
                            id="amount"
                            name="amount"
                            type="number"
                            required
                            value={formData.amount}
                            onChange={handleChange}
                        />
                        <InputError message={errors.amount} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="purpose">Purpose</Label>
                        <Select
                            name="purpose"
                            value={formData.purpose}
                            onValueChange={(value) => handleSelectChange('purpose', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select purpose" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Savings">Savings</SelectItem>
                                <SelectItem value="Expenses">Expenses</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.purpose} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="period">Period*</Label>
                        <Select
                            name="period"
                            value={formData.period}
                            onValueChange={(value) => handleSelectChange('period', value)}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.period} />
                    </div>

                    {formData.period === 'custom' && (<>
                        <div className="grid gap-2">
                            <Label htmlFor="start_date">Start Date*</Label>
                            <Input
                                id="start_date"
                                name="start_date"
                                type="date"
                                required
                                value={formData.start_date}
                                onChange={handleChange}
                            />
                            <InputError message={errors.start_date} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="end_date">End Date*</Label>
                            <Input
                                id="end_date"
                                name="end_date"
                                type="date"
                                required
                                value={formData.end_date}
                                onChange={handleChange}
                            />
                            <InputError message={errors.end_date} />
                        </div>
                    </>)}

                    <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="auto_reset">Auto Reset</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="auto_reset"
                                name="auto_reset"
                                type="checkbox"
                                checked={formData.auto_reset}
                                onChange={handleChange}
                                className='h-4 w-4'
                            />
                            <Label htmlFor="auto_reset" className='font-normal'>Enable auto reset after each period</Label>
                        </div>
                        <InputError message={errors.auto_reset} />
                    </div>

                    <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="description">Description/Note</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                        />
                        <InputError message={errors.description} />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full md:w-auto md:self-end bg-corporate-blue/90 text-white"
                    disabled={processing}
                    variant="corporate"
                >
                    {processing ? <LoaderCircle className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                    Save Budget
                </Button>
            </form>
        </div>
    );
}
