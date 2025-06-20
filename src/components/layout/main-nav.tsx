'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, FileText, ListChecks, HelpCircle, Send, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import React from 'react';

const navItems = [
  { href: '/', label: 'Beranda', icon: Home },
  { href: '/application', label: 'Formulir Pendaftaran', icon: FileText },
  { href: '/status', label: 'Cek Status', icon: ListChecks },
  { href: '/faq', label: 'FAQ', icon: HelpCircle },
  { href: '/inquiry', label: 'Kontak', icon: Send },
];

export function MainNav() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const NavLinks = ({ inSheet = false }: { inSheet?: boolean }) => (
    <>
      {navItems.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          asChild
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            pathname === item.href ? 'text-primary' : 'text-foreground/80',
            inSheet && 'w-full justify-start text-lg py-3'
          )}
          onClick={() => inSheet && setIsMobileMenuOpen(false)}
        >
          <Link href={item.href}>
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Link>
        </Button>
      ))}
    </>
  );
  
  return (
    <>
      <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
        <NavLinks />
      </nav>
      <div className="md:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Buka menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-xs p-6 bg-background">
            <div className="flex flex-col space-y-4">
              <SheetClose asChild>
                 <Button variant="ghost" size="icon" className="self-end">
                    <X className="h-6 w-6" />
                    <span className="sr-only">Tutup menu</span>
                  </Button>
              </SheetClose>
              <NavLinks inSheet={true} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
