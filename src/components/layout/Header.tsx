'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, LogIn, UserPlus, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SearchModal } from '@/components/common/SearchModal';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSiteSettings } from '@/hooks/use-site-settings';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, signout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { settings } = useSiteSettings();
  const { t } = useTranslation();
  const siteName = settings?.siteName || 'My Blog';
  const logoUrl = settings?.logo || '';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleSignout = async () => {
    try {
      await signout();
      toast({ title: 'Signed out', description: 'See you next time!' });
      router.push('/');
    } catch {
      toast({ title: 'Error', description: 'Failed to sign out.', variant: 'destructive' });
    }
  };

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/blog', label: t('nav.blog') },
    { href: '/categories', label: t('nav.categories') },
    { href: '/contact', label: t('nav.contact') },
  ];

  return (
    <>
      <motion.header
        className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-gray-800">
              {logoUrl
                ? <img src={logoUrl} alt={siteName} className="h-8 w-auto object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                : null}
              {siteName}
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex space-x-4 items-center">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                  {link.label}
                </Link>
              ))}
              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                <Search className="w-5 h-5" />
              </Button>

              <LanguageSwitcher />

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.profilePicture} alt={user.username} />
                        <AvatarFallback>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">
                          <LayoutDashboard className="mr-2 h-4 w-4" /> {t('nav.dashboard')}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleSignout}>
                      <LogOut className="mr-2 h-4 w-4" /> {t('nav.signout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">
                      <LogIn className="mr-2 h-4 w-4" /> {t('nav.login')}
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">
                      <UserPlus className="mr-2 h-4 w-4" /> {t('nav.register')}
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile nav */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 space-y-2 pb-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="block py-2 text-gray-600 hover:text-gray-900" onClick={() => setIsMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <Button variant="ghost" className="w-full justify-start" onClick={() => { setIsSearchOpen(true); setIsMenuOpen(false); }}>
                <Search className="mr-2 h-4 w-4" /> {t('nav.search')}
              </Button>
              <div className="flex items-center px-1 py-1">
                <LanguageSwitcher />
              </div>
              {user ? (
                <>
                  {user.isAdmin && (
                    <Link href="/dashboard" className="block py-2 text-gray-600 hover:text-gray-900" onClick={() => setIsMenuOpen(false)}>
                      {t('nav.dashboard')}
                    </Link>
                  )}
                  <Button variant="ghost" onClick={handleSignout} className="w-full justify-start">
                    <LogOut className="mr-2 h-4 w-4" /> {t('nav.signout')}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild className="w-full justify-start">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <LogIn className="mr-2 h-4 w-4" /> {t('nav.login')}
                    </Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      <UserPlus className="mr-2 h-4 w-4" /> {t('nav.register')}
                    </Link>
                  </Button>
                </>
              )}
            </div>
          )}
        </nav>
      </motion.header>

      <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
