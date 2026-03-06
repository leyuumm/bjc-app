import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { SplashPage } from './components/SplashPage';
import { LoginPage } from './components/LoginPage';
import { StoreSelection } from './components/StoreSelection';
import { BranchSelection } from './components/BranchSelection';
import { MenuPage } from './components/MenuPage';
import { CartPage } from './components/CartPage';
import { CheckoutPage } from './components/CheckoutPage';
import { OrderTracking } from './components/OrderTracking';
import { OrdersPage } from './components/OrdersPage';
import { CashierDashboard } from './components/CashierDashboard';
import { RewardsPage } from './components/RewardsPage';
import { ProfilePage } from './components/ProfilePage';

export const router = createBrowserRouter([
  {
    path: '/splash',
    Component: SplashPage,
  },
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: StoreSelection },
      { path: 'home', Component: StoreSelection },
      { path: 'branches', Component: BranchSelection },
      { path: 'menu', Component: MenuPage },
      { path: 'cart', Component: CartPage },
      { path: 'checkout', Component: CheckoutPage },
      { path: 'order-tracking/:orderId', Component: OrderTracking },
      { path: 'orders', Component: OrdersPage },
      { path: 'cashier', Component: CashierDashboard },
      { path: 'rewards', Component: RewardsPage },
      { path: 'profile', Component: ProfilePage },
      { path: '*', Component: StoreSelection },
    ],
  },
]);