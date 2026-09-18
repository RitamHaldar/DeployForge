import { createBrowserRouter, Navigate } from "react-router";
import { HomePage } from "../features/home";
import { AuthLayout, LoginPage, RegisterPage } from "../features/auth";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/auth",
        element: <Navigate to="/login" replace />,
      },
    ],
  },
]);