import { lazy } from "react";
export const LoginPage = lazy(() => import("../pages/Login"));

export const StoresPage = lazy(() => import("../pages/StoreSelection"));
export const ProductPage = lazy(() => import("../pages/Products"));
export const OrderPage = lazy(() => import("../pages/Order"));
export const PaymentPage = lazy(() => import("../pages/Payment"));



