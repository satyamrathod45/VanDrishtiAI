# VanDrishti
## Product Requirements Document (PRD)

**Version:** 1.0  
**Product:** VanDrishti  
**Problem Statement:** Automated Camera Trap Triage and Individual Tiger Movement Intelligence System for Pench Tiger Reserve  
**Platform:** Offline-first Windows desktop application  
**Primary Users:** Forest Officers and authorized forest/wildlife staff  
**Status:** Product definition / MVP planning

---

## 1. Executive Summary

VanDrishti is an offline-first camera-trap intelligence system designed to transform raw camera-trap imagery collected from field SD cards into verified individual-tiger intelligence.

The core pipeline is:

**Collect → Import → Validate → Filter → Detect → Identify → Review → Verify → Map → Compare → Alert**

The system is not a generic analytics dashboard. Its primary purpose is to reduce manual camera-trap triage and convert processed imagery into persistent, queryable tiger movement intelligence.

---

## 2. Source Problem Statement

Pench Tiger Reserve camera traps generate tens of thousands of images per monitoring cycle, many of which are false triggers. Field staff currently spend substantial time manually sorting these images. Individual tiger identification also requires visual comparison of flank stripe patterns, while movement changes can depend on institutional memory rather than systematic analysis.

The required system must accept raw camera-trap image folders as they come from field SD cards and produce a clean individual-tiger database together with area-occupancy and movement-deviation intelligence with minimal human intervention.

The problem statement also requires safe blank-image handling, persistent tiger identification, occupancy mapping, movement alerts, offline operation on ordinary hardware, robustness to messy field data, privacy safeguards for human images, and auditable/correctable automated decisions.

---

## 3. Product Vision

> **Turn raw camera-trap data into trusted, actionable tiger intelligence while keeping the Forest Officer in control.**

---

## 4. Goals

### Primary Goals

- Reduce manual blank-image filtering.
- Reduce manual tiger identification effort.
- Build a persistent individual tiger catalogue.
- Link every verified tiger observation to evidence.
- Generate tiger-wise occupancy information.
- Detect meaningful movement deviations.
- Provide actionable alerts.
- Operate offline on ordinary laptop hardware.
- Make automated decisions auditable and correctable.
- Provide an interface usable by non-data-scientist forest staff.

### Secondary Goals

- Preserve original field evidence.
- Make processing jobs resumable.
- Provide dataset-level traceability.
- Provide maps supporting management decisions.
- Provide useful exports.

---

## 5. Non-Goals

The first version should not attempt to become:

- A live camera IoT monitoring system.
- A generic BI/analytics platform.
- A public-facing tiger tracking application.
- A cloud-first system.
- A replacement for Forest Officer judgment.
- A product with unnecessary admin/user-management complexity.

---

## 6. Target Users

### User Persona 1: Forest Officer

**Role:** Primary operational user

**Needs**
- Import field camera data.
- Know whether processing is progressing.
- Avoid manually inspecting tens of thousands of images.
- Review uncertain tiger identities.
- Understand current tiger activity.
- Investigate movement alerts.
- View individual tiger history.
- Export useful information.

**Technical level:** May not be a data scientist.

**Success:** Can complete normal monitoring work without technical assistance.

### User Persona 2: Wildlife Researcher

**Role:** Secondary analytical user

**Needs**
- Search individual tigers.
- Inspect sightings.
- Study occupancy and movement.
- Compare historical observations.
- Access structured evidence and exports.

---

## 7. User Cards

### User Card: Forest Officer

**I am:** A Forest Officer responsible for monitoring camera-trap data.

**I want to:** Import a camera-trap collection and process it without manually sorting thousands of images.

**So that:** I can spend my time reviewing meaningful evidence and responding to wildlife intelligence instead of repetitive image triage.

**Pain points**
- Huge image volume.
- False triggers.
- Manual tiger identification.
- Delayed movement detection.
- Offline environment.
- Messy SD-card data.
- Limited technical time.

### User Card: Wildlife Researcher

**I am:** A researcher analyzing tiger populations and movement.

**I want to:** Search tiger identities, sightings, occupancy and movement history.

**So that:** I can study patterns and produce useful management/research outputs.

---

## 8. Core User Journey

