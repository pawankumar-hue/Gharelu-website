import { useEffect, useRef } from 'react';
import { useApp, type Tab, type StackScreen } from './store';
import BottomNav from './BottomNav';
import TopNavbar from './TopNavbar';
import LocationPick from './screens/LocationPick';
import Home from './screens/Home';
import MenuScreen from './screens/MenuScreen';
import Orders from './screens/Orders';
import Reservations from './screens/Reservations';
import Profile from './screens/Profile';
import DishDetail from './screens/DishDetail';
import Checkout from './screens/Checkout';
import TrackOrder from './screens/TrackOrder';
import ReserveFlow from './screens/ReserveFlow';
import Loyalty from './screens/Loyalty';
import Offers from './screens/Offers';
import Search from './screens/Search';
import CartSheet from './screens/CartSheet';
import FloatingCartButton from './FloatingCartButton';

function getPathForState(tab: Tab, stack: StackScreen[]): string {
  if (stack.length > 0) {
    const top = stack[stack.length - 1];
    switch (top.type) {
      case 'dish':
        return `/product/${top.id}`;
      case 'checkout':
        return '/checkout';
      case 'track':
        return `/orders/track/${top.orderId}`;
      case 'reserve':
        return '/reserve';
      case 'loyalty':
        return '/loyalty';
      case 'offers':
        return '/offers';
      case 'search':
        return '/search';
      case 'location':
        return '/location';
    }
  }

  switch (tab) {
    case 'menu':
      return '/menu';
    case 'orders':
      return '/orders';
    case 'reservations':
      return '/reservations';
    case 'profile':
      return '/profile';
    case 'home':
    default:
      return '/';
  }
}

function parsePathToState(path: string): { tab?: Tab; screen?: StackScreen } {
  const clean = path.replace(/\/+$/, '') || '/';

  if (clean.startsWith('/product/')) {
    const id = clean.replace('/product/', '');
    return { screen: { type: 'dish', id } };
  }
  if (clean.startsWith('/orders/track/')) {
    const orderId = clean.replace('/orders/track/', '');
    return { screen: { type: 'track', orderId } };
  }
  if (clean === '/checkout') return { screen: { type: 'checkout' } };
  if (clean === '/reserve') return { screen: { type: 'reserve' } };
  if (clean === '/loyalty') return { screen: { type: 'loyalty' } };
  if (clean === '/offers') return { screen: { type: 'offers' } };
  if (clean === '/search') return { screen: { type: 'search' } };
  if (clean === '/location') return { screen: { type: 'location' } };

  if (clean === '/menu') return { tab: 'menu' };
  if (clean === '/orders') return { tab: 'orders' };
  if (clean === '/reservations') return { tab: 'reservations' };
  if (clean === '/profile') return { tab: 'profile' };

  return { tab: 'home' };
}

export default function App() {
  const phase = useApp((s) => s.phase);
  const tab = useApp((s) => s.tab);
  const stack = useApp((s) => s.stack);
  const setTab = useApp((s) => s.setTab);
  const push = useApp((s) => s.push);
  const pop = useApp((s) => s.pop);
  const online = useApp((s) => s.online);
  const setOnline = useApp((s) => s.setOnline);

  const isNavigatingFromPopstate = useRef(false);

  // Initial load from URL and sync live products from backend
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const parsed = parsePathToState(window.location.pathname);
    if (parsed.screen) {
      push(parsed.screen);
    } else if (parsed.tab) {
      setTab(parsed.tab);
    }

    // Live sync menu + chapters from the backend so admin panel changes
    // (new products, price edits, sold-out toggles, new chapters) show up here.
    const { refreshMenu } = useApp.getState();
    refreshMenu();
    const interval = setInterval(refreshMenu, 15000); // 15s refresh
    // Refetch the moment the tab regains focus
    const onFocus = () => refreshMenu();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, []);

  // Update browser URL on tab or screen stack change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isNavigatingFromPopstate.current) {
      isNavigatingFromPopstate.current = false;
      return;
    }

    const currentUrl = window.location.pathname;
    const targetUrl = getPathForState(tab, stack);

    if (currentUrl !== targetUrl) {
      window.history.pushState({ tab, stackLength: stack.length }, '', targetUrl);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [tab, stack]);

  // Handle browser back/forward buttons
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      isNavigatingFromPopstate.current = true;
      const parsed = parsePathToState(window.location.pathname);
      if (parsed.screen) {
        push(parsed.screen);
      } else if (parsed.tab) {
        setTab(parsed.tab);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setTab, push]);

  useEffect(() => {
    document.title = 'Gharelu Hub';
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    setOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, [setOnline]);

  const top = stack[stack.length - 1];

  const renderStack = () => {
    if (!top) return null;
    switch (top.type) {
      case 'dish':
        return <DishDetail id={top.id} />;
      case 'checkout':
        return <Checkout />;
      case 'track':
        return <TrackOrder orderId={top.orderId} />;
      case 'reserve':
        return <ReserveFlow />;
      case 'loyalty':
        return <Loyalty />;
      case 'offers':
        return <Offers />;
      case 'search':
        return <Search />;
      case 'location':
        return <LocationPick />;
      default:
        return null;
    }
  };

  const renderTab = () => {
    switch (tab) {
      case 'home':
        return <Home />;
      case 'menu':
        return <MenuScreen />;
      case 'orders':
        return <Orders />;
      case 'reservations':
        return <Reservations />;
      case 'profile':
        return <Profile />;
      default:
        return null;
    }
  };

  let content: React.ReactNode;
  if (phase === 'location') {
    content = <LocationPick firstTime />;
  } else {
    content = (
      <>
        <TopNavbar />
        {stack.length === 0 ? (
          <div key={tab} className="screen-in">
            {renderTab()}
          </div>
        ) : (
          renderStack()
        )}
        <BottomNav />
        <FloatingCartButton />
        <CartSheet />
      </>
    );
  }

  return (
    <div className="app-frame">
      {content}

      {!online && phase === 'app' && (
        <div className="fixed inset-x-0 top-0 z-50 mx-auto max-w-xl bg-chili px-4 py-2 text-center shadow-lg">
          <span className="label text-ivory">YOU’RE OFFLINE — SHOWING WHAT WE CACHED</span>
        </div>
      )}
    </div>
  );
}
