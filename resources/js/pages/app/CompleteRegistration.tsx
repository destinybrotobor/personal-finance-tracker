import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Complete Registration',
        href: '/complete-registration',
    },
];

type RegistrationFormData = {
    address: string;
    ssn: string;
    city: string;
    state: string;
    zip: string;
    job_title: string;
    is_military: boolean;
    military_unit: string;
    emergency_contact: string;
    profile_picture: File | null;
    drivers_license: File | null;
    reference_fullname: string;
    reference_contact: string;
    reference_email: string;
    reference_relationship: string;
};

export default function CompleteRegistration() {
    const { data, setData, post, processing, errors, reset } = useForm<RegistrationFormData>({
        address: '',
        ssn: '',
        city: '',
        state: '',
        zip: '',
        job_title: '',
        is_military: false,
        military_unit: '',
        emergency_contact: '',
        profile_picture: null,
        reference_fullname: '',
        reference_contact: '',
        reference_email: '',
        reference_relationship: '',
        drivers_license: null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('save-complete-registration'), {
            onFinish: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Complete Registration" />
            <form
                onSubmit={submit}
                className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto"
                encType='multipart/form-data'
            >
                <div className="grid auto-rows-min gap-4 lg:grid-cols-2">
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border py-2 px-4">
                        <h1 className="text-2xl font-bold mb-4">Finalize Your Registration</h1>
                        <div>
                            <p className='mb-6'>Please fill in the following details to complete your registration.</p>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        disabled={processing}
                                        placeholder="Full address"
                                    />
                                    <InputError message={errors.address} className="mt-2" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="ssn">Social Security Number</Label>
                                    <Input
                                        id="ssn"
                                        type="text"
                                        required
                                        tabIndex={2}
                                        autoComplete="ssn"
                                        value={data.ssn}
                                        onChange={(e) => setData('ssn', e.target.value)}
                                        placeholder="123-45-6789"
                                    />
                                    <InputError message={errors.ssn} />
                                </div>

                                {/* <div className="grid gap-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        type="text"
                                        required
                                        tabIndex={3}
                                        autoComplete="city"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        placeholder="City"
                                    />
                                    <InputError message={errors.city} className="mt-2" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input
                                        id="state"
                                        type="text"
                                        required
                                        tabIndex={4}
                                        autoComplete="state"
                                        value={data.state}
                                        onChange={(e) => setData('state', e.target.value)}
                                        placeholder="State"
                                    />
                                    <InputError message={errors.state} className="mt-2" />
                                </div> */}

                                <div className="grid gap-2">
                                    <Label htmlFor="zip">ZIP Code</Label>
                                    <Input
                                        id="zip"
                                        type="text"
                                        required
                                        tabIndex={5}
                                        autoComplete="zip"
                                        value={data.zip}
                                        onChange={(e) => setData('zip', e.target.value)}
                                        placeholder="ZIP Code"
                                    />
                                    <InputError message={errors.zip} className="mt-2" />
                                </div>

                                <div className="flex gap-2 items-center">
                                    <Label htmlFor="is_military" className="flex-shrink-0">Are you in the military?</Label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="is_military"
                                                value="yes"
                                                checked={data.is_military === true}
                                                onChange={() => setData('is_military', true)}
                                                tabIndex={7}
                                            />
                                            <span className="ml-2">Yes</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="is_military"
                                                value="no"
                                                checked={data.is_military === false}
                                                onChange={() => setData('is_military', false)}
                                                tabIndex={7}
                                            />
                                            <span className="ml-2">No</span>
                                        </label>
                                    </div>
                                    <InputError message={errors.is_military} className="mt-2" />
                                </div>

                                {data.is_military ? (
                                    <div className="grid gap-2">
                                        <Label htmlFor="military_unit">Military Unit</Label>
                                        <Input
                                            id="military_unit"
                                            type="text"
                                            required
                                            tabIndex={8}
                                            autoComplete="military-unit"
                                            value={data.military_unit}
                                            onChange={(e) => setData('military_unit', e.target.value)}
                                            placeholder="Military Unit"
                                        />
                                        <InputError message={errors.military_unit} className="mt-2" />
                                    </div>
                                ) : (<div className="grid gap-2">
                                    <Label htmlFor="job_title">Job Title</Label>
                                    <Input
                                        id="job_title"
                                        type="text"
                                        required
                                        tabIndex={6}
                                        autoComplete="job-title"
                                        value={data.job_title}
                                        onChange={(e) => setData('job_title', e.target.value)}
                                        placeholder="Job Title"
                                    />
                                    <InputError message={errors.job_title} className="mt-2" />
                                </div>
                                )}

                                <div className="grid gap-2">
                                    <Label htmlFor="emergency_contact">Emergency Contact</Label>
                                    <Input
                                        id="emergency_contact"
                                        type="text"
                                        required
                                        tabIndex={9}
                                        autoComplete="emergency-contact"
                                        value={data.emergency_contact}
                                        onChange={(e) => setData('emergency_contact', e.target.value)}
                                        placeholder="Emergency Contact Name"
                                    />
                                    <InputError message={errors.emergency_contact} className="mt-2" />
                                </div>

                                {/* <div className="grid gap-2">
                                    <Label htmlFor="profile_picture">Profile Picture</Label>
                                    <Input
                                        id="profile_picture"
                                        type="file"
                                        accept="image/*"
                                        tabIndex={10}
                                        onChange={(e) => setData('profile_picture', e.target.files?.[0] || null)}
                                    />
                                    <InputError message={errors.profile_picture} className="mt-2" />
                                </div>  */}
                            </div>
                        </div>
                    </div>
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border py-2 px-4">
                        {/* Form for references personal information */}
                        <h1 className="text-2xl font-bold mb-4">References</h1>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="reference_fullname">Reference Fullname</Label>
                                <Input
                                    id="reference_fullname"
                                    type="text"
                                    required
                                    tabIndex={11}
                                    autoComplete="reference-fullname"
                                    value={data.reference_fullname}
                                    onChange={(e) => setData('reference_fullname', e.target.value)}
                                    placeholder="Reference First Name"
                                />
                                <InputError message={errors.reference_fullname} className="mt-2" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="reference_contact">Reference Contact Number</Label>
                                <Input
                                    id="reference_contact"
                                    type="tel"
                                    required
                                    tabIndex={12}
                                    autoComplete="reference-contact"
                                    value={data.reference_contact}
                                    onChange={(e) => setData('reference_contact', e.target.value)}
                                    placeholder="Reference Contact"
                                />
                                <InputError message={errors.reference_contact} className="mt-2" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="reference_email">Reference Email</Label>
                                <Input
                                    id="reference_email"
                                    type="email"
                                    required
                                    tabIndex={13}
                                    autoComplete="reference-email"
                                    value={data.reference_email}
                                    onChange={(e) => setData('reference_email', e.target.value)}
                                    placeholder="Reference Email"
                                />
                                <InputError message={errors.reference_email} className="mt-2" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="reference_relationship">Relationship</Label>
                                <Input
                                    id="reference_relationship"
                                    type="text"
                                    required
                                    tabIndex={13}
                                    autoComplete="reference-relationship"
                                    value={data.reference_relationship}
                                    onChange={(e) => setData('reference_relationship', e.target.value)}
                                    placeholder="Relationship to Reference"
                                />
                                <InputError message={errors.reference_relationship} className="mt-2" />
                            </div>
                        </div>
                        <p className='mt-4'>Please ensure all information is accurate before submitting.</p>

                        <div className='mt-6'>
                            <h1 className='text-lg font-semibold mb-4'>Upload Your Drivers' License and Profile Picture</h1>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="drivers_license">Drivers' License</Label>
                                    <Input
                                        id="drivers_license"
                                        type="file"
                                        accept="image/*"
                                        tabIndex={14}
                                        required
                                        onChange={(e) => setData('drivers_license', e.target.files?.[0] || null)}
                                    />
                                    <InputError message={errors.drivers_license} className="mt-2" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="profile_picture">Profile Picture</Label>
                                    <Input
                                        id="profile_picture"
                                        type="file"
                                        accept="image/*"
                                        tabIndex={15}
                                        onChange={(e) => setData('profile_picture', e.target.files?.[0] || null)}
                                    />
                                    <InputError message={errors.profile_picture} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <Button
                                variant={"gold"}
                                type="submit"
                                className="w-full text-slate-900 py-5 rounded focus:outline-none focus:ring-2 focus:ring-corporate-gold focus:ring-opacity-50"
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                {processing ? 'Submitting...' : 'Complete Registration'}
                            </Button>
                        </div>
                    </div>
                </div>
                {/* <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div> */}
            </form>
        </AppLayout>
    );
}