```text
Forest / Camera Trap
        ↓
Camera captures images
        ↓
SD Card
        ↓
Forest Officer collects SD card
        ↓
VanDrishti
        ↓
Create / Import Dataset
        ↓
Validate raw data
        ↓
Start Processing
        ↓
Blank Filtering
        ↓
Tiger Detection
        ↓
Flank / Stripe Extraction
        ↓
Tiger Re-ID
        ↓
 ┌───────────────┐
 │ Confidence?   │
 └───────┬───────┘
     Yes │ No / Low
         │
         ▼
  Automatic Result
                           → Human Review
                    ↓
              Final Decision
                    ↓
              Verified Sighting
                    ↓
       Tiger Intelligence Database
                    ↓
          Occupancy + Movement
                    ↓
                 Alerts
                    ↓
             Officer Action
```

---

## 9. Application User Flow

### Flow A: Login

```text
Open VanDrishti
    ↓
Forest Officer Login
    ↓
Officer ID + Password
    ↓
Authenticate
    ↓
Overview
```

### Flow B: Overview

The Overview answers:

> **What is happening right now and what requires my attention?**

It shows:
- Processing status.
- Map.
- Recent tiger activity.
- Pending reviews.
- Important alerts.
- Recent datasets.

### Flow C: Import Camera Data

```text
Overview
    ↓
Camera Data
    ↓
Select Camera
    ↓
Enter / confirm collection metadata
    ↓
Select raw folder / ZIP
    ↓
Scan files
    ↓
Validate dataset
    ↓
Show validation report
    ↓
Create Dataset
    ↓
Start Processing
```

### Flow D: Dataset Validation

Validate:
- Image readability.
- Supported image types.
- Corrupted files.
- Duplicates.
- Camera identification.
- Folder structure.
- Timestamp consistency.
- GPS metadata when available.
- Possible SD-card mix-up.
- Camera clock drift.

### Flow E: Processing

```text
Dataset Ready
    ↓
Start Processing
    ↓
Create Processing Job
    ↓
Batch processing
    ↓
Track progress
    ↓
Resume after recoverable failure
    ↓
Processing Complete
```

Stages:
1. Image validation
2. Blank filtering
3. Subject detection
4. Tiger detection
5. Flank extraction
6. Stripe feature extraction
7. Tiger Re-ID
8. Confidence scoring
9. Result generation
10. Review queue generation
11. Intelligence update

### Flow F: Blank Image Filtering

```text
Raw Image
    ↓
Blank classifier
    ↓
Blank?
 ┌──┴───┐
Yes     No
 ↓       ↓
Quarantine  Continue
```

Use:

**Classify → Quarantine → Review/retention → Safe removal**

Report:
- Number of blank images.
- Number retained.
- Storage saved.
- Processing time saved.

### Flow G: Tiger Detection and Re-ID

```text
Retained Image
      ↓
Subject Detection
      ↓
Tiger?
   ┌──┴──┐
  No    Yes
        ↓
   Detect tiger
        ↓
   Isolate flank
        ↓
 Extract stripe features
        ↓
 Compare catalogue
        ↓
 Generate candidates
        ↓
 Confidence threshold
```

High-confidence matches are automatically assigned. Ambiguous matches enter Image Review. Potential new individuals are enrolled subject to confirmation.

### Flow H: Image Review

```text
Review Queue
    ↓
Open uncertain image
    ↓
View image/evidence
    ↓
View AI candidates
    ↓
Officer decision
    ├── Existing tiger
    ├── New tiger
    ├── Not a tiger
    └── Needs further review
    ↓
Save decision
    ↓
Update database
```

### Flow I: Verified Sighting

```text
Image
 ↓
Tiger identity
 ↓
Camera
 ↓
Timestamp
 ↓
GPS
 ↓
Verified Sighting
```

### Flow J: Tiger Profile

```text
Tigers
   ↓
Select Tiger
   ↓
Tiger Profile
```

Contains:
- Identity.
- Reference images.
- Sightings.
- Camera stations.
- First/last detection.
- Activity centroid.
- Estimated occupancy.
- Home-range visualization.
- Movement history.
- Re-ID evidence.
- Relevant alerts.

### Flow K: Occupancy Intelligence

```text
Verified sightings
      ↓
Tiger-wise locations
      ↓
Activity centroid
      ↓
Home range estimate
      ↓
Estimated occupied area
      ↓
Reserve map
```

### Flow L: Movement Deviation

```text
Current Run
    ↓
Historical baseline
    ↓
Compare activity
    ↓
Check survey effort
    ↓
Detect meaningful deviation
    ↓
Generate alert if justified
```

