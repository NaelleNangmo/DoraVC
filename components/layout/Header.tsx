'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu, X, Search, Globe, User, LogOut, Settings,
  Shield, MapPin, Bell
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { useAuth } from '@/hooks/use-auth';
import { LoginModal } from '@/components/auth/LoginModal';

type NotificationType = {
  id: string;
  message: string;
  link: string;
  read: boolean;
  date: string;
};

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  const unreadCount = notifications.filter(n => !n.read).length;

  const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'Pays', href: '/countries' },
    { name: 'Communauté', href: '/community' },
    ...(isAuthenticated ? [
      { name: 'Mes démarches', href: '/visa-steps' },
      { name: 'Intégration', href: '/integration' }
    ] : []),
    ...(isAdmin ? [{ name: 'Dashboard', href: '/admin' }] : []),
  ];

  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => setNotifications(data));
    }
  }, [isAuthenticated]);

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    fetch('/api/notifications/mark-read', { method: 'POST' });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/countries?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Globe className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-foreground">DORA</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex items-center space-x-4 flex-1 max-w-sm mx-8">
              <form onSubmit={handleSearch} className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un pays..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </form>
            </div>

            {/* Controls */}
            <div className="hidden md:flex items-center space-x-2">
              <ThemeToggle />
              <LanguageToggle />

              {isAuthenticated && (
                <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Bell className="h-5 w-5 text-black" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-semibold text-white bg-destructive rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80" align="end">
                    <div className="flex items-center justify-between px-4 py-2">
                      <span className="font-medium">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-primary hover:underline"
                        >
                          Tout lire
                        </button>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    {notifications.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-muted-foreground">
                        Aucune notification.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <DropdownMenuItem
                          key={n.id}
                          className={`flex items-start space-x-2 ${n.read ? '' : 'bg-muted/30'}`}
                          asChild
                        >
                          <Link href={n.link} className="block w-full px-1">
                            <p className="text-sm">{n.message}</p>
                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(n.date), { addSuffix: true })}</p>
                          </Link>
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="flex items-center gap-2 p-2">
                      <div className="flex flex-col leading-none">
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3 text-primary" />
                            <span className="text-xs font-medium text-primary">Admin</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Paramètres
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin">
                            <Shield className="mr-2 h-4 w-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Se connecter
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ✅ Menu mobile affiché uniquement quand isMenuOpen === true */}
      {isMenuOpen && (
        <div className="md:hidden border-b bg-background">
          <nav className="flex flex-col px-4 py-2 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex items-center justify-between py-2">
              <ThemeToggle />
              <LanguageToggle />
            </div>
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mon profil
                </Link>
                <Button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  variant="ghost"
                  className="text-left"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  setIsLoginModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Se connecter
              </Button>
            )}
          </nav>
        </div>
      )}

      <LoginModal open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
    </>
  );
}
