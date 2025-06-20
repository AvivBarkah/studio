import Link from 'next/link';
import { Logo } from '@/components/icons/logo';
import { MainNav } from './main-nav';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2" aria-label="Madrasah Gateway Home">
          <Logo className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl font-headline text-primary">Madrasah Gateway</span>
        </Link>
        <MainNav />
      </div>
    </header>
  );
}
