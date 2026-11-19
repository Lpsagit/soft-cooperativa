import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router";

import { LoginPage } from "./auth/pages/login/LoginPage";

import { DashboardPage } from "./admin/pages/dashboard/DashboardPage";
import { AdminProductPage } from "./admin/pages/product/AdminProductPage";
import { AdminProductsPage } from "./admin/pages/products/AdminProductsPage";
import { AhorrosPage } from "./admin/pages/ahorros/AhorrosPage";
import { AhorrosCount } from "./admin/pages/ahorros/AhorrosCount";
import { SociosPage } from "./admin/pages/socios/SociosPage";
import { SociosCount } from "./admin/pages/socios/SociosCount";
import { DescuentosPage } from "./admin/pages/descuentos/DescuentosPage";
import { PrestamosPage } from "./admin/pages/prestamos/PrestamosPage";
import { Prestamo } from "./admin/pages/prestamos/Prestamo";
import { CuentaBancariaPage } from "./admin/pages/cuenta-bancaria/CuentaBancariaPage";
import {
  AuthenticatedRoute,
  NotAuthenticatedRoute,
} from "./components/routes/ProtectedRoutes";

const AuthLayout = lazy(() => import("./auth/layouts/AuthLayout"));
const AdminLayout = lazy(() => import("./admin/layouts/AdminLayout"));

export const appRouter = createBrowserRouter(
  [
    // Auth Routes
    {
      path: "auth",
      element: (
        <NotAuthenticatedRoute>
          <AuthLayout />
        </NotAuthenticatedRoute>
      ),
      children: [
        {
          index: true,
          element: <Navigate to="/auth/login" />,
        },
        {
          path: "login",
          element: <LoginPage />,
        },
      ],
    },
    // Admin Routes
    {
      path: "/",
      element: (
        <AuthenticatedRoute>
          <AdminLayout />
        </AuthenticatedRoute>
      ),
      children: [
        {
          index: true,
          element: <DashboardPage />,
        },
        {
          path: "ahorros",
          element: <AhorrosPage />,
        },
        {
          path: "ahorros/:id",
          element: <AhorrosCount />,
        },
        {
          path: "socios",
          element: <SociosPage />,
        },
        {
          path: "socios/:id",
          element: <SociosCount />,
        },
        {
          path: "descuentos",
          element: <DescuentosPage />,
        },
        {
          path: "prestamos",
          element: <PrestamosPage />,
        },
        {
          path: "prestamos/:id",
          element: <Prestamo />,
        },
        {
          path: "cuenta-bancaria",
          element: <CuentaBancariaPage />,
        },
        {
          path: "products",
          element: <AdminProductsPage />,
        },
        {
          path: "products/:id",
          element: <AdminProductPage />,
        },
      ],
    },
    {
      path: "*",
      element: <Navigate to="/" />,
    },
  ],
  {
    basename: "/cooperativa/admin_coop",
  },
);