Minimum alert categories:
1. Range centroid shift.
2. First capture at a previously unused station.
3. Movement toward buffer/village-adjacent stations.
4. Prolonged absence of a previously regular individual.

---

## 10. Navigation Structure

Keep the product intentionally lean.

```text
                    Overview
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   Camera Data     Processing       Tigers
        │              │              │
        │              ▼              ▼
        │        Image Review    Tiger Profile
```

Alerts can be surfaced in Overview and linked to relevant evidence rather than becoming an unnecessary top-level page.

---

## 11. Page Responsibilities

### Overview
Operational command center:
- Map.
- Current/recent tiger activity.
- Processing status.
- Pending reviews.
- Important alerts.
- Recent datasets.

### Camera Data
Bring field data into the system:
- Dataset creation.
- Camera selection.
- Collection metadata.
- Folder/ZIP import.
- Validation.

### Processing
Monitor AI processing:
- Job status.
- Progress.
- Processing stages.
- Counts.
- Failures.
- Blank filtering.
- Tiger detections.
- Re-ID results.
- Review queue count.

### Image Review
Human verification:
- Uncertain results.
- AI candidates.
- Evidence.
- Decisions.
- Audit trail.

### Tigers
Persistent tiger catalogue:
- Search.
- Filter.
- Basic identity/status.
- Navigate to profile.

### Tiger Profile
Individual intelligence:
- Identity.
- Evidence.
- Sightings.
- Locations.
- Occupancy.
- Movement history.
- Alerts.

---

## 12. User Stories

### Authentication

**US-001:** As a Forest Officer, I want to log in using my Officer ID and password so that I can access VanDrishti securely.

**Acceptance Criteria**
- Officer ID is required.
- Password is required.
- Invalid credentials show a clear error.
- Successful authentication opens Overview.

### Dataset Import

**US-002:** As a Forest Officer, I want to create a dataset for a camera collection so that all images remain traceable.

**US-003:** As a Forest Officer, I want to import raw camera-trap folders so that I do not need to reorganize field data.

**US-004:** As a Forest Officer, I want to import a ZIP dataset so that large collections can be transferred conveniently.

**US-005:** As a Forest Officer, I want VanDrishti to validate the dataset before processing so that problems are detected early.

**US-006:** As a Forest Officer, I want corrupted or inconsistent files flagged rather than crashing the dataset.

### Blank Filtering

**US-007:** As a Forest Officer, I want VanDrishti to identify blank frames automatically so that I do not manually inspect them.

**US-008:** As a Forest Officer, I want blank images quarantined rather than immediately deleted so that important evidence is not lost.

**US-009:** As a Forest Officer, I want to see how many images were filtered and how much storage/time was saved.

### Tiger Detection and Re-ID

**US-010:** As a Forest Officer, I want VanDrishti to identify tiger-containing images so that I can focus on meaningful evidence.

**US-011:** As a Forest Officer, I want VanDrishti to compare tiger stripe patterns against known individuals so that identification is faster.

**US-012:** As a Forest Officer, I want confident matches applied automatically so routine decisions do not require review.

**US-013:** As a Forest Officer, I want ambiguous matches sent to review so the system does not silently guess.

**US-014:** As a Forest Officer, I want genuinely new tigers enrolled as new identities.

### Human Review

**US-015:** As a Forest Officer, I want uncertain images shown with AI candidates so I can make the final decision efficiently.

**US-016:** As a Forest Officer, I want to correct an AI identification so incorrect decisions do not become permanent intelligence.

**US-017:** As a Forest Officer, I want every review decision recorded so the system remains auditable.

### Tiger Intelligence

**US-018:** As a Forest Officer, I want every verified sighting linked to image, camera, timestamp and location so evidence remains traceable.

**US-019:** As a Researcher, I want to search for a tiger and see its historical sightings so I can understand its activity.

**US-020:** As a Researcher, I want to see tiger occupancy on a map so I can understand where an individual is active.

**US-021:** As a Researcher, I want to see overlap between tiger areas so potential territorial interactions can be studied.

### Movement Intelligence

**US-022:** As a Forest Officer, I want VanDrishti to compare current activity with historical behaviour so meaningful changes can be detected.

**US-023:** As a Forest Officer, I want alerts when a tiger moves into a new station or meaningful new area so I can investigate potential movement changes.

**US-024:** As a Forest Officer, I want buffer/village-adjacent movement highlighted so potentially important situations are visible early.

