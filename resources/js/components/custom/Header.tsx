import { useState } from "react";
import Logo from "@/assets/logo_white.png";
import Logo2 from "@/assets/logo.png";
import { LogIn, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link, usePage } from "@inertiajs/react";
import { SharedData } from "@/types";
import AppLogoIcon from "../app-logo-icon";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { auth } = usePage<SharedData>().props;

  const navigationItems = [
    { title: "Home", href: "/" },
    { title: "About Project", href: "/about" }
  ];

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/10">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Brand Name */}
        <div className="flex items-center space-x-2">
          <img src={Logo} alt="Logo" className="h-8 w-8" />
          <h1 className="text-3xl font-bold text-white">Fin<span className="text-corporate-gold-light">Track</span> </h1>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex">
          <NavigationMenu>
            <NavigationMenuList className="space-x-2 text-white font-semibold">
              {navigationItems.map((item, index) => (
                <NavigationMenuItem key={index}>
                  <NavigationMenuLink href={item.href}>
                    {item.title}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
              {auth.user ? (
                <NavigationMenuItem className="relative">
                  <NavigationMenuLink
                    href={route("dashboard")}
                    className="inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                  >
                    Dashboard
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem className="relative bg-linear-to-r from-corporate-gold to-corporate-gold-light rounded-lg">
                  <NavigationMenuLink
                    href={route("login")}
                    className="inline-flex flex-row gap-2 h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-corporate-gold hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                  >
                    <LogIn className="h-4 w-4 text-white" /> Login
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>
                  <div className="flex items-center space-x-2">
                    <img src={Logo2} alt="Logo" className="h-8 w-8" />
                    <h1 className="text-3xl font-bold text-corporate-blue">Fin<span className="text-corporate-gold">Track</span> </h1>
                  </div>
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 space-y-4 px-4">
                {navigationItems.map((item) => (
                  <div key={item.title}>
                    <Link
                      href={item.href}
                      className="block font-medium text-primary hover:text-primary/80 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.title}
                    </Link>
                  </div>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;