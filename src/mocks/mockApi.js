/*
|--------------------------------------------------------------------------
| VanDrishti Mock API
|--------------------------------------------------------------------------
|
| PURPOSE
| -------
| This file simulates the backend API while the actual backend is being
| developed.
|
| The frontend communicates with this file through `api.js`.
|
| Current architecture:
|
| Component
|    ↓
| Service
|    ↓
| api.js
|    ↓
| mockApi.js       ← CURRENT FILE
|    ↓
| mockDB.js
|
|
| WHEN BACKEND IS READY
| ---------------------
| The frontend should NOT need to change its components.
|
| We simply change:
|
|     USE_MOCK_API = true
|
| to:
|
|     USE_MOCK_API = false
|
| in `services/api.js`.
|
|
| IMPORTANT FOR BACKEND DEVELOPERS
| --------------------------------
| The endpoint names and response structures below represent the API
| contracts expected by the frontend.
|
| The mock database is NOT the final database schema.
|
|--------------------------------------------------------------------------
*/

import { mockDB } from "./db";


// ============================================================================
// CONFIGURATION
// ============================================================================

/*
|--------------------------------------------------------------------------
| MOCK NETWORK DELAY
|--------------------------------------------------------------------------
|
| Real APIs have network/database latency.
|
| We intentionally simulate a small delay so the frontend can properly
| implement:
|
| - Loading states
| - Skeletons
| - Error states
| - Async behaviour
|
*/

const delay = (
  milliseconds = 450
) => {
  return new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        milliseconds
      )
  );
};


// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/*
|--------------------------------------------------------------------------
| REMOVE SENSITIVE OFFICER DATA
|--------------------------------------------------------------------------
|
| Passwords should NEVER be returned to the frontend.
|
| The mock database contains passwords only because it is simulating
| authentication.
|
| A real backend should return a safe user/session object instead.
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


/*
|--------------------------------------------------------------------------
| SUCCESS RESPONSE
|--------------------------------------------------------------------------
|
| Keeping a consistent response structure makes the frontend easier
| to maintain.
|
| Example:
|
| {
|   success: true,
|   data: [...]
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
| ERROR CREATOR
|--------------------------------------------------------------------------
|
| The frontend services can catch this error and display an appropriate
| message.
|
*/

const createApiError = (
  message,
  status = 400
) => {

  const error =
    new Error(message);

  error.status = status;

  return error;
};


// ============================================================================
// MOCK API
// ============================================================================

