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
| Frontend should NEVER directly access mockDB.
|
| Frontend
|    ↓
| Service
|    ↓
| api.js
|    ↓
| mockApi.js
|    ↓
| mockDB
|
|--------------------------------------------------------------------------
|
| VANDrISHTI FIELD WORKFLOW
|--------------------------------------------------------------------------
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
| Human Review
|      ↓
| Verified Tiger Intelligence
|
|--------------------------------------------------------------------------
|
| IMPORTANT
|--------------------------------------------------------------------------
|
| Cameras are OFFLINE camera traps.
|
| Therefore:
|
| "camera status" does NOT mean internet connectivity.
|
| The system is focused on:
|
| - Field collections
| - Image ingestion
| - Large dataset processing
| - Tiger detection
| - Tiger Re-ID
| - Human verification
| - Tiger profiles
| - Geographic intelligence
|
|--------------------------------------------------------------------------
*/


import {
  mockDB,
} from "./db";


// ============================================================================
// MOCK NETWORK DELAY
// ============================================================================

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

const successResponse = (
  data
) => {

  return {
    success: true,
    data,
  };

};


const createApiError = (
  message,
  status = 400
) => {

  const error =
    new Error(
      message
    );

  error.status =
    status;

  return error;

};


// ============================================================================
// SAFE ARRAY HELPER
// ============================================================================
//
// This prevents the UI from crashing if a mock DB collection is missing.
//
// Example:
//
// mockDB.reviews
// mockDB.processingJobs
//
// If any of them are temporarily unavailable, the API returns [].
//
// This is ONLY for frontend development.
// The real backend should return proper database results.
//

const safeArray = (
  value
) => {

  return Array.isArray(
    value
  )
    ? value
    : [];

};


// ============================================================================
// SANITIZE FOREST OFFICER
// ============================================================================
//
// Password must NEVER be returned to the frontend.
//

