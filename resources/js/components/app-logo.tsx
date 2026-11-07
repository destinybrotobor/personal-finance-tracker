import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-9 items-center justify-center rounded-md bg-corporate-blue text-sidebar-primary-foreground">
                <AppLogoIcon className="size-7 fill-corporate-gold text-white dark:text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">FinTRACK</span>
            </div>
        </>
    );
}