export const mockApi = {


  // ==========================================================================
  // GET
  // ==========================================================================

  async get(endpoint) {

    /*
    |--------------------------------------------------------------------------
    | Simulate network latency
    |--------------------------------------------------------------------------
    */

    await delay();


    // ========================================================================
    // DYNAMIC TIGER ENDPOINTS
    // ========================================================================
    //
    // These must be checked BEFORE the static switch.
    //
    // Supported:
    //
    // GET /api/tigers/:tigerId
    // GET /api/tigers/:tigerId/sightings
    // GET /api/tigers/:tigerId/reid
    //
    // ========================================================================


    /*
    |--------------------------------------------------------------------------
    | GET SINGLE TIGER
    |--------------------------------------------------------------------------
    |
    | Endpoint:
    |
    | GET /api/tigers/TGR-024
    |
    | Used by:
    |
    | TigerProfile.jsx
    |
    */

    const tigerProfileMatch =
      endpoint.match(
        /^\/api\/tigers\/([^/]+)$/
      );


    if (tigerProfileMatch) {

      const tigerId =
        tigerProfileMatch[1];


      const tiger =
        mockDB.tigers.find(
          (item) =>
            item.id === tigerId
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


    /*
    |--------------------------------------------------------------------------
    | GET TIGER SIGHTINGS
    |--------------------------------------------------------------------------
    |
    | Endpoint:
    |
    | GET /api/tigers/TGR-024/sightings
    |
    | Used by:
    |
    | TigerProfile.jsx
    |
    */

    const tigerSightingsMatch =
      endpoint.match(
        /^\/api\/tigers\/([^/]+)\/sightings$/
      );


    if (tigerSightingsMatch) {

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


    /*
    |--------------------------------------------------------------------------
    | GET TIGER RE-ID HISTORY
    |--------------------------------------------------------------------------
    |
    | Endpoint:
    |
    | GET /api/tigers/TGR-024/reid
    |
    | Used by:
    |
    | TigerProfile.jsx
    |
    | Future backend source:
    |
    | ML / Re-ID pipeline
    |
    */

    const tigerReidMatch =
      endpoint.match(
        /^\/api\/tigers\/([^/]+)\/reid$/
      );


    if (tigerReidMatch) {

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
    // STATIC ENDPOINTS
    // ========================================================================

    switch (endpoint) {


      // ======================================================================
      // OVERVIEW
      // ======================================================================

      /*
      |--------------------------------------------------------------------------
      | GET OVERVIEW
      |--------------------------------------------------------------------------
      |
      | Endpoint:
      |
      | GET /api/overview
      |
      | Purpose:
      |
      | Provides the data required by the VanDrishti command dashboard.
      |
      | A real backend can construct this response from:
      |
      | - Tiger database
      | - Camera service
      | - Sightings database
      | - Re-ID pipeline
      | - Alert service
      |
      */

      case "/api/overview":

        return successResponse({

          /*
          |--------------------------------------------------------------------------
          | SYSTEM STATUS
          |--------------------------------------------------------------------------
          */

          system: {

            status:
              "operational",

            lastUpdated:
              "2026-08-15T18:42:00Z",

            monitoringActive:
              true,
          },


          /*
          |--------------------------------------------------------------------------
          | DASHBOARD STATISTICS
          |--------------------------------------------------------------------------
          */

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

            onlineCameras:
              118,

            offlineCameras:
              6,

            pendingReviews:
              4,

            activeAlerts:
              2,
          },


          /*
          |--------------------------------------------------------------------------
          | TIGER ACTIVITY CHART
          |--------------------------------------------------------------------------
          |
          | Used by:
          |
          | Overview → Wildlife Activity
          |
          */

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


          /*
          |--------------------------------------------------------------------------
          | RECENT SIGHTINGS
          |--------------------------------------------------------------------------
          */

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


          /*
          |--------------------------------------------------------------------------
          | INTELLIGENCE SUMMARY
          |--------------------------------------------------------------------------
          */

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


          /*
          |--------------------------------------------------------------------------
          | ZONE ACTIVITY
          |--------------------------------------------------------------------------
          */

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
      // TIGER LIST
      // ======================================================================

      /*
      |--------------------------------------------------------------------------
      | GET ALL TIGERS
      |--------------------------------------------------------------------------
      |
      | Endpoint:
      |
      | GET /api/tigers
      |
      | Used by:
      |
      | Tigers.jsx
      |
      | Backend should eventually support:
      |
      | - Pagination
      | - Search
      | - Zone filtering
      | - Status filtering
      |
      | Example future API:
      |
      | GET /api/tigers?page=1&limit=20&zone=Moharli
      |
      */

      case "/api/tigers":

        return successResponse(
          mockDB.tigers
        );


      // ======================================================================
      // CAMERA LIST
      // ======================================================================

      /*
      |--------------------------------------------------------------------------
      | GET ALL CAMERAS
      |--------------------------------------------------------------------------
      |
      | Endpoint:
      |
      | GET /api/cameras
      |
      | Used by:
      |
      | Future Cameras page
      |
      */

      case "/api/cameras":

        return successResponse(
          mockDB.cameras
        );


      // ======================================================================
      // GENERAL SIGHTINGS
      // ======================================================================

      /*
      |--------------------------------------------------------------------------
      | GET ALL SIGHTINGS
      |--------------------------------------------------------------------------
      |
      | Endpoint:
      |
      | GET /api/sightings
      |
      | Used by:
      |
      | Future:
      | - Sightings dashboard
      | - Analytics
      | - Review workflow
      |
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
      | GET ALERTS
      |--------------------------------------------------------------------------
      |
      | Endpoint:
      |
      | GET /api/alerts
      |
      | Future backend sources:
      |
      | - Camera failures
      | - Low confidence detections
      | - Unknown tiger detections
      | - Restricted-zone activity
      |
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
      | GET IMAGE REVIEWS
      |--------------------------------------------------------------------------
      |
      | Endpoint:
      |
      | GET /api/reviews
      |
      | Used by:
      |
      | Future Image Review page.
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
          `GET ${endpoint} is not implemented in the VanDrishti mock API.`,
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

    /*
    |--------------------------------------------------------------------------
    | Simulate network latency
    |--------------------------------------------------------------------------
    */

    await delay();


    switch (endpoint) {


      // ======================================================================
      // FOREST OFFICER LOGIN
      // ======================================================================

      /*
      |--------------------------------------------------------------------------
      | POST /api/auth/login
      |--------------------------------------------------------------------------
      |
      | IMPORTANT:
      |
      | VanDrishti currently does NOT implement:
      |
      | - Admin login
      | - Public user registration
      | - Multiple user roles
      |
      | Only Forest Officer authentication is required.
      |
      |
      | Request:
      |
      | {
      |   officerId: "FO-1024",
      |   password: "forest123"
      | }
      |
      |
      | Response:
      |
      | {
      |   success: true,
      |   data: {
      |      session: {...},
      |      officer: {...}
      |   }
      | }
      |
      */

      case "/api/auth/login": {

        const {
          officerId,
          password,
        } = body;


        /*
        |--------------------------------------------------------------------------
        | Validate request body
        |--------------------------------------------------------------------------
        */

        if (
          !officerId ||
          !password
        ) {

          throw createApiError(
            "Forest Officer ID and password are required.",
            400
          );

        }


        /*
        |--------------------------------------------------------------------------
        | Find officer
        |--------------------------------------------------------------------------
        */

        const officer =
          mockDB.forestOfficers.find(
            (item) =>
              item.id.toLowerCase() ===
              officerId
                .toLowerCase()
          );


        if (!officer) {

          throw createApiError(
            "Invalid Forest Officer ID or password.",
            401
          );

        }


        /*
        |--------------------------------------------------------------------------
        | Validate password
        |--------------------------------------------------------------------------
        */

        if (
          officer.password !==
          password
        ) {

          throw createApiError(
            "Invalid Forest Officer ID or password.",
            401
          );

        }


        /*
        |--------------------------------------------------------------------------
        | Check account status
        |--------------------------------------------------------------------------
        */

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
        | Create mock session
        |--------------------------------------------------------------------------
        |
        | Real backend equivalent could return:
        |
        | JWT
        | Refresh token
        | Session ID
        |
        */

        const sessionId =
          `MOCK-SESSION-${officer.id}-${Date.now()}`;


        return successResponse({

          session: {

            authenticated:
              true,

            sessionId,

            /*
             * Mock expiration.
             * Real backend should manage this.
             */

            expiresIn:
              3600,
          },


          /*
           * NEVER return password.
           */

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
      |
      | In the mock environment there is no real server-side session.
      |
      | The frontend can remove its local session.
      |
      | A real backend should invalidate the session/token here.
      |
      */

      case "/api/auth/logout":

        return successResponse({
          message:
            "Forest Officer logged out successfully.",
        });


      // ======================================================================
      // FUTURE IMAGE PROCESSING
      // ======================================================================

      /*
      |--------------------------------------------------------------------------
      | POST /api/reviews/:reviewId/decision
      |--------------------------------------------------------------------------
      |
      | This endpoint is intentionally NOT implemented yet.
      |
      | Future workflow:
      |
      | Forest Officer
      |       ↓
      | Image Review
      |       ↓
      | Confirm / Reject / Unknown
      |       ↓
      | Backend
      |       ↓
      | Tiger registry update
      |
      */

      default:

        throw createApiError(
          `POST ${endpoint} is not implemented in the VanDrishti mock API.`,
          404
        );

    }

  },


  // ==========================================================================
  // PUT
  // ==========================================================================

  async put(
    endpoint,
    body
  ) {

    /*
    |--------------------------------------------------------------------------
    | PUT is currently a placeholder.
    |--------------------------------------------------------------------------
    |
    | We keep this method so frontend services can already be designed
    | around REST-style APIs.
    |
    | Future examples:
    |
    | PUT /api/tigers/:id
    | PUT /api/cameras/:id
    | PUT /api/alerts/:id
    |
    */

    await delay();


    console.log(
      "[MOCK PUT]",
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

    /*
    |--------------------------------------------------------------------------
    | DELETE is currently a placeholder.
    |--------------------------------------------------------------------------
    |
    | Most VanDrishti entities may not actually be physically deleted.
    |
    | In a real wildlife monitoring system, records such as sightings
    | and Re-ID evidence should generally be retained for auditing.
    |
    | Therefore, future backend design should prefer:
    |
    | - Soft deletion
    | - Archiving
    | - Status changes
    |
    | instead of permanently deleting evidence.
    |
    */

    await delay();


    console.log(
      "[MOCK DELETE]",
      endpoint
    );


    return successResponse({
      message:
        "Mock DELETE request accepted.",

      endpoint,
    });

  },

};