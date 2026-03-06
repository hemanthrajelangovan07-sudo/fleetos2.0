# 🚛 FleetOS 2.0

> A modern, real-time fleet management dashboard built with React — featuring live telemetry, anomaly detection, multi-organization support, and role-based access control.

![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white&style=flat-square)
![Recharts](https://img.shields.io/badge/Recharts-2.x-22d3ee?style=flat-square)
![Lucide](https://img.shields.io/badge/Lucide--React-icons-a78bfa?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-34d399?style=flat-square)

---

## 📸 Overview

FleetOS 2.0 is a full-featured fleet operations platform that gives organizations complete visibility and control over their vehicle fleets. It simulates live vehicle telemetry, detects anomalies in real time, and provides a rich analytics dashboard — all wrapped in a sleek dark-mode UI.

---

## ✨ Features

### 🔐 Role-Based Access Control
Four user roles with scoped permissions:

| Role | Access |
|---|---|
| **Super Admin** | Full access to all organizations, users, vehicles, and analytics |
| **Org Admin** | Manages their organization's users, vehicles, and schedules |
| **Fleet Manager** | Oversees fleet operations, schedules, and telemetry for their org |
| **Driver** | Views assigned schedules and vehicle info |

### 🏢 Multi-Organization Management
- Create and manage multiple independent fleet organizations
- Organization-scoped data isolation
- Cross-org analytics for Super Admins

### 🚗 Vehicle Management
- Add, edit, and delete vehicles with full details (plate, type, year, mileage)
- Track vehicle status: **Available**, **In Use**, **Maintenance**, **Reserved**
- Vehicle categorization: Sedan, Truck, Van, SUV, Bus
- Per-organization fleet views

### 📅 Schedule Management
- Book vehicles for specific date ranges and purposes
- Schedule statuses: **Active**, **Reserved**, **Completed**, **Cancelled**
- Conflict-aware scheduling tied to vehicle and user assignments

### 📡 Live Telemetry
Real-time simulated telemetry for a fleet of 5 vehicles (EV, Petrol, Diesel, Hybrid), updating every 2 seconds:
- **Speed** (km/h)
- **Engine Temperature** (°C)
- **Battery %** (EVs)
- **Fuel Level** (non-EVs)
- **Engine RPM**
- **GPS Coordinates** (lat/lon)

### 🤖 Anomaly Detection
Automated detection of 8 critical vehicle anomaly types with severity classification:

| Anomaly | Severity | Code |
|---|---|---|
| Engine Overheat | 🔴 HIGH | P0217 |
| Overspeed Warning | 🔴 HIGH | C1234 |
| Critical Battery | 🔴 HIGH | B1001 |
| Rapid Fuel Loss | 🔴 HIGH | P0087 |
| Transmission Slip | 🟡 MEDIUM | P0894 |
| Brake Overheat | 🟡 MEDIUM | C0040 |
| Fast Battery Drain | 🟡 MEDIUM | B1023 |
| Over-Revving | 🟡 MEDIUM | P0219 |

### 📊 Dashboard & Reports
- KPI summary cards (total vehicles, active schedules, utilization rate)
- Live speed bar charts across vehicles
- Fleet status pie charts
- Organization comparison charts (Super Admin view)
- Area charts for historical telemetry trends
- Anomaly logs with timestamps and risk levels

### 🔌 Backend Connectivity
- Configurable API endpoint (defaults to `http://localhost:8000`)
- Live connection status ping every 10 seconds
- Designed to integrate with a REST backend

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 18+** | UI framework with hooks (`useState`, `useEffect`, `useReducer`, `useCallback`, `useRef`, `useMemo`) |
| **Recharts** | Interactive charts — Bar, Pie, Area |
| **Lucide React** | Icon library |
| **Google Fonts (Outfit)** | Typography |
| **Inline styles** | Custom dark-theme design system (`T` theme tokens) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js **16+**
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/hemanthrajelangovan07-sudo/fleetos2.0.git
cd fleetos2.0

# # 1. Create a Vite React project
npm create vite@latest fleetos2 -- --template react
cd fleetos2

# 2. Install dependencies
npm install recharts lucide-react

# 3. Replace src/App.jsx with FleetOS.jsx
cp /path/to/FleetOS.jsx src/App.jsx
#the path to FleetOS.jsx wil be available at the cloned files
# 4. Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔑 Demo Credentials

Use these accounts to explore different permission levels:

| Role | Email | Password |
|---|---|---|
| Super Admin | `super@fleet.com` | `admin123` |
| Org Admin (MCC) | `admin@mcc.com` | `admin123` |
| Fleet Manager (MCC) | `manager@mcc.com` | `manager123` |
| Driver | `driver@mcc.com` | `driver123` |
| Org Admin (NTC) | `admin@ntc.com` | `admin123` |
| Fleet Manager (SDA) | `manager@sda.com` | `manager123` |

> ⚠️ These are demo credentials for development. Replace with a secure auth system before deploying to production.

---

## 📁 Project Structure

```
fleetos2.0/
├── src/
│   └── fleetos_enhanced.jsx   # Main application (single-file React component)
├── public/
│   └── index.html
├── package.json
└── README.md
```

---

## 🗺️ Pages & Navigation

| Page | Description |
|---|---|
| **Dashboard** | KPI overview, live fleet status, charts |
| **Live Telemetry** | Real-time vehicle metrics and anomaly alerts |
| **Vehicles** | Full CRUD for fleet vehicles |
| **Schedules** | Manage vehicle bookings and assignments |
| **Organizations** | Multi-org management (Super Admin / Org Admin) |
| **Users** | User management and role assignment |
| **Reports** | Fleet analytics and historical data |

---



## 📄 License

This project is licensed under the [MIT License](LICENSE).

---
