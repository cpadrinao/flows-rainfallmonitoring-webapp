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

The project is structured as a component-based Next.js web application:

```
flows-rainfallmonitoring-webapp/
├── src/                                # Next.js React Frontend
│   ├── app/                            # Next.js App Router Structure
│   │   ├── page.tsx                    # Resident Landing Observatory
│   │   ├── error.tsx                   # Client-side Error Boundary
│   │   ├── lib/                        # API Clients & Types
│   │   │   └── api.ts                  # Httpx Telemetry Sync Client
│   │   └── admin/                      # Administration CMS Portal
│   │       ├── login/                  # sessionStorage Authorization
│   │       ├── dashboard/              # Console Home & Heartbeat Terminal
│   │       ├── zones/                  # Monitored Purok Array CRUD
│   │       └── history/                # Chronological Audit & PDF Generator
├── package.json                        # Node Script & Dependencies
└── .env.local                          # Environment Variables
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

---

## Local Development & Setup

### Prerequisites
*   Node.js 18+ and npm

### Setup Instructions
1. Clone the repository and navigate into the root directory:
   ```bash
   cd flows-rainfallmonitoring-webapp
   ```
2. Create a `.env.local` file in the root directory and specify the URL of your telemetry API server:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
3. Install the node package dependencies:
   ```bash
   npm install
   ```
4. Start the local development web server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the Resident Weather Observatory, or navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login) to access the administrative dashboard.

---

## Contributors
*   **Crisler Padrinao** │ Full Stack Developer & Module Lead