const sanitizeOfficer = (
  officer
) => {

  if (!officer) {

    return null;

  }


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
        safeArray(
          mockDB.tigers
        ).find(
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
        safeArray(
          mockDB.tigerSightings
        ).filter(
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
        safeArray(
          mockDB.tigerReidMatches
        ).filter(
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
        safeArray(
          mockDB.cameras
        ).find(
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
        safeArray(
          mockDB.cameraCollections
        ).filter(
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
        safeArray(
          mockDB.cameraCaptures
        ).filter(
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
      | Main VanDrishti Forest Officer command dashboard.
      |
      |--------------------------------------------------------------------------
      |
      | The redesigned Overview is intentionally NOT a generic analytics
      | dashboard.
      |
      | It focuses on:
      |
      | 1. Officer actions
      | 2. Forest map
      | 3. Processing status
      | 4. Camera collections
      | 5. Tiger intelligence
      | 6. Recent observations
      |
      |--------------------------------------------------------------------------
      |
      | We intentionally DO NOT expose:
      |
      | - Camera online/offline metrics
      | - Generic AI accuracy
      | - Decorative charts
      | - Meaningless KPI cards
      |
      */

      case "/api/overview": {

        // --------------------------------------------------------------------
        // SOURCE DATA
        // --------------------------------------------------------------------

        const tigers =
          safeArray(
            mockDB.tigers
          );


        const sightings =
          safeArray(
            mockDB.sightings
          );


        const reviews =
          safeArray(
            mockDB.reviews
          );


        const processingJobs =
          safeArray(
            mockDB.processingJobs
          );


        const collections =
          safeArray(
            mockDB.cameraCollections
          );


        const alerts =
          safeArray(
            mockDB.alerts
          );


        // --------------------------------------------------------------------
        // IDENTIFIED TIGERS
        // --------------------------------------------------------------------

        const identifiedTigers =
          tigers.filter(
            (tiger) =>
              tiger.status ===
                "identified" ||
              tiger.status ===
                "active"
          );


        // --------------------------------------------------------------------
        // PENDING REVIEWS
        // --------------------------------------------------------------------

        const pendingReviews =
          reviews.filter(
            (review) =>
              review.status ===
                "pending" ||
              review.status ===
                "review"
          );


        // --------------------------------------------------------------------
        // ACTIVE ALERTS
        // --------------------------------------------------------------------

        const activeAlerts =
          alerts.filter(
            (alert) =>
              alert.status ===
                "open" ||
              alert.status ===
                "active"
          );


        // --------------------------------------------------------------------
        // ACTIVE PROCESSING JOB
        // --------------------------------------------------------------------

        const activeProcessingJob =
          processingJobs.find(
            (job) =>
              job.status ===
                "processing" ||
              job.status ===
                "running"
          );


        // --------------------------------------------------------------------
        // COMPLETED PROCESSING JOBS
        // --------------------------------------------------------------------

        const completedProcessingJobs =
          processingJobs.filter(
            (job) =>
              job.status ===
              "completed"
          );


        // --------------------------------------------------------------------
        // UNKNOWN TIGER / UNCERTAIN RE-ID
        // --------------------------------------------------------------------

        const unknownReviews =
          reviews.filter(
            (review) => {

              return (
                !review.predictedTigerId &&
                !review.tigerId
              );

            }
          );


        // --------------------------------------------------------------------
        // COLLECTIONS WAITING FOR PROCESSING
        // --------------------------------------------------------------------

        const collectionDue =
          collections.filter(
            (collection) => {

              const status =
                collection.status;

              return (
                status ===
                  "collected" ||
                status ===
                  "uploaded" ||
                status ===
                  "pending_processing"
              );

            }
          );


        // --------------------------------------------------------------------
        // RECENT SIGHTINGS
        // --------------------------------------------------------------------

        const recentSightings =
          sightings
            .slice(
              0,
              6
            )
            .map(
              (
                sighting
              ) => ({

                id:
                  sighting.id,

                tigerId:
                  sighting.tigerId ||
                  null,

                tigerName:
                  sighting.tigerName ||
                  sighting.tigerId ||
                  "Unknown tiger",

                cameraId:
                  sighting.cameraId ||
                  "Unknown camera",

                location:
                  sighting.location ||
                  "Forest zone",

                time:
                  sighting.time ||
                  "--:--",

                date:
                  sighting.date ||
                  "2026-08-16",

                confidence:
                  sighting.confidence ||
                  0,

                status:
                  sighting.status ||
                  "observed",

                latitude:
                  sighting.latitude ||
                  null,

                longitude:
                  sighting.longitude ||
                  null,

                imageId:
                  sighting.imageId ||
                  null,

                detectionType:
                  sighting.detectionType ||
                  "tiger_detection",

              })
            );


        // --------------------------------------------------------------------
        // MAP DATA
        // --------------------------------------------------------------------
        //
        // IMPORTANT:
        //
        // Your existing mockDB does NOT have mockDB.zones.
        //
        // Therefore we keep the map's initial zone data here.
        //
        // Production backend should eventually provide this through:
        //
        // GET /api/zones
        //
        // or a GIS service.
        //

        const zones = [

          {
            id:
              "ZONE-A",

            name:
              "Moharli",

            sightings:
              38,

            status:
              "active",

            latitude:
              20.2674,

            longitude:
              79.3684,

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

            latitude:
              20.2976,

            longitude:
              79.2842,

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

            latitude:
              20.2154,

            longitude:
              79.3127,

          },


          {
            id:
              "ZONE-D",

            name:
              "Buffer",

            sightings:
              13,

            status:
              "active",

            latitude:
              20.3251,

            longitude:
              79.4102,

          },

        ];


        // --------------------------------------------------------------------
        // PROCESSING RESPONSE
        // --------------------------------------------------------------------
        //
        // Normalize processing jobs so Overview.jsx always receives the
        // fields it expects.
        //
        // This also allows us to keep your existing db.js unchanged.
        //

        const normalizedProcessingJobs =
          processingJobs.map(
            (
              job
            ) => {

              const totalImages =
                Number(
                  job.totalImages ||
                  job.imageCount ||
                  0
                );


              const processedImages =
                Number(
                  job.processedImages ||
                  0
                );


              let progress =
                Number(
                  job.progress ||
                  0
                );


              if (
                progress === 0 &&
                totalImages > 0
              ) {

                progress =
                  Math.round(
                    (
                      processedImages /
                      totalImages
                    ) *
                    100
                  );

              }


              if (
                job.status ===
                "completed"
              ) {

                progress =
                  100;

              }


              return {

                id:
                  job.id,

                datasetId:
                  job.datasetId ||
                  job.importId ||
                  null,

                cameraId:
                  job.cameraId ||
                  null,

                zoneId:
                  job.zoneId ||
                  null,

                status:
                  job.status ||
                  "queued",

                totalImages,

                processedImages,

                failedImages:
                  Number(
                    job.failedImages ||
                    0
                  ),

                tigerDetections:
                  Number(
                    job.tigerDetections ||
                    job.detectedImages ||
                    0
                  ),

                identifiedTigers:
                  Number(
                    job.identifiedTigers ||
                    0
                  ),

                unknownDetections:
                  Number(
                    job.unknownDetections ||
                    0
                  ),

                pendingReviews:
                  Number(
                    job.pendingReviews ||
                    0
                  ),

                progress,

                currentStage:
                  job.currentStage ||
                  job.stage ||
                  (
                    job.status ===
                    "completed"
                      ? "Completed"
                      : "Processing"
                  ),

                startedAt:
                  job.startedAt ||
                  job.createdAt ||
                  null,

                completedAt:
                  job.completedAt ||
                  null,

                estimatedRemaining:
                  job.estimatedRemaining ||
                  null,

              };

            }
          );


        // --------------------------------------------------------------------
        // FALLBACK PROCESSING JOB
        // --------------------------------------------------------------------
        //
        // If the existing db.js doesn't yet contain a processing job,
        // the dashboard still gets realistic data.
        //
        // This can be removed once db.js contains real mock jobs.
        //

        if (
          normalizedProcessingJobs.length ===
          0
        ) {

          normalizedProcessingJobs.push({

            id:
              "JOB-2026-0816-0042",

            datasetId:
              "COL-2026-0816-0042",

            cameraId:
              "CAM-018",

            zoneId:
              "ZONE-A",

            status:
              "processing",

            totalImages:
              84231,

            processedImages:
              68912,

            failedImages:
              37,

            tigerDetections:
              1284,

            identifiedTigers:
              941,

            unknownDetections:
              43,

            pendingReviews:
              12,

            progress:
              82,

            currentStage:
              "Re-identification",

            startedAt:
              "2026-08-16T18:05:00Z",

            completedAt:
              null,

            estimatedRemaining:
              "18 min",

          });

        }


        // --------------------------------------------------------------------
        // ACTIVE JOB AFTER NORMALIZATION
        // --------------------------------------------------------------------

        const dashboardActiveJob =
          normalizedProcessingJobs.find(
            (job) =>
              job.status ===
                "processing" ||
              job.status ===
                "running"
          );


        // --------------------------------------------------------------------
        // PENDING IMAGE COUNT
        // --------------------------------------------------------------------

        const pendingProcessingImages =
          dashboardActiveJob
            ? Math.max(
                dashboardActiveJob.totalImages -
                  dashboardActiveJob.processedImages,
                0
              )
            : 0;


        // --------------------------------------------------------------------
        // TODAY'S SIGHTINGS
        // --------------------------------------------------------------------

        const todaysSightings =
          recentSightings.filter(
            (sighting) =>
              sighting.date ===
              "2026-08-16"
          );


        // --------------------------------------------------------------------
        // FINAL OVERVIEW RESPONSE
        // --------------------------------------------------------------------

        return successResponse({

          // ==================================================================
          // SYSTEM
          // ==================================================================

          system: {

            status:
              "operational",

            lastUpdated:
              "2026-08-16T19:05:00Z",

            monitoringActive:
              true,

          },


          // ==================================================================
          // OPERATIONAL STATISTICS
          // ==================================================================

          statistics: {

            totalTigers:
              tigers.length ||
              47,

            identifiedTigers:
              identifiedTigers.length ||
              42,

            unknownTigers:
              unknownReviews.length ||
              2,

            totalSightings:
              sightings.length ||
              1284,

            todaysSightings:
              todaysSightings.length ||
              18,

            /*
            |--------------------------------------------------------------------------
            | IMPORTANT
            |--------------------------------------------------------------------------
            |
            | We intentionally DO NOT return:
            |
            | totalCameras
            | onlineCameras
            | offlineCameras
            |
            | because VanDrishti uses offline camera traps.
            |
            */

            collectionDue:
              collectionDue.length ||
              2,

            pendingProcessingImages,

            pendingReviews:
              pendingReviews.length ||
              12,

            activeAlerts:
              activeAlerts.length ||
              1,

          },


          // ==================================================================
          // RECENT INTELLIGENCE
          // ==================================================================

          recentSightings:


            recentSightings.length > 0

              ? recentSightings

              : [

                  {
                    id:
                      "SIG-1024",

                    tigerId:
                      "TGR-024",

                    tigerName:
                      "TGR-024",

                    cameraId:
                      "CAM-014",

                    location:
                      "Moharli Zone A",

                    time:
                      "18:42",

                    date:
                      "2026-08-16",

                    confidence:
                      96,

                    status:
                      "verified",

                    latitude:
                      20.2674,

                    longitude:
                      79.3684,

                  },


                  {
                    id:
                      "SIG-1023",

                    tigerId:
                      "TGR-011",

                    tigerName:
                      "TGR-011",

                    cameraId:
                      "CAM-021",

                    location:
                      "Tadoba Core",

                    time:
                      "17:31",

                    date:
                      "2026-08-16",

                    confidence:
                      94,

                    status:
                      "verified",

                    latitude:
                      20.2154,

                    longitude:
                      79.3127,

                  },


                  {
                    id:
                      "SIG-1022",

                    tigerId:
                      "TGR-037",

                    tigerName:
                      "TGR-037",

                    cameraId:
                      "CAM-051",

                    location:
                      "Buffer Zone",

                    time:
                      "16:54",

                    date:
                      "2026-08-16",

                    confidence:
                      73,

                    status:
                      "review",

                    latitude:
                      20.3251,

                    longitude:
                      79.4102,

                  },

                ],


          // ==================================================================
          // OFFICER INTELLIGENCE
          // ==================================================================

          intelligence: {

            newSightings:
              todaysSightings.length ||
              12,

            reidMatches:
              todaysSightings.filter(
                (item) =>
                  item.tigerId
              ).length ||
              9,

            pendingReviews:
              pendingReviews.length ||
              12,

            alerts:
              activeAlerts.length ||
              1,

            unknownTigers:
              unknownReviews.length ||
              2,

          },


          // ==================================================================
          // PROCESSING JOBS
          // ==================================================================

          processingJobs:
            normalizedProcessingJobs,


          // ==================================================================
          // MAP / ZONES
          // ==================================================================

          zones,

        });

      }


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
          safeArray(
            mockDB.tigers
          )
        );


      // ======================================================================
      // CAMERAS
      // ======================================================================

      /*
      |--------------------------------------------------------------------------
      | GET /api/cameras
      |--------------------------------------------------------------------------
      |
      | Returns the physical camera-trap registry.
      |
      | IMPORTANT:
      |
      | status != internet connectivity.
      |
      */

      case "/api/cameras":

        return successResponse(
          safeArray(
            mockDB.cameras
          )
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
          safeArray(
            mockDB.cameraCollections
          )
        );


      // ======================================================================
      // ALL PROCESSING JOBS
      // ======================================================================

      /*
      |--------------------------------------------------------------------------
      | GET /api/processing/jobs
      |--------------------------------------------------------------------------
      */

      case "/api/processing/jobs": {

        const jobs =
          safeArray(
            mockDB.processingJobs
          );


        return successResponse(
          jobs
        );

      }


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
          safeArray(
            mockDB.sightings
          )
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
          safeArray(
            mockDB.alerts
          )
        );


      // ======================================================================
      // IMAGE REVIEWS
      // ======================================================================

      /*
      |--------------------------------------------------------------------------
      | GET /api/reviews
      |--------------------------------------------------------------------------
      |
      | Images requiring human verification.
      |
      */

      case "/api/reviews":

        return successResponse(
          safeArray(
            mockDB.reviews
          )
        );


      // ======================================================================
      // UNKNOWN GET ENDPOINT
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
    body = {}
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
      | VanDrishti intentionally has ONLY:
      |
      | Forest Officer ID + Password
      |
      | No:
      |
      | - Admin login
      | - Public registration
      | - Multiple account types
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


        const officers =
          safeArray(
            mockDB.forestOfficers
          );


        const officer =
          officers.find(
            (item) => {

              return (
                String(
                  item.id
                ).toLowerCase() ===
                String(
                  officerId
                ).toLowerCase()
              );

            }
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


        // --------------------------------------------------------------------
        // MOCK SESSION
        // --------------------------------------------------------------------

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
      | This endpoint DOES NOT receive the huge ZIP file directly.
      |
      | Production workflow:
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
      |--------------------------------------------------------------------------
      |
      | This is important because VanDrishti may process 100,000+
      | camera-trap images in a single collection.
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
      | Human-in-the-loop verification.
      |
      | Example request:
      |
      | {
      |   decision: "confirmed",
      |   tigerId: "TGR-024"
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


          const decision =
            body?.decision ||
            null;


          const tigerId =
            body?.tigerId ||
            null;


          return successResponse({

            reviewId,

            status:
              "decision_recorded",

            message:
              "Mock review decision recorded.",

            decision,

            tigerId,

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
    | Future production endpoints:
    |
    | PUT /api/tigers/:id
    | PUT /api/cameras/:id
    | PUT /api/alerts/:id
    | PUT /api/reviews/:id
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
    | Wildlife evidence should generally NOT be permanently deleted.
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