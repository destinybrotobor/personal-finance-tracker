import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import httpClient from '@/lib/axios';
import moment from 'moment';

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Feedbacks', href: '/feedbacks' },
];


interface FeedbackFormState {
    type: string;
    title: string;
    description: string;
    attachment: File | null;
}

interface Feedback {
    id: number;
    type: string;
    title: string;
    description: string;
    attachment: string[];
    user: { firstname: string; lastname: string };
    created_at: string;
    [key: string]: string | File | null;
}

export default function Feedback() {
    const [formData, setFormData] = useState<FeedbackFormState>({
        type: '',
        title: '',
        description: '',
        attachment: null,
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [processing, setProcessing] = useState(false);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type, files } = e.target as HTMLInputElement;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'file' ? (files && files[0] ? files[0] : null) : value,
        }));
    };

    const handleSelectChange = (name: keyof FeedbackFormState, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setProcessing(true);
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'attachment' && value) {
                data.append(key, value);
            } else {
                data.append(key, value?.toString() ?? '');
            }
        });

        httpClient.post(route('api.submit-feedback'), data).then((response) => {
            if (response.status === 200) {
                setProcessing(false);
                setFormData({
                    type: '',
                    title: '',
                    description: '',
                    attachment: null,
                });
                fetchFeedbacks();
            }
        });
    };

    const fetchFeedbacks = async () => {
        await httpClient.get(route('api.fetch-feedbacks')).then((response) => {
            if (response.status === 200) {
                setFeedbacks(response.data.body.feedbacks);
            }
        });
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Feedbacks" />
            <div className='flex justify-center items-start flex-col md:flex-row gap-4'>
                <div className="p-4 flex-1/2">
                    <h2 className="text-xl font-semibold mb-4">Submit Feedback</h2>
                    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="type">Type*</Label>
                                <Select
                                    name="type"
                                    value={formData.type || 'general'}
                                    onValueChange={(value) => handleSelectChange('type', value)}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select feedback type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">General</SelectItem>
                                        <SelectItem value="complaint">Complaint</SelectItem>
                                        <SelectItem value="suggestion">Suggestion</SelectItem>
                                        <SelectItem value="request">Request</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.type} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="title">Title*</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="description">Description*</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    required
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="attachment">Attachment</Label>
                                <Input
                                    id="attachment"
                                    name="attachment"
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={handleChange}
                                />
                                <InputError message={errors.attachment} />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full md:w-auto md:self-end bg-corporate-blue/90 text-white"
                            disabled={processing}
                            variant="corporate"
                        >
                            {processing ? 'Submitting...' : 'Submit Feedback'}
                        </Button>
                    </form>
                </div>

                <div className="p-4 flex-1/2">
                    <h2 className="text-xl font-semibold mb-4">Feedbacks</h2>
                    <div className="grid grid-cols-1 gap-6">
                        {feedbacks.map((feedback: Feedback) => (
                            <div key={feedback.id} className="bg-white rounded-lg shadow-md p-4">
                                <h3 className="text-lg font-semibold mb-1">{feedback.title}</h3>
                                <p className="text-gray-600 text-sm">{feedback.description}</p>
                                <div className="mt-2 flex items-center divide-x-2">
                                    <span className="text-gray-500 text-sm pr-3">By: {feedback?.user?.firstname} {feedback?.user?.lastname}</span>
                                    <span className="text-gray-500 text-sm pl-3">{ moment(feedback?.created_at).fromNow() }</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
