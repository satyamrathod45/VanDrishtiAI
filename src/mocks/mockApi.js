/*
|--------------------------------------------------------------------------
| VanDrishti Mock API
|--------------------------------------------------------------------------
|
| PURPOSE
|--------------------------------------------------------------------------
|
| This file simulates the VanDrishti backend while the real backend
| is being developed.
|
| The frontend should NEVER depend directly on mockDB.
|
| Frontend
|    ↓
| Service
|    ↓
| api.js
|    ↓
| mockApi.js       ← THIS FILE
|    ↓
| mockDB
|
|
| IMPORTANT
|--------------------------------------------------------------------------
|
| VanDrishti uses OFFLINE camera traps.
|
| The actual field workflow is:
|
| Camera Trap
|      ↓
| SD Card
|      ↓
| Forest Officer collects SD Card
|      ↓
| Dataset Import
|      ↓
| Processing Job
|      ↓
| AI Detection
|      ↓
| Re-ID
|      ↓
| Tiger / Review
|
|
| The mock API therefore models:
|
| 1. Forest Officer authentication
| 2. Dashboard / Overview
| 3. Tigers
| 4. Tiger sightings
| 5. Tiger Re-ID
| 6. Cameras
| 7. Camera collections
| 8. Camera captures
| 9. Processing jobs
| 10. Image import sessions
| 11. Alerts
| 12. Image reviews
|
|--------------------------------------------------------------------------
*/

import { mockDB } from "./db";


// ============================================================================
// MOCK NETWORK DELAY
// ============================================================================

/*
|--------------------------------------------------------------------------
| Simulate real API latency.
|--------------------------------------------------------------------------
|
| This is useful because it forces the frontend to properly handle:
|
| - Loading states
| - Error states
| - Async requests
| - Skeletons
|
*/

const delay = (
  milliseconds = 400
) => {

  return new Promise(
    (resolve) => {

      setTimeout(
        resolve,
        milliseconds
      );

    }
  );

};


// ============================================================================
// API RESPONSE HELPERS
// ============================================================================

/*
|--------------------------------------------------------------------------
| SUCCESS RESPONSE
|--------------------------------------------------------------------------
|
| All successful mock API calls follow the same structure.
|
| {
|     success: true,
|     data: ...
| }
|
*/

const successResponse = (
  data
) => {

  return {
    success: true,
    data,
  };

};


/*
|--------------------------------------------------------------------------
| ERROR HELPER
|--------------------------------------------------------------------------
*/

const createApiError = (
  message,
  status = 400
) => {

  const error =
    new Error(message);

  error.status =
    status;

  return error;

};


/*
|--------------------------------------------------------------------------
| SANITIZE FOREST OFFICER
|--------------------------------------------------------------------------
|
| Passwords should NEVER be returned to the frontend.
|
| The mock database contains passwords only because we are simulating
| authentication.
|
| A real backend would hash passwords and never expose them.
|
*/

const sanitizeOfficer = (
  officer
) => {

  const {
    password,
    ...safeOfficer
  } = officer;

  return safeOfficer;

};


// ============================================================================
// MOCK API
// ============================================================================

