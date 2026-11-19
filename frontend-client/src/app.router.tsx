import { createBrowserRouter, Navigate } from "react-router";
import { lazy } from "react";

import { UserLayout } from "./user/layouts/UserLayout";
import { HomePage } from "./user/pages/home/HomePage";
import { AhorroPage } from "./user/pages/ahorro/AhorroPage";
import { PrestamoPage } from "./user/pages/prestamo/PrestamoPage";
//import { AuthLayout } from './auth/layouts/AuthLayout';
import { LoginPage } from "./auth/pages/login/LoginPage";
import { RegiterPage } from "./auth/pages/register/RegiterPage";
import { PerfilPage } from "./user/pages/perfil/PerfilPage";
import { EditPerfilPage } from "./user/pages/perfil/EditPerfilPage";
import {
  AuthenticatedRoute,
  NotAuthenticatedRoute,
} from "./components/routes/ProtectedRoutes";

//carga peresosa
const AuthLayout = lazy(() => import("./auth/layouts/AuthLayout"));

export const appRouter = createBrowserRouter([
  // Main Routes
  {
    path: "/",
    element: (
      <AuthenticatedRoute>
        <UserLayout />
      </AuthenticatedRoute>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "perfil",
        element: <PerfilPage />,
      },
      {
        path: "edit-perfil",
        element: <EditPerfilPage />,
      },
      {
        path: "ahorros",
        element: <AhorroPage />,
      },
      {
        path: "prestamos",
        element: <PrestamoPage />,
      },
    ],
  },
  //Auth Routes
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
      {
        path: "register",
        element: <RegiterPage />,
      },
    ],
  },
  //Comodin Route
  {
    path: "*",
    element: <Navigate to="/" />,
  },
],
  {
    basename: "/cooperativa",
  },
);
