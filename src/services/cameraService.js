/*
|--------------------------------------------------------------------------
| VanDrishti Camera Service
|--------------------------------------------------------------------------
|
| PURPOSE
| -------
| This service isolates camera-related API calls from the UI.
|
| Components should NOT directly call:
|
| fetch("/api/cameras")
|
| Instead:
|
| Cameras.jsx
|      ↓
| cameraService
|      ↓
| api.js
|      ↓
| mockApi / real backend
|
|--------------------------------------------------------------------------
*/

import { api } from "./api";


export const cameraService = {


  /*
  |--------------------------------------------------------------------------
  | GET CAMERA REGISTRY
  |--------------------------------------------------------------------------
  |
  | GET /api/cameras
  |
  | Returns deployed camera-trap metadata.
  |
  */

  async getCameras() {

    return api.get(
      "/api/cameras"
    );

  },


  /*
  |--------------------------------------------------------------------------
  | GET SINGLE CAMERA
  |--------------------------------------------------------------------------
  |
  | GET /api/cameras/:cameraId
  |
  */

  async getCamera(
    cameraId
  ) {

    return api.get(
      `/api/cameras/${cameraId}`
    );

  },


  /*
  |--------------------------------------------------------------------------
  | GET CAMERA COLLECTIONS
  |--------------------------------------------------------------------------
  |
  | GET /api/cameras/:cameraId/collections
  |
  | Returns physical SD-card/data collection events.
  |
  */

  async getCollections(
    cameraId
  ) {

    return api.get(
      `/api/cameras/${cameraId}/collections`
    );

  },


  /*
  |--------------------------------------------------------------------------
  | GET CAMERA CAPTURES
  |--------------------------------------------------------------------------
  |
  | GET /api/cameras/:cameraId/captures
  |
  | Returns processed observations originating from this camera.
  |
  */

  async getCaptures(
    cameraId
  ) {

    return api.get(
      `/api/cameras/${cameraId}/captures`
    );

  },


  /*
  |--------------------------------------------------------------------------
  | GET PROCESSING JOBS
  |--------------------------------------------------------------------------
  |
  | GET /api/processing/jobs
  |
  */

  async getProcessingJobs() {

    return api.get(
      "/api/processing/jobs"
    );

  },


  /*
  |--------------------------------------------------------------------------
  | CREATE IMPORT SESSION
  |--------------------------------------------------------------------------
  |
  | POST /api/imports
  |
  | IMPORTANT:
  |
  | This does NOT upload a 15 GB ZIP directly to the API.
  |
  | A real backend should eventually return an upload session,
  | presigned URL, multipart upload information, etc.
  |
  */

  async createImportSession(
    metadata
  ) {

    return api.post(
      "/api/imports",
      metadata
    );

  },


};