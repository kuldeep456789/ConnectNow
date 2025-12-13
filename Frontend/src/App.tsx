import { Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { AuthContainer } from "./styles/ReusableStyles";
import PrivateRoute from "./components/PrivateRoute";
import { ThemeProvider } from "./hooks/useTheme";
import { useUserStore } from "./hooks";
import { Spinner } from "./components/Core";
import api from "./services/api";

const SignIn = lazy(() => import("./pages/SignIn/SignIn"));
const Home = lazy(() => import("./pages/Home/Home"));
const Chat = lazy(() => import("./pages/Chat/Chat"));
const PageNotFound = lazy(() => import("./pages/PageNotFound/PageNotFound"));

export default function App() {
  const { setCurrentUser } = useUserStore();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setCurrentUser(null);
        return;
      }

      try {
        const response = await api.get("/users/me");
        setCurrentUser(response.data);
      } catch (error) {
        console.error("Auth check failed", error);
        localStorage.removeItem("token");
        setCurrentUser(null);
      }
    };

    checkAuth();
  }, [setCurrentUser]);

  return (
    <ThemeProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />

        <Route
          path="/signin"
          element={
            <Suspense
              fallback={
                <AuthContainer>
                  <Spinner />
                </AuthContainer>
              }
            >
              <AuthContainer>
                <SignIn />
              </AuthContainer>
            </Suspense>
          }
        />

        <Route
          path="/:id"
          element={
            <Suspense
              fallback={
                <AuthContainer>
                  <Spinner />
                </AuthContainer>
              }
            >
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            </Suspense>
          }
        />

        <Route path="/iii" element={<PageNotFound />} />
      </Routes>
    </ThemeProvider>
  );
}
