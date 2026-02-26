import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from './hooks/useQueries';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import MyOrders from './pages/MyOrders';
import ProfileSetupModal from './components/ProfileSetupModal';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

type View = 'home' | 'admin' | 'orders';

export default function App() {
  const { identity, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const [currentView, setCurrentView] = useState<View>('home');

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Reset to home view when logging out
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentView('home');
    }
  }, [isAuthenticated]);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="flex min-h-screen flex-col">
        <Header 
          currentView={currentView} 
          onViewChange={setCurrentView}
          isAdmin={isAdmin || false}
          isAuthenticated={isAuthenticated}
        />
        
        <main className="flex-1">
          {currentView === 'home' && <HomePage />}
          {currentView === 'admin' && isAdmin && <AdminDashboard />}
          {currentView === 'orders' && isAuthenticated && <MyOrders />}
        </main>

        <Footer />

        {showProfileSetup && <ProfileSetupModal />}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
