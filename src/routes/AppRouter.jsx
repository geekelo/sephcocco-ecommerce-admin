import { Suspense, useState, } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {  ActivitiesPage, DashboardPage, ForgotPasswordPage, LoginPage, ManageAccountPage, MessagesPage, OrderPage, PaymentPage, RegisterPage, ResetPasswordPage, StoresPage } from "./LazyLoader";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { SplashScreen } from "../components/SplashScreen";
import Layout from "../layout/Layout";
import ProductsPage from "../pages/Products";




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
                <Route path="/" element={<Navigate to="/" replace />} />
                        <Route path="sign-up" element={<RegisterPage />} />
                  <Route path="sign-in" element={<LoginPage />} />
                             <Route path="forgot-password" element={<ForgotPasswordPage />} />
                                  <Route path="reset-password" element={<ResetPasswordPage />} />
                  <Route path="store" element={<StoresPage />} />
                  <Route path="/" element={<Layout />}>
       
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<OrderPage />} />
            <Route path="payments" element={<PaymentPage />} />
                        <Route path="activities" element={<ActivitiesPage />} />
                          <Route path="messages" element={<MessagesPage />} />
                                        <Route path="manage-accounts" element={<ManageAccountPage />} />
        </Route>
                {/* Redirect unknown routes to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          )}
        </ErrorBoundary>
      </BrowserRouter>
    );
  };

export default AppRouter;