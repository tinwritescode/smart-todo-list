import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Authenticated, Unauthenticated } from "convex/react";
import { Toaster } from "sonner";
import Layout from "./components/Layout";

// Lazy load pages
const TodosPage = lazy(() => import("./pages/TodosPage"));
const AchievementsPage = lazy(() => import("./pages/AchievementsPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const EditProfilePage = lazy(() => import("./pages/EditProfilePage"));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Authenticated>
                    <TodosPage />
                  </Authenticated>
                  <Unauthenticated>
                    <AuthPage />
                  </Unauthenticated>
                </>
              }
            />
            <Route
              path="/achievements"
              element={
                <Authenticated>
                  <AchievementsPage />
                </Authenticated>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <Authenticated>
                  <EditProfilePage />
                </Authenticated>
              }
            />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
      <Toaster />
    </BrowserRouter>
  );
}