export const mockApi = {


  // ==========================================================================
  // GET
  // ==========================================================================

  async get(
    endpoint
  ) {

    await delay();


    // ========================================================================
    // TIGER PROFILE
    // ========================================================================

    /*
    |--------------------------------------------------------------------------
    | GET /api/tigers/:tigerId
    |--------------------------------------------------------------------------
    */

    const tigerProfileMatch =
      endpoint.match(
        /^\/api\/tigers\/([^/]+)$/
      );


    if (
      tigerProfileMatch
    ) {

      const tigerId =
        tigerProfileMatch[1];


      const tiger =
        mockDB.tigers.find(
          (item) =>
            item.id ===
            tigerId
        );


      if (!tiger) {

        throw createApiError(
          "Tiger not found.",
          404
        );

      }


      return successResponse(
        tiger
      );

    }


    // ========================================================================
    // TIGER SIGHTINGS
    // ========================================================================

    /*
    |--------------------------------------------------------------------------
    | GET /api/tigers/:tigerId/sightings
    |--------------------------------------------------------------------------
    */

    const tigerSightingsMatch =
      endpoint.match(
        /^\/api\/tigers\/([^/]+)\/sightings$/
      );


    if (
      tigerSightingsMatch
    ) {

      const tigerId =
        tigerSightingsMatch[1];


      const sightings =
        mockDB.tigerSightings.filter(
          (item) =>
            item.tigerId ===
            tigerId
        );


      return successResponse(
        sightings
      );

    }


    // ========================================================================
    // TIGER RE-ID
    // ========================================================================

    /*
    |--------------------------------------------------------------------------
    | GET /api/tigers/:tigerId/reid
    |--------------------------------------------------------------------------
    */

    const tigerReidMatch =
      endpoint.match(
        /^\/api\/tigers\/([^/]+)\/reid$/
      );


    if (
      tigerReidMatch
    ) {

      const tigerId =
        tigerReidMatch[1];


      const matches =
        mockDB.tigerReidMatches.filter(
          (item) =>
            item.tigerId ===
            tigerId
        );


      return successResponse(
        matches
      );

    }


    // ========================================================================
    // CAMERA PROFILE
    // ========================================================================

    /*
    |--------------------------------------------------------------------------
    | GET /api/cameras/:cameraId
    |--------------------------------------------------------------------------
    */

    const cameraProfileMatch =
      endpoint.match(
        /^\/api\/cameras\/([^/]+)$/
      );


    if (
      cameraProfileMatch
    ) {

      const cameraId =
        cameraProfileMatch[1];


      const camera =
        mockDB.cameras.find(
          (item) =>
            item.id ===
            cameraId
        );


      if (!camera) {

        throw createApiError(
          "Camera not found.",
          404
        );

      }


      return successResponse(
        camera
      );

    }


    // ========================================================================
    // CAMERA COLLECTIONS
    // ========================================================================

    /*
    |--------------------------------------------------------------------------
    | GET /api/cameras/:cameraId/collections
    |--------------------------------------------------------------------------
    */

    const cameraCollectionsMatch =
      endpoint.match(
        /^\/api\/cameras\/([^/]+)\/collections$/
      );


    if (
      cameraCollectionsMatch
    ) {

      const cameraId =
        cameraCollectionsMatch[1];


      const collections =
        mockDB.cameraCollections.filter(
          (item) =>
            item.cameraId ===
            cameraId
        );


      return successResponse(
        collections
      );

    }


    // ========================================================================
    // CAMERA CAPTURES
    // ========================================================================

    /*
    |--------------------------------------------------------------------------
    | GET /api/cameras/:cameraId/captures
    |--------------------------------------------------------------------------
    */

    const cameraCapturesMatch =
      endpoint.match(
        /^\/api\/cameras\/([^/]+)\/captures$/
      );


    if (
      cameraCapturesMatch
    ) {

      const cameraId =
        cameraCapturesMatch[1];


      const captures =
        mockDB.cameraCaptures.filter(
          (item) =>
            item.cameraId ===
            cameraId
        );


      return successResponse(
        captures
      );

    }


    // ========================================================================
    // STATIC GET ENDPOINTS
    // ========================================================================

    switch (
      endpoint
    ) {


      // ======================================================================
      // OVERVIEW
      // ======================================================================

      /*
      |--------------------------------------------------------------------------
      | GET /api/overview
      |--------------------------------------------------------------------------
      |
      | Main VanDrishti command dashboard data.
      |
      */

      case "/api/overview":

        return successResponse({

          system: {

            status:
              "operational",

            lastUpdated:
              "2026-08-15T18:42:00Z",

            monitoringActive:
              true,

          },


          statistics: {

            totalTigers:
              47,

            identifiedTigers:
              42,

            unknownTigers:
              5,

            totalSightings:
              1284,

            todaysSightings:
              18,

            totalCameras:
              124,

            deployedCameras:
              118,

            collectionDue:
              6,

            pendingProcessingImages:
              1521,

            pendingReviews:
              12,

            activeAlerts:
              2,

          },


          activity: [

            {
              label: "Mon",
              sightings: 42,
            },

            {
              label: "Tue",
              sightings: 56,
            },

            {
              label: "Wed",
              sightings: 48,
            },

            {
              label: "Thu",
              sightings: 71,
            },

            {
              label: "Fri",
              sightings: 64,
            },

            {
              label: "Sat",
              sightings: 82,
            },

            {
              label: "Sun",
              sightings: 68,
            },

          ],


          recentSightings: [

            {
              id: "SIG-1024",

              tigerId:
                "TGR-024",

              tigerName:
                "T-024",

              cameraId:
                "CAM-018",

              location:
                "Zone A · Moharli",

              time:
                "18:42",

              confidence:
                97,

              status:
                "verified",

            },


            {
              id: "SIG-1023",

              tigerId:
                "TGR-011",

              tigerName:
                "T-011",

              cameraId:
                "CAM-042",

              location:
                "Zone B · Navegaon",

              time:
                "17:56",

              confidence:
                94,

              status:
                "verified",

            },


            {
              id: "SIG-1022",

              tigerId:
                "TGR-037",

              tigerName:
                "T-037",

              cameraId:
                "CAM-031",

              location:
                "Zone C · Tadoba",

              time:
                "17:21",

              confidence:
                89,

              status:
                "review",

            },


            {
              id: "SIG-1021",

              tigerId:
                "TGR-006",

              tigerName:
                "T-006",

              cameraId:
                "CAM-011",

              location:
                "Zone A · Moharli",

              time:
                "16:48",

              confidence:
                96,

              status:
                "verified",

            },

          ],


          intelligence: {

            newSightings:
              12,

            reidMatches:
              9,

            pendingReviews:
              4,

            alerts:
              2,

            detectionAccuracy:
              94.7,

          },


          zones: [

            {
              id:
                "ZONE-A",

              name:
                "Moharli",

              sightings:
                38,

              status:
                "active",

            },


            {
              id:
                "ZONE-B",

              name:
                "Navegaon",

              sightings:
                27,

              status:
                "active",

            },


            {
              id:
                "ZONE-C",

              name:
                "Tadoba",

              sightings:
                19,

              status:
                "active",

            },

          ],

        });


      // ======================================================================
      // TIGERS
      // ======================================================================

      /*
      |--------------------------------------------------------------------------
      | GET /api/tigers
      |--------------------------------------------------------------------------
      */

      case "/api/tigers":

        return successResponse(
          mockDB.tigers
        );


      // ======================================================================
      // CAMERAS
      // ======================================================================

      /*
      |--------------------------------------------------------------------------
      | GET /api/cameras
      |--------------------------------------------------------------------------
      |
      | Returns the deployed camera-trap registry.
      |
      | IMPORTANT:
      |
      | "status" represents field/deployment state.
      | It does NOT mean internet connectivity.
      |
      */

      case "/api/cameras":

        return successResponse(
          mockDB.cameras
        );


      // ======================================================================
      // ALL CAMERA COLLECTIONS
      // ======================================================================

      /*
      |--------------------------------------------------------------------------
      | GET /api/collections
      |--------------------------------------------------------------------------
      */

      case "/api/collections":

        return successResponse(
          mockDB.cameraCollections
        );


      // ======================================================================
      // ALL PROCESSING JOBS
      // ======================================================================

      /*
      |--------------------------------------------------------------------------
      | GET /api/processing/jobs
      |--------------------------------------------------------------------------
      */

      case "/api/processing/jobs":

        return successResponse(
          mockDB.processingJobs
        );


      // ======================================================================
      // ALL SIGHTINGS
      // ======================================================================

      /*
      |--------------------------------------------------------------------------
      | GET /api/sightings
      |--------------------------------------------------------------------------
      */

      case "/api/sightings":

        return successResponse(
          mockDB.sightings
        );


      // ======================================================================
      // ALERTS
      // ======================================================================

      /*
      |--------------------------------------------------------------------------
      | GET /api/alerts
      |--------------------------------------------------------------------------
      */

      case "/api/alerts":

        return successResponse(
          mockDB.alerts
        );


      // ======================================================================
      // IMAGE REVIEWS
      // ======================================================================

      /*
      |--------------------------------------------------------------------------
      | GET /api/reviews
      |--------------------------------------------------------------------------
      |
      | These are images that require human verification.
      |
      */

      case "/api/reviews":

        return successResponse(
          mockDB.reviews
        );


      // ======================================================================
      // UNKNOWN ENDPOINT
      // ======================================================================

      default:

        throw createApiError(
          `GET ${endpoint} is not implemented in the VanDrishti Mock API.`,
          404
        );

    }

  },


  // ==========================================================================
  // POST
  // ==========================================================================

  async post(
    endpoint,
    body
  ) {

    await delay();


    switch (
      endpoint
    ) {


      // ======================================================================
      // FOREST OFFICER LOGIN
      // ======================================================================

      /*
      |--------------------------------------------------------------------------
      | POST /api/auth/login
      |--------------------------------------------------------------------------
      |
      | VanDrishti intentionally does NOT have:
      |
      | - Admin login
      | - Public registration
      | - Multiple user login systems
      |
      | Authentication is based on:
      |
      | Forest Officer ID + Password
      |
      */

      case "/api/auth/login": {

        const {
          officerId,
          password,
        } = body;


        if (
          !officerId ||
          !password
        ) {

          throw createApiError(
            "Forest Officer ID and password are required.",
            400
          );

        }


        const officer =
          mockDB.forestOfficers.find(
            (item) =>
              item.id
                .toLowerCase() ===
              officerId
                .toLowerCase()
          );


        if (!officer) {

          throw createApiError(
            "Invalid Forest Officer ID or password.",
            401
          );

        }


        if (
          officer.password !==
          password
        ) {

          throw createApiError(
            "Invalid Forest Officer ID or password.",
            401
          );

        }


        if (
          !officer.active
        ) {

          throw createApiError(
            "This Forest Officer account is inactive.",
            403
          );

        }


        /*
        |--------------------------------------------------------------------------
        | MOCK SESSION
        |--------------------------------------------------------------------------
        |
        | Production backend can replace this with JWT/session authentication.
        |
        */

        const sessionId =
          `MOCK-SESSION-${officer.id}-${Date.now()}`;


        return successResponse({

          session: {

            authenticated:
              true,

            sessionId,

            expiresIn:
              3600,

          },


          officer:
            sanitizeOfficer(
              officer
            ),

        });

      }


      // ======================================================================
      // LOGOUT
      // ======================================================================

      /*
      |--------------------------------------------------------------------------
      | POST /api/auth/logout
      |--------------------------------------------------------------------------
      */

      case "/api/auth/logout":

        return successResponse({

          message:
            "Forest Officer logged out successfully.",

        });


      // ======================================================================
      // CREATE CAMERA DATA IMPORT
      // ======================================================================

      /*
      |--------------------------------------------------------------------------
      | POST /api/imports
      |--------------------------------------------------------------------------
      |
      | IMPORTANT BACKEND CONTRACT
      |--------------------------------------------------------------------------
      |
      | This endpoint DOES NOT receive the huge ZIP directly.
      |
      | The correct production workflow is:
      |
      | Frontend
      |    ↓
      | POST /api/imports
      |    ↓
      | Backend creates upload session
      |    ↓
      | Backend returns upload URL
      |    ↓
      | Browser uploads large file
      |    ↓
      | Object Storage
      |    ↓
      | Upload complete
      |    ↓
      | Backend creates processing job
      |
      */

      case "/api/imports": {

        const {
          cameraId,
          collectionDate,
          collectedBy,
          datasetName,
          sourceType,
          fileName,
          fileSize,
        } = body;


        if (!cameraId) {

          throw createApiError(
            "Camera ID is required.",
            400
          );

        }


        if (!collectionDate) {

          throw createApiError(
            "Collection date is required.",
            400
          );

        }


        if (!collectedBy) {

          throw createApiError(
            "Collector information is required.",
            400
          );

        }


        const importId =
          `IMP-${Date.now()}`;


        const uploadId =
          `UPLOAD-${Date.now()}`;


        return successResponse({

          importId,

          uploadId,

          status:
            "upload_pending",


          dataset: {

            cameraId,

            collectionDate,

            collectedBy,

            datasetName:
              datasetName ||
              "Untitled Dataset",

            sourceType:
              sourceType ||
              "zip",

            fileName:
              fileName ||
              null,

            fileSize:
              fileSize ||
              0,

          },


          upload: {

            method:
              "PUT",

            uploadUrl:
              `/mock-upload/${uploadId}`,

            expiresIn:
              3600,

          },

        });

      }


      // ======================================================================
      // REVIEW DECISION
      // ======================================================================

      /*
      |--------------------------------------------------------------------------
      | POST /api/reviews/:reviewId/decision
      |--------------------------------------------------------------------------
      |
      | Future human-in-the-loop workflow.
      |
      | Example:
      |
      | {
      |    decision: "confirmed",
      |    tigerId: "TGR-024"
      | }
      |
      */

      default: {

        const reviewMatch =
          endpoint.match(
            /^\/api\/reviews\/([^/]+)\/decision$/
          );


        if (
          reviewMatch
        ) {

          const reviewId =
            reviewMatch[1];


          return successResponse({

            reviewId,

            status:
              "decision_recorded",

            message:
              "Mock review decision recorded.",

            decision:
              body?.decision ||
              null,

            tigerId:
              body?.tigerId ||
              null,

          });

        }


        throw createApiError(
          `POST ${endpoint} is not implemented in the VanDrishti Mock API.`,
          404
        );

      }

    }

  },


  // ==========================================================================
  // PUT
  // ==========================================================================

  async put(
    endpoint,
    body
  ) {

    await delay();


    /*
    |--------------------------------------------------------------------------
    | PUT PLACEHOLDER
    |--------------------------------------------------------------------------
    |
    | Future examples:
    |
    | PUT /api/tigers/:id
    | PUT /api/cameras/:id
    | PUT /api/alerts/:id
    |
    */

    console.log(
      "[VanDrishti MOCK PUT]",
      endpoint,
      body
    );


    return successResponse({

      message:
        "Mock PUT request accepted.",

      endpoint,

      data:
        body,

    });

  },


  // ==========================================================================
  // DELETE
  // ==========================================================================

  async delete(
    endpoint
  ) {

    await delay();


    /*
    |--------------------------------------------------------------------------
    | DELETE PLACEHOLDER
    |--------------------------------------------------------------------------
    |
    | Wildlife evidence should generally not be permanently deleted.
    |
    | Production backend should prefer:
    |
    | - Archiving
    | - Soft deletion
    | - Status changes
    |
    */

    console.log(
      "[VanDrishti MOCK DELETE]",
      endpoint
    );


    return successResponse({

      message:
        "Mock DELETE request accepted.",

      endpoint,

    });

  },

};