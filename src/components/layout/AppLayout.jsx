/*
|--------------------------------------------------------------------------
| VanDrishti Application Layout
|--------------------------------------------------------------------------
|
| PURPOSE
| -------
| This component defines the shared layout for all authenticated pages.
|
| It intentionally does NOT contain page-specific business logic.
|
| Current structure:
|
|                    AppLayout
|                       │
|              ┌────────┴────────┐
|              │                 │
|           <Outlet />      BottomNavigation
|              │
|              ├── Overview
|              ├── Tigers
|              ├── Tiger Profile
|              ├── Cameras
|              ├── Review
|              └── Alerts
|
|
| WHY THIS EXISTS
| --------------
| We do NOT want to put the BottomNavigation inside every page.
|
| Without this layout:
|
| Overview.jsx
|   └── BottomNavigation
|
| Tigers.jsx
|   └── BottomNavigation
|
| Cameras.jsx
|   └── BottomNavigation
|
| ...etc.
|
| That would duplicate shared UI.
|
| Instead:
|
| AppLayout
|   ├── Current Page
|   └── BottomNavigation
|
| React Router's <Outlet /> automatically renders the current
| child route here.
|
|--------------------------------------------------------------------------
*/

import {
  Outlet,
} from "react-router-dom";

import BottomNavigation from "../navigation/BottomNavigation";


export default function AppLayout() {

  return (

    <div className="min-h-screen">

      {/*
      |--------------------------------------------------------------------------
      | PAGE CONTENT
      |--------------------------------------------------------------------------
      |
      | React Router renders the currently matched protected page here.
      |
      | Example:
      |
      | /overview
      |      ↓
      | <Overview />
      |
      | /tigers
      |      ↓
      | <Tigers />
      |
      | /tigers/TGR-024
      |      ↓
      | <TigerProfile />
      |
      */}

      <Outlet />


      {/*
      |--------------------------------------------------------------------------
      | GLOBAL BOTTOM NAVIGATION
      |--------------------------------------------------------------------------
      |
      | This component remains visible across the authenticated
      | VanDrishti application.
      |
      | The navigation itself detects the current route and highlights
      | the appropriate section.
      |
      */}

      <BottomNavigation />

    </div>

  );

}