**US-025:** As a Forest Officer, I want prolonged absence of a normally regular tiger flagged so possible changes can be investigated.

**US-026:** As a Forest Officer, I want alerts to account for uneven survey effort so newly installed cameras do not create false movement alerts.

**US-027:** As a Forest Officer, I want every alert to explain its evidence and confidence so I can judge whether it is actionable.

### Processing

**US-028:** As a Forest Officer, I want processing progress so I know whether a large dataset is still running.

**US-029:** As a Forest Officer, I want batch processing so very large datasets can be handled on ordinary hardware.

**US-030:** As a Forest Officer, I want processing jobs to recover from failures so I do not restart an entire dataset.

**US-031:** As a Forest Officer, I want VanDrishti to work without internet connectivity.

### Privacy

**US-032:** As a Forest Officer, I want images containing humans to receive appropriate privacy handling.

---

## 13. Functional Requirements

- **FR-001 Authentication:** Officer ID/password authentication.
- **FR-002 Dataset Import:** Accept raw folders and ZIP datasets.
- **FR-003 Dataset Metadata:** Store camera, collection, operator and dataset metadata.
- **FR-004 Validation:** Detect and flag malformed/inconsistent data.
- **FR-005 Blank Detection:** Classify blank/non-blank frames.
- **FR-006 Safe Blank Handling:** Quarantine/stage deletion.
- **FR-007 Tiger Detection:** Detect tiger-containing frames.
- **FR-008 Flank Extraction:** Prepare flank imagery for Re-ID.
- **FR-009 Re-ID:** Compare stripe patterns against the catalogue.
- **FR-010 New Individual Enrollment:** Create new tiger identities.
- **FR-011 Human Review:** Surface ambiguous decisions.
- **FR-012 Evidence Linking:** Link sightings to image, camera, timestamp and location.
- **FR-013 Persistent Database:** Maintain tiger records across runs.
- **FR-014 Occupancy:** Generate individual occupancy information.
- **FR-015 Movement Analysis:** Compare current observations with historical activity.
- **FR-016 Alerts:** Generate movement/trend alerts.
- **FR-017 Explainable Alerts:** Include evidence and confidence.
- **FR-018 Audit Trail:** Track automated and human decisions.

---

## 14. Non-Functional Requirements

### Performance
- Handle tens of thousands of images.
- Batch processing.
- Memory-efficient image loading.
- Thumbnail generation.
- Resumable processing.

### Offline
- Core workflow works without internet.
- Runs on ordinary laptop hardware.
- No cloud dependency for essential processing.

### Reliability
- Preserve original field evidence.
- Processing failures must not corrupt originals.
- Recoverable jobs.

### Usability
- Designed for non-data-scientists.
- Minimal technical jargon.
- Clear status indicators.
- Explain AI decisions.

### Security
- Protect local application data.
- Do not expose sensitive wildlife data publicly.
- Apply privacy safeguards to human images.

---

## 15. Data Model

```text
ForestOfficer
    │
    └── Dataset

Camera
    │
    └── Dataset

Dataset
    │
    ├── Images
    ├── ProcessingJob
    └── Results

Image
    │
    ├── Detection
    ├── ReIDMatch
    └── Review

Tiger
    │
    ├── Sightings
    ├── ReIDMatches
    ├── Occupancy
    ├── MovementEvents
    └── Alerts

Sighting
    ├── Tiger
    ├── Image
    ├── Camera
    ├── Timestamp
    └── Location
```

### Suggested tables

```text
forest_officers
cameras
zones
datasets
images
processing_jobs
detections
reid_matches
tigers
tiger_images
reviews
sightings
occupancy_records
movement_events
alerts
audit_logs
```

---

## 16. Backend API Domains

```text
/auth

/cameras
/cameras/:id

/datasets
/datasets/:id

/processing/jobs
/processing/jobs/:id

/images
/detections

/reviews
/reviews/:id

/tigers
/tigers/:id
/tigers/:id/sightings
/tigers/:id/reid

/sightings

/occupancy

/movement

/alerts

/zones
```

During development, `mockApi.js` should reproduce the expected contracts. Production can later replace the mock layer without rewriting the UI.

---

## 17. Desktop Architecture

```text
                    VanDrishti.exe
                         │
          ┌──────────────┼──────────────┐
          │              │              │
        React          Electron       AI Worker
          │              │              │
          │          File System      Detection
          │          SQLite           Re-ID
          │          IPC              Processing
          │              │              │
          └──────────────┼──────────────┘
                         │
                   Local Storage
```

