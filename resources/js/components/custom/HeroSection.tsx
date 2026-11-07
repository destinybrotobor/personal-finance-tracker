import { Button } from "@/components/ui/button";
import heroImage from "@/assets/banner_bg.png";
import { ArrowRight } from "lucide-react";
import { FormEvent, useState } from "react";
import { router } from "@inertiajs/react";

export function HeroSection() {
  const [email, setEmail] = useState('');
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.visit(route('register'), { data: { default_email: email } });
  }
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-corporate-blue/80 via-corporate-blue/60 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <section className="container mx-auto px-4 py-20 md:py-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Take Control of Your <span className="block bg-clip-text text-transparent bg-gradient-to-r from-corporate-gold to-corporate-gold-light">Financial Future</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto bg-linear-to-r from-transparent to-corporate-blue/30 rounded-2xl py-2 px-5">
              FinTrack helps you monitor expenses, track investments, and achieve your financial goals with intuitive tools and powerful analytics.
            </p>
            <form onSubmit={(e) => handleFormSubmit(e)} className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto sm:max-w-xl">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-md border border-input bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" variant="gold" className="px-6 py-4 min-h-12 flex items-center justify-center cursor-pointer ">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
            <div className="mt-10 hidden">
              <img
                src="/images/dashboard-preview.png"
                alt="FinTrack Dashboard Preview"
                className="rounded-xl border border-border shadow-2xl mx-auto"
              />
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}