import { Suspense, useState, } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {  LoginPage, OrderPage, PaymentPage, StoresPage } from "./LazyLoader";
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
                <Route path="/" element={<Navigate to="/products" replace />} />
       
                  <Route path="login" element={<LoginPage />} />
                  <Route path="store" element={<StoresPage />} />
                  <Route path="/" element={<Layout />}>
     
          <Route index element={<ProductsPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<OrderPage />} />
            <Route path="payments" element={<PaymentPage />} />
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