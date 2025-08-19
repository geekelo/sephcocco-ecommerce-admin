import { Suspense, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Cookies from 'js-cookie';
import { 
  ActivitiesPage, 
  AnalyticsPage, 
  DashboardPage, 
  FAQPage, 
  ForgotPasswordPage, 
  LoginPage, 
  ManageAccountPage, 
  MessagesPage, 
  OrderPage, 
  PaymentPage, 
  ProductCategoresPage, 
  RegisterPage, 
  ResetPasswordPage, 
  SettingsPage, 
  ShippingPage, 
  StoresPage, 
  VerifyOTPPage 
} from "./LazyLoader";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { SplashScreen } from "../components/SplashScreen";
import Layout from "../layout/Layout";
import ProductsPage from "../pages/Products";

// Helper function to check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const activeOutlet = Cookies.get('activeOutlet');
  
  // If no token or no active outlet, user is not authenticated
  if (!token || !activeOutlet) {
    // Remove token if activeOutlet is missing
    if (token && !activeOutlet) {
      localStorage.removeItem('token');
    }
    return false;
  }
  
  return true;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  if (!isAuthenticated()) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }
  
  return children;
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
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

           
        
                        <Route path="/store" element={ <ProtectedRoute><StoresPage /></ProtectedRoute>} />

              {/* Protected routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
            
                <Route index element={<DashboardPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="products-categories" element={<ProductCategoresPage />} />
                <Route path="faq" element={<FAQPage />} />
                <Route path="orders" element={<OrderPage />} />
                <Route path="payments" element={<PaymentPage />} />
                <Route path="shipping" element={<ShippingPage />} />
                <Route path="activities" element={<ActivitiesPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="manage-accounts" element={<ManageAccountPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Redirect unknown routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        )}
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default AppRouter;