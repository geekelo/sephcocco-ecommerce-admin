import { Suspense, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Cookies from 'js-cookie';
import {
  ActivitiesPage,
  AnalyticsPage,
  DashboardPage,
  DepartmentPage,
  FAQPage,
  ForgotPasswordPage,
  LocationPage,
  LoginPage,
  ManageAccountPage,
  MessagesPage,
  OrderPage,
  OtpPage,
  PaymentPage,
  ProductCategoresPage,
  RegisterPage,
  ResetPasswordPage,
  SettingsPage,
  ShippingPage,
  StockPage,
  StoresPage,
  BulkStockPage,
  VerifyOTPPage
} from "./LazyLoader";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { SplashScreen } from "../components/SplashScreen";
import Layout from "../layout/Layout";
import ProductsPage from "../pages/Products";
import { getActiveUser } from "../utils/getActiveUser";
import NotFoundPage from "../pages/NotFound";
import UnauthorizedPage from "../pages/Unauthorized";


// Helper function to check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const activeOutlet = Cookies.get('activeOutlet');

  console.log('🔐 Auth check - Token:', !!token);
  console.log('🔐 Auth check - Active outlet:', activeOutlet);

  if (!token || !activeOutlet) {
    if (token && !activeOutlet) {
      console.log('🔐 Removing token due to missing activeOutlet');
      localStorage.removeItem('token');
    }
    return false;
  }

  return true;
};

// Define all navigation items with their keys
const navItems = [
  { path: '/', key: 'dashboard' },
  { path: '/products', key: 'products' },
  { path: '/orders', key: 'orders' },
  { path: '/payments', key: 'payments' },
  { path: '/logistics', key: 'logistics' },
  { path: '/delivery-locations', key: 'locations' },
  { path: '/stocks', key: 'stocks' },
  { path: '/products-categories', key: 'categories' },
  { path: '/departments', key: 'departments' },
  { path: '/faq', key: 'faq' },
  { path: '/messages', key: 'messages' },
  { path: '/activities', key: 'activities' },
  { path: '/analytics', key: 'analytics' },
  { path: '/manage-accounts', key: 'users' },
  { path: '/settings', key: 'settings' },
];

// Role-based permissions
const rolePermissions = {
  stock: ['stocks'],
  logistics: ['logistics'],
  support: ['orders', 'payments'],
  supperadmin: navItems.map(i => i.key),
  admin: navItems.map(i => i.key),
  manager: navItems.map(i => i.key).filter(k => !['users', 'analytics'].includes(k)),
  accountant: ['dashboard', 'analytics'],
};

// Get user's allowed routes based on subroles
const getAllowedKeys = () => {
  const activeUser = getActiveUser();
  const userRole = activeUser?.role?.toLowerCase();
  const subroles = activeUser?.subroles || [];

  let allowedKeys = [];

  if (subroles.length > 0) {
    // Merge all permissions from subroles
    allowedKeys = subroles.flatMap(sr => rolePermissions[sr.toLowerCase()] || []);
  } else {
    // Fallback to role if no subroles
    allowedKeys = rolePermissions[userRole] || [];
  }

  // Always include settings
  if (!allowedKeys.includes('settings')) {
    allowedKeys.push('settings');
  }

  return allowedKeys;
};

// Get the first accessible route based on subroles
const getDefaultRoute = () => {
  const allowedKeys = getAllowedKeys();
  const firstAccessible = navItems.find(item => allowedKeys.includes(item.key));
  return firstAccessible?.path || '/';
};

// Get route key from path
const getRouteKeyFromPath = (path) => {
  const item = navItems.find(nav => nav.path === path);
  return item?.key;
};

// Check if user has access to a specific route
const hasAccessToRoute = (path) => {
  const allowedKeys = getAllowedKeys();
  const routeKey = getRouteKeyFromPath(path);

  if (!routeKey) return true;
  return allowedKeys.includes(routeKey);
};

// Protected Route Component with role-based access
const ProtectedRoute = ({ children, requiredKey }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Check if user has access to this route
  if (requiredKey && !hasAccessToRoute(location.pathname)) {
    console.warn(`🚫 Access denied to ${location.pathname}`);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Component to redirect index to first accessible route
const IndexRedirect = () => {
  const defaultRoute = getDefaultRoute();
  console.log('defaultrole', defaultRoute);
  if (defaultRoute === '/') {
    return <DashboardPage />
  }

  return <Navigate to={defaultRoute} replace />;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    const defaultRoute = getDefaultRoute();
    return <Navigate to={defaultRoute} replace />;
  }

  return children;
};

const AppRouter = () => {
  const [loading, setLoading] = useState(true);

  const handleSplashComplete = () => {
    setLoading(false);
  };

  return (
    <BrowserRouter>
      <ErrorBoundary showError={true}>
        {loading ? (
          <SplashScreen onComplete={handleSplashComplete} />
        ) : (
          <Suspense fallback={<SplashScreen />}>
            <Routes>
              {/* Public routes */}
              <Route
                path="/sign-up"
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/sign-in"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <ForgotPasswordPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <PublicRoute>
                    <ResetPasswordPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/verify-otp"
                element={
                  <PublicRoute>
                    <VerifyOTPPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/verify-email"
                element={
                  <PublicRoute>
                    <OtpPage />
                  </PublicRoute>
                }
              />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/store" element={<ProtectedRoute><StoresPage /></ProtectedRoute>} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<IndexRedirect /> || <DashboardPage />} />




                <Route
                  path="products"
                  element={
                    <ProtectedRoute requiredKey="products">
                      <ProductsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="stocks"
                  element={
                    <ProtectedRoute requiredKey="stocks">
                      <StockPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="stocks/bulk"
                  element={
                    <ProtectedRoute requiredKey="stocks">
                      <BulkStockPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="products-categories"
                  element={
                    <ProtectedRoute requiredKey="categories">
                      <ProductCategoresPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="faq"
                  element={
                    <ProtectedRoute requiredKey="faq">
                      <FAQPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="departments"
                  element={
                    <ProtectedRoute requiredKey="departments">
                      <DepartmentPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="orders"
                  element={
                    <ProtectedRoute requiredKey="orders">
                      <OrderPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="payments"
                  element={
                    <ProtectedRoute requiredKey="payments">
                      <PaymentPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="logistics"
                  element={
                    <ProtectedRoute requiredKey="logistics">
                      <ShippingPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="delivery-locations"
                  element={
                    <ProtectedRoute requiredKey="locations">
                      <LocationPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="activities"
                  element={
                    <ProtectedRoute requiredKey="activities">
                      <ActivitiesPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="analytics"
                  element={
                    <ProtectedRoute requiredKey="analytics">
                      <AnalyticsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="messages"
                  element={
                    <ProtectedRoute requiredKey="messages">
                      <MessagesPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="manage-accounts"
                  element={
                    <ProtectedRoute requiredKey="users">
                      <ManageAccountPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="settings"
                  element={
                    <ProtectedRoute requiredKey="settings">
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Redirect unknown routes */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        )}
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default AppRouter;