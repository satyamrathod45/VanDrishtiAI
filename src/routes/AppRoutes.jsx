import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "../pages/Login/Login";

import Overview from "../pages/Overview/Overview";

import Tigers from "../pages/Tigers/Tigers";

import TigerProfile from "../pages/Tigers/TigerProfile";

import AppLayout from "../components/layout/AppLayout";


// ============================================================
// PROTECTED ROUTE
// ============================================================

function ProtectedRoute({
  children,
}) {
  const session =
    localStorage.getItem(
      "vandrishti_session"
    );

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}


// ============================================================
// ROUTES
// ============================================================

export default function AppRoutes() {

  return (
    <Routes>

      {/* ================================================== */}
      {/* PUBLIC */}
      {/* ================================================== */}

      <Route
        path="/login"
        element={
          <Login />
        }
      />


      {/* ================================================== */}
      {/* PROTECTED APPLICATION */}
      {/* ================================================== */}

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >

        {/* Overview */}

        <Route
          path="/overview"
          element={
            <Overview />
          }
        />


        {/* Tigers */}

        <Route
          path="/tigers"
          element={
            <Tigers />
          }
        />


        {/* Tiger Profile */}

        <Route
          path="/tigers/:tigerId"
          element={
            <TigerProfile />
          }
        />


        {/* Future:
        
        <Route
          path="/cameras"
          element={<Cameras />}
        />

        <Route
          path="/cameras/:cameraId"
          element={<CameraProfile />}
        />

        <Route
          path="/review"
          element={<Review />}
        />

        <Route
          path="/review/:reviewId"
          element={<ProcessingDetails />}
        />

        <Route
          path="/alerts"
          element={<Alerts />}
        />

        */}

      </Route>


      {/* ================================================== */}
      {/* DEFAULT */}
      {/* ================================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/overview"
            replace
          />
        }
      />


      <Route
        path="*"
        element={
          <Navigate
            to="/overview"
            replace
          />
        }
      />

    </Routes>
  );
}