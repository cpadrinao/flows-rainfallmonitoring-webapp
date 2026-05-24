<table>
<tr>
<td>

```

███████╗██╗      ██████╗ ██╗    ██╗███████╗
██╔════╝██║     ██╔═══██╗██║    ██║██╔════╝
█████╗  ██║     ██║   ██║██║ █╗ ██║███████╗
██╔══╝  ██║     ██║   ██║██║███╗██║╚════██║
██║     ███████╗╚██████╔╝╚███╔███╔╝███████║
╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝ ╚══════╝

```

</td>
<td>

```
 Flood Observation and Warning System - Web Console
 ─────────────────────────────────────────────────────────────────────────────────
 Module     │ Data Presentation & Admin Dashboard UI
 Purpose    │ Frontend web console and resident observatory display
 Target     │ Barangay Rizal Disaster Operators & Resident End-Users
 Access     │ Web Portal (Landing Page observatory & Admin Control Panel)
 Data       │ Real-time precipitation and forecasts (Open-Meteo Integration)
 ─────────────────────────────────────────────────────────────────────────────────
```

</td>
</tr>
</table>

## About

This system serves as the frontend client portal for the **Barangay Rizal Flood Level Observation and Warning System (F.L.O.W.S.)**. On the client side, the system provides a beautiful observatory landing portal for residents to view real-time warnings, along with a secure administrative dashboard for rescue operators to manage monitored zones, calibrate local threshold parameters, and audit historical telemetry logs.

**Core Features:**
*   **Resident Weather Observatory:** A dark-themed public landing page displaying localized real-time precipitation metrics, flood alert levels, preparation checklists, and 24-hour bento-grid forecast trends.
*   **Zone Calibration Panel:** A secure control console enabling operators to edit boundary purok descriptions, add monitored sectors, and calibrate local parameters.
*   **Chronological Rainfall History:** An administrative audit grid displaying detailed records fetched directly from the database, featuring interactive forecast metrics search filters and single-click **PDF report exports**.
*   **Pulsing API Heartbeat Monitor:** Integrated navbar telemetry status widgets showing live API connectivity status, latency, and standby loaders during offline states.

---

## Folder & Repository Structure

The project is structured as a unified monorepo comprising a Next.js frontend client and a Python FastAPI backend server:

```
flows-rainfallmonitoring-webapp/
├── src/                                # Next.js React Frontend
│   ├── app/                            # Next.js App Router Structure
│   │   ├── page.tsx                    # Resident Landing Observatory & Dashboard
│   │   ├── error.tsx                   # Client-side Error Boundary
│   │   ├── lib/                        # API Clients & Types
│   │   │   └── api.ts                  # Httpx Telemetry Sync Client
│   │   └── admin/                      # Administration CMS Portal
│   │       ├── login/                  # sessionStorage Authorization
│   │       ├── dashboard/              # Console Home & Heartbeat Terminal
│   │       ├── zones/                  # Monitored Purok Array CRUD
│   │       └── history/                # Chronological Audit & PDF Generator
├── flows-backend/                      # Python FastAPI Backend
│   ├── main.py                         # FastAPI Application Entry Point
│   ├── config.py                       # Settings & Environment Variables
│   ├── scheduler.py                    # APScheduler Ingestion Cron Pipeline
│   ├── seed_zones.py                   # Initial Supabase Purok Seeding Script
│   ├── requirements.txt                # Python Dependencies List
│   ├── services/                       # Application Services
│   │   ├── alert_engine.py             # Precipitation Threshold Alert Engine
│   │   ├── open_meteo.py               # Weather Data Fetch Service
│   │   └── supabase_client.py          # Direct HTTPX Supabase Client
│   └── routers/                        # API Router Modules
│       ├── zones.py                    # Monitored Purok CRUD endpoints
│       ├── weather.py                  # Log listing & summary endpoints
│       └── alerts.py                   # Evacuation status endpoints
├── package.json                        # Node Script & Dependencies
└── .env.local                          # Frontend Environment Variables
```

---

## Tech Stack

### 🌐 Frontend & Presentation Layer
*   **Framework:** Next.js 15+ App Router (React Server/Client hybrid page rendering)
*   **Language:** TypeScript (Strict type checks and compile validations)
*   **Aesthetics:** Modern HSL Dark-Mode theme customized using Vanilla CSS and glassmorphism.
*   **Icons:** Lucide React (Premium vector iconography)
*   **PDF Exporter:** jsPDF & jspdf-autotable (Generates downloadable clean administrative reports)
*   **Authorization:** Client-side secure sessionStorage session management.

### 🐍 Backend & Ingestion Layer
*   **Framework:** FastAPI 0.136+ (High-performance ASGI python backend)
*   **Database:** Supabase REST API (Direct HTTPX client communication)
*   **Cron Scheduler:** APScheduler 3.11+ (Hourly active weather pipeline)
*   **API Data Provider:** Open-Meteo Weather Forecasting API (Coordinates-matched queries)

---

## Local Development & Setup

### Prerequisites
*   Node.js 18+ and npm
*   Python 3.10+ (with virtual environment configured at `flows-backend/venv`)

### Setup & Run Instructions

1. **Configure Environment Variables**:
   - Create a `.env` file in the `flows-backend` directory and add your Supabase credentials:
     ```env
     SUPABASE_URL=your_supabase_project_url
     SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_SERVICE_KEY=your_supabase_service_role_key
     OPEN_METEO_LAT=14.0860
     OPEN_METEO_LON=121.1000
     TIMEZONE=Asia/Manila
     FETCH_INTERVAL_MINUTES=60
     ```
   - Create a `.env.local` file in the root directory:
     ```env
     NEXT_PUBLIC_API_URL=http://localhost:8000
     ```

2. **Install Project Dependencies**:
   From the root folder, install npm packages:
   ```bash
   npm install
   ```

3. **Run Both Systems Concurrently**:
   Start the integrated dev server which concurrently boots the Python FastAPI backend and the Next.js React frontend with a single command:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the Resident Weather Observatory, or navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login) to access the administrative dashboard.


---

## Contributors
*   **Crisler Padrinao** │ Full Stack Developer & Module Lead
