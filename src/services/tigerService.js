/*
|--------------------------------------------------------------------------
| Tiger Service
|--------------------------------------------------------------------------
|
| PURPOSE:
| This file is the frontend abstraction layer for Tiger-related APIs.
|
| COMPONENTS SHOULD NOT DIRECTLY CALL fetch().
|
| Instead:
|
| Tigers.jsx
|     ↓
| tigerService
|     ↓
| api.js
|     ↓
| mockApi / real backend
|
|--------------------------------------------------------------------------
*/

import { api } from "./api";


export const tigerService = {

  /*
  |--------------------------------------------------------------------------
  | GET ALL TIGERS
  |--------------------------------------------------------------------------
  |
  | Backend contract:
  |
  | GET /api/tigers
  |
  | Expected response:
  |
  | {
  |   success: true,
  |   data: [...]
  | }
  |
  */

  async getTigers() {
    return api.get(
      "/api/tigers"
    );
  },


  /*
  |--------------------------------------------------------------------------
  | GET SINGLE TIGER
  |--------------------------------------------------------------------------
  |
  | Backend contract:
  |
  | GET /api/tigers/:tigerId
  |
  | Example:
  |
  | GET /api/tigers/TGR-024
  |
  */

  async getTiger(tigerId) {
    return api.get(
      `/api/tigers/${tigerId}`
    );
  },


  /*
  |--------------------------------------------------------------------------
  | GET TIGER SIGHTINGS
  |--------------------------------------------------------------------------
  |
  | Backend contract:
  |
  | GET /api/tigers/:tigerId/sightings
  |
  | Used by:
  | Tiger Profile → Sighting History
  |
  */

  async getTigerSightings(
    tigerId
  ) {
    return api.get(
      `/api/tigers/${tigerId}/sightings`
    );
  },


  /*
  |--------------------------------------------------------------------------
  | GET TIGER RE-ID HISTORY
  |--------------------------------------------------------------------------
  |
  | Backend contract:
  |
  | GET /api/tigers/:tigerId/reid
  |
  | This endpoint will eventually be connected to the
  | machine-learning / Re-ID pipeline.
  |
  */

  async getTigerReidHistory(
    tigerId
  ) {
    return api.get(
      `/api/tigers/${tigerId}/reid`
    );
  },
};