import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import heroImage from "@/assets/auth_bg.png";
import Logo from "@/assets/logo_white.png";

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote } = usePage<SharedData>().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute bg-cover bg-center bg-no-repeat inset-0 bg-zinc-900"
                    style={{ backgroundImage: `url(${heroImage})` }} />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-corporate-blue/80 via-corporate-blue/60 to-transparent" />

                <Link href={route('home')} className="relative z-20 flex items-center text-lg font-medium">
                    <img
                        src={Logo}
                        alt="Logo"
                        className="h-8 fill-current text-black sm:h-12"
                    />
                    <span className="ml-2 text-white">Fin<span className="text-corporate-gold-light">Track</span></span>
                </Link>
                {quote && (
                    <div className="relative z-20 mt-auto">
                        <blockquote className="space-y-2">
                            <p className="text-lg">&ldquo;{quote.message}&rdquo;</p>
                            <footer className="text-sm text-neutral-300">{quote.author}</footer>
                        </blockquote>
                    </div>
                )}
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link href={route('home')} className="relative z-20 flex items-center justify-center lg:hidden">
                        <div className="flex aspect-square size-20 items-center justify-center rounded-md bg-corporate-blue text-sidebar-primary-foreground">
                            <AppLogoIcon className="size-18 fill-corporate-gold text-white dark:text-black" />
                        </div>
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