### React
UI and presentation.

### Electron
Desktop capabilities and controlled local-resource access.

### SQLite
Local structured database.

### Filesystem
Raw images, thumbnails, processed images, quarantine and exports.

### AI Worker
Image processing and ML inference.

---

## 18. Image Storage Strategy

Do not store 100,000+ original images as database BLOBs.

Recommended:

```text
VanDrishtiData/
│
├── vandrishti.db
│
├── datasets/
│   └── VD-2026-0816-0042/
│       ├── raw/
│       ├── processed/
│       ├── quarantine/
│       └── thumbnails/
│
├── exports/
└── logs/
```

SQLite stores metadata and paths. The filesystem stores the actual evidence.

---

## 19. Results Presentation Strategy

Results should be dataset-centric.

```text
Dataset
   ↓
Summary
   ↓
Tiger detections
   ↓
High-confidence results
   ↓
Uncertain results
   ↓
Image Review
```

For large datasets:
- Use pagination or virtualization.
- Use thumbnails.
- Lazy-load full-resolution images.
- Support filtering.
- Support search.
- Support confidence categories.

Never attempt to render 100,000 images at once.

---

## 20. Processing Job States

```text
IMPORTED
VALIDATING
READY
PROCESSING
PROCESSED
REVIEW_REQUIRED
VERIFIED
FAILED
ARCHIVED
```

---

## 21. Design Principles

1. **Officer First:** Every screen should answer a real operational question.
2. **Evidence First:** AI conclusions remain connected to original evidence.
3. **Human in Control:** AI assists; officers can correct it.
4. **Offline First:** Internet is not required for the core workflow.
5. **Don't Flood the Officer:** Surface only meaningful information.
6. **Preserve Original Data:** Never casually destroy field evidence.
7. **Explain Alerts:** Every alert should explain why it exists.
8. **Scale to Real Data:** Design for 100,000+ images, not demo-sized datasets.

---

## 22. MVP Acceptance Criteria

A successful MVP demonstration should complete:

```text
1. Login
      ↓
2. Import raw camera dataset
      ↓
3. Validate dataset
      ↓
4. Process images
      ↓
5. Filter blank images
      ↓
6. Detect tigers
      ↓
7. Match known individuals
      ↓
8. Send uncertain results to review
      ↓
9. Confirm tiger identity
      ↓
10. Store verified sighting
      ↓
11. Update tiger profile
      ↓
12. Display tiger locations on map
      ↓
13. Generate occupancy information
      ↓
14. Compare movement with history
      ↓
15. Generate actionable alert
```

---

## 23. Success Metrics

### Blank Detection
- Precision.
- Recall.
- False-negative rate.

### Tiger Re-ID
- Top-1 accuracy.
- Top-k accuracy.
- New-individual detection.
- Human correction rate.

### Occupancy
- Geographic usefulness.
- Interpretability.
- Consistency across runs.

### Alerts
- Precision.
- False-alert rate.
- Evidence quality.
- Actionability.

### Processing
- Images processed per hour.
- CPU/memory use.
- Failure recovery.

### Usability
- Dataset import time.
- Review time per uncertain result.
- Alert investigation time.
- Task completion without technical assistance.

---

## 24. Future Scope

Potential future features:
- Advanced GIS.
- Advanced home-range modelling.
- Behavioural analytics.
- Automated human anonymization.
- Multi-workstation synchronization.
- Secure backup.
- Advanced reporting.
- Model improvement from reviewed results.
- Distributed processing.

These are outside the first MVP.

---

## 25. Product Success Definition

VanDrishti succeeds when a Forest Officer can take a messy raw camera-trap collection from an SD card and transform:

**tens of thousands of raw images**

into:

**a clean, persistent and reviewable tiger intelligence dataset**

without manually inspecting every frame.

The complete product loop is:

```text
RAW DATA
   ↓
CLEAN DATA
   ↓
IDENTIFIED TIGERS
   ↓
VERIFIED SIGHTINGS
   ↓
OCCUPANCY
   ↓
MOVEMENT INTELLIGENCE
   ↓
ACTIONABLE ALERTS
```

---

## 26. One-Line Product Definition

> **VanDrishti is an offline-first AI-powered camera-trap intelligence system that filters massive raw image collections, identifies individual tigers through stripe-pattern Re-ID, builds persistent sighting intelligence, maps occupancy, and detects meaningful movement deviations for Forest Officers.**
