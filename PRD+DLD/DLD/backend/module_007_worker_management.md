# DLD — Backend — Module 007: Worker Management & Service Job Assignment
## Showroom Application

**Layer:** Backend (Next.js)

---

## 1. Purpose
Provides simple worker management and service job allocation functionality:
- Admins provision Worker credentials.
- Admins assign servicing or minor repair jobs to Workers.
- Workers log in, view assigned jobs, accept/reject jobs, and update job status with timestamps.

---

## 2. API Endpoints

### 2.1 Admin Assigns Service Job to Worker
- `POST /api/admin/service-jobs/assign`
- Body:
  ```json
  {
    "service_job_id": "job-101",
    "worker_id": "usr-worker-01"
  }
  ```

### 2.2 Worker Views Assigned Jobs
- `GET /api/worker/jobs`
- Headers: `Authorization: Bearer <WorkerToken>`

### 2.3 Worker Accepts or Rejects Job
- `PATCH /api/worker/jobs/:id/respond`
- Body:
  ```json
  {
    "approval": "APPROVED" // or "REJECTED",
    "reason": "Available for servicing"
  }
  ```

### 2.4 Worker Updates Status with Time
- `PATCH /api/worker/jobs/:id/status`
- Body:
  ```json
  {
    "status": "IN_PROGRESS", // "COMPLETED" | "IN_PROGRESS"
    "update_time": "2026-09-26T14:30:00Z",
    "notes": "Oil change complete"
  }
  ```
