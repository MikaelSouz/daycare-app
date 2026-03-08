import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { NannyProfilePage } from "./pages/NannyProfilePage";
import { BookingPage } from "./pages/BookingPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { SuccessPage } from "./pages/SuccessPage";
import { BookingsPage } from "./pages/BookingsPage";
import { ConversationsPage } from "./pages/ConversationsPage";
import { MessagesPage } from "./pages/MessagesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SplashScreen } from "./pages/SplashScreen";
import { Navbar } from "./components/layout/Navbar";
import { NannyDashboardPage } from "./pages/NannyDashboardPage";
import { AvailabilityPage } from "./pages/AvailabilityPage";
import { NannyOnboardingPage } from "./pages/NannyOnboardingPage";
import { EarningsPage } from "./pages/EarningsPage";
import { NannyVerificationStatusPage } from "./pages/NannyVerificationStatusPage";
import { EditProfilePage } from "./pages/EditProfilePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { NannyBookingsPage } from "./pages/NannyBookingsPage";
import { useAuth } from "./contexts/AuthContext";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import { NannyNavbar } from "./components/layout/NannyNavbar";

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  const isCuidadora = user?.role === "CUIDADORA";

  // Esconde a navbar padrão em páginas específicas e para cuidadoras (que têm sua própria nav)
  const hideNavbarPaths = [
    "/book",
    "/checkout",
    "/success",
    "/messages",
    "/splash",
    "/nanny",
    "/profile/edit",
    "/login",
    "/register",
  ];
  const shouldShowNavbar =
    !isCuidadora &&
    !hideNavbarPaths.some((path) => location.pathname.startsWith(path));

  // Esconde a navbar da cuidadora em rotas específicas como o chat detalhado
  const isMessageDetail = location.pathname.startsWith("/messages/") && location.pathname.split("/").length > 2;
  const shouldShowNannyNavbar = isCuidadora && !isMessageDetail;

  if (!isLoaded && location.pathname === "/") {
    return <SplashScreen onComplete={() => setIsLoaded(true)} />;
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Routes>
        {/* Rota raiz: redireciona cuidadora para o dashboard */}
        <Route
          path="/"
          element={
            isCuidadora ? (
              <Navigate to="/nanny/dashboard" replace />
            ) : (
              <HomePage />
            )
          }
        />

        {/* Rotas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rotas compartilhadas */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/messages" element={<ConversationsPage />} />
        <Route path="/messages/:conversationId" element={<MessagesPage />} />

        {/* Rotas exclusivas de responsável */}
        {!isCuidadora && (
          <>
            <Route path="/nanny/:id" element={<NannyProfilePage />} />
            <Route path="/book/:id" element={<BookingPage />} />
            <Route path="/book" element={<HomePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
          </>
        )}

        {/* Rotas exclusivas de cuidadora */}
        {isCuidadora && (
          <>
            <Route
              path="/nanny/dashboard"
              element={<NannyDashboardPage />}
            />
            <Route
              path="/nanny/availability"
              element={<AvailabilityPage />}
            />
            <Route path="/nanny/earnings" element={<EarningsPage />} />
            <Route
              path="/nanny/bookings"
              element={<NannyBookingsPage />}
            />
            <Route
              path="/nanny/onboarding"
              element={<NannyOnboardingPage />}
            />
            <Route
              path="/nanny/verify/status"
              element={<NannyVerificationStatusPage />}
            />
          </>
        )}

        {/* Fallback: redireciona rotas não encontradas */}
        <Route
          path="*"
          element={
            <Navigate to={isCuidadora ? "/nanny/dashboard" : "/"} replace />
          }
        />
      </Routes>
      {shouldShowNavbar && <Navbar />}
      {shouldShowNannyNavbar && <NannyNavbar />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
}
