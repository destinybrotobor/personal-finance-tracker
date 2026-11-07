import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    firstname: string;
    middlename?: string;
    lastname?: string;
    phone?: string;
    dob?: Date | string | null;
    email?: string;
    profile_img?: File | string;
};

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { user } = usePage<SharedData>().props.auth;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        firstname: user.firstname,
        middlename: user.middlename,
        lastname: user.lastname,
        phone: user.phone,
        dob: user.dob,
        email: user.email,
        profile_img: user.profile_img
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your name and email address" />
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="firstname">Firstame</Label>

                            <Input
                                id="firstname"
                                type="text"
                                name="firstname"
                                className="mt-1 block w-full"
                                value={data.firstname}
                                onChange={(e) => setData('firstname', e.target.value)}
                                required
                                autoComplete="firstname"
                                placeholder="Firstname"
                            />

                            <InputError className="mt-2" message={errors.firstname} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="lastname">Lastname</Label>

                            <Input
                                id="lastname"
                                type="text"
                                name="lastname"
                                className="mt-1 block w-full"
                                value={data.lastname}
                                onChange={(e) => setData('lastname', e.target.value)}
                                required
                                autoComplete="lastname"
                                placeholder="Lastname"
                            />

                            <InputError className="mt-2" message={errors.lastname} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="middlename">Middle Name</Label>

                            <Input
                                id="middlename"
                                type="text"
                                name="middlename"
                                className="mt-1 block w-full"
                                value={data.middlename}
                                onChange={(e) => setData('middlename', e.target.value)}
                                autoComplete="middlename"
                                placeholder="Enter your middle name"
                            />

                            <InputError className="mt-2" message={errors.middlename} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>

                            <Input
                                id="phone"
                                type="tel"
                                name="phone"
                                className="mt-1 block w-full"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                autoComplete="phone"
                                placeholder="Phone"
                            />

                            <InputError className="mt-2" message={errors.phone} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="dob">Date of birth</Label>

                            <Input
                                id="dob"
                                type='date'
                                name="dob"
                                className="mt-1 block w-full"
                                value={data.dob as string}
                                onChange={(e) => setData('dob', e.target.value)}
                                autoComplete="dob"
                                placeholder="Date of birth"
                            />

                            <InputError className="mt-2" message={errors.dob} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>

                            <Input
                                id="email"
                                type="email"
                                name="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        {mustVerifyEmail || user.email_verified_at === null && (
                            <div>
                                <p className="-mt-4 text-sm text-muted-foreground">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-red-400 underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Click here to resend the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="profile_img">Profile Image</Label>

                            <Input
                                id="profile_img"
                                type="file"
                                name="profile_img"
                                className="mt-1 block w-full"
                                onChange={(e) => setData('profile_img', e.target.files![0])}
                                autoComplete="profile_img"
                                placeholder="Profile Image"
                            />

                            <InputError className="mt-2" message={errors.profile_img} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button variant="gold" disabled={processing}>Save</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
