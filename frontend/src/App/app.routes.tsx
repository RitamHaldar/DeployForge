import { createBrowserRouter, Navigate } from "react-router";
import { HomePage } from "../features/home";
import { AuthPage } from "../features/auth";
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
    path: "/login",
    element: <AuthPage initialMode="login" />,
  },
  {
    path: "/register",
    element: <AuthPage initialMode="register" />,
  },
  {
    path: "/auth",
    element: <Navigate to="/login" replace />,
  },
]);