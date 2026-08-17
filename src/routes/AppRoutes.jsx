/*
|--------------------------------------------------------------------------
| VanDrishti Application Routes
|--------------------------------------------------------------------------
|
| PURPOSE
|--------------------------------------------------------------------------
|
| This file defines navigation and access control for the entire
| VanDrishti frontend.
|
|
| ROUTE STRUCTURE
|--------------------------------------------------------------------------
|
| Public
|
| /login
|
|
| Protected
|
| /overview
| /tigers
| /tigers/:tigerId
| /cameras
| /cameras/:cameraId
|
|
| FUTURE
|
| /reviews
| /processing
| /alerts
| /sightings
|
|--------------------------------------------------------------------------
|
| IMPORTANT
|--------------------------------------------------------------------------
|
| AppLayout contains shared authenticated UI:
|
|             AppLayout
|                 │
|        ┌────────┴────────┐
|        │                 │
|     <Outlet />     BottomNavigation
|        │
|        ├── Overview
|        ├── Tigers
|        ├── Cameras
|        └── ...
|
|
| This means individual pages do NOT need to render
| BottomNavigation themselves.
|
|--------------------------------------------------------------------------
*/

import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";


// ============================================================================
// AUTH
// ============================================================================

import Login from "../pages/Login/Login";


// ============================================================================
// LAYOUT
// ============================================================================

import AppLayout from "../components/layout/AppLayout";


// ============================================================================
// PAGES
// ============================================================================

import Overview from "../pages/Overview/Overview";

import Tigers from "../pages/Tigers/Tigers";

import TigerProfile from "../pages/Tigers/TigerProfile";

import CameraDetails from "../pages/Camera/CameraDetails";
import Cameras from "../pages/Camera/Cameras";
import Alerts from "../pages/Alerts/Alerts";
// ============================================================================
// PROTECTED ROUTE
// ============================================================================

/*
|--------------------------------------------------------------------------
| ProtectedRoute
|--------------------------------------------------------------------------
|
| Checks whether a Forest Officer is authenticated.
|
| IMPORTANT:
|--------------------------------------------------------------------------
|
| We are NOT creating:
|
| - Admin login
| - Public registration
| - Role management
|
| VanDrishti currently uses:
|
| Forest Officer ID + Password
|
|--------------------------------------------------------------------------
|
| This reads the authentication state from localStorage.
|
| Later, the backend authentication/session mechanism can replace this.
|
*/

function ProtectedRoute({
  children,
}) {

  const session =
    localStorage.getItem(
      "vandrishti_session"
    );


  /*
  |--------------------------------------------------------------------------
  | No session
  |--------------------------------------------------------------------------
  |
  | Send the user back to login.
  |
  */

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


// ============================================================================
// APP ROUTES
// ============================================================================

export default function AppRoutes() {

  return (

    <Routes>


      {/* ================================================================ */}
      {/* PUBLIC ROUTES                                                    */}
      {/* ================================================================ */}

      <Route
        path="/login"
        element={
          <Login />
        }
      />


      {/* ================================================================ */}
      {/* PROTECTED APPLICATION                                            */}
      {/* ================================================================ */}

      <Route
        element={

          <ProtectedRoute>

            <AppLayout />

          </ProtectedRoute>

        }
      >


        {/* ============================================================ */}
        {/* OVERVIEW                                                     */}
        {/* ============================================================ */}

        <Route
          path="/overview"
          element={
            <Overview />
          }
        />


        {/* ============================================================ */}
        {/* TIGERS                                                       */}
        {/* ============================================================ */}

        <Route
          path="/tigers"
          element={
            <Tigers />
          }
        />


        {/* ============================================================ */}
        {/* TIGER PROFILE                                                */}
        {/* ============================================================ */}

        <Route
          path="/tigers/:tigerId"
          element={
            <TigerProfile />
          }
        />


        {/* ============================================================ */}
        {/* CAMERA DATA CENTER                                           */}
        {/* ============================================================ */}

        <Route
          path="/cameras"
          element={
            <Cameras />
          }
        />


        {/* ============================================================ */}
        {/* CAMERA DETAILS                                               */}
        {/* ============================================================ */}

        <Route
          path="/cameras/:cameraId"
          element={
            <CameraDetails />
          }
        />


        {/* ============================================================ */}
        {/* FUTURE ROUTES                                                */}
        {/* ============================================================ */}

        {/*
        |--------------------------------------------------------------------------
        | IMAGE REVIEW
        |--------------------------------------------------------------------------
        |
        | Will consume pending AI detections generated from processing jobs.
        |
        | <Route
        |   path="/reviews"
        |   element={<ImageReview />}
        | />
        |
        |--------------------------------------------------------------------------
        */}


        {/*
        |--------------------------------------------------------------------------
        | PROCESSING DETAILS
        |--------------------------------------------------------------------------
        |
        | Will show a complete processing pipeline for a dataset/job.
        |
        | <Route
        |   path="/processing/:jobId"
        |   element={<ProcessingDetails />}
        | />
        |
        |--------------------------------------------------------------------------
        */}


        {/*
        |--------------------------------------------------------------------------
        | ALERTS
        |--------------------------------------------------------------------------
        |
        | <Route
        |   path="/alerts"
        |   element={<Alerts />}
        | />
        |
        |--------------------------------------------------------------------------
        */}
 <Route
          path="/alerts"
          element={<Alerts />}
         />

        {/*
        |--------------------------------------------------------------------------
        | SIGHTINGS
        |--------------------------------------------------------------------------
        |
        | <Route
        |   path="/sightings"
        |   element={<Sightings />}
        | />
        |
        |--------------------------------------------------------------------------
        */}


      </Route>


      {/* ================================================================ */}
      {/* DEFAULT ROUTE                                                   */}
      {/* ================================================================ */}

      <Route
        path="/"
        element={
          <Navigate
            to="/overview"
            replace
          />
        }
      />


      {/* ================================================================ */}
      {/* 404 FALLBACK                                                    */}
      {/* ================================================================ */}

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