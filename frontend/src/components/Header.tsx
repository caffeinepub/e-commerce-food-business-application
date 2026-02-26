import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, LayoutDashboard, Heart } from 'lucide-react';

type View = 'home' | 'admin' | 'orders';

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

export default function Header({ currentView, onViewChange, isAdmin, isAuthenticated }: HeaderProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const disabled = loginStatus === 'logging-in';
  const buttonText = loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/assets/generated/food-business-logo-transparent.dim_200x200.png" 
            alt="Logo" 
            className="h-10 w-10"
          />
          <div>
            <h1 className="text-xl font-bold text-primary">Gourmet Delights</h1>
            <p className="text-xs text-muted-foreground">Premium Snacks & Treats</p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <Button
            variant={currentView === 'home' ? 'default' : 'ghost'}
            onClick={() => onViewChange('home')}
            size="sm"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Shop
          </Button>

          {isAuthenticated && (
            <Button
              variant={currentView === 'orders' ? 'default' : 'ghost'}
              onClick={() => onViewChange('orders')}
              size="sm"
            >
              <Package className="mr-2 h-4 w-4" />
              My Orders
            </Button>
          )}

          {isAdmin && (
            <Button
              variant={currentView === 'admin' ? 'default' : 'ghost'}
              onClick={() => onViewChange('admin')}
              size="sm"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Admin
            </Button>
          )}

          <Button
            onClick={handleAuth}
            disabled={disabled}
            variant={isAuthenticated ? 'outline' : 'default'}
            size="sm"
          >
            {buttonText}
          </Button>
        </nav>
      </div>
    </header>
  );
}
