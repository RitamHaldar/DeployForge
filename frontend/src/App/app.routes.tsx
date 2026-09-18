import { createBrowserRouter, Navigate } from "react-router";
import { HomePage } from "../features/home";
import { AuthLayout, LoginPage, RegisterPage } from "../features/auth";
import { ReposPage } from "../features/github";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/repos",
    element: <ReposPage />,
  },
  {
    path: "/repositories",
    element: <Navigate to="/repos" replace />,
  },
  {
    path: "/console",
    element: <Navigate to="/repos" replace />,
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