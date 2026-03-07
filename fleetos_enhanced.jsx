import React, { useState, useMemo, useEffect, useReducer, useCallback, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from "recharts";
import {
  Truck, Calendar, Building2, Users, LayoutDashboard, LogOut, Plus, Edit2,
  Trash2, Search, X, BarChart2, Eye, EyeOff, CheckCircle, AlertCircle,
  Activity, TrendingUp, TrendingDown, Download, RefreshCw, Radio, AlertTriangle,
  Shield, Server, Brain, MessageSquare, Zap, Clock, Target, Cpu, Thermometer,
  Gauge, Battery, Fuel, Send, ChevronRight, Info, MapPin, Navigation, Layers,
  FileText, Wrench, ShieldCheck, ShieldOff, UserCheck, Car, BadgeCheck, ClipboardList,
  AlertOctagon, CheckSquare, PlusCircle, RotateCcw, Sliders, Package
} from "lucide-react";

const T = {
  bg:       '#06101f',
  sidebar:  '#080e1c',
  card:     '#0c1524',
  cardHover:'#111e30',
  border:   'rgba(148,163,184,0.1)',
  borderHi: 'rgba(148,163,184,0.2)',
  accent:   '#f59e0b', accentBg: 'rgba(245,158,11,0.1)',
  blue:     '#60a5fa', blueBg:   'rgba(96,165,250,0.1)',
  green:    '#34d399', greenBg:  'rgba(52,211,153,0.1)',
  red:      '#fb7185', redBg:    'rgba(251,113,133,0.1)',
  amber:    '#fbbf24', amberBg:  'rgba(251,191,36,0.1)',
  purple:   '#a78bfa', purpleBg: 'rgba(167,139,250,0.1)',
  cyan:     '#22d3ee', cyanBg:   'rgba(34,211,238,0.1)',
  text:     '#e2e8f0',
  muted:    '#94a3b8',
  dim:      '#475569',
};

const VEHICLE_STATUS_COLOR = { Available: T.green, 'In Use': T.blue, Maintenance: T.red, Reserved: T.amber };
const VEHICLE_STATUS_BG    = { Available: T.greenBg, 'In Use': T.blueBg, Maintenance: T.redBg, Reserved: T.amberBg };
const SCHEDULE_STATUS_COLOR = { active: T.blue, reserved: T.amber, completed: T.green, cancelled: T.red };
const SCHEDULE_STATUS_BG    = { active: T.blueBg, reserved: T.amberBg, completed: T.greenBg, cancelled: T.redBg };
const RISK_COLOR = { LOW: T.green, MEDIUM: T.amber, HIGH: T.red, UNKNOWN: T.muted };
const RISK_BG    = { LOW: T.greenBg, MEDIUM: T.amberBg, HIGH: T.redBg, UNKNOWN: 'rgba(148,163,184,0.08)' };

const ANOMALY_TYPES = {
  overheat:          { label: 'Engine Overheat',   severity: 'HIGH',   code: 'P0217', metric: 'temperature', icon: '🌡️', color: T.red   },
  overspeed:         { label: 'Overspeed Warning', severity: 'HIGH',   code: 'C1234', metric: 'speed',       icon: '⚡', color: T.red   },
  low_battery:       { label: 'Critical Battery',  severity: 'HIGH',   code: 'B1001', metric: 'battery_pct', icon: '🔋', color: T.red   },
  transmission_slip: { label: 'Transmission Slip', severity: 'MEDIUM', code: 'P0894', metric: 'engine_rpm',  icon: '⚙️', color: T.amber },
  fuel_leak:         { label: 'Rapid Fuel Loss',   severity: 'HIGH',   code: 'P0087', metric: 'fuel_level',  icon: '⛽', color: T.red   },
  brake_overheat:    { label: 'Brake Overheat',    severity: 'MEDIUM', code: 'C0040', metric: 'temperature', icon: '🔥', color: T.amber },
  battery_drain:     { label: 'Fast Battery Drain',severity: 'MEDIUM', code: 'B1023', metric: 'battery_pct', icon: '📉', color: T.amber },
  high_rpm:          { label: 'Over-Revving',      severity: 'MEDIUM', code: 'P0219', metric: 'engine_rpm',  icon: '🔄', color: T.amber },
};

const vc  = s => VEHICLE_STATUS_COLOR[s]  || T.muted;
const vb  = s => VEHICLE_STATUS_BG[s]     || 'transparent';
const sc  = s => SCHEDULE_STATUS_COLOR[s] || T.muted;
const sb  = s => SCHEDULE_STATUS_BG[s]    || 'transparent';
const rl  = l => RISK_COLOR[l] || T.muted;
const rb  = l => RISK_BG[l]    || 'transparent';

const ROLES_MAP   = { super_admin: 'Super Admin', org_admin: 'Org Admin', fleet_manager: 'Fleet Manager', driver: 'Driver' };
const ROLE_COLORS = { super_admin: T.accent, org_admin: T.blue, fleet_manager: T.green, driver: T.amber };

const nowD = new Date();
const fd   = d => new Date(d).toISOString().split('T')[0];
const ad   = n => { const d = new Date(nowD); d.setDate(d.getDate() + n); return fd(d); };

const hashPassword = pwd => btoa(pwd + ':fleet_salt');

const USERS0 = [
  { id: 1, name: 'Alex Morrison',  email: 'super@fleet.com',   passHash: hashPassword('admin123'),    role: 'super_admin',   orgId: null, initials: 'AM' },
  { id: 2, name: 'Sarah Chen',     email: 'admin@mcc.com',     passHash: hashPassword('admin123'),    role: 'org_admin',     orgId: 1,    initials: 'SC' },
  { id: 3, name: 'Mike Torres',    email: 'manager@mcc.com',   passHash: hashPassword('manager123'),  role: 'fleet_manager', orgId: 1,    initials: 'MT' },
  { id: 4, name: 'James Wilson',   email: 'driver@mcc.com',    passHash: hashPassword('driver123'),   role: 'driver',        orgId: 1,    initials: 'JW' },
  { id: 5, name: 'Priya Sharma',   email: 'admin@ntc.com',     passHash: hashPassword('admin123'),    role: 'org_admin',     orgId: 2,    initials: 'PS' },
  { id: 6, name: 'David Kim',      email: 'manager@sda.com',   passHash: hashPassword('manager123'),  role: 'fleet_manager', orgId: 3,    initials: 'DK' },
];

const ORGS0 = [
  { id: 1, name: 'Metro City Council',      code: 'MCC', status: 'active', createdAt: '2024-01-15' },
  { id: 2, name: 'Northern Transport Co.',  code: 'NTC', status: 'active', createdAt: '2024-02-20' },
  { id: 3, name: 'South District Authority',code: 'SDA', status: 'active', createdAt: '2024-03-10' },
];

const VEHICLES0 = [
  { id:  1, plate: 'MCC-001', name: 'Toyota Camry',        cat: 'Sedan', orgId: 1, status: 'Available',   year: 2022, km: 15420 },
  { id:  2, plate: 'MCC-002', name: 'Ford Ranger',         cat: 'Truck', orgId: 1, status: 'In Use',      year: 2021, km: 28100 },
  { id:  3, plate: 'MCC-003', name: 'Toyota HiAce',        cat: 'Van',   orgId: 1, status: 'Available',   year: 2023, km: 8500  },
  { id:  4, plate: 'MCC-004', name: 'Mitsubishi Pajero',   cat: 'SUV',   orgId: 1, status: 'Maintenance', year: 2020, km: 45000 },
  { id:  5, plate: 'MCC-005', name: 'Honda Civic',         cat: 'Sedan', orgId: 1, status: 'Available',   year: 2023, km: 5200  },
  { id:  6, plate: 'MCC-006', name: 'Isuzu Crosswind',     cat: 'SUV',   orgId: 1, status: 'Reserved',    year: 2022, km: 22300 },
  { id:  7, plate: 'NTC-001', name: 'Volvo FH16',          cat: 'Truck', orgId: 2, status: 'In Use',      year: 2021, km: 62000 },
  { id:  8, plate: 'NTC-002', name: 'Mercedes Sprinter',   cat: 'Van',   orgId: 2, status: 'Available',   year: 2022, km: 18700 },
  { id:  9, plate: 'NTC-003', name: 'BMW X5',              cat: 'SUV',   orgId: 2, status: 'Available',   year: 2023, km: 9100  },
  { id: 10, plate: 'SDA-001', name: 'Toyota Land Cruiser', cat: 'SUV',   orgId: 3, status: 'Available',   year: 2021, km: 35000 },
  { id: 11, plate: 'SDA-002', name: 'Nissan Urvan',        cat: 'Bus',   orgId: 3, status: 'In Use',      year: 2020, km: 55000 },
  { id: 12, plate: 'SDA-003', name: 'Ford Transit',        cat: 'Van',   orgId: 3, status: 'Maintenance', year: 2019, km: 78000 },
];

const SCHEDULES0 = [
  { id: 1, vehicleId: 2,  userId: 3, orgId: 1, purpose: 'Field inspection - North District', start: ad(-1),    end: fd(nowD), status: 'active'    },
  { id: 2, vehicleId: 6,  userId: 4, orgId: 1, purpose: 'Site visit - Construction area',   start: fd(nowD),  end: ad(1),    status: 'reserved'  },
  { id: 3, vehicleId: 1,  userId: 3, orgId: 1, purpose: 'Office supplies delivery',          start: ad(1),     end: ad(1),    status: 'reserved'  },
  { id: 4, vehicleId: 7,  userId: 5, orgId: 2, purpose: 'Cargo transport - Port',            start: ad(-3),    end: ad(-1),   status: 'completed' },
  { id: 5, vehicleId: 11, userId: 6, orgId: 3, purpose: 'Staff transport - Route 5',         start: fd(nowD),  end: ad(2),    status: 'active'    },
  { id: 6, vehicleId: 3,  userId: 3, orgId: 1, purpose: 'Equipment transport',               start: ad(3),     end: ad(4),    status: 'reserved'  },
];

// ─── OWNERSHIP DATA ──────────────────────────────────────────────────────────
const OWNERSHIP0 = [
  { id:  1, vehicleId:  1, ownerName: 'Metro City Council',      ownerType: 'Organization', licenseNo: 'LIC-MCC-2022-001', contact: 'admin@mcc.com',     address: '1 City Hall Avenue, Chennai 600001', validFrom: '2022-03-01', validTo: '2027-03-01', authorized: true  },
  { id:  2, vehicleId:  2, ownerName: 'Metro City Council',      ownerType: 'Organization', licenseNo: 'LIC-MCC-2021-002', contact: 'admin@mcc.com',     address: '1 City Hall Avenue, Chennai 600001', validFrom: '2021-06-15', validTo: '2026-06-15', authorized: true  },
  { id:  3, vehicleId:  3, ownerName: 'Metro City Council',      ownerType: 'Organization', licenseNo: 'LIC-MCC-2023-003', contact: 'admin@mcc.com',     address: '1 City Hall Avenue, Chennai 600001', validFrom: '2023-01-10', validTo: '2028-01-10', authorized: true  },
  { id:  4, vehicleId:  4, ownerName: 'Metro City Council',      ownerType: 'Organization', licenseNo: 'LIC-MCC-2020-004', contact: 'admin@mcc.com',     address: '1 City Hall Avenue, Chennai 600001', validFrom: '2020-09-01', validTo: '2025-09-01', authorized: false },
  { id:  5, vehicleId:  5, ownerName: 'Metro City Council',      ownerType: 'Organization', licenseNo: 'LIC-MCC-2023-005', contact: 'admin@mcc.com',     address: '1 City Hall Avenue, Chennai 600001', validFrom: '2023-04-20', validTo: '2028-04-20', authorized: true  },
  { id:  6, vehicleId:  6, ownerName: 'Metro City Council',      ownerType: 'Organization', licenseNo: 'LIC-MCC-2022-006', contact: 'admin@mcc.com',     address: '1 City Hall Avenue, Chennai 600001', validFrom: '2022-11-05', validTo: '2027-11-05', authorized: true  },
  { id:  7, vehicleId:  7, ownerName: 'Northern Transport Co.',  ownerType: 'Organization', licenseNo: 'LIC-NTC-2021-001', contact: 'admin@ntc.com',     address: '45 Industrial Park Road, Chennai 600058', validFrom: '2021-03-01', validTo: '2026-03-01', authorized: true  },
  { id:  8, vehicleId:  8, ownerName: 'Northern Transport Co.',  ownerType: 'Organization', licenseNo: 'LIC-NTC-2022-002', contact: 'admin@ntc.com',     address: '45 Industrial Park Road, Chennai 600058', validFrom: '2022-07-12', validTo: '2027-07-12', authorized: true  },
  { id:  9, vehicleId:  9, ownerName: 'Northern Transport Co.',  ownerType: 'Organization', licenseNo: 'LIC-NTC-2023-003', contact: 'admin@ntc.com',     address: '45 Industrial Park Road, Chennai 600058', validFrom: '2023-02-28', validTo: '2028-02-28', authorized: true  },
  { id: 10, vehicleId: 10, ownerName: 'South District Authority',ownerType: 'Organization', licenseNo: 'LIC-SDA-2021-001', contact: 'manager@sda.com',   address: '7 District HQ, Chennai 600045', validFrom: '2021-01-15', validTo: '2026-01-15', authorized: true  },
  { id: 11, vehicleId: 11, ownerName: 'South District Authority',ownerType: 'Organization', licenseNo: 'LIC-SDA-2020-002', contact: 'manager@sda.com',   address: '7 District HQ, Chennai 600045', validFrom: '2020-05-10', validTo: '2025-05-10', authorized: false },
  { id: 12, vehicleId: 12, ownerName: 'South District Authority',ownerType: 'Organization', licenseNo: 'LIC-SDA-2019-003', contact: 'manager@sda.com',   address: '7 District HQ, Chennai 600045', validFrom: '2019-08-22', validTo: '2024-08-22', authorized: false },
];

// ─── INSURANCE DATA ───────────────────────────────────────────────────────────
const INSURANCE0 = [
  { id:  1, vehicleId:  1, provider: 'SafeDrive Insurance',     policyNo: 'POL-SD-2024-001', coverageType: 'Comprehensive', startDate: '2024-01-01', expiryDate: '2026-01-01', premiumAnnual: 1200, insuredValue: 25000, contactNo: '+91-1800-111-222' },
  { id:  2, vehicleId:  2, provider: 'FleetGuard Assurance',    policyNo: 'POL-FG-2023-002', coverageType: 'Comprehensive', startDate: '2023-06-15', expiryDate: '2025-06-15', premiumAnnual: 1800, insuredValue: 32000, contactNo: '+91-1800-333-444' },
  { id:  3, vehicleId:  3, provider: 'SafeDrive Insurance',     policyNo: 'POL-SD-2025-003', coverageType: 'Third-Party',   startDate: '2025-01-10', expiryDate: '2027-01-10', premiumAnnual: 650,  insuredValue: 28000, contactNo: '+91-1800-111-222' },
  { id:  4, vehicleId:  4, provider: 'NationalFleet Cover',     policyNo: 'POL-NF-2024-004', coverageType: 'Comprehensive', startDate: '2024-09-01', expiryDate: '2025-09-01', premiumAnnual: 2100, insuredValue: 38000, contactNo: '+91-1800-555-666' },
  { id:  5, vehicleId:  5, provider: 'SafeDrive Insurance',     policyNo: 'POL-SD-2025-005', coverageType: 'Comprehensive', startDate: '2025-04-20', expiryDate: '2027-04-20', premiumAnnual: 950,  insuredValue: 22000, contactNo: '+91-1800-111-222' },
  { id:  6, vehicleId:  6, provider: 'FleetGuard Assurance',    policyNo: 'POL-FG-2024-006', coverageType: 'Comprehensive', startDate: '2024-11-05', expiryDate: '2026-11-05', premiumAnnual: 1550, insuredValue: 30000, contactNo: '+91-1800-333-444' },
  { id:  7, vehicleId:  7, provider: 'TruckShield Pro',         policyNo: 'POL-TS-2024-007', coverageType: 'Comprehensive', startDate: '2024-03-01', expiryDate: '2026-03-01', premiumAnnual: 3200, insuredValue: 85000, contactNo: '+91-1800-777-888' },
  { id:  8, vehicleId:  8, provider: 'FleetGuard Assurance',    policyNo: 'POL-FG-2025-008', coverageType: 'Third-Party',   startDate: '2025-07-12', expiryDate: '2027-07-12', premiumAnnual: 720,  insuredValue: 35000, contactNo: '+91-1800-333-444' },
  { id:  9, vehicleId:  9, provider: 'SafeDrive Insurance',     policyNo: 'POL-SD-2025-009', coverageType: 'Comprehensive', startDate: '2025-02-28', expiryDate: '2027-02-28', premiumAnnual: 1400, insuredValue: 52000, contactNo: '+91-1800-111-222' },
  { id: 10, vehicleId: 10, provider: 'NationalFleet Cover',     policyNo: 'POL-NF-2024-010', coverageType: 'Comprehensive', startDate: '2024-01-15', expiryDate: '2026-01-15', premiumAnnual: 2800, insuredValue: 58000, contactNo: '+91-1800-555-666' },
  { id: 11, vehicleId: 11, provider: 'NationalFleet Cover',     policyNo: 'POL-NF-2023-011', coverageType: 'Third-Party',   startDate: '2023-05-10', expiryDate: '2025-05-10', premiumAnnual: 890,  insuredValue: 18000, contactNo: '+91-1800-555-666' },
  { id: 12, vehicleId: 12, provider: 'TruckShield Pro',         policyNo: 'POL-TS-2022-012', coverageType: 'Comprehensive', startDate: '2022-08-22', expiryDate: '2024-08-22', premiumAnnual: 2200, insuredValue: 26000, contactNo: '+91-1800-777-888' },
];

// ─── MAINTENANCE DATA ─────────────────────────────────────────────────────────
const SERVICE_TYPES = ['Oil Change','Tire Rotation','Brake Inspection','Air Filter','Battery Check','Full Service','Transmission Service','Coolant Flush','Wheel Alignment','A/C Service'];

const MAINTENANCE0 = [
  { id:  1, vehicleId:  1, type: 'Oil Change',          date: '2025-11-15', kmAtService: 14000, cost: 85,  technician: 'Ravi Kumar', notes: 'Full synthetic 5W-30',           nextServiceKm: 19000, nextServiceDate: '2026-05-15' },
  { id:  2, vehicleId:  1, type: 'Tire Rotation',       date: '2025-09-02', kmAtService: 12800, cost: 45,  technician: 'Suresh M.',  notes: 'All tires rotated, pressure OK', nextServiceKm: 18800, nextServiceDate: '2026-03-02' },
  { id:  3, vehicleId:  2, type: 'Full Service',         date: '2025-10-20', kmAtService: 27000, cost: 340, technician: 'Arjun R.',   notes: 'Full 30k service completed',     nextServiceKm: 32000, nextServiceDate: '2026-04-20' },
  { id:  4, vehicleId:  2, type: 'Brake Inspection',    date: '2025-08-10', kmAtService: 25500, cost: 120, technician: 'Ravi Kumar', notes: 'Rear pads replaced',             nextServiceKm: 30500, nextServiceDate: '2026-02-10' },
  { id:  5, vehicleId:  3, type: 'Oil Change',          date: '2026-01-05', kmAtService:  7900, cost: 75,  technician: 'Mani S.',    notes: 'Diesel engine, 5W-40',           nextServiceKm: 12900, nextServiceDate: '2026-07-05' },
  { id:  6, vehicleId:  4, type: 'Transmission Service',date: '2025-07-15', kmAtService: 42000, cost: 450, technician: 'Arjun R.',   notes: 'Fluid replaced, filter new',     nextServiceKm: 47000, nextServiceDate: '2026-01-15' },
  { id:  7, vehicleId:  4, type: 'Full Service',         date: '2026-01-20', kmAtService: 44500, cost: 380, technician: 'Suresh M.',  notes: 'Overdue — all filters replaced', nextServiceKm: 49500, nextServiceDate: '2026-07-20' },
  { id:  8, vehicleId:  5, type: 'Battery Check',       date: '2025-12-01', kmAtService:  4800, cost: 30,  technician: 'Mani S.',    notes: 'Battery at 85% health',         nextServiceKm:  9800, nextServiceDate: '2026-06-01' },
  { id:  9, vehicleId:  6, type: 'Wheel Alignment',     date: '2025-10-30', kmAtService: 21000, cost: 60,  technician: 'Ravi Kumar', notes: 'Corrected 0.3° drift',          nextServiceKm: 31000, nextServiceDate: '2026-10-30' },
  { id: 10, vehicleId:  6, type: 'Oil Change',          date: '2025-12-18', kmAtService: 22100, cost: 90,  technician: 'Arjun R.',   notes: 'Synthetic 0W-20',               nextServiceKm: 27100, nextServiceDate: '2026-06-18' },
  { id: 11, vehicleId:  7, type: 'Full Service',         date: '2025-09-10', kmAtService: 60000, cost: 820, technician: 'Kumar T.',   notes: 'Major 60k service',             nextServiceKm: 65000, nextServiceDate: '2026-03-10' },
  { id: 12, vehicleId:  8, type: 'Air Filter',          date: '2026-01-22', kmAtService: 18200, cost: 40,  technician: 'Mani S.',    notes: 'Cabin + engine filter replaced', nextServiceKm: 28200, nextServiceDate: '2026-07-22' },
  { id: 13, vehicleId:  9, type: 'A/C Service',         date: '2025-11-05', kmAtService:  8800, cost: 110, technician: 'Suresh M.',  notes: 'Gas recharged, filter cleaned',  nextServiceKm: 18800, nextServiceDate: '2026-11-05' },
  { id: 14, vehicleId: 10, type: 'Coolant Flush',       date: '2025-08-20', kmAtService: 33000, cost: 95,  technician: 'Arjun R.',   notes: 'Replaced with OEM coolant',     nextServiceKm: 43000, nextServiceDate: '2026-08-20' },
  { id: 15, vehicleId: 11, type: 'Oil Change',          date: '2025-06-30', kmAtService: 53000, cost: 95,  technician: 'Kumar T.',   notes: 'Heavy duty 15W-40',             nextServiceKm: 58000, nextServiceDate: '2026-01-30' },
  { id: 16, vehicleId: 12, type: 'Brake Inspection',    date: '2024-12-10', kmAtService: 75000, cost: 200, technician: 'Ravi Kumar', notes: 'All pads critical, replaced',   nextServiceKm: 80000, nextServiceDate: '2025-06-10' },
];

const SIM_VEHICLES = [
  { id: 'VH-001', type: 'EV',     name: 'Tesla Model 3',     color: T.blue   },
  { id: 'VH-002', type: 'Petrol', name: 'Toyota Camry',      color: T.green  },
  { id: 'VH-003', type: 'Diesel', name: 'Ford Transit Van',  color: T.amber  },
  { id: 'VH-004', type: 'EV',     name: 'Tata Nexon EV',     color: T.purple },
  { id: 'VH-005', type: 'Hybrid', name: 'Honda City Hybrid', color: T.cyan   },
];

// Real road waypoints for Chennai, India — each vehicle follows a named road corridor
const VEHICLE_ROUTES = {
  'VH-001': [ // Anna Salai (Mount Road) — Chennai Central ↔ Guindy
    [13.0827, 80.2707], [13.0800, 80.2688], [13.0775, 80.2665],
    [13.0748, 80.2638], [13.0718, 80.2610], [13.0692, 80.2584],
    [13.0665, 80.2558], [13.0638, 80.2534], [13.0610, 80.2510],
    [13.0582, 80.2487], [13.0555, 80.2465], [13.0525, 80.2443],
    [13.0496, 80.2422], [13.0466, 80.2404], [13.0436, 80.2388],
    [13.0405, 80.2374], [13.0374, 80.2360], [13.0344, 80.2347], // Guindy
    [13.0374, 80.2360], [13.0405, 80.2374], [13.0436, 80.2388],
    [13.0466, 80.2404], [13.0496, 80.2422], [13.0525, 80.2443],
    [13.0555, 80.2465], [13.0582, 80.2487], [13.0610, 80.2510],
    [13.0638, 80.2534], [13.0665, 80.2558], [13.0692, 80.2584],
    [13.0718, 80.2610], [13.0748, 80.2638], [13.0775, 80.2665],
    [13.0800, 80.2688],
  ],
  'VH-002': [ // OMR (Old Mahabalipuram Road) — Perungudi ↔ Kelambakkam
    [12.9716, 80.2450], [12.9678, 80.2432], [12.9640, 80.2416],
    [12.9600, 80.2408], [12.9560, 80.2396], [12.9520, 80.2386],
    [12.9480, 80.2376], [12.9440, 80.2367], [12.9400, 80.2358],
    [12.9360, 80.2350], [12.9320, 80.2342], [12.9280, 80.2336],
    [12.9240, 80.2330], [12.9200, 80.2325], [12.9160, 80.2320], // Kelambakkam
    [12.9200, 80.2325], [12.9240, 80.2330], [12.9280, 80.2336],
    [12.9320, 80.2342], [12.9360, 80.2350], [12.9400, 80.2358],
    [12.9440, 80.2367], [12.9480, 80.2376], [12.9520, 80.2386],
    [12.9560, 80.2396], [12.9600, 80.2408], [12.9640, 80.2418],
    [12.9678, 80.2432],
  ],
  'VH-003': [ // Chennai Port → George Town → Parry's → T.Nagar
    [13.0878, 80.2988], [13.0855, 80.2952], [13.0830, 80.2912],
    [13.0805, 80.2870], [13.0778, 80.2832], [13.0750, 80.2796],
    [13.0722, 80.2762], [13.0694, 80.2728], [13.0665, 80.2695],
    [13.0636, 80.2663], [13.0606, 80.2632], [13.0576, 80.2603],
    [13.0545, 80.2575], [13.0514, 80.2548], [13.0482, 80.2523],
    [13.0450, 80.2498], // T.Nagar area
    [13.0482, 80.2523], [13.0514, 80.2548], [13.0545, 80.2575],
    [13.0576, 80.2603], [13.0606, 80.2632], [13.0636, 80.2663],
    [13.0665, 80.2695], [13.0694, 80.2728], [13.0722, 80.2762],
    [13.0750, 80.2796], [13.0778, 80.2832], [13.0805, 80.2870],
    [13.0830, 80.2912], [13.0855, 80.2952],
  ],
  'VH-004': [ // Adyar → Kasturba Nagar → Velachery loop
    [13.0012, 80.2565], [13.0038, 80.2533], [13.0064, 80.2501],
    [13.0092, 80.2470], [13.0120, 80.2439], [13.0148, 80.2408],
    [13.0176, 80.2378], [13.0203, 80.2348], [13.0228, 80.2319],
    [13.0252, 80.2290], // Velachery
    [13.0228, 80.2319], [13.0203, 80.2348], [13.0176, 80.2378],
    [13.0148, 80.2408], [13.0120, 80.2439], [13.0092, 80.2470],
    [13.0064, 80.2501], [13.0038, 80.2533],
  ],
  'VH-005': [ // ECR (East Coast Road) — Thiruvanmiyur ↔ Kovalam (on-road coords)
    [12.9834, 80.2554], [12.9800, 80.2545], [12.9765, 80.2535],
    [12.9730, 80.2525], [12.9695, 80.2518], [12.9660, 80.2512],
    [12.9620, 80.2508], [12.9580, 80.2502], [12.9540, 80.2496],
    [12.9500, 80.2490], [12.9460, 80.2484], [12.9420, 80.2480],
    [12.9380, 80.2476], [12.9340, 80.2474], [12.9300, 80.2472],
    [12.9260, 80.2470], [12.9220, 80.2469], [12.9180, 80.2470], // Kovalam
    [12.9220, 80.2469], [12.9260, 80.2470], [12.9300, 80.2472],
    [12.9340, 80.2474], [12.9380, 80.2476], [12.9420, 80.2480],
    [12.9460, 80.2484], [12.9500, 80.2490], [12.9540, 80.2496],
    [12.9580, 80.2502], [12.9620, 80.2508], [12.9660, 80.2512],
    [12.9695, 80.2518], [12.9730, 80.2525], [12.9765, 80.2535],
    [12.9800, 80.2545],
  ],
};

const VEHICLE_EMOJIS = { EV: '⚡', Petrol: '🚗', Diesel: '🚐', Hybrid: '🔋' };

// Compute compass bearing between two [lat,lon] points
const calcBearing = (p1, p2) => {
  const toRad = d => d * Math.PI / 180;
  const dLon  = toRad(p2[1] - p1[1]);
  const lat1  = toRad(p1[0]);
  const lat2  = toRad(p2[0]);
  const y     = Math.sin(dLon) * Math.cos(lat2);
  const x     = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
};

const rnd   = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function initSimState() {
  return Object.fromEntries(
    SIM_VEHICLES.map((v, vi) => {
      const route    = VEHICLE_ROUTES[v.id];
      // Stagger starting positions so vehicles are spread across their routes
      const startIdx = Math.floor((route.length - 1) * (vi / SIM_VEHICLES.length));
      const startPt  = route[startIdx];
      return [
        v.id,
        {
          speed:            rnd(30, 80),
          temp:             rnd(70, 85),
          battery:          v.type === 'EV'  ? rnd(50, 90) : null,
          fuel:             v.type !== 'EV'  ? rnd(20, 60) : null,
          rpm:              rnd(1500, 3000),
          lat:              startPt[0],
          lon:              startPt[1],
          routeIdx:         startIdx,
          routeProg:        rnd(0, 0.5),
          bearing:          0,
          trail:            [startPt],
          anomalyCountdown: Math.round(rnd(20, 60)),
          activeAnomaly:    null,
          anomalyLog:       [],
          tick:             0,
        },
      ];
    })
  );
}

function tickSimState(prev) {
  return Object.fromEntries(
    SIM_VEHICLES.map(v => {
      const s = { ...prev[v.id], anomalyLog: [...(prev[v.id].anomalyLog || [])] };
      s.tick++;
      s.speed = clamp(s.speed + rnd(-5, 5), 0, 160);
      s.temp  = clamp(s.temp  + rnd(-1, 1.5), 60, 105);
      s.rpm   = clamp(s.speed * 38 + rnd(-200, 200), 800, 7000);

      if (v.type === 'EV') {
        s.battery = clamp(s.battery - s.speed * 0.0003 + rnd(-0.1, 0.2), 5, 100);
      } else {
        s.fuel = clamp(s.fuel - rnd(0.01, 0.05), 0, 60);
      }

      // ── Road-following movement ──────────────────────────────────────────
      const route    = VEHICLE_ROUTES[v.id] || [];
      const maxIdx   = route.length - 2; // last valid source segment idx
      let   routeIdx = s.routeIdx  ?? 0;
      let   routeProg= s.routeProg ?? 0;

      // Advance progress proportional to speed (tuned: 60 km/h ≈ 12 ticks/segment)
      const step = s.speed / 72000;
      routeProg += step;
      while (routeProg >= 1 && maxIdx >= 0) {
        routeProg -= 1;
        routeIdx  = (routeIdx + 1) % (maxIdx + 1);
      }

      // Interpolate position between current and next waypoint
      const wp0 = route[routeIdx]     || route[0];
      const wp1 = route[routeIdx + 1] || route[0];
      s.lat      = wp0[0] + (wp1[0] - wp0[0]) * routeProg;
      s.lon      = wp0[1] + (wp1[1] - wp0[1]) * routeProg;
      s.bearing  = calcBearing(wp0, wp1);
      s.routeIdx = routeIdx;
      s.routeProg= routeProg;

      // Update trail — store last 20 positions, throttled every 3 ticks
      if (s.tick % 3 === 0) {
        const prevTrail = prev[v.id].trail || [];
        s.trail = [[s.lat, s.lon], ...prevTrail].slice(0, 20);
      } else {
        s.trail = prev[v.id].trail || [];
      }
      // ────────────────────────────────────────────────────────────────────

      s.anomalyCountdown--;
      s.activeAnomaly = null;

      if (s.anomalyCountdown <= 0) {
        const pools = {
          EV:     ['overheat', 'overspeed', 'low_battery', 'battery_drain', 'high_rpm'],
          Petrol: ['overheat', 'overspeed', 'fuel_leak', 'transmission_slip', 'high_rpm', 'brake_overheat'],
          Diesel: ['overheat', 'overspeed', 'fuel_leak', 'transmission_slip', 'brake_overheat'],
          Hybrid: ['overheat', 'overspeed', 'low_battery', 'high_rpm', 'transmission_slip'],
        };
        const pool    = pools[v.type] || pools.Petrol;
        const anomaly = pool[Math.floor(Math.random() * pool.length)];

        if (anomaly === 'overheat')          { s.temp    = rnd(102, 110); }
        if (anomaly === 'overspeed')         { s.speed   = rnd(135, 155); }
        if (anomaly === 'low_battery')       { s.battery = rnd(5, 12);   }
        if (anomaly === 'battery_drain')     { s.battery = clamp(s.battery - rnd(8, 15), 5, 100); }
        if (anomaly === 'fuel_leak')         { s.fuel    = clamp(s.fuel   - rnd(10, 20), 0, 60); }
        if (anomaly === 'transmission_slip') { s.rpm     = rnd(5500, 7000); s.speed = clamp(s.speed * 0.6, 0, 160); }
        if (anomaly === 'brake_overheat')    { s.temp    = rnd(96, 104); }
        if (anomaly === 'high_rpm')          { s.rpm     = rnd(5800, 6800); }

        s.activeAnomaly = anomaly;
        s.anomalyLog = [
          { anomaly, timestamp: new Date().toISOString(), severity: ANOMALY_TYPES[anomaly]?.severity || 'MEDIUM' },
          ...s.anomalyLog,
        ].slice(0, 20);
        s.anomalyCountdown = Math.round(rnd(30, 80));
      }

      return [v.id, s];
    })
  );
}

function toReading(vehicleId, s, ts) {
  return {
    vehicle_id:  vehicleId,
    timestamp:   ts || new Date().toISOString(),
    speed:       +s.speed.toFixed(1),
    temperature: +s.temp.toFixed(1),
    battery_pct: s.battery != null ? +s.battery.toFixed(1) : null,
    fuel_level:  s.fuel    != null ? +s.fuel.toFixed(2)    : null,
    engine_rpm:  +s.rpm.toFixed(0),
    latitude:    +s.lat.toFixed(6),
    longitude:   +s.lon.toFixed(6),
    activeAnomaly: s.activeAnomaly,
  };
}

function buildAlerts(readings, vehicleId) {
  const r = readings[0];
  if (!r) return { risk_level: 'LOW', alerts: [], summary: 'No data.', health_score: 100 };

  const alerts = [];

  // — Threshold checks —
  if (r.speed > 130)
    alerts.push({ metric: 'speed', issue: `Overspeed: ${r.speed} km/h`, recommendation: 'Reduce speed immediately.', code: 'C1234', severity: 'HIGH' });
  if (r.temperature > 100)
    alerts.push({ metric: 'temperature', issue: `Overheating: ${r.temperature}°C`, recommendation: 'Pull over. Check coolant level and radiator.', code: 'P0217', severity: 'HIGH' });
  if (r.battery_pct != null && r.battery_pct < 15)
    alerts.push({ metric: 'battery_pct', issue: `Critical battery: ${r.battery_pct}%`, recommendation: 'Find nearest charging station immediately.', code: 'B1001', severity: 'HIGH' });
  if (r.engine_rpm > 6000)
    alerts.push({ metric: 'engine_rpm', issue: `Over-revving: ${r.engine_rpm} RPM`, recommendation: 'Reduce throttle and upshift to a higher gear.', code: 'P0219', severity: 'MEDIUM' });
  if (r.fuel_level != null && r.fuel_level < 8)
    alerts.push({ metric: 'fuel_level', issue: `Critical fuel: ${r.fuel_level.toFixed(1)}L remaining`, recommendation: 'Refuel immediately. Estimated range critical.', code: 'P0087', severity: 'HIGH' });

  // — Trend-based checks (requires history depth) —
  if (readings.length > 3) {
    const tempDelta = readings[0].temperature - readings[3].temperature;
    if (tempDelta > 8)
      alerts.push({ metric: 'temperature', issue: `Rapid temp spike: +${tempDelta.toFixed(1)}°C in last 4 readings`, recommendation: 'Monitor cooling system closely. Possible coolant leak.', code: 'P0218', severity: 'MEDIUM' });
  }
  if (readings.length > 5) {
    const speedArr  = readings.slice(0, 6).map(r => r.speed);
    const rpmArr    = readings.slice(0, 6).map(r => r.engine_rpm);
    const avgSpeed  = speedArr.reduce((a, b) => a + b, 0) / speedArr.length;
    const avgRpm    = rpmArr.reduce((a, b) => a + b, 0) / rpmArr.length;
    const rpmPerKmh = avgRpm / Math.max(avgSpeed, 1);
    if (rpmPerKmh > 55 && avgSpeed > 20)
      alerts.push({ metric: 'engine_rpm', issue: `Transmission anomaly: ${rpmPerKmh.toFixed(0)} RPM/km·h⁻¹ ratio`, recommendation: 'Possible transmission slip. Schedule inspection.', code: 'P0894', severity: 'MEDIUM' });
  }
  if (readings.length > 8 && r.fuel_level != null) {
    const fuelDrop = readings[7].fuel_level - readings[0].fuel_level;
    if (fuelDrop > 3)
      alerts.push({ metric: 'fuel_level', issue: `Abnormal fuel loss: ${fuelDrop.toFixed(1)}L in 8 readings`, recommendation: 'Inspect for fuel line leaks. Do not drive far.', code: 'P0087', severity: 'HIGH' });
  }
  if (readings.length > 8 && r.battery_pct != null) {
    const battDrop = readings[7].battery_pct - readings[0].battery_pct;
    if (battDrop > 12)
      alerts.push({ metric: 'battery_pct', issue: `Fast battery drain: ${battDrop.toFixed(1)}% in 8 readings`, recommendation: 'Check battery health and charging system.', code: 'B1023', severity: 'MEDIUM' });
  }

  // — Health Score Computation —
  let score = 100;
  const recent20 = readings.slice(0, 20);
  score -= recent20.filter(x => x.activeAnomaly).length * 5;
  score -= recent20.filter(x => x.temperature > 100).length * 3;
  score -= recent20.filter(x => x.speed > 130).length * 2;
  score -= recent20.filter(x => x.battery_pct != null && x.battery_pct < 15).length * 4;
  score -= recent20.filter(x => x.engine_rpm > 6000).length * 2;
  score -= alerts.filter(a => a.severity === 'HIGH').length * 8;
  score -= alerts.filter(a => a.severity === 'MEDIUM').length * 4;
  if (readings.length > 3) {
    const tempTrend = readings[0].temperature - readings[3].temperature;
    if (tempTrend > 5) score -= 8;
  }
  const health_score = Math.max(0, Math.min(100, Math.round(score)));

  const highCount = alerts.filter(a => a.severity === 'HIGH').length;
  const risk = alerts.length === 0 ? 'LOW' : highCount > 0 || r.temperature > 104 || r.speed > 140 ? 'HIGH' : 'MEDIUM';

  return {
    risk_level: risk,
    alerts,
    health_score,
    summary: alerts.length === 0
      ? 'All metrics within safe operating ranges.'
      : `${alerts.length} issue(s) detected — ${highCount} critical.`,
  };
}

async function callClaudeForDiagnosis(vehicleInfo, readings, stats, alertResult, anomalyLog) {
  const recentAnomalies = anomalyLog.slice(0, 8).map(a =>
    `${new Date(a.timestamp).toLocaleTimeString()}: ${ANOMALY_TYPES[a.anomaly]?.label || a.anomaly} (${a.severity})`
  ).join('\n') || 'No recent anomaly events';

  const alertList = alertResult.alerts.map(a =>
    `[${a.code}] ${a.metric}: ${a.issue}`
  ).join('\n') || 'None detected';

  const prompt = `You are an automotive AI diagnostics system for FleetOS. Analyze this vehicle telemetry and respond ONLY with valid JSON (no markdown fences, no extra text).

Vehicle: ${vehicleInfo.name} | Type: ${vehicleInfo.type} | ID: ${vehicleInfo.id}
Health Score: ${alertResult.health_score}/100 | Risk Level: ${alertResult.risk_level}

Telemetry Stats (last ${stats.total_readings} readings):
- Speed: avg ${stats.speed_kmh.avg} km/h, max ${stats.speed_kmh.max} km/h
- Temperature: avg ${stats.temperature_c.avg}°C, max ${stats.temperature_c.max}°C
- RPM: avg ${stats.engine_rpm.avg}, max ${stats.engine_rpm.max}
${stats.battery_pct ? `- Battery: avg ${stats.battery_pct.avg}%, min ${stats.battery_pct.min}%` : ''}

Active Alerts:
${alertList}

Recent Fault History:
${recentAnomalies}

Return this exact JSON structure:
{
  "diagnosis": "2-3 sentence clinical assessment of vehicle condition",
  "fault_codes": [{"code": "P0217", "description": "Engine Coolant Over Temperature Condition", "severity": "HIGH"}],
  "maintenance_priority": "immediate|within_week|next_service|healthy",
  "root_cause": "Most probable root cause in 1-2 sentences",
  "recommendations": ["Specific action 1", "Specific action 2", "Specific action 3"],
  "health_summary": "One concise line summary",
  "predicted_next_issue": "What system is most at risk next and why"
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await response.json();
  const text = data.content?.map(c => c.text || '').join('') || '';
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

async function callClaudeChat(vehicleInfo, readings, stats, alertResult, question) {
  const r = readings[0];
  const prompt = `You are a vehicle diagnostics AI assistant for FleetOS. Answer the driver/manager's question about this vehicle concisely and practically.

Vehicle: ${vehicleInfo.name} (${vehicleInfo.type})
Current: speed ${r?.speed?.toFixed(0) || '—'} km/h, temp ${r?.temperature?.toFixed(0) || '—'}°C${r?.battery_pct != null ? `, battery ${r.battery_pct.toFixed(0)}%` : r?.fuel_level != null ? `, fuel ${r.fuel_level.toFixed(1)}L` : ''}
Health Score: ${alertResult?.health_score || '—'}/100 | Risk: ${alertResult?.risk_level || '—'}
Active Alerts: ${alertResult?.alerts?.length || 0} — ${alertResult?.alerts?.map(a => a.issue).join('; ') || 'None'}

Question: ${question}

Answer in 2-4 sentences. Be specific, practical, and reference actual data values where relevant.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await response.json();
  return data.content?.map(c => c.text || '').join('') || 'Unable to generate response.';
}

function computeStats(history) {
  if (!history.length) return null;

  const defined = arr => arr.filter(v => v != null);
  const spd = defined(history.map(r => r.speed));
  const tmp = defined(history.map(r => r.temperature));
  const bat = defined(history.map(r => r.battery_pct));
  const rpm = defined(history.map(r => r.engine_rpm));
  const avg = a => a.length ? +(a.reduce((s, v) => s + v, 0) / a.length).toFixed(1) : 0;

  return {
    total_readings: history.length,
    speed_kmh:      { avg: avg(spd), max: spd.length ? +Math.max(...spd).toFixed(1) : 0, min: spd.length ? +Math.min(...spd).toFixed(1) : 0 },
    temperature_c:  { avg: avg(tmp), max: tmp.length ? +Math.max(...tmp).toFixed(1) : 0, min: tmp.length ? +Math.min(...tmp).toFixed(1) : 0 },
    battery_pct:    bat.length ? { avg: avg(bat), min: +Math.min(...bat).toFixed(1) } : null,
    engine_rpm:     { avg: avg(rpm), max: rpm.length ? +Math.max(...rpm).toFixed(0) : 0 },
    last_seen:      history[0]?.timestamp,
  };
}

function telemetryReducer(state, action) {
  const ts = action.timestamp;
  const nextSim = tickSimState(state.sim);
  const nextHistory = { ...state.history };
  SIM_VEHICLES.forEach(v => {
    const reading = toReading(v.id, nextSim[v.id], ts);
    nextHistory[v.id] = [reading, ...(state.history[v.id] || [])].slice(0, 200);
  });
  return { sim: nextSim, history: nextHistory };
}

function initTelemetry() {
  return {
    sim:     initSimState(),
    history: Object.fromEntries(SIM_VEHICLES.map(v => [v.id, []])),
  };
}

const abortableFetch = (url, timeoutMs = 2000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
};

const Badge = ({ label, color, bg }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
    borderRadius: 20, fontSize: 12, fontWeight: 500, color, background: bg,
    border: `1px solid ${color}33`, whiteSpace: 'nowrap',
  }}>
    {label}
  </span>
);

const Modal = ({ title, onClose, children, wide }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(4px)', padding: 16,
  }}>
    <div style={{
      background: T.card, border: `1px solid ${T.borderHi}`, borderRadius: 16,
      padding: 32, width: '100%', maxWidth: wide ? 800 : 520,
      maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: T.text, fontSize: 18, fontWeight: 700, margin: 0 }}>{title}</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', padding: 4, display: 'flex' }}>
          <X size={20} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, value, onChange, type = 'text', options, placeholder }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', color: T.muted, fontSize: 13, marginBottom: 6, fontWeight: 500 }}>{label}</label>
    {options ? (
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '10px 12px', background: '#0a1525', border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 14, outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
      >
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    ) : (
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || ''}
        style={{ width: '100%', padding: '10px 12px', background: '#0a1525', border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
      />
    )}
  </div>
);

const BUTTON_STYLES = {
  primary:   { color: '#000', border: 'none' },
  secondary: { background: 'transparent', color: T.text, border: `1px solid ${T.border}` },
  danger:    { background: T.redBg,  color: T.red,  border: `1px solid ${T.red}33`  },
  ghost:     { background: 'transparent', color: T.muted, border: 'none' },
  cyan:      { background: T.cyanBg, color: T.cyan, border: `1px solid ${T.cyan}33` },
};

const Btn = ({ onClick, children, variant = 'primary', small, disabled }) => {
  const base = { ...BUTTON_STYLES[variant] };
  if (variant === 'primary') {
    base.background = disabled ? T.dim : `linear-gradient(135deg,${T.accent},#d97706)`;
  }
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        ...base,
        padding: small ? '6px 14px' : '10px 20px',
        borderRadius: 8,
        fontSize: small ? 12 : 14,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
};

const StatCard = ({ icon: Icon, label, value, color, sub, pulse }) => (
  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, flex: 1, minWidth: 160 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
      <div>
        <p style={{ color: T.muted, fontSize: 12, margin: '0 0 8px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</p>
        <p style={{ color: T.text, fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>{value}</p>
        {sub && <p style={{ color: T.dim, fontSize: 12, margin: '4px 0 0' }}>{sub}</p>}
      </div>
      <div style={{ background: `${color}18`, borderRadius: 10, padding: 10, flexShrink: 0, position: 'relative' }}>
        <Icon size={20} color={color} />
        {pulse && <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: color, animation: 'pulse 2s infinite' }} />}
      </div>
    </div>
  </div>
);

const GaugeMini = ({ value, max, color, label, unit, warn, danger }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const c = value >= danger ? T.red : value >= warn ? T.amber : color;
  return (
    <div style={{ background: T.bg, borderRadius: 10, padding: '12px 14px', flex: 1, minWidth: 110 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'baseline' }}>
        <span style={{ color: T.muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <span style={{ color: c, fontSize: 15, fontWeight: 800 }}>
          {value != null ? value : '—'}
          <span style={{ fontSize: 10, color: T.dim, fontWeight: 400 }}>{unit}</span>
        </span>
      </div>
      <div style={{ height: 5, background: T.border, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: c, borderRadius: 3, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
};

const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [pass,  setPass]  = useState('');
  const [show,  setShow]  = useState(false);
  const [err,   setErr]   = useState('');

  const handle = () => {
    const u = USERS0.find(u => u.email === email && u.passHash === hashPassword(pass));
    if (u) onLogin(u);
    else setErr('Invalid credentials');
  };

  const demos = [
    ['Super Admin',   'super@fleet.com',   'admin123'   ],
    ['Org Admin',     'admin@mcc.com',     'admin123'   ],
    ['Fleet Manager', 'manager@mcc.com',   'manager123' ],
    ['Driver',        'driver@mcc.com',    'driver123'  ],
  ];

  return (
    <div style={{
      minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: '"Outfit",system-ui,sans-serif', padding: 16,
      backgroundImage: `radial-gradient(ellipse at 20% 50%,rgba(245,158,11,0.06) 0%,transparent 55%),radial-gradient(ellipse at 80% 20%,rgba(96,165,250,0.06) 0%,transparent 50%)`,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ width: 46, height: 46, background: `linear-gradient(135deg,${T.accent},#d97706)`, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 24px ${T.accent}44` }}>
              <Truck size={24} color="#000" />
            </div>
            <span style={{ fontSize: 26, fontWeight: 800, color: T.text, letterSpacing: '-1px' }}>FleetOS</span>
          </div>
          <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>Fleet Governance & Scheduling System</p>
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          <h2 style={{ color: T.text, fontSize: 20, fontWeight: 700, margin: '0 0 22px' }}>Sign in</h2>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', color: T.muted, fontSize: 13, marginBottom: 6, fontWeight: 500 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErr(''); }}
              placeholder="you@example.com"
              onKeyDown={e => e.key === 'Enter' && handle()}
              style={{ width: '100%', padding: '11px 14px', background: '#0a1525', border: `1px solid ${err ? T.red : T.border}`, borderRadius: 8, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: err ? 8 : 20, position: 'relative' }}>
            <label style={{ display: 'block', color: T.muted, fontSize: 13, marginBottom: 6, fontWeight: 500 }}>Password</label>
            <input
              type={show ? 'text' : 'password'}
              value={pass}
              onChange={e => { setPass(e.target.value); setErr(''); }}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handle()}
              style={{ width: '100%', padding: '11px 40px 11px 14px', background: '#0a1525', border: `1px solid ${err ? T.red : T.border}`, borderRadius: 8, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
            <button onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 12, top: 34, background: 'none', border: 'none', color: T.muted, cursor: 'pointer', display: 'flex', padding: 0 }}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {err && <p style={{ color: T.red, fontSize: 13, margin: '0 0 16px' }}>{err}</p>}
          <button
            onClick={handle}
            style={{ width: '100%', padding: '12px', background: `linear-gradient(135deg,${T.accent},#d97706)`, border: 'none', borderRadius: 8, color: '#000', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 16px ${T.accent}44` }}
          >
            Sign In
          </button>
        </div>

        <div style={{ marginTop: 16, background: 'rgba(96,165,250,0.05)', border: `1px solid ${T.blue}22`, borderRadius: 12, padding: 16 }}>
          <p style={{ color: T.blue, fontSize: 11, fontWeight: 700, margin: '0 0 10px', letterSpacing: '0.08em' }}>DEMO ACCOUNTS</p>
          {demos.map(([role, e, p]) => (
            <div key={role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${T.border}` }}>
              <div>
                <span style={{ color: T.text, fontSize: 13, fontWeight: 500 }}>{role}</span>
                <span style={{ color: T.dim, fontSize: 12, marginLeft: 8 }}>{e}</span>
              </div>
              <button onClick={() => { setEmail(e); setPass(p); setErr(''); }} style={{ background: 'none', border: `1px solid ${T.border}`, color: T.muted, fontSize: 11, padding: '3px 10px', borderRadius: 4, cursor: 'pointer' }}>
                Use
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const NAV = [
  { id: 'dashboard',     icon: LayoutDashboard, label: 'Dashboard',      roles: ['super_admin', 'org_admin', 'fleet_manager', 'driver'] },
  { id: 'telemetry',     icon: Radio,           label: 'Live Telemetry', roles: ['super_admin', 'org_admin', 'fleet_manager', 'driver'], live: true },
  { id: 'map',           icon: MapPin,          label: 'Live Map',       roles: ['super_admin', 'org_admin', 'fleet_manager', 'driver'], live: true },
  { id: 'vehicles',      icon: Truck,           label: 'Vehicles',       roles: ['super_admin', 'org_admin', 'fleet_manager', 'driver'] },
  { id: 'identity',      icon: BadgeCheck,      label: 'Identity & Insurance', roles: ['super_admin', 'org_admin', 'fleet_manager'] },
  { id: 'maintenance',   icon: Wrench,          label: 'Maintenance',    roles: ['super_admin', 'org_admin', 'fleet_manager'] },
  { id: 'schedules',     icon: Calendar,        label: 'Schedules',      roles: ['super_admin', 'org_admin', 'fleet_manager', 'driver'] },
  { id: 'organizations', icon: Building2,       label: 'Organizations',  roles: ['super_admin'] },
  { id: 'users',         icon: Users,           label: 'Users',          roles: ['super_admin', 'org_admin'] },
  { id: 'reports',       icon: BarChart2,       label: 'Reports',        roles: ['super_admin', 'org_admin', 'fleet_manager'] },
];

const Sidebar = ({ user, page, setPage, onLogout }) => (
  <div style={{ width: 224, background: T.sidebar, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100vh', position: 'sticky', top: 0 }}>
    <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${T.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, background: `linear-gradient(135deg,${T.accent},#d97706)`, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Truck size={18} color="#000" />
        </div>
        <span style={{ fontSize: 20, fontWeight: 800, color: T.text, letterSpacing: '-0.5px' }}>FleetOS</span>
      </div>
    </div>
    <nav style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
      {NAV.filter(n => n.roles.includes(user.role)).map(({ id, icon: Icon, label, live }) => {
        const active = page === id;
        return (
          <button
            key={id}
            onClick={() => setPage(id)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between',
              padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', marginBottom: 2,
              textAlign: 'left', background: active ? T.accentBg : 'transparent',
              color: active ? T.accent : T.muted, transition: 'all 0.12s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon size={17} />
              <span style={{ fontSize: 14, fontWeight: active ? 600 : 400 }}>{label}</span>
            </div>
            {live && (
              <span style={{ fontSize: 9, fontWeight: 700, color: T.red, background: T.redBg, padding: '2px 6px', borderRadius: 4, letterSpacing: '0.05em', animation: 'pulse 2s infinite' }}>
                LIVE
              </span>
            )}
          </button>
        );
      })}
    </nav>
    <div style={{ padding: 12, borderTop: `1px solid ${T.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: T.card, marginBottom: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg,${ROLE_COLORS[user.role]},${T.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
          {user.initials}
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <p style={{ color: T.text, fontSize: 13, fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
          <p style={{ color: T.dim, fontSize: 11, margin: 0 }}>{ROLES_MAP[user.role]}</p>
        </div>
      </div>
      <button onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: 'none', border: `1px solid ${T.border}`, borderRadius: 8, color: T.muted, cursor: 'pointer', fontSize: 13 }}>
        <LogOut size={15} /> Sign out
      </button>
    </div>
  </div>
);

const Dashboard = ({ user, vehicles, schedules, orgs, simState }) => {
  const mv = user.role === 'super_admin' ? vehicles : vehicles.filter(v => v.orgId === user.orgId);
  const ms = user.role === 'super_admin'
    ? schedules
    : user.role === 'driver'
      ? schedules.filter(s => s.userId === user.id)
      : schedules.filter(s => s.orgId === user.orgId);

  const statusData = [
    { name: 'Available',   value: mv.filter(v => v.status === 'Available').length,   color: T.green },
    { name: 'In Use',      value: mv.filter(v => v.status === 'In Use').length,      color: T.blue  },
    { name: 'Maintenance', value: mv.filter(v => v.status === 'Maintenance').length, color: T.red   },
    { name: 'Reserved',    value: mv.filter(v => v.status === 'Reserved').length,    color: T.amber },
  ].filter(d => d.value > 0);

  const catData    = ['Sedan', 'SUV', 'Van', 'Truck', 'Bus'].map(c => ({ name: c, count: mv.filter(v => v.cat === c).length })).filter(d => d.count > 0);
  const monthData  = [{ m: 'Oct', b: 8 }, { m: 'Nov', b: 12 }, { m: 'Dec', b: 10 }, { m: 'Jan', b: 15 }, { m: 'Feb', b: 18 }, { m: 'Mar', b: ms.length }];
  const activeCount = ms.filter(s => s.status === 'active' || s.status === 'reserved').length;
  const liveAlerts  = Object.values(simState).filter(s => s.activeAnomaly).length;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ color: T.text, fontSize: 24, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Dashboard</h1>
        <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>
          Welcome back, {user.name.split(' ')[0]} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
        <StatCard icon={Truck}         label="Total Vehicles"   value={mv.length}                          color={T.blue}   sub={`${mv.filter(v => v.status === 'Available').length} available`} />
        <StatCard icon={Calendar}      label="Active Bookings"  value={activeCount}                        color={T.accent} />
        <StatCard icon={Radio}         label="Live Vehicles"    value={`${SIM_VEHICLES.length} online`}    color={T.green}  pulse sub="Telemetry streaming" />
        {liveAlerts > 0 && <StatCard icon={AlertTriangle} label="Live Alerts" value={liveAlerts} color={T.red} pulse sub="Needs attention" />}
        {user.role === 'super_admin' && <StatCard icon={Building2} label="Organizations" value={orgs.length} color={T.purple} />}
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.green}33`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.green, display: 'inline-block', boxShadow: `0 0 8px ${T.green}`, animation: 'pulse 2s infinite' }} />
            <span style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>Live Vehicle Feed</span>
          </div>
          <span style={{ color: T.muted, fontSize: 11 }}>Refreshes every 2s</span>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {SIM_VEHICLES.map(v => {
            const s = simState[v.id];
            const hasAlert = s.activeAnomaly;
            return (
              <div key={v.id} style={{ flex: 1, minWidth: 130, background: hasAlert ? T.redBg : T.bg, border: `1px solid ${hasAlert ? T.red : T.border}`, borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ color: v.color, fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}>{v.id}</span>
                  {hasAlert && <AlertTriangle size={11} color={T.red} />}
                </div>
                <p style={{ color: T.text, fontSize: 12, fontWeight: 600, margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.name}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ color: T.muted, fontSize: 11 }}>{s.speed.toFixed(0)} km/h</span>
                  <span style={{ color: s.temp > 100 ? T.red : T.muted, fontSize: 11 }}>{s.temp.toFixed(0)}°C</span>
                  {s.battery != null && <span style={{ color: s.battery < 15 ? T.red : T.muted, fontSize: 11 }}>{s.battery.toFixed(0)}%</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14, marginBottom: 14 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24 }}>
          <h3 style={{ color: T.text, fontSize: 14, fontWeight: 700, margin: '0 0 18px' }}>Booking Trends</h3>
          <ResponsiveContainer width="100%" height={175}>
            <AreaChart data={monthData}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T.accent} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={T.accent} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
              <XAxis dataKey="m" tick={{ fill: T.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13 }} />
              <Area type="monotone" dataKey="b" stroke={T.accent} fill="url(#ag)" strokeWidth={2.5} name="Bookings" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24 }}>
          <h3 style={{ color: T.text, fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Vehicle Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <PieChart width={140} height={140}>
              <Pie data={statusData} cx={65} cy={65} innerRadius={42} outerRadius={62} dataKey="value" paddingAngle={3}>
                {statusData.map((e, i) => <Cell key={`cell-${i}`} fill={e.color} />)}
              </Pie>
            </PieChart>
            <div style={{ width: '100%', marginTop: 8 }}>
              {statusData.map(d => (
                <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                    <span style={{ color: T.muted, fontSize: 12 }}>{d.name}</span>
                  </div>
                  <span style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 14 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24 }}>
          <h3 style={{ color: T.text, fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>By Category</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={catData} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13 }} />
              <Bar dataKey="count" fill={T.blue} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24 }}>
          <h3 style={{ color: T.text, fontSize: 14, fontWeight: 700, margin: '0 0 14px' }}>Recent Activity</h3>
          {ms.slice(0, 4).map(s => {
            const v = vehicles.find(vv => vv.id === s.vehicleId);
            return (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: T.bg, borderRadius: 8, border: `1px solid ${T.border}`, gap: 10, marginBottom: 8 }}>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ color: T.text, fontSize: 13, fontWeight: 500, margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.purpose}</p>
                  <p style={{ color: T.muted, fontSize: 12, margin: 0 }}>{v?.plate} · {s.start}</p>
                </div>
                <Badge label={s.status} color={sc(s.status)} bg={sb(s.status)} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const TelemetryPage = ({ simState, history, apiUrl, setApiUrl, connected }) => {
  const [selVid,         setSelVid]         = useState(null);
  const [tab,            setTab]            = useState('charts');
  const [alertData,      setAlertData]      = useState({});
  const [loadingAlert,   setLoadingAlert]   = useState({});
  const [aiDiagnosis,    setAiDiagnosis]    = useState({});
  const [loadingDx,      setLoadingDx]      = useState({});
  const [chatHistory,    setChatHistory]    = useState({});
  const [chatInput,      setChatInput]      = useState('');
  const [chatLoading,    setChatLoading]    = useState({});
  const [alertSubTab,    setAlertSubTab]    = useState('overview');
  const [range,          setRange]          = useState('1h');
  const chatEndRef = useRef(null);

  const selVehicle  = SIM_VEHICLES.find(v => v.id === selVid);
  const selHistory  = selVid ? history[selVid] || [] : [];
  const stats       = selVid ? computeStats(selHistory) : null;
  const alertResult = selVid ? alertData[selVid] : null;
  const selSimState = selVid ? simState[selVid] : null;

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, selVid]);

  const runAlerts = useCallback(async vid => {
    setLoadingAlert(p => ({ ...p, [vid]: true }));
    try {
      if (connected) {
        const res = await abortableFetch(`${apiUrl}/alerts/${vid}`);
        const d = await res.json();
        setAlertData(p => ({ ...p, [vid]: d }));
      } else {
        await new Promise(r => setTimeout(r, 300));
        setAlertData(p => ({ ...p, [vid]: buildAlerts(history[vid] || [], vid) }));
      }
    } catch {
      setAlertData(p => ({ ...p, [vid]: buildAlerts(history[vid] || [], vid) }));
    } finally {
      setLoadingAlert(p => ({ ...p, [vid]: false }));
    }
  }, [connected, apiUrl, history]);

  const runAIDiagnosis = useCallback(async vid => {
    const vInfo    = SIM_VEHICLES.find(v => v.id === vid);
    const readings = history[vid] || [];
    const st       = computeStats(readings);
    const ar       = alertData[vid] || buildAlerts(readings, vid);
    const aLog     = simState[vid]?.anomalyLog || [];
    if (!st || !vInfo) return;
    setLoadingDx(p => ({ ...p, [vid]: true }));
    try {
      const result = await callClaudeForDiagnosis(vInfo, readings, st, ar, aLog);
      setAiDiagnosis(p => ({ ...p, [vid]: result }));
    } catch (e) {
      setAiDiagnosis(p => ({ ...p, [vid]: { error: 'Analysis failed. Check connection.' } }));
    } finally {
      setLoadingDx(p => ({ ...p, [vid]: false }));
    }
  }, [history, alertData, simState]);

  const sendChat = useCallback(async () => {
    if (!chatInput.trim() || !selVid) return;
    const vid    = selVid;
    const q      = chatInput.trim();
    const vInfo  = SIM_VEHICLES.find(v => v.id === vid);
    const readings = history[vid] || [];
    const ar     = alertData[vid] || buildAlerts(readings, vid);
    setChatInput('');
    setChatHistory(p => ({ ...p, [vid]: [...(p[vid] || []), { role: 'user', text: q }] }));
    setChatLoading(p => ({ ...p, [vid]: true }));
    try {
      const answer = await callClaudeChat(vInfo, readings, computeStats(readings), ar, q);
      setChatHistory(p => ({ ...p, [vid]: [...(p[vid] || []), { role: 'ai', text: answer }] }));
    } catch {
      setChatHistory(p => ({ ...p, [vid]: [...(p[vid] || []), { role: 'ai', text: 'Unable to respond. Please try again.' }] }));
    } finally {
      setChatLoading(p => ({ ...p, [vid]: false }));
    }
  }, [chatInput, selVid, history, alertData]);

  const exportCSV = vid => {
    const rows  = history[vid] || [];
    const lines = [['Timestamp', 'Speed (km/h)', 'Temp (°C)', 'Battery (%)', 'Fuel (L)', 'RPM', 'Lat', 'Lon'].join(',')];
    rows.forEach(r => lines.push([r.timestamp, r.speed, r.temperature, r.battery_pct ?? '', r.fuel_level ?? '', r.engine_rpm, r.latitude, r.longitude].join(',')));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `${vid}_telemetry.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const chartData = selHistory.slice(0, 50).reverse();

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: T.text, fontSize: 24, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Live Telemetry</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.green, display: 'inline-block', animation: 'pulse 2s infinite', boxShadow: `0 0 8px ${T.green}` }} />
            <span style={{ color: T.muted, fontSize: 13 }}>5 vehicles streaming · 2s interval</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: '8px 14px' }}>
          <Server size={14} color={connected ? T.green : T.muted} />
          <input
            value={apiUrl}
            onChange={e => setApiUrl(e.target.value)}
            style={{ background: 'none', border: 'none', color: T.text, fontSize: 12, outline: 'none', width: 170 }}
            placeholder="http://localhost:8000"
          />
          <span style={{ color: connected ? T.green : T.dim, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
            {connected ? '● Connected' : '○ Demo Mode'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(255px,1fr))', gap: 14, marginBottom: 20 }}>
        {SIM_VEHICLES.map(v => {
          const s        = simState[v.id];
          const r        = toReading(v.id, s, new Date().toISOString());
          const isEV     = v.type === 'EV';
          const sel      = selVid === v.id;
          const hasAlert = s.activeAnomaly;
          return (
            <div
              key={v.id}
              onClick={() => setSelVid(sel ? null : v.id)}
              style={{
                background: T.card,
                border: `2px solid ${sel ? v.color : hasAlert ? T.red : T.border}`,
                borderRadius: 14, padding: 20, cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: sel ? `0 0 20px ${v.color}22` : hasAlert ? `0 0 12px ${T.red}22` : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ color: v.color, fontSize: 13, fontWeight: 800, fontFamily: 'monospace' }}>{v.id}</span>
                    <span style={{ color: T.dim, fontSize: 11, background: `${v.color}14`, padding: '1px 6px', borderRadius: 4 }}>{v.type}</span>
                  </div>
                  <p style={{ color: T.text, fontSize: 14, fontWeight: 700, margin: 0 }}>{v.name}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  {hasAlert && <span style={{ background: T.redBg, color: T.red, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>⚠ {s.activeAnomaly.replace('_', ' ')}</span>}
                  <span style={{ background: T.greenBg, color: T.green, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}>● LIVE</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <GaugeMini value={r.speed}       max={160} color={T.blue}  label="Speed"   unit=" km/h" warn={110} danger={130} />
                <GaugeMini value={r.temperature} max={120} color={T.amber} label="Temp"    unit="°C"    warn={90}  danger={100} />
                {isEV
                  ? <GaugeMini value={r.battery_pct} max={100} color={T.green} label="Battery" unit="%" warn={25} danger={15} />
                  : <GaugeMini value={r.fuel_level}  max={60}  color={T.cyan}  label="Fuel"    unit="L" warn={15} danger={8}  />
                }
                <GaugeMini value={Math.round(r.engine_rpm)} max={7000} color={T.purple} label="RPM" unit="" warn={5000} danger={6000} />
              </div>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: T.dim, fontSize: 11 }}>📍 {r.latitude?.toFixed(4)}, {r.longitude?.toFixed(4)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {selVehicle && (
        <div style={{ background: T.card, border: `1px solid ${selVehicle.color}33`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: `1px solid ${T.border}`, background: `${selVehicle.color}06` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${selVehicle.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Truck size={20} color={selVehicle.color} />
              </div>
              <div>
                <h3 style={{ color: T.text, fontSize: 16, fontWeight: 700, margin: '0 0 2px' }}>{selVehicle.name}</h3>
                <span style={{ color: selVehicle.color, fontSize: 12, fontFamily: 'monospace', fontWeight: 600 }}>{selVehicle.id}</span>
                <span style={{ color: T.dim, fontSize: 12, marginLeft: 8 }}>· {selVehicle.type}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select value={range} onChange={e => setRange(e.target.value)} style={{ padding: '6px 10px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 7, color: T.text, fontSize: 12, outline: 'none', cursor: 'pointer' }}>
                {['10m', '30m', '1h', '6h', '24h', '7d'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <Btn onClick={() => exportCSV(selVid)} small variant="secondary"><Download size={12} />CSV</Btn>
              <Btn onClick={() => { setTab('alerts'); setAlertSubTab('overview'); runAlerts(selVid); }} small variant="cyan">
                <Shield size={12} />{loadingAlert[selVid] ? 'Scanning…' : 'AI Alerts'}
              </Btn>
              <button onClick={() => setSelVid(null)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', display: 'flex', padding: 4 }}>
                <X size={16} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}` }}>
            {['charts', 'stats', 'alerts'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); if (t === 'alerts') { setAlertSubTab('overview'); runAlerts(selVid); } }}
                style={{
                  padding: '12px 22px', background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: `2px solid ${tab === t ? selVehicle.color : 'transparent'}`,
                  color: tab === t ? T.text : T.muted,
                  fontSize: 14, fontWeight: tab === t ? 600 : 400, textTransform: 'capitalize', transition: 'all 0.12s',
                }}
              >
                {t === 'alerts' ? '🛡 AI Alerts' : t}
              </button>
            ))}
          </div>

          <div style={{ padding: 24 }}>
            {tab === 'charts' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { key: 'speed',       label: 'Speed (km/h)',    color: T.blue,   domain: [0, 160]  },
                  { key: 'temperature', label: 'Temperature (°C)', color: T.amber, domain: [60, 115] },
                  { key: selVehicle.type === 'EV' ? 'battery_pct' : 'fuel_level', label: selVehicle.type === 'EV' ? 'Battery (%)' : 'Fuel Level (L)', color: T.green, domain: [0, 100] },
                  { key: 'engine_rpm',  label: 'Engine RPM',      color: T.purple, domain: [0, 7500] },
                ].map(({ key, label, color, domain }) => (
                  <div key={key} style={{ background: T.bg, borderRadius: 10, padding: 16 }}>
                    <p style={{ color: T.muted, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>{label}</p>
                    <ResponsiveContainer width="100%" height={130}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id={`g-${key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0}   />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                        <XAxis dataKey="timestamp" tickFormatter={v => new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} tick={{ fill: T.dim, fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                        <YAxis tick={{ fill: T.dim, fontSize: 10 }} axisLine={false} tickLine={false} domain={domain} />
                        <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12 }} labelFormatter={v => new Date(v).toLocaleTimeString()} />
                        <Area type="monotone" dataKey={key} stroke={color} fill={`url(#g-${key})`} strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            )}

            {tab === 'stats' && stats && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
                  {[
                    { label: 'Avg Speed',      value: `${stats.speed_kmh.avg} km/h`,    sub: `Max ${stats.speed_kmh.max} · Min ${stats.speed_kmh.min}`, color: T.blue  },
                    { label: 'Avg Temp',        value: `${stats.temperature_c.avg}°C`,   sub: `Max ${stats.temperature_c.max} · Min ${stats.temperature_c.min}`, color: T.amber },
                    { label: 'Total Readings',  value: stats.total_readings,              sub: 'Current session', color: T.green },
                    ...(stats.battery_pct ? [{ label: 'Min Battery', value: `${stats.battery_pct.min}%`, sub: `Avg ${stats.battery_pct.avg}%`, color: T.green }] : []),
                    { label: 'Max RPM',        value: stats.engine_rpm.max,              sub: `Avg ${stats.engine_rpm.avg}`, color: T.purple },
                    { label: 'Last Seen',      value: stats.last_seen ? new Date(stats.last_seen).toLocaleTimeString() : '—', sub: 'Latest timestamp', color: T.cyan },
                  ].map((s, i) => (
                    <div key={i} style={{ background: T.bg, borderRadius: 10, padding: '14px 16px', border: `1px solid ${s.color}22` }}>
                      <p style={{ color: T.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px', fontWeight: 600 }}>{s.label}</p>
                      <p style={{ color: s.color, fontSize: 20, fontWeight: 800, margin: '0 0 3px' }}>{s.value}</p>
                      <p style={{ color: T.dim, fontSize: 11, margin: 0 }}>{s.sub}</p>
                    </div>
                  ))}
                </div>
                <div style={{ background: T.bg, borderRadius: 10, overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 580 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                        {['Time', 'Speed', 'Temp', 'Battery/Fuel', 'RPM', 'Location'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: T.dim, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selHistory.slice(0, 15).map((r, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                          <td style={{ padding: '9px 14px', color: T.muted, fontSize: 12, fontFamily: 'monospace' }}>{new Date(r.timestamp).toLocaleTimeString()}</td>
                          <td style={{ padding: '9px 14px', color: r.speed > 130 ? T.red : T.text, fontSize: 13, fontWeight: r.speed > 130 ? 700 : 400 }}>{r.speed}</td>
                          <td style={{ padding: '9px 14px', color: r.temperature > 100 ? T.red : T.text, fontSize: 13, fontWeight: r.temperature > 100 ? 700 : 400 }}>{r.temperature}°C</td>
                          <td style={{ padding: '9px 14px', color: T.text, fontSize: 13 }}>{r.battery_pct != null ? `${r.battery_pct}%` : r.fuel_level != null ? `${r.fuel_level}L` : '—'}</td>
                          <td style={{ padding: '9px 14px', color: r.engine_rpm > 6000 ? T.red : T.muted, fontSize: 12 }}>{r.engine_rpm}</td>
                          <td style={{ padding: '9px 14px', color: T.dim, fontSize: 11, fontFamily: 'monospace' }}>{r.latitude?.toFixed(4)},{r.longitude?.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'alerts' && (
              <div>
                {/* Loading overlay for initial scan */}
                {loadingAlert[selVid] && (
                  <div style={{ textAlign: 'center', padding: 32, color: T.muted, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <RefreshCw size={16} color={T.cyan} style={{ animation: 'spin 1s linear infinite' }} /> Scanning telemetry…
                  </div>
                )}

                {!alertResult && !loadingAlert[selVid] && (
                  <div style={{ textAlign: 'center', padding: 48 }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: T.cyanBg, border: `1px solid ${T.cyan}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <Shield size={28} color={T.cyan} />
                    </div>
                    <h3 style={{ color: T.text, fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>AI Fault Detection</h3>
                    <p style={{ color: T.muted, fontSize: 13, margin: '0 0 20px' }}>Analyze telemetry with rule-based scanning + Claude AI diagnosis</p>
                    <button onClick={() => runAlerts(selVid)} style={{ background: `linear-gradient(135deg,${T.cyan},${T.blue})`, border: 'none', color: '#000', padding: '12px 28px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <Shield size={16} /> Run Fault Scan
                    </button>
                  </div>
                )}

                {alertResult && !loadingAlert[selVid] && (
                  <div>
                    {/* Sub-tab bar */}
                    <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: T.bg, borderRadius: 10, padding: 4 }}>
                      {[
                        { id: 'overview',  label: '📊 Overview'   },
                        { id: 'diagnosis', label: '🧠 AI Diagnosis' },
                        { id: 'history',   label: '🕐 History'    },
                        { id: 'ask',       label: '💬 Ask AI'     },
                      ].map(st => (
                        <button
                          key={st.id}
                          onClick={() => { setAlertSubTab(st.id); if (st.id === 'diagnosis' && !aiDiagnosis[selVid] && !loadingDx[selVid]) runAIDiagnosis(selVid); }}
                          style={{
                            flex: 1, padding: '8px 6px', border: 'none', borderRadius: 7, cursor: 'pointer',
                            background: alertSubTab === st.id ? T.card : 'transparent',
                            color: alertSubTab === st.id ? T.text : T.muted,
                            fontSize: 12, fontWeight: alertSubTab === st.id ? 600 : 400, transition: 'all 0.12s',
                          }}
                        >{st.label}</button>
                      ))}
                    </div>

                    {/* ── OVERVIEW SUB-TAB ── */}
                    {alertSubTab === 'overview' && (
                      <div>
                        {/* Health Score + Risk Row */}
                        <div style={{ display: 'flex', gap: 14, marginBottom: 16, alignItems: 'stretch' }}>
                          {/* Health Score Ring */}
                          <div style={{ background: T.bg, borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 150 }}>
                            <svg width={110} height={110} viewBox="0 0 110 110">
                              <circle cx={55} cy={55} r={46} fill="none" stroke={T.border} strokeWidth={10} />
                              <circle
                                cx={55} cy={55} r={46} fill="none"
                                stroke={alertResult.health_score >= 70 ? T.green : alertResult.health_score >= 40 ? T.amber : T.red}
                                strokeWidth={10} strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 46}`}
                                strokeDashoffset={`${2 * Math.PI * 46 * (1 - alertResult.health_score / 100)}`}
                                transform="rotate(-90 55 55)"
                                style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s' }}
                              />
                              <text x={55} y={50} textAnchor="middle" fill={T.text} fontSize={24} fontWeight={800} fontFamily="Outfit,sans-serif">{alertResult.health_score}</text>
                              <text x={55} y={66} textAnchor="middle" fill={T.muted} fontSize={10} fontFamily="Outfit,sans-serif">HEALTH</text>
                            </svg>
                          </div>

                          {/* Risk + Stats */}
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ padding: '12px 16px', borderRadius: 10, background: rb(alertResult.risk_level), border: `1px solid ${rl(alertResult.risk_level)}33`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div>
                                <p style={{ color: T.muted, fontSize: 11, margin: '0 0 2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Risk Level</p>
                                <span style={{ color: rl(alertResult.risk_level), fontSize: 20, fontWeight: 800 }}>
                                  {alertResult.risk_level === 'HIGH' ? '🔴 ' : alertResult.risk_level === 'MEDIUM' ? '⚠️ ' : '✅ '}{alertResult.risk_level}
                                </span>
                              </div>
                              <Btn onClick={() => runAlerts(selVid)} small variant="secondary"><RefreshCw size={11} /> Re-scan</Btn>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, flex: 1 }}>
                              {[
                                { label: 'Active Faults', value: alertResult.alerts.filter(a => a.severity === 'HIGH').length, color: T.red, sub: 'Critical' },
                                { label: 'Warnings',      value: alertResult.alerts.filter(a => a.severity === 'MEDIUM').length, color: T.amber, sub: 'Medium' },
                                { label: 'Anomaly Log',  value: (selSimState?.anomalyLog?.length || 0), color: T.purple, sub: 'Events tracked' },
                                { label: 'Readings',     value: selHistory.length, color: T.blue, sub: 'History depth' },
                              ].map((s, i) => (
                                <div key={i} style={{ background: T.bg, borderRadius: 8, padding: '10px 12px', border: `1px solid ${s.color}22` }}>
                                  <p style={{ color: T.muted, fontSize: 11, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                                  <p style={{ color: s.color, fontSize: 18, fontWeight: 800, margin: 0 }}>{s.value}</p>
                                  <p style={{ color: T.dim, fontSize: 10, margin: 0 }}>{s.sub}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Alert Cards */}
                        {alertResult.alerts.length === 0 ? (
                          <div style={{ background: T.greenBg, border: `1px solid ${T.green}33`, borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10, color: T.green }}>
                            <CheckCircle size={18} />
                            <span style={{ fontSize: 14, fontWeight: 500 }}>All metrics within safe operating ranges. Vehicle is healthy.</span>
                          </div>
                        ) : (
                          alertResult.alerts.map((a, i) => {
                            const sev = a.severity || 'MEDIUM';
                            const sColor = sev === 'HIGH' ? T.red : T.amber;
                            const sBg    = sev === 'HIGH' ? T.redBg : T.amberBg;
                            return (
                              <div key={i} style={{ background: sBg, border: `1px solid ${sColor}33`, borderRadius: 10, padding: '14px 18px', marginBottom: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <AlertTriangle size={14} color={sColor} />
                                    <span style={{ color: sColor, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{a.metric.replace(/_/g, ' ')}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {a.code && <span style={{ background: `${sColor}22`, color: sColor, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, fontFamily: 'monospace' }}>{a.code}</span>}
                                    <span style={{ background: sev === 'HIGH' ? T.redBg : T.amberBg, color: sColor, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>{sev}</span>
                                  </div>
                                </div>
                                <p style={{ color: T.text, fontSize: 14, fontWeight: 600, margin: '0 0 6px' }}>{a.issue}</p>
                                <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>💡 {a.recommendation}</p>
                              </div>
                            );
                          })
                        )}

                        {/* Trend Indicators */}
                        {selHistory.length >= 5 && (() => {
                          const last5 = selHistory.slice(0, 5);
                          const trend = key => {
                            const vals = last5.map(r => r[key]).filter(v => v != null);
                            if (vals.length < 2) return 0;
                            return vals[0] - vals[vals.length - 1];
                          };
                          const trendItems = [
                            { label: 'Speed',       delta: trend('speed'),       unit: 'km/h', warn: 5  },
                            { label: 'Temperature', delta: trend('temperature'), unit: '°C',   warn: 3  },
                            ...(selHistory[0]?.battery_pct != null ? [{ label: 'Battery', delta: trend('battery_pct'), unit: '%', warn: -2 }] : []),
                            ...(selHistory[0]?.fuel_level   != null ? [{ label: 'Fuel',    delta: trend('fuel_level'),   unit: 'L',  warn: -1 }] : []),
                          ];
                          return (
                            <div style={{ marginTop: 16 }}>
                              <p style={{ color: T.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 10px' }}>5-Reading Trends</p>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {trendItems.map((t, i) => {
                                  const rising = t.delta > t.warn;
                                  const color = t.label === 'Battery' || t.label === 'Fuel'
                                    ? (t.delta < 0 ? T.amber : T.green)
                                    : (rising ? T.red : T.green);
                                  return (
                                    <div key={i} style={{ flex: 1, minWidth: 100, background: T.bg, borderRadius: 8, padding: '10px 12px', border: `1px solid ${color}22` }}>
                                      <p style={{ color: T.muted, fontSize: 11, margin: '0 0 4px' }}>{t.label}</p>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {t.delta > 0 ? <TrendingUp size={14} color={color} /> : <TrendingDown size={14} color={color} />}
                                        <span style={{ color, fontSize: 14, fontWeight: 700 }}>{t.delta > 0 ? '+' : ''}{t.delta.toFixed(1)}{t.unit}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* ── AI DIAGNOSIS SUB-TAB ── */}
                    {alertSubTab === 'diagnosis' && (
                      <div>
                        {loadingDx[selVid] && (
                          <div style={{ textAlign: 'center', padding: 40 }}>
                            <div style={{ width: 56, height: 56, borderRadius: '50%', background: T.purpleBg, border: `1px solid ${T.purple}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', animation: 'pulse 2s infinite' }}>
                              <Brain size={26} color={T.purple} />
                            </div>
                            <p style={{ color: T.text, fontWeight: 600, margin: '0 0 4px' }}>Claude is analyzing telemetry…</p>
                            <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>Evaluating {selHistory.length} readings + anomaly history</p>
                          </div>
                        )}
                        {!aiDiagnosis[selVid] && !loadingDx[selVid] && (
                          <div style={{ textAlign: 'center', padding: 40 }}>
                            <div style={{ width: 56, height: 56, borderRadius: '50%', background: T.purpleBg, border: `1px solid ${T.purple}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                              <Brain size={26} color={T.purple} />
                            </div>
                            <h3 style={{ color: T.text, fontWeight: 700, margin: '0 0 8px' }}>Deep AI Diagnosis</h3>
                            <p style={{ color: T.muted, fontSize: 13, margin: '0 0 20px' }}>Claude will analyze all telemetry data, identify root causes, generate fault codes, and recommend maintenance actions.</p>
                            <button onClick={() => runAIDiagnosis(selVid)} style={{ background: `linear-gradient(135deg,${T.purple},${T.blue})`, border: 'none', color: '#fff', padding: '12px 28px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                              <Brain size={16} /> Run AI Diagnosis
                            </button>
                          </div>
                        )}
                        {aiDiagnosis[selVid] && !loadingDx[selVid] && (() => {
                          const dx = aiDiagnosis[selVid];
                          if (dx.error) return <div style={{ color: T.red, padding: 20, textAlign: 'center' }}>{dx.error}</div>;
                          const priColor = { immediate: T.red, within_week: T.amber, next_service: T.blue, healthy: T.green }[dx.maintenance_priority] || T.muted;
                          const priLabel = { immediate: '🚨 IMMEDIATE ACTION', within_week: '⚠️ THIS WEEK', next_service: '📅 NEXT SERVICE', healthy: '✅ HEALTHY' }[dx.maintenance_priority] || dx.maintenance_priority;
                          return (
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <Brain size={16} color={T.purple} />
                                  <span style={{ color: T.purple, fontSize: 13, fontWeight: 700 }}>Claude AI Analysis</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <span style={{ background: `${priColor}22`, color: priColor, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, border: `1px solid ${priColor}44` }}>{priLabel}</span>
                                  <Btn onClick={() => runAIDiagnosis(selVid)} small variant="secondary"><RefreshCw size={11} /> Re-analyze</Btn>
                                </div>
                              </div>

                              {/* Diagnosis Summary */}
                              <div style={{ background: T.purpleBg, border: `1px solid ${T.purple}33`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
                                <p style={{ color: T.purple, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>Diagnosis</p>
                                <p style={{ color: T.text, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{dx.diagnosis}</p>
                              </div>

                              {/* Fault Codes */}
                              {dx.fault_codes?.length > 0 && (
                                <div style={{ marginBottom: 14 }}>
                                  <p style={{ color: T.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>Fault Codes Detected</p>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {dx.fault_codes.map((fc, i) => {
                                      const fc_color = fc.severity === 'HIGH' ? T.red : fc.severity === 'MEDIUM' ? T.amber : T.blue;
                                      return (
                                        <div key={i} style={{ background: T.bg, border: `1px solid ${fc_color}33`, borderRadius: 8, padding: '8px 14px' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                            <span style={{ color: fc_color, fontSize: 13, fontWeight: 800, fontFamily: 'monospace' }}>{fc.code}</span>
                                            <span style={{ background: `${fc_color}22`, color: fc_color, fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3 }}>{fc.severity}</span>
                                          </div>
                                          <p style={{ color: T.muted, fontSize: 11, margin: 0 }}>{fc.description}</p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Root Cause */}
                              <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
                                <p style={{ color: T.amber, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px' }}>🔍 Root Cause</p>
                                <p style={{ color: T.text, fontSize: 13, lineHeight: 1.5, margin: 0 }}>{dx.root_cause}</p>
                              </div>

                              {/* Recommendations */}
                              {dx.recommendations?.length > 0 && (
                                <div style={{ marginBottom: 14 }}>
                                  <p style={{ color: T.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>Recommended Actions</p>
                                  {dx.recommendations.map((rec, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 0', borderBottom: `1px solid ${T.border}` }}>
                                      <span style={{ color: T.cyan, fontWeight: 800, fontSize: 12, flexShrink: 0, marginTop: 1 }}>{i + 1}.</span>
                                      <p style={{ color: T.text, fontSize: 13, margin: 0 }}>{rec}</p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Predicted Next Issue */}
                              {dx.predicted_next_issue && (
                                <div style={{ background: T.amberBg, border: `1px solid ${T.amber}33`, borderRadius: 10, padding: '12px 16px' }}>
                                  <p style={{ color: T.amber, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px' }}>⚡ Predicted Next Risk</p>
                                  <p style={{ color: T.text, fontSize: 13, lineHeight: 1.5, margin: 0 }}>{dx.predicted_next_issue}</p>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* ── HISTORY SUB-TAB ── */}
                    {alertSubTab === 'history' && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                          <p style={{ color: T.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Anomaly Event Log</p>
                          <span style={{ color: T.dim, fontSize: 11 }}>{selSimState?.anomalyLog?.length || 0} events tracked</span>
                        </div>
                        {(!selSimState?.anomalyLog?.length) ? (
                          <div style={{ textAlign: 'center', padding: 32, color: T.muted, fontSize: 13 }}>
                            <CheckCircle size={28} color={T.green} style={{ marginBottom: 10, display: 'block', margin: '0 auto 10px' }} />
                            No anomaly events logged yet. Keep monitoring.
                          </div>
                        ) : (
                          <div>
                            {selSimState.anomalyLog.map((ev, i) => {
                              const info   = ANOMALY_TYPES[ev.anomaly] || {};
                              const evColor = ev.severity === 'HIGH' ? T.red : T.amber;
                              return (
                                <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: `1px solid ${T.border}` }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: evColor, flexShrink: 0 }} />
                                    {i < selSimState.anomalyLog.length - 1 && <div style={{ width: 1, flex: 1, background: T.border, marginTop: 4 }} />}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontSize: 13 }}>{info.icon || '⚠️'}</span>
                                        <span style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{info.label || ev.anomaly}</span>
                                        {info.code && <span style={{ color: evColor, fontSize: 10, fontFamily: 'monospace', background: `${evColor}18`, padding: '1px 5px', borderRadius: 3 }}>{info.code}</span>}
                                      </div>
                                      <span style={{ background: `${evColor}22`, color: evColor, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>{ev.severity}</span>
                                    </div>
                                    <p style={{ color: T.dim, fontSize: 11, margin: 0, fontFamily: 'monospace' }}>
                                      {new Date(ev.timestamp).toLocaleTimeString()} · {new Date(ev.timestamp).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Telemetry anomaly readings from history */}
                        {(() => {
                          const anomalyReadings = selHistory.filter(r => r.activeAnomaly).slice(0, 10);
                          if (!anomalyReadings.length) return null;
                          return (
                            <div style={{ marginTop: 20 }}>
                              <p style={{ color: T.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 10px' }}>Anomalous Readings</p>
                              {anomalyReadings.map((r, i) => {
                                const info  = ANOMALY_TYPES[r.activeAnomaly] || {};
                                const rColor = info.color || T.amber;
                                return (
                                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: `${rColor}0d`, borderRadius: 8, marginBottom: 6, border: `1px solid ${rColor}22` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <span style={{ fontSize: 12 }}>{info.icon || '⚠️'}</span>
                                      <span style={{ color: T.text, fontSize: 12, fontWeight: 500 }}>{info.label || r.activeAnomaly}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                      <span style={{ color: T.muted, fontSize: 11 }}>{r.speed?.toFixed(0)} km/h · {r.temperature?.toFixed(0)}°C</span>
                                      <span style={{ color: T.dim, fontSize: 11, fontFamily: 'monospace' }}>{new Date(r.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* ── ASK AI SUB-TAB ── */}
                    {alertSubTab === 'ask' && (
                      <div style={{ display: 'flex', flexDirection: 'column', height: 420 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                          <MessageSquare size={15} color={T.cyan} />
                          <span style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>Ask about {selVehicle?.name}</span>
                          <span style={{ color: T.dim, fontSize: 11, marginLeft: 4 }}>Powered by Claude</span>
                        </div>

                        {/* Suggested questions */}
                        {!(chatHistory[selVid]?.length) && (
                          <div style={{ marginBottom: 12 }}>
                            <p style={{ color: T.dim, fontSize: 11, margin: '0 0 8px' }}>Try asking:</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {[
                                'Why is the temperature so high?',
                                'Is this vehicle safe to drive?',
                                'When should I schedule maintenance?',
                                'What does this fault code mean?',
                              ].map((q, i) => (
                                <button key={i} onClick={() => { setChatInput(q); }} style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.muted, fontSize: 11, padding: '5px 10px', borderRadius: 20, cursor: 'pointer', transition: 'all 0.12s' }}>
                                  {q}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Chat messages */}
                        <div style={{ flex: 1, overflowY: 'auto', background: T.bg, borderRadius: 10, padding: 12, marginBottom: 10 }}>
                          {!(chatHistory[selVid]?.length) && (
                            <div style={{ textAlign: 'center', padding: 20, color: T.dim, fontSize: 13 }}>
                              <MessageSquare size={24} color={T.dim} style={{ marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                              Ask anything about {selVehicle?.name}'s telemetry, faults, or maintenance needs.
                            </div>
                          )}
                          {(chatHistory[selVid] || []).map((msg, i) => (
                            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 14, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                              <div style={{ width: 28, height: 28, borderRadius: '50%', background: msg.role === 'user' ? T.accentBg : T.purpleBg, border: `1px solid ${msg.role === 'user' ? T.accent : T.purple}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {msg.role === 'user' ? <span style={{ fontSize: 11, fontWeight: 700, color: T.accent }}>U</span> : <Brain size={13} color={T.purple} />}
                              </div>
                              <div style={{ maxWidth: '78%', background: msg.role === 'user' ? T.accentBg : T.card, border: `1px solid ${msg.role === 'user' ? T.accent : T.border}33`, borderRadius: 10, padding: '10px 14px' }}>
                                <p style={{ color: T.text, fontSize: 13, lineHeight: 1.55, margin: 0 }}>{msg.text}</p>
                              </div>
                            </div>
                          ))}
                          {chatLoading[selVid] && (
                            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                              <div style={{ width: 28, height: 28, borderRadius: '50%', background: T.purpleBg, border: `1px solid ${T.purple}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 2s infinite' }}>
                                <Brain size={13} color={T.purple} />
                              </div>
                              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px' }}>
                                <span style={{ color: T.muted, fontSize: 13 }}>Thinking…</span>
                              </div>
                            </div>
                          )}
                          <div ref={chatEndRef} />
                        </div>

                        {/* Chat Input */}
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
                            placeholder={`Ask about ${selVehicle?.name}…`}
                            style={{ flex: 1, padding: '10px 14px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, outline: 'none' }}
                          />
                          <button
                            onClick={sendChat}
                            disabled={!chatInput.trim() || chatLoading[selVid]}
                            style={{ background: chatInput.trim() ? `linear-gradient(135deg,${T.cyan},${T.blue})` : T.card, border: 'none', color: chatInput.trim() ? '#000' : T.dim, padding: '10px 16px', borderRadius: 8, cursor: chatInput.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, transition: 'all 0.15s' }}
                          >
                            <Send size={14} /> Send
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const VEHICLE_CATS = ['Sedan', 'SUV', 'Van', 'Truck', 'Bus', 'Motorcycle'];

const VehiclesPage = ({ user, vehicles, setVehicles, orgs }) => {
  const [search, setSearch] = useState('');
  const [catF,   setCatF]   = useState('');
  const [statF,  setStatF]  = useState('');
  const [modal,  setModal]  = useState(null);
  const [form,   setForm]   = useState({});

  const mv      = user.role === 'super_admin' ? vehicles : vehicles.filter(v => v.orgId === user.orgId);
  const canEdit = ['super_admin', 'org_admin', 'fleet_manager'].includes(user.role);

  const filtered = useMemo(() =>
    mv.filter(v => {
      const s = search.toLowerCase();
      return (
        (!s    || v.name.toLowerCase().includes(s) || v.plate.toLowerCase().includes(s)) &&
        (!catF  || v.cat    === catF)  &&
        (!statF || v.status === statF)
      );
    }),
    [mv, search, catF, statF]
  );

  const openAdd  = () => { setForm({ plate: '', name: '', cat: 'Sedan', orgId: user.orgId || 1, status: 'Available', year: String(new Date().getFullYear()), km: '0' }); setModal('add'); };
  const openEdit = v => { setForm({ ...v, year: String(v.year), km: String(v.km) }); setModal('edit'); };
  const save     = () => {
    if (!form.plate || !form.name) return;
    const v = { ...form, year: +form.year, km: +form.km, orgId: +form.orgId };
    if (modal === 'add') setVehicles(p => [...p, { ...v, id: Date.now() }]);
    else setVehicles(p => p.map(x => x.id === form.id ? v : x));
    setModal(null);
  };
  const del = id => setVehicles(p => p.filter(v => v.id !== id));

  const TH = ({ c }) => <th style={{ padding: '12px 16px', textAlign: 'left', color: T.dim, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{c}</th>;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: T.text, fontSize: 24, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Vehicles</h1>
          <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>{filtered.length} of {mv.length}</p>
        </div>
        {canEdit && <Btn onClick={openAdd}><Plus size={15} /> Add Vehicle</Btn>}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: T.muted }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search plate or name…" style={{ width: '100%', padding: '9px 9px 9px 34px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={catF}  onChange={e => setCatF(e.target.value)}  style={{ padding: '9px 12px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: catF  ? T.text : T.muted, fontSize: 13, outline: 'none', cursor: 'pointer' }}>
          <option value="">All Categories</option>
          {VEHICLE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={statF} onChange={e => setStatF(e.target.value)} style={{ padding: '9px 12px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: statF ? T.text : T.muted, fontSize: 13, outline: 'none', cursor: 'pointer' }}>
          <option value="">All Statuses</option>
          {['Available', 'In Use', 'Maintenance', 'Reserved'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead style={{ borderBottom: `1px solid ${T.border}` }}>
            <tr>{['PLATE', 'VEHICLE', 'CAT', 'ORG', 'STATUS', 'YEAR', 'KM', ''].map(c => <TH key={c} c={c} />)}</tr>
          </thead>
          <tbody>
            {filtered.map((v, i) => {
              const org = orgs.find(o => o.id === v.orgId);
              return (
                <tr key={v.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : 'none' }} onMouseEnter={e => e.currentTarget.style.background = T.cardHover} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '13px 16px', color: T.accent, fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>{v.plate}</td>
                  <td style={{ padding: '13px 16px', color: T.text,   fontSize: 14, fontWeight: 500 }}>{v.name}</td>
                  <td style={{ padding: '13px 16px', color: T.muted,  fontSize: 13 }}>{v.cat}</td>
                  <td style={{ padding: '13px 16px' }}><span style={{ background: T.accentBg, color: T.accent, padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>{org?.code || '—'}</span></td>
                  <td style={{ padding: '13px 16px' }}><Badge label={v.status} color={vc(v.status)} bg={vb(v.status)} /></td>
                  <td style={{ padding: '13px 16px', color: T.muted, fontSize: 13 }}>{v.year}</td>
                  <td style={{ padding: '13px 16px', color: T.muted, fontSize: 13 }}>{v.km.toLocaleString()}</td>
                  <td style={{ padding: '13px 16px' }}>
                    {canEdit && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(v)} style={{ background: T.blueBg, border: 'none', color: T.blue, padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><Edit2 size={12} /> Edit</button>
                        <button onClick={() => del(v.id)}   style={{ background: T.redBg,  border: 'none', color: T.red,  padding: '5px 8px',  borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Trash2 size={13} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 48, textAlign: 'center', color: T.muted, fontSize: 14 }}>No vehicles found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add Vehicle' : 'Edit Vehicle'} onClose={() => setModal(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Plate"        value={form.plate} onChange={v => setForm(f => ({ ...f, plate: v }))} placeholder="MCC-007" />
            <Field label="Vehicle Name" value={form.name}  onChange={v => setForm(f => ({ ...f, name: v }))}  placeholder="Toyota Camry" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Category" value={form.cat}    onChange={v => setForm(f => ({ ...f, cat: v }))}    options={VEHICLE_CATS} />
            <Field label="Status"   value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} options={['Available', 'In Use', 'Maintenance', 'Reserved']} />
          </div>
          {user.role === 'super_admin' && (
            <Field label="Organization" value={form.orgId} onChange={v => setForm(f => ({ ...f, orgId: v }))} options={orgs.map(o => ({ value: o.id, label: o.name }))} />
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Year"         value={form.year} onChange={v => setForm(f => ({ ...f, year: v }))} type="number" />
            <Field label="Mileage (km)" value={form.km}   onChange={v => setForm(f => ({ ...f, km: v }))}   type="number" />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Btn onClick={() => setModal(null)} variant="secondary">Cancel</Btn>
            <Btn onClick={save} disabled={!form.plate || !form.name}><CheckCircle size={14} /> Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

const SchedulesPage = ({ user, schedules, setSchedules, vehicles, users }) => {
  const [modal,    setModal]    = useState(false);
  const [statF,    setStatF]    = useState('');
  const [conflict, setConflict] = useState(false);
  const [form,     setForm]     = useState({ vehicleId: '', userId: '', purpose: '', start: fd(nowD), end: fd(nowD) });

  const ms = user.role === 'super_admin'
    ? schedules
    : user.role === 'driver'
      ? schedules.filter(s => s.userId === user.id)
      : schedules.filter(s => s.orgId === user.orgId);

  const mv       = user.role === 'super_admin' ? vehicles : vehicles.filter(v => v.orgId === user.orgId);
  const mu       = user.role === 'super_admin' ? users    : users.filter(u => u.orgId === user.orgId);
  const filtered = statF ? ms.filter(s => s.status === statF) : ms;
  const canAdd   = ['super_admin', 'org_admin', 'fleet_manager'].includes(user.role);

  const checkConflict = (vid, start, end) =>
    schedules.some(s => s.vehicleId === +vid && s.status !== 'cancelled' && s.status !== 'completed' && start <= s.end && end >= s.start);

  const upd = (field, val) => {
    const nf = { ...form, [field]: val };
    setForm(nf);
    if (nf.vehicleId && nf.start && nf.end) setConflict(checkConflict(nf.vehicleId, nf.start, nf.end));
  };

  const save = () => {
    if (!form.vehicleId || !form.purpose || conflict) return;
    const orgId = user.role === 'super_admin'
      ? vehicles.find(v => v.id === +form.vehicleId)?.orgId
      : user.orgId;
    setSchedules(p => [...p, {
      id: Date.now(), vehicleId: +form.vehicleId,
      userId: form.userId ? +form.userId : user.id,
      orgId, purpose: form.purpose, start: form.start, end: form.end, status: 'reserved',
    }]);
    setModal(false);
    setConflict(false);
  };

  const updStatus = (id, status) => setSchedules(p => p.map(s => s.id === id ? { ...s, status } : s));

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: T.text, fontSize: 24, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Schedules</h1>
          <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>{filtered.length} bookings</p>
        </div>
        {canAdd && <Btn onClick={() => setModal(true)}><Plus size={15} /> New Booking</Btn>}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {['', ...['active', 'reserved', 'completed', 'cancelled']].map(s => (
          <button
            key={s}
            onClick={() => setStatF(s)}
            style={{
              padding: '7px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13,
              border: `1px solid ${statF === s ? (sc(s) || T.accent) : T.border}`,
              fontWeight: statF === s ? 600 : 400,
              background: statF === s ? (sb(s) || T.accentBg) : 'transparent',
              color: statF === s ? (sc(s) || T.accent) : T.muted,
              textTransform: 'capitalize',
            }}
          >
            {s || 'All'} {s && `(${ms.filter(x => x.status === s).length})`}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.sort((a, b) => b.start.localeCompare(a.start)).map(s => {
          const v = vehicles.find(vv => vv.id === s.vehicleId);
          const u = users.find(uu => uu.id === s.userId);
          return (
            <div key={s.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Badge label={s.status} color={sc(s.status)} bg={sb(s.status)} />
                  <span style={{ color: T.dim, fontSize: 11 }}>#{s.id}</span>
                </div>
                <p style={{ color: T.text, fontSize: 15, fontWeight: 600, margin: '0 0 6px' }}>{s.purpose}</p>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <span style={{ color: T.muted, fontSize: 12 }}>🚗 {v?.name} · <span style={{ color: T.accent, fontFamily: 'monospace' }}>{v?.plate}</span></span>
                  <span style={{ color: T.muted, fontSize: 12 }}>👤 {u?.name}</span>
                  <span style={{ color: T.muted, fontSize: 12 }}>📅 {s.start} → {s.end}</span>
                </div>
              </div>
              {user.role !== 'driver' && (
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {s.status === 'reserved' && (
                    <>
                      <Btn onClick={() => updStatus(s.id, 'active')}    small variant="secondary"><Activity size={12} /> Activate</Btn>
                      <Btn onClick={() => updStatus(s.id, 'cancelled')} small variant="danger"><X size={12} /> Cancel</Btn>
                    </>
                  )}
                  {s.status === 'active' && (
                    <Btn onClick={() => updStatus(s.id, 'completed')} small><CheckCircle size={12} /> Complete</Btn>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ padding: 56, textAlign: 'center', color: T.muted, background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, fontSize: 14 }}>
            No schedules found
          </div>
        )}
      </div>

      {modal && (
        <Modal title="Create Booking" onClose={() => { setModal(false); setConflict(false); }}>
          <Field label="Vehicle" value={form.vehicleId} onChange={v => upd('vehicleId', v)} options={[{ value: '', label: '— Select vehicle —' }, ...mv.filter(v => v.status === 'Available' || v.status === 'Reserved').map(v => ({ value: v.id, label: `${v.name} (${v.plate})` }))]} />
          <Field label="Purpose"   value={form.purpose} onChange={v => upd('purpose', v)} placeholder="Trip description…" />
          <Field label="Assign To" value={form.userId}  onChange={v => upd('userId', v)}  options={[{ value: '', label: `Self (${user.name})` }, ...mu.filter(u => u.id !== user.id).map(u => ({ value: u.id, label: `${u.name} — ${ROLES_MAP[u.role]}` }))]} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Start" value={form.start} onChange={v => upd('start', v)} type="date" />
            <Field label="End"   value={form.end}   onChange={v => upd('end',   v)} type="date" />
          </div>
          {conflict && (
            <div style={{ background: T.redBg, border: `1px solid ${T.red}33`, borderRadius: 8, padding: '10px 14px', marginBottom: 12, color: T.red, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={15} /> Conflict: vehicle already booked for these dates.
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn onClick={() => setModal(false)} variant="secondary">Cancel</Btn>
            <Btn onClick={save} disabled={!form.vehicleId || !form.purpose || conflict}><CheckCircle size={14} /> Confirm</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

const OrgsPage = ({ orgs, setOrgs, vehicles, users }) => {
  const [modal, setModal] = useState(null);
  const [form,  setForm]  = useState({ name: '', code: '', status: 'active' });

  const save = () => {
    if (!form.name || !form.code) return;
    if (modal === 'add') setOrgs(p => [...p, { ...form, id: Date.now(), createdAt: fd(nowD) }]);
    else setOrgs(p => p.map(o => o.id === form.id ? form : o));
    setModal(null);
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: T.text, fontSize: 24, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Organizations</h1>
          <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>{orgs.length} organizations</p>
        </div>
        <Btn onClick={() => { setForm({ name: '', code: '', status: 'active' }); setModal('add'); }}><Plus size={15} /> Add</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
        {orgs.map(o => {
          const vehicleCount = vehicles.filter(v => v.orgId === o.id).length;
          const userCount    = users.filter(u => u.orgId === o.id).length;
          const availCount   = vehicles.filter(v => v.orgId === o.id && v.status === 'Available').length;
          return (
            <div key={o.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                <div style={{ width: 46, height: 46, background: T.accentBg, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent, fontSize: 15, fontWeight: 800 }}>{o.code}</div>
                <Badge label={o.status} color={o.status === 'active' ? T.green : T.red} bg={o.status === 'active' ? T.greenBg : T.redBg} />
              </div>
              <h3 style={{ color: T.text, fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>{o.name}</h3>
              <p style={{ color: T.dim, fontSize: 12, margin: '0 0 18px' }}>Since {o.createdAt}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 18, background: T.bg, borderRadius: 8, padding: 12 }}>
                {[['Vehicles', vehicleCount, T.blue], ['Available', availCount, T.green], ['Users', userCount, T.amber]].map(([l, v, c]) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <p style={{ color: c, fontSize: 20, fontWeight: 800, margin: '0 0 2px' }}>{v}</p>
                    <p style={{ color: T.dim, fontSize: 11, margin: 0 }}>{l}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setForm({ ...o }); setModal('edit'); }} style={{ flex: 1, padding: '8px', background: T.blueBg, border: 'none', color: T.blue, borderRadius: 7, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <Edit2 size={13} /> Edit
                </button>
                <button onClick={() => setOrgs(p => p.filter(x => x.id !== o.id))} style={{ padding: '8px 12px', background: T.redBg, border: 'none', color: T.red, borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add Organization' : 'Edit Organization'} onClose={() => setModal(null)}>
          <Field label="Name"   value={form.name}   onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="West Coast Authority" />
          <Field label="Code"   value={form.code}   onChange={v => setForm(f => ({ ...f, code: v.toUpperCase().slice(0, 5) }))} placeholder="WCA" />
          <Field label="Status" value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} options={['active', 'inactive']} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn onClick={() => setModal(null)} variant="secondary">Cancel</Btn>
            <Btn onClick={save} disabled={!form.name || !form.code}><CheckCircle size={14} /> Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

const UsersPage = ({ user, users, setUsers, orgs }) => {
  const [modal,  setModal]  = useState(null);
  const [form,   setForm]   = useState({});
  const [search, setSearch] = useState('');

  const mu       = user.role === 'super_admin' ? users : users.filter(u => u.orgId === user.orgId);
  const filtered = search
    ? mu.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    : mu;

  const save = () => {
    if (!form.name || !form.email) return;
    const initials = form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const entry    = { ...form, initials, passHash: form.passHash || hashPassword('password') };
    if (modal === 'add') setUsers(p => [...p, { ...entry, id: Date.now() }]);
    else setUsers(p => p.map(u => u.id === form.id ? entry : u));
    setModal(null);
  };

  const TH = ({ c }) => <th style={{ padding: '12px 16px', textAlign: 'left', color: T.dim, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>{c}</th>;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: T.text, fontSize: 24, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Users</h1>
          <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>{filtered.length} users</p>
        </div>
        <Btn onClick={() => { setForm({ name: '', email: '', role: 'driver', orgId: user.orgId || 1 }); setModal('add'); }}>
          <Plus size={15} /> Add User
        </Btn>
      </div>

      <div style={{ position: 'relative', marginBottom: 18, maxWidth: 320 }}>
        <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: T.muted }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ width: '100%', padding: '9px 9px 9px 34px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead style={{ borderBottom: `1px solid ${T.border}` }}>
            <tr>{['USER', 'EMAIL', 'ROLE', 'ORGANIZATION', ''].map(c => <TH key={c} c={c} />)}</tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => {
              const org = orgs.find(o => o.id === u.orgId);
              const rc  = ROLE_COLORS[u.role] || T.muted;
              return (
                <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : 'none' }} onMouseEnter={e => e.currentTarget.style.background = T.cardHover} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${rc}18`, border: `2px solid ${rc}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: rc, fontSize: 12, fontWeight: 700 }}>{u.initials}</div>
                      <div>
                        <p style={{ color: T.text, fontSize: 14, fontWeight: 600, margin: 0 }}>{u.name}</p>
                        {u.id === user.id && <span style={{ color: T.accent, fontSize: 11 }}>● You</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '13px 16px', color: T.muted,  fontSize: 13 }}>{u.email}</td>
                  <td style={{ padding: '13px 16px' }}><Badge label={ROLES_MAP[u.role]} color={rc} bg={`${rc}14`} /></td>
                  <td style={{ padding: '13px 16px', color: T.muted,  fontSize: 13 }}>{org?.name || <span style={{ color: T.dim, fontStyle: 'italic' }}>Platform</span>}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => { setForm({ ...u }); setModal('edit'); }} style={{ background: T.blueBg, border: 'none', color: T.blue, padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><Edit2 size={12} /> Edit</button>
                      {u.id !== user.id && <button onClick={() => setUsers(p => p.filter(x => x.id !== u.id))} style={{ background: T.redBg, border: 'none', color: T.red, padding: '5px 8px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Trash2 size={13} /></button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add User' : 'Edit User'} onClose={() => setModal(null)}>
          <Field label="Full Name" value={form.name}  onChange={v => setForm(f => ({ ...f, name: v }))}  placeholder="John Smith" />
          <Field label="Email"     value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} type="email" />
          <Field label="Role"      value={form.role}  onChange={v => setForm(f => ({ ...f, role: v }))}
            options={Object.entries(ROLES_MAP).filter(([k]) => user.role === 'super_admin' || k !== 'super_admin').map(([value, label]) => ({ value, label }))}
          />
          {user.role === 'super_admin' && (
            <Field label="Organization" value={form.orgId || ''} onChange={v => setForm(f => ({ ...f, orgId: +v || null }))}
              options={[{ value: '', label: 'None (Platform Admin)' }, ...orgs.map(o => ({ value: o.id, label: o.name }))]}
            />
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn onClick={() => setModal(null)} variant="secondary">Cancel</Btn>
            <Btn onClick={save} disabled={!form.name || !form.email}><CheckCircle size={14} /> Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

const ReportsPage = ({ user, vehicles, schedules, orgs, history }) => {
  const mv = user.role === 'super_admin' ? vehicles : vehicles.filter(v => v.orgId === user.orgId);
  const ms = user.role === 'super_admin' ? schedules : schedules.filter(s => s.orgId === user.orgId);

  const utilData = VEHICLE_CATS.map(cat => {
    const total = mv.filter(v => v.cat === cat).length;
    const used  = mv.filter(v => v.cat === cat && (v.status === 'In Use' || v.status === 'Reserved')).length;
    return { cat, total, pct: total ? Math.round(used / total * 100) : 0 };
  }).filter(d => d.total > 0);

  const statusDist = [
    { s: 'Available',   count: mv.filter(v => v.status === 'Available').length,   color: T.green },
    { s: 'In Use',      count: mv.filter(v => v.status === 'In Use').length,      color: T.blue  },
    { s: 'Maintenance', count: mv.filter(v => v.status === 'Maintenance').length, color: T.red   },
    { s: 'Reserved',    count: mv.filter(v => v.status === 'Reserved').length,    color: T.amber },
  ];

  const orgData = user.role === 'super_admin'
    ? orgs.map(o => ({
        org:       o.code,
        vehicles:  vehicles.filter(v => v.orgId === o.id).length,
        active:    schedules.filter(s => s.orgId === o.id && (s.status === 'active' || s.status === 'reserved')).length,
        completed: schedules.filter(s => s.orgId === o.id && s.status === 'completed').length,
      }))
    : [];

  const liveSpeedData = SIM_VEHICLES.map(v => {
    const h   = history[v.id] || [];
    const avg = h.length ? +(h.slice(0, 10).reduce((s, r) => s + (r.speed || 0), 0) / Math.min(10, h.length)).toFixed(1) : 0;
    return { name: v.id, avg, color: v.color };
  });

  const utilPct = mv.length ? Math.round(mv.filter(v => v.status === 'In Use' || v.status === 'Reserved').length / mv.length * 100) : 0;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ color: T.text, fontSize: 24, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Reports</h1>
        <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>Fleet performance & telemetry analytics</p>
      </div>

      <div style={{ display: 'flex', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
        <StatCard icon={TrendingUp}   label="Fleet Utilization"  value={`${utilPct}%`}                              color={T.blue}  />
        <StatCard icon={CheckCircle}  label="Completed Trips"    value={ms.filter(s => s.status === 'completed').length} color={T.green} sub={`of ${ms.length} total`} />
        <StatCard icon={AlertCircle}  label="In Maintenance"     value={mv.filter(v => v.status === 'Maintenance').length} color={T.red}  />
        <StatCard icon={Activity}     label="Live Telemetry"     value={SIM_VEHICLES.length}                        color={T.cyan}  pulse sub="Vehicles online" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24 }}>
          <h3 style={{ color: T.text, fontSize: 14, fontWeight: 700, margin: '0 0 18px' }}>Utilization by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={utilData}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="cat" tick={{ fill: T.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.muted, fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
              <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13 }} formatter={v => [`${v}%`, 'Utilization']} />
              <Bar dataKey="pct" fill={T.accent} radius={[4, 4, 0, 0]} barSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24 }}>
          <h3 style={{ color: T.text, fontSize: 14, fontWeight: 700, margin: '0 0 20px' }}>Fleet Status</h3>
          {statusDist.map(d => (
            <div key={d.s} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: T.muted, fontSize: 13 }}>{d.s}</span>
                <span style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>{d.count}</span>
              </div>
              <div style={{ height: 7, background: T.bg, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: d.color, borderRadius: 4, width: `${mv.length ? d.count / mv.length * 100 : 0}%`, transition: 'width 0.5s' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.cyan}33`, borderRadius: 12, padding: 24, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.cyan, display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <h3 style={{ color: T.text, fontSize: 14, fontWeight: 700, margin: 0 }}>Live Avg Speed — Telemetry Vehicles</h3>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={liveSpeedData}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: T.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: T.muted, fontSize: 12 }} axisLine={false} tickLine={false} unit=" km/h" />
            <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13 }} formatter={v => [`${v} km/h`, 'Avg Speed']} />
            <Bar dataKey="avg" radius={[5, 5, 0, 0]} barSize={36}>
              {liveSpeedData.map((e, i) => <Cell key={`speed-${i}`} fill={e.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {user.role === 'super_admin' && (
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24 }}>
          <h3 style={{ color: T.text, fontSize: 14, fontWeight: 700, margin: '0 0 18px' }}>Organization Comparison</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={orgData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="org" tick={{ fill: T.muted, fontSize: 13 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13 }} />
              <Legend wrapperStyle={{ color: T.muted, fontSize: 12 }} />
              <Bar dataKey="vehicles"  fill={T.blue}  radius={[4, 4, 0, 0]} barSize={22} name="Vehicles"  />
              <Bar dataKey="active"    fill={T.accent} radius={[4, 4, 0, 0]} barSize={22} name="Active"    />
              <Bar dataKey="completed" fill={T.green} radius={[4, 4, 0, 0]} barSize={22} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

// ─── Route names for display ──────────────────────────────────────────────────
const ROUTE_NAMES = {
  'VH-001': 'Anna Salai (Mount Road)',
  'VH-002': 'OMR — IT Corridor',
  'VH-003': 'Chennai Port → T.Nagar',
  'VH-004': 'Adyar → Velachery',
  'VH-005': 'ECR — Coastal Route',
};



// ─── Real Leaflet MapPage (OpenStreetMap tiles) ────────────────────────────────

const MapPage = ({ simState }) => {
  const mapContainerRef = useRef(null);
  const mapRef          = useRef(null);
  const markersRef      = useRef({});
  const trailsRef       = useRef({});
  const routeLinesRef   = useRef({});
  const simStateRef     = useRef(simState);

  const [showRoutes,   setShowRoutes]   = useState(true);
  const [showTrails,   setShowTrails]   = useState(true);
  const [selectedVid,  setSelectedVid]  = useState(null);
  const [leafletReady, setLeafletReady] = useState(!!window.L);

  // ── Load Leaflet CSS + JS once ──────────────────────────────────────────────
  useEffect(() => {
    if (window.L) { setLeafletReady(true); return; }
    const css = document.createElement('link');
    css.rel   = 'stylesheet';
    css.href  = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(css);
    const js    = document.createElement('script');
    js.src      = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    js.onload   = () => setLeafletReady(true);
    document.head.appendChild(js);
  }, []);

  // ── Initialise map after Leaflet loads ────────────────────────────────────
  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current || mapRef.current) return;
    const L   = window.L;
    const map = L.map(mapContainerRef.current, {
      center: [13.03, 80.27],
      zoom:   12,
      zoomControl: false,
      attributionControl: true,
    });

    // Standard OSM tiles — universally accessible
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: 'abc',
      maxZoom: 19,
    }).addTo(map);

    // Fit map to show all vehicle routes
    const allPts = Object.values(VEHICLE_ROUTES).flat();
    if (allPts.length) {
      const bounds = L.latLngBounds(allPts);
      map.fitBounds(bounds.pad(0.12));
    }

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Draw route paths (dashed polylines)
    SIM_VEHICLES.forEach(v => {
      const pts = VEHICLE_ROUTES[v.id];
      if (!pts?.length) return;
      const line = L.polyline(pts, {
        color:     v.color,
        weight:    2.5,
        opacity:   0.45,
        dashArray: '8 6',
      }).addTo(map);
      routeLinesRef.current[v.id] = line;
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current    = null;
      markersRef.current   = {};
      trailsRef.current    = {};
      routeLinesRef.current= {};
    };
  }, [leafletReady]);

  // ── Keep simStateRef in sync ───────────────────────────────────────────────
  useEffect(() => { simStateRef.current = simState; }, [simState]);

  // ── Build a DivIcon for a vehicle ─────────────────────────────────────────
  const makeIcon = useCallback((v, s) => {
    const L        = window.L;
    const hasAlert = !!s.activeAnomaly;
    const color    = hasAlert ? '#fb7185' : v.color;
    const emoji    = VEHICLE_EMOJIS[v.type] || '🚗';
    const bearing  = s.bearing || 0;
    const pulse    = hasAlert
      ? `@keyframes leafPulse{0%,100%{box-shadow:0 0 10px ${color}88}50%{box-shadow:0 0 22px ${color}}}`
      : '';
    return L.divIcon({
      className: '',
      iconSize:  [36, 36],
      iconAnchor:[18, 18],
      html: `
        <style>${pulse}</style>
        <div style="position:relative;width:36px;height:36px;">
          <!-- direction arrow -->
          <div style="
            position:absolute;top:50%;left:50%;
            width:0;height:0;
            border-left:5px solid transparent;
            border-right:5px solid transparent;
            border-bottom:12px solid ${color};
            transform:translate(-50%,-100%) rotate(${bearing}deg);
            transform-origin:50% 100%;
            margin-top:-18px;
          "></div>
          <!-- circle -->
          <div style="
            width:36px;height:36px;
            background:${color}22;
            border:2.5px solid ${color};
            border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            font-size:15px;
            ${hasAlert ? `animation:leafPulse 1.4s infinite;` : `box-shadow:0 0 8px ${color}55;`}
          ">${emoji}</div>
          <!-- label -->
          <div style="
            position:absolute;bottom:calc(100% + 4px);left:50%;transform:translateX(-50%);
            background:rgba(6,16,31,0.93);
            border:1px solid ${color}77;
            border-radius:4px;padding:1px 7px;
            color:${color};font-size:9px;font-weight:700;
            font-family:monospace;white-space:nowrap;
            pointer-events:none;
          ">${v.id}</div>
          ${hasAlert ? `<div style="
            position:absolute;top:0;right:0;width:10px;height:10px;
            background:#fb7185;border-radius:50%;
            border:1.5px solid #06101f;
          "></div>` : ''}
        </div>`,
    });
  }, []);

  // ── Update markers + trails every simState tick ───────────────────────────
  useEffect(() => {
    if (!mapRef.current || !leafletReady || !window.L) return;
    const L   = window.L;
    const map = mapRef.current;

    SIM_VEHICLES.forEach(v => {
      const s = simState[v.id];
      if (!s?.lat) return;

      // Marker
      const icon = makeIcon(v, s);
      if (markersRef.current[v.id]) {
        markersRef.current[v.id].setLatLng([s.lat, s.lon]);
        markersRef.current[v.id].setIcon(icon);
      } else {
        const m = L.marker([s.lat, s.lon], { icon, zIndexOffset: 1000 })
          .addTo(map)
          .on('click', () => setSelectedVid(prev => prev === v.id ? null : v.id));
        markersRef.current[v.id] = m;
      }

      // Trail
      if (showTrails && s.trail?.length > 1) {
        if (trailsRef.current[v.id]) {
          trailsRef.current[v.id].setLatLngs(s.trail);
        } else {
          trailsRef.current[v.id] = L.polyline(s.trail, {
            color:   v.color,
            weight:  3,
            opacity: 0.65,
          }).addTo(map);
        }
      } else if (!showTrails && trailsRef.current[v.id]) {
        map.removeLayer(trailsRef.current[v.id]);
        delete trailsRef.current[v.id];
      }
    });

    // Toggle route polylines
    SIM_VEHICLES.forEach(v => {
      const line = routeLinesRef.current[v.id];
      if (!line) return;
      if (showRoutes  && !map.hasLayer(line)) line.addTo(map);
      if (!showRoutes &&  map.hasLayer(line)) map.removeLayer(line);
    });
  }, [simState, showTrails, showRoutes, leafletReady, makeIcon]);

  // ── Focus / reset ─────────────────────────────────────────────────────────
  const focusOnVehicle = useCallback(vid => {
    const s = simStateRef.current[vid];
    if (!mapRef.current || !s?.lat) return;
    mapRef.current.flyTo([s.lat, s.lon], 15, { duration: 1 });
  }, []);

  const resetView = useCallback(() => {
    mapRef.current?.flyTo([13.03, 80.27], 12, { duration: 1 });
    setSelectedVid(null);
  }, []);

  const selectedVehicle = selectedVid ? SIM_VEHICLES.find(v => v.id === selectedVid) : null;
  const selectedState   = selectedVid ? simState[selectedVid] : null;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, padding: '24px 28px 24px', boxSizing: 'border-box', gap: 16 }}>

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, flexShrink: 0 }}>
        <div>
          <h1 style={{ color: T.text, fontSize: 22, fontWeight: 800, margin: '0 0 3px', letterSpacing: '-0.5px' }}>Live Map</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: T.green, display: 'inline-block', animation: 'pulse 2s infinite', boxShadow: `0 0 6px ${T.green}` }} />
            <span style={{ color: T.muted, fontSize: 12 }}>
              {SIM_VEHICLES.length} vehicles · OpenStreetMap · live 2s tick · Chennai roads
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { label: '⎯ Routes', active: showRoutes, toggle: () => setShowRoutes(p => !p), color: T.blue  },
            { label: '〰 Trails', active: showTrails, toggle: () => setShowTrails(p => !p), color: T.green },
          ].map(ctrl => (
            <button key={ctrl.label} onClick={ctrl.toggle} style={{
              padding: '5px 13px', borderRadius: 7,
              border: `1px solid ${ctrl.active ? ctrl.color : T.border}`,
              background: ctrl.active ? `${ctrl.color}18` : 'transparent',
              color: ctrl.active ? ctrl.color : T.muted,
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              {ctrl.label}
            </button>
          ))}
          <button onClick={resetView} style={{ padding: '5px 13px', borderRadius: 7, border: `1px solid ${T.border}`, background: 'transparent', color: T.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <X size={11} /> Reset view
          </button>
        </div>
      </div>

      {/* Map + right sidebar */}
      <div style={{ flex: 1, display: 'flex', gap: 12, minHeight: 0 }}>

        {/* Leaflet map container */}
        <div style={{ flex: 1, position: 'relative', borderRadius: 12, overflow: 'hidden', border: `1px solid ${T.border}`, minHeight: 0 }}>

          {/* Loading state */}
          {!leafletReady && (
            <div style={{ position: 'absolute', inset: 0, background: T.card, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, borderRadius: 12 }}>
              <div style={{ color: T.muted, fontSize: 14 }}>Loading map…</div>
            </div>
          )}

          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

          {/* Floating alert badges */}
          {(() => {
            const alertVehicles = SIM_VEHICLES.filter(v => simState[v.id]?.activeAnomaly);
            if (!alertVehicles.length) return null;
            return (
              <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 800, display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', maxWidth: '80%', pointerEvents: 'none' }}>
                {alertVehicles.map(v => (
                  <div key={v.id} onClick={(e) => { e.stopPropagation(); focusOnVehicle(v.id); setSelectedVid(v.id); }}
                    style={{ background: 'rgba(251,113,133,0.15)', border: '1px solid rgba(251,113,133,0.55)', backdropFilter: 'blur(10px)', borderRadius: 20, padding: '4px 11px', color: T.red, fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, animation: 'pulse 2s infinite', pointerEvents: 'auto' }}>
                    <AlertTriangle size={10} />
                    {v.id} — {(simState[v.id]?.activeAnomaly || '').replace(/_/g,' ').toUpperCase()}
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Selected vehicle popup panel */}
          {selectedVehicle && selectedState && (
            <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 800, background: T.card, border: `1px solid ${selectedVehicle.color}44`, borderRadius: 10, overflow: 'hidden', minWidth: 215, boxShadow: '0 8px 32px rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}>
              <div style={{ background: selectedVehicle.color + '18', borderBottom: `1px solid ${selectedVehicle.color}30`, padding: '10px 14px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: selectedVehicle.color, letterSpacing: '0.06em', fontFamily: 'monospace' }}>{selectedVehicle.id}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: '2px 0' }}>{selectedVehicle.name}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>{selectedVehicle.type} · {ROUTE_NAMES[selectedVehicle.id] || ''}</div>
                </div>
                <button onClick={() => setSelectedVid(null)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', padding: 2, display: 'flex' }}><X size={14} /></button>
              </div>
              <div style={{ padding: '10px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Speed', value: `${selectedState.speed.toFixed(0)} km/h`, color: T.blue },
                  { label: 'Temp',  value: `${selectedState.temp.toFixed(0)}°C`,     color: selectedState.temp > 100 ? T.red : T.amber },
                  selectedState.battery != null
                    ? { label: 'Battery', value: `${selectedState.battery.toFixed(0)}%`, color: selectedState.battery < 15 ? T.red : T.green }
                    : { label: 'Fuel',    value: `${(selectedState.fuel||0).toFixed(1)} L`, color: T.cyan },
                  { label: 'RPM', value: Math.round(selectedState.rpm).toLocaleString(), color: selectedState.rpm > 6000 ? T.red : T.purple },
                ].map((m, i) => (
                  <div key={i} style={{ background: '#06101f', borderRadius: 6, padding: '8px 10px' }}>
                    <div style={{ color: T.dim, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{m.label}</div>
                    <div style={{ color: m.color, fontSize: 16, fontWeight: 800 }}>{m.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '5px 14px 7px', display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${T.border}` }}>
                <span style={{ color: T.dim, fontSize: 10, fontFamily: 'monospace' }}>📍 {selectedState.lat.toFixed(4)}, {selectedState.lon.toFixed(4)}</span>
                <span style={{ color: T.dim, fontSize: 10 }}>🧭 {Math.round(selectedState.bearing || 0)}°</span>
              </div>
              {selectedState.activeAnomaly && (
                <div style={{ padding: '8px 14px', background: T.redBg, borderTop: `1px solid ${T.red}33`, color: T.red, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>⚠</span>
                  <span>{(ANOMALY_TYPES[selectedState.activeAnomaly]?.label || selectedState.activeAnomaly).replace(/_/g,' ').toUpperCase()}</span>
                  <span style={{ marginLeft: 'auto', fontFamily: 'monospace', fontSize: 10, opacity: 0.7 }}>{ANOMALY_TYPES[selectedState.activeAnomaly]?.code || ''}</span>
                </div>
              )}
            </div>
          )}

          {/* Map legend (bottom-left) — collapsible */}
          {(() => {
            const [legendOpen, setLegendOpen] = React.useState(true);
            return (
              <div style={{ position: 'absolute', bottom: 20, left: 12, zIndex: 800, minWidth: 44 }}>
                {/* Toggle pill */}
                <button
                  onClick={() => setLegendOpen(p => !p)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'rgba(8,14,28,0.92)', border: `1px solid ${T.borderHi}`,
                    borderRadius: legendOpen ? '8px 8px 0 0' : 8,
                    padding: '5px 10px', cursor: 'pointer', width: '100%',
                    backdropFilter: 'blur(12px)',
                  }}>
                  <Layers size={11} color={T.blue} />
                  <span style={{ color: T.text, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', flex: 1, textAlign: 'left' }}>Fleet</span>
                  <span style={{ color: T.dim, fontSize: 9, transition: 'transform 0.2s', display: 'inline-block', transform: legendOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                </button>

                {/* Body */}
                {legendOpen && (
                  <div style={{
                    background: 'rgba(8,14,28,0.92)', border: `1px solid ${T.borderHi}`,
                    borderTop: 'none', borderRadius: '0 0 8px 8px',
                    padding: '6px 0 4px', backdropFilter: 'blur(12px)', overflow: 'hidden',
                  }}>
                    {SIM_VEHICLES.map(v => {
                      const s = simState[v.id];
                      const hasAlert = s?.activeAnomaly;
                      const isSelected = selectedVid === v.id;
                      return (
                        <div key={v.id}
                          onClick={() => { focusOnVehicle(v.id); setSelectedVid(v.id); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '4px 10px', cursor: 'pointer',
                            background: isSelected ? `${v.color}12` : 'transparent',
                            borderLeft: `2px solid ${isSelected ? v.color : 'transparent'}`,
                            transition: 'background 0.15s',
                          }}>
                          {/* Animated status dot */}
                          <div style={{
                            width: 7, height: 7, borderRadius: '50%',
                            background: hasAlert ? T.red : v.color,
                            boxShadow: `0 0 5px ${hasAlert ? T.red : v.color}`,
                            flexShrink: 0,
                            animation: hasAlert ? 'pulse 1s infinite' : 'none',
                          }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ color: v.color, fontSize: 9, fontWeight: 800, fontFamily: 'monospace' }}>{v.id}</span>
                              {hasAlert && <span style={{ color: T.red, fontSize: 8, fontWeight: 700 }}>⚠</span>}
                            </div>
                            <div style={{ color: T.muted, fontSize: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 130 }}>{v.name}</div>
                          </div>
                          {/* Live speed badge */}
                          {s && (
                            <span style={{ color: T.dim, fontSize: 9, fontFamily: 'monospace', flexShrink: 0 }}>
                              {s.speed.toFixed(0)}<span style={{ fontSize: 7 }}>km/h</span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Right sidebar – vehicle cards */}
        <div style={{ width: 234, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', overflowX: 'hidden', flexShrink: 0, minHeight: 0 }}>
          {SIM_VEHICLES.map(v => {
            const s        = simState[v.id];
            if (!s) return null;
            const hasAlert = !!s.activeAnomaly;
            const isFocus  = selectedVid === v.id;
            const energy   = s.battery != null
              ? { label: 'Battery', value: `${s.battery.toFixed(0)}%`, pct: s.battery, color: s.battery < 15 ? T.red : T.green }
              : { label: 'Fuel',    value: `${(s.fuel||0).toFixed(1)}L`, pct: (s.fuel||0)/60*100, color: T.cyan };
            const metrics = [
              { label: 'Speed', value: s.speed.toFixed(0), unit: 'km/h', pct: s.speed/160*100, color: s.speed > 130 ? T.red : T.blue },
              { label: 'Temp',  value: s.temp.toFixed(0),  unit: '°C',   pct: (s.temp-60)/50*100, color: s.temp > 100 ? T.red : T.amber },
              { label: energy.label, value: energy.value, unit: '', pct: energy.pct, color: energy.color },
              { label: 'RPM',   value: Math.round(s.rpm/100)/10+'k', unit: '', pct: s.rpm/7000*100, color: s.rpm > 6000 ? T.red : T.purple },
            ];
            return (
              <div key={v.id} onClick={() => { setSelectedVid(isFocus ? null : v.id); if (!isFocus) focusOnVehicle(v.id); }} style={{
                background: isFocus ? T.cardHover : T.card,
                border: `1px solid ${isFocus ? v.color : hasAlert ? T.red : T.border}`,
                borderRadius: 10, padding: '11px 13px', cursor: 'pointer',
                transition: 'border-color 0.2s, background 0.2s',
                boxShadow: isFocus ? `0 0 14px ${v.color}1a` : hasAlert ? `0 0 8px ${T.red}14` : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13 }}>{VEHICLE_EMOJIS[v.type] || '🚗'}</span>
                    <div>
                      <div style={{ color: v.color, fontSize: 9, fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.04em' }}>{v.id}</div>
                      <div style={{ color: T.text, fontSize: 11, fontWeight: 600, lineHeight: 1.25, maxWidth: 110, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.name}</div>
                    </div>
                  </div>
                  {hasAlert
                    ? <span style={{ background: T.redBg, color: T.red, fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 8, animation: 'pulse 2s infinite', whiteSpace: 'nowrap' }}>⚠ FAULT</span>
                    : <span style={{ background: T.greenBg, color: T.green, fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 8 }}>● LIVE</span>
                  }
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                  {metrics.map((m, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ color: T.dim, fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</span>
                        <span style={{ color: m.color, fontSize: 9, fontWeight: 700 }}>{m.value}<span style={{ fontSize: 7, color: T.dim }}>{m.unit}</span></span>
                      </div>
                      <div style={{ height: 3, background: T.border, borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100,Math.max(0,m.pct))}%`, background: m.color, borderRadius: 2, transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 7, paddingTop: 6, borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: T.dim, fontSize: 9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>
                    📍 {ROUTE_NAMES[v.id]?.split('—')[0]?.trim() || 'En route'}
                  </span>
                  <Navigation size={10} color={isFocus ? v.color : T.dim}
                    style={{ transform: `rotate(${(s.bearing||0)-45}deg)`, transition: 'transform 0.5s ease', flexShrink: 0 }} />
                </div>
                {hasAlert && (
                  <div style={{ marginTop: 5, background: T.redBg, border: `1px solid ${T.red}33`, borderRadius: 5, padding: '3px 7px', color: T.red, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {ANOMALY_TYPES[s.activeAnomaly]?.icon} {ANOMALY_TYPES[s.activeAnomaly]?.label || s.activeAnomaly.replace(/_/g,' ')}
                  </div>
                )}
              </div>
            );
          })}

          {/* Summary footer card */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 13px', flexShrink: 0 }}>
            <div style={{ color: T.dim, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Fleet Summary</div>
            {[
              { label: 'Online',   value: SIM_VEHICLES.length,                                                                                       color: T.green },
              { label: 'Faults',   value: SIM_VEHICLES.filter(v => simState[v.id]?.activeAnomaly).length,                                            color: T.red   },
              { label: 'Avg spd',  value: `${Math.round(SIM_VEHICLES.reduce((s,v) => s+(simState[v.id]?.speed||0),0)/SIM_VEHICLES.length)} km/h`,    color: T.blue  },
              { label: 'Max temp', value: `${Math.round(Math.max(...SIM_VEHICLES.map(v=>simState[v.id]?.temp||0)))}°C`,                              color: T.amber },
            ].map((row,i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: T.dim, fontSize: 10 }}>{row.label}</span>
                <span style={{ color: row.color, fontSize: 10, fontWeight: 700 }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};



const PAGE_TITLES = {
  dashboard: 'Dashboard', telemetry: 'Live Telemetry', map: 'Live Map', vehicles: 'Vehicles',
  identity: 'Identity & Insurance', maintenance: 'Maintenance & Service',
  schedules: 'Schedules', organizations: 'Organizations', users: 'Users', reports: 'Reports',
};

const TopBar = ({ page, user, alerts }) => (
  <div style={{ height: 60, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', background: T.bg, position: 'sticky', top: 0, zIndex: 10 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: T.dim, fontSize: 13 }}>FleetOS</span>
      <span style={{ color: T.border }}>›</span>
      <span style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{PAGE_TITLES[page]}</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ background: T.greenBg, color: T.green, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, border: `1px solid ${T.green}33` }}>● System Online</div>
      {alerts > 0 && (
        <div style={{ background: T.redBg, color: T.red, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1px solid ${T.red}33`, animation: 'pulse 2s infinite' }}>
          <AlertTriangle size={11} style={{ marginRight: 4, display: 'inline' }} />
          {alerts} Alert{alerts > 1 ? 's' : ''}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 8 }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: `linear-gradient(135deg,${ROLE_COLORS[user.role]},${T.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>{user.initials}</div>
        <span style={{ color: T.text, fontSize: 13, fontWeight: 500 }}>{user.name.split(' ')[0]}</span>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// IDENTITY & INSURANCE PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const isExpired   = d => d && new Date(d) < new Date();
const expiresInDays = d => { if (!d) return null; const diff = (new Date(d) - new Date()) / 86400000; return Math.round(diff); };

const IdentityPage = ({ user, vehicles, orgs, ownership, setOwnership, insurance, setInsurance }) => {
  const [search,   setSearch]   = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all | authorized | unauthorized | expired
  const [modal,    setModal]    = useState(null); // null | 'owner' | 'insurance' | 'view'
  const [selVehicle, setSelVehicle] = useState(null);
  const [ownerForm, setOwnerForm] = useState({});
  const [insForm,   setInsForm]   = useState({});

  const mv = user.role === 'super_admin' ? vehicles : vehicles.filter(v => v.orgId === user.orgId);
  const canEdit = ['super_admin', 'org_admin'].includes(user.role);

  const getAuth   = vid => ownership.find(o => o.vehicleId === vid);
  const getIns    = vid => insurance.find(i => i.vehicleId === vid);

  const getStatus = (vid) => {
    const ow = getAuth(vid);
    const ins = getIns(vid);
    if (!ow || !ins) return 'incomplete';
    if (!ow.authorized || isExpired(ow.validTo)) return 'unauthorized';
    if (isExpired(ins.expiryDate)) return 'expired';
    const days = expiresInDays(ins.expiryDate);
    if (days !== null && days <= 30) return 'expiring';
    return 'authorized';
  };

  const STATUS_CFG = {
    authorized:   { label: 'Authorized',  color: T.green,  bg: T.greenBg  },
    unauthorized: { label: 'Unauthorized',color: T.red,    bg: T.redBg    },
    expired:      { label: 'Expired',     color: T.red,    bg: T.redBg    },
    expiring:     { label: 'Expiring Soon',color: T.amber, bg: T.amberBg  },
    incomplete:   { label: 'Incomplete',  color: T.muted,  bg: 'rgba(148,163,184,0.08)' },
  };

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return mv.filter(v => {
      const st = getStatus(v.id);
      const matchSearch = !s || v.name.toLowerCase().includes(s) || v.plate.toLowerCase().includes(s);
      const matchFilter = filterStatus === 'all' || st === filterStatus;
      return matchSearch && matchFilter;
    });
  }, [mv, search, filterStatus, ownership, insurance]);

  const summary = {
    total: mv.length,
    authorized: mv.filter(v => getStatus(v.id) === 'authorized').length,
    unauthorized: mv.filter(v => ['unauthorized','expired','incomplete'].includes(getStatus(v.id))).length,
    expiring: mv.filter(v => getStatus(v.id) === 'expiring').length,
  };

  const openView = v => { setSelVehicle(v); setModal('view'); };

  const openOwnerEdit = v => {
    setSelVehicle(v);
    const existing = getAuth(v.id);
    setOwnerForm(existing ? { ...existing } : {
      vehicleId: v.id, ownerName: '', ownerType: 'Organization', licenseNo: '',
      contact: '', address: '', validFrom: fd(nowD), validTo: ad(365 * 3), authorized: true,
    });
    setModal('owner');
  };

  const openInsEdit = v => {
    setSelVehicle(v);
    const existing = getIns(v.id);
    setInsForm(existing ? { ...existing } : {
      vehicleId: v.id, provider: '', policyNo: '', coverageType: 'Comprehensive',
      startDate: fd(nowD), expiryDate: ad(365), premiumAnnual: '', insuredValue: '', contactNo: '',
    });
    setModal('insurance');
  };

  const saveOwner = () => {
    const rec = { ...ownerForm, vehicleId: selVehicle.id, id: ownerForm.id || Date.now(), authorized: ownerForm.authorized === true || ownerForm.authorized === 'true' };
    setOwnership(p => p.some(o => o.vehicleId === selVehicle.id) ? p.map(o => o.vehicleId === selVehicle.id ? rec : o) : [...p, rec]);
    setModal(null);
  };

  const saveIns = () => {
    const rec = { ...insForm, vehicleId: selVehicle.id, id: insForm.id || Date.now(), premiumAnnual: +insForm.premiumAnnual, insuredValue: +insForm.insuredValue };
    setInsurance(p => p.some(i => i.vehicleId === selVehicle.id) ? p.map(i => i.vehicleId === selVehicle.id ? rec : i) : [...p, rec]);
    setModal(null);
  };

  const InfoRow = ({ label, value, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${T.border}` }}>
      <span style={{ color: T.muted, fontSize: 13 }}>{label}</span>
      <span style={{ color: color || T.text, fontSize: 13, fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{value || '—'}</span>
    </div>
  );

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: T.text, fontSize: 24, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Identity & Insurance</h1>
        <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>Vehicle ownership verification and insurance validity management</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { icon: ShieldCheck,  label: 'Authorized',     value: summary.authorized,   color: T.green  },
          { icon: ShieldOff,    label: 'Non-Compliant',  value: summary.unauthorized, color: T.red    },
          { icon: AlertOctagon, label: 'Expiring ≤30d',  value: summary.expiring,     color: T.amber  },
          { icon: BadgeCheck,   label: 'Total Vehicles', value: summary.total,        color: T.blue   },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={{ flex: 1, minWidth: 140, background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: T.muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>{label}</p>
                <p style={{ color, fontSize: 28, fontWeight: 800, margin: 0 }}>{value}</p>
              </div>
              <div style={{ background: `${color}18`, borderRadius: 10, padding: 10 }}><Icon size={20} color={color} /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: T.muted }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search plate or vehicle name…" style={{ width: '100%', padding: '9px 9px 9px 34px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        {['all','authorized','expiring','unauthorized','expired','incomplete'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{
            padding: '9px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: filterStatus === s ? 700 : 400, textTransform: 'capitalize',
            background: filterStatus === s ? T.accentBg : 'transparent', color: filterStatus === s ? T.accent : T.muted,
            border: `1px solid ${filterStatus === s ? T.accent : T.border}`,
          }}>{s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}</button>
        ))}
      </div>

      {/* Vehicle Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {filtered.map(v => {
          const ow  = getAuth(v.id);
          const ins = getIns(v.id);
          const st  = getStatus(v.id);
          const cfg = STATUS_CFG[st];
          const org = orgs.find(o => o.id === v.orgId);
          const insDays = ins ? expiresInDays(ins.expiryDate) : null;

          return (
            <div key={v.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = T.borderHi}
              onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
            >
              {/* Card Header */}
              <div style={{ padding: '16px 20px', background: `${cfg.color}08`, borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ color: T.accent, fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>{v.plate}</span>
                  <p style={{ color: T.text, fontSize: 15, fontWeight: 700, margin: '2px 0 0' }}>{v.name}</p>
                  <span style={{ color: T.dim, fontSize: 11 }}>{v.cat} · {org?.code}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}44`, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{cfg.label}</span>
                </div>
              </div>

              {/* Owner Section */}
              <div style={{ padding: '12px 20px', borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <UserCheck size={13} color={ow ? T.blue : T.dim} />
                    <span style={{ color: T.dim, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ownership</span>
                  </div>
                  {canEdit && (
                    <button onClick={() => openOwnerEdit(v)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Edit2 size={11} /> {ow ? 'Edit' : 'Add'}
                    </button>
                  )}
                </div>
                {ow ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <div>
                      <p style={{ color: T.muted, fontSize: 10, margin: '0 0 2px' }}>OWNER</p>
                      <p style={{ color: T.text, fontSize: 12, fontWeight: 600, margin: 0 }}>{ow.ownerName}</p>
                    </div>
                    <div>
                      <p style={{ color: T.muted, fontSize: 10, margin: '0 0 2px' }}>LICENSE</p>
                      <p style={{ color: T.accent, fontSize: 11, fontFamily: 'monospace', fontWeight: 600, margin: 0 }}>{ow.licenseNo}</p>
                    </div>
                    <div>
                      <p style={{ color: T.muted, fontSize: 10, margin: '0 0 2px' }}>VALID TO</p>
                      <p style={{ color: isExpired(ow.validTo) ? T.red : T.green, fontSize: 12, fontWeight: 600, margin: 0 }}>{ow.validTo}</p>
                    </div>
                    <div>
                      <p style={{ color: T.muted, fontSize: 10, margin: '0 0 2px' }}>STATUS</p>
                      <p style={{ color: ow.authorized ? T.green : T.red, fontSize: 12, fontWeight: 700, margin: 0 }}>{ow.authorized ? '✓ Authorized' : '✗ Revoked'}</p>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: T.dim, fontSize: 12, margin: 0, fontStyle: 'italic' }}>No ownership record — click Add</p>
                )}
              </div>

              {/* Insurance Section */}
              <div style={{ padding: '12px 20px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Shield size={13} color={ins ? T.purple : T.dim} />
                    <span style={{ color: T.dim, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Insurance</span>
                  </div>
                  {canEdit && (
                    <button onClick={() => openInsEdit(v)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Edit2 size={11} /> {ins ? 'Edit' : 'Add'}
                    </button>
                  )}
                </div>
                {ins ? (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                      <div>
                        <p style={{ color: T.muted, fontSize: 10, margin: '0 0 2px' }}>PROVIDER</p>
                        <p style={{ color: T.text, fontSize: 12, fontWeight: 600, margin: 0 }}>{ins.provider}</p>
                      </div>
                      <div>
                        <p style={{ color: T.muted, fontSize: 10, margin: '0 0 2px' }}>POLICY NO.</p>
                        <p style={{ color: T.purple, fontSize: 11, fontFamily: 'monospace', fontWeight: 600, margin: 0 }}>{ins.policyNo}</p>
                      </div>
                      <div>
                        <p style={{ color: T.muted, fontSize: 10, margin: '0 0 2px' }}>COVERAGE</p>
                        <p style={{ color: T.text, fontSize: 12, margin: 0 }}>{ins.coverageType}</p>
                      </div>
                      <div>
                        <p style={{ color: T.muted, fontSize: 10, margin: '0 0 2px' }}>EXPIRES</p>
                        <p style={{ color: isExpired(ins.expiryDate) ? T.red : insDays !== null && insDays <= 30 ? T.amber : T.green, fontSize: 12, fontWeight: 600, margin: 0 }}>
                          {ins.expiryDate} {insDays !== null && !isExpired(ins.expiryDate) && insDays <= 60 && <span style={{ fontSize: 10 }}>({insDays}d)</span>}
                        </p>
                      </div>
                    </div>
                    {insDays !== null && insDays <= 30 && !isExpired(ins.expiryDate) && (
                      <div style={{ background: T.amberBg, border: `1px solid ${T.amber}33`, borderRadius: 6, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AlertTriangle size={12} color={T.amber} />
                        <span style={{ color: T.amber, fontSize: 11, fontWeight: 600 }}>Renew within {insDays} days</span>
                      </div>
                    )}
                    {isExpired(ins.expiryDate) && (
                      <div style={{ background: T.redBg, border: `1px solid ${T.red}33`, borderRadius: 6, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ShieldOff size={12} color={T.red} />
                        <span style={{ color: T.red, fontSize: 11, fontWeight: 600 }}>Insurance EXPIRED — vehicle uninsured</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ color: T.dim, fontSize: 12, margin: 0, fontStyle: 'italic' }}>No insurance record — click Add</p>
                )}
              </div>

              {/* View Details Button */}
              <div style={{ padding: '0 20px 16px' }}>
                <button onClick={() => openView(v)} style={{ width: '100%', padding: '8px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, color: T.muted, cursor: 'pointer', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Eye size={13} /> View Full Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: 56, textAlign: 'center', color: T.muted, background: T.card, borderRadius: 12, border: `1px solid ${T.border}` }}>
          No vehicles match the current filter.
        </div>
      )}

      {/* ── Owner Edit Modal ──────────────────────────────────────────────────── */}
      {modal === 'owner' && selVehicle && (
        <Modal title={`Ownership — ${selVehicle.name}`} onClose={() => setModal(null)}>
          <Field label="Owner Name"  value={ownerForm.ownerName}  onChange={v => setOwnerForm(f => ({ ...f, ownerName: v  }))} placeholder="Organization or person name" />
          <Field label="Owner Type"  value={ownerForm.ownerType}  onChange={v => setOwnerForm(f => ({ ...f, ownerType: v  }))} options={['Organization','Individual','Government','Leased']} />
          <Field label="License No." value={ownerForm.licenseNo}  onChange={v => setOwnerForm(f => ({ ...f, licenseNo: v  }))} placeholder="e.g. LIC-ORG-2025-001" />
          <Field label="Contact"     value={ownerForm.contact}    onChange={v => setOwnerForm(f => ({ ...f, contact: v    }))} placeholder="Email or phone" />
          <Field label="Address"     value={ownerForm.address}    onChange={v => setOwnerForm(f => ({ ...f, address: v    }))} placeholder="Registered address" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Valid From" value={ownerForm.validFrom} onChange={v => setOwnerForm(f => ({ ...f, validFrom: v }))} type="date" />
            <Field label="Valid To"   value={ownerForm.validTo}   onChange={v => setOwnerForm(f => ({ ...f, validTo: v   }))} type="date" />
          </div>
          <Field label="Authorization Status" value={String(ownerForm.authorized)} onChange={v => setOwnerForm(f => ({ ...f, authorized: v === 'true' }))} options={[{value:'true',label:'✓ Authorized'},{value:'false',label:'✗ Revoked / Suspended'}]} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={saveOwner} disabled={!ownerForm.ownerName || !ownerForm.licenseNo}>Save Ownership</Btn>
          </div>
        </Modal>
      )}

      {/* ── Insurance Edit Modal ──────────────────────────────────────────────── */}
      {modal === 'insurance' && selVehicle && (
        <Modal title={`Insurance — ${selVehicle.name}`} onClose={() => setModal(null)}>
          <Field label="Insurance Provider" value={insForm.provider}     onChange={v => setInsForm(f => ({ ...f, provider: v     }))} placeholder="e.g. SafeDrive Insurance" />
          <Field label="Policy Number"      value={insForm.policyNo}     onChange={v => setInsForm(f => ({ ...f, policyNo: v     }))} placeholder="e.g. POL-2025-001" />
          <Field label="Coverage Type"      value={insForm.coverageType} onChange={v => setInsForm(f => ({ ...f, coverageType: v }))} options={['Comprehensive','Third-Party','Third-Party Fire & Theft','Own Damage']} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Start Date"   value={insForm.startDate}   onChange={v => setInsForm(f => ({ ...f, startDate:   v }))} type="date" />
            <Field label="Expiry Date"  value={insForm.expiryDate}  onChange={v => setInsForm(f => ({ ...f, expiryDate:  v }))} type="date" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Annual Premium (₹)" value={insForm.premiumAnnual} onChange={v => setInsForm(f => ({ ...f, premiumAnnual: v }))} type="number" placeholder="0" />
            <Field label="Insured Value (₹)"  value={insForm.insuredValue}  onChange={v => setInsForm(f => ({ ...f, insuredValue:  v }))} type="number" placeholder="0" />
          </div>
          <Field label="Insurer Contact" value={insForm.contactNo} onChange={v => setInsForm(f => ({ ...f, contactNo: v }))} placeholder="+91-1800-XXX-XXX" />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={saveIns} disabled={!insForm.provider || !insForm.policyNo || !insForm.expiryDate}>Save Insurance</Btn>
          </div>
        </Modal>
      )}

      {/* ── Full Details View Modal ───────────────────────────────────────────── */}
      {modal === 'view' && selVehicle && (() => {
        const ow  = getAuth(selVehicle.id);
        const ins = getIns(selVehicle.id);
        const st  = getStatus(selVehicle.id);
        const cfg = STATUS_CFG[st];
        return (
          <Modal title={`${selVehicle.name} — Identity Record`} onClose={() => setModal(null)} wide>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '14px 18px', background: `${cfg.color}0a`, border: `1px solid ${cfg.color}33`, borderRadius: 10 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${cfg.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Truck size={22} color={cfg.color} />
              </div>
              <div>
                <p style={{ color: T.accent, fontSize: 13, fontWeight: 700, fontFamily: 'monospace', margin: 0 }}>{selVehicle.plate}</p>
                <p style={{ color: T.text, fontSize: 17, fontWeight: 800, margin: '2px 0' }}>{selVehicle.name}</p>
                <span style={{ background: cfg.bg, color: cfg.color, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: `1px solid ${cfg.color}44` }}>{cfg.label}</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ background: T.bg, borderRadius: 10, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <UserCheck size={15} color={T.blue} />
                  <span style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>Ownership Record</span>
                </div>
                {ow ? (<>
                  <InfoRow label="Owner"        value={ow.ownerName} />
                  <InfoRow label="Type"         value={ow.ownerType} />
                  <InfoRow label="License No."  value={ow.licenseNo} color={T.accent} />
                  <InfoRow label="Contact"      value={ow.contact} />
                  <InfoRow label="Address"      value={ow.address} />
                  <InfoRow label="Valid From"   value={ow.validFrom} />
                  <InfoRow label="Valid To"     value={ow.validTo} color={isExpired(ow.validTo) ? T.red : T.green} />
                  <InfoRow label="Authorization" value={ow.authorized ? '✓ Authorized' : '✗ Revoked'} color={ow.authorized ? T.green : T.red} />
                </>) : <p style={{ color: T.dim, fontSize: 13, fontStyle: 'italic' }}>No ownership record on file.</p>}
              </div>
              <div style={{ background: T.bg, borderRadius: 10, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Shield size={15} color={T.purple} />
                  <span style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>Insurance Record</span>
                </div>
                {ins ? (<>
                  <InfoRow label="Provider"      value={ins.provider} />
                  <InfoRow label="Policy No."    value={ins.policyNo} color={T.purple} />
                  <InfoRow label="Coverage"      value={ins.coverageType} />
                  <InfoRow label="Start Date"    value={ins.startDate} />
                  <InfoRow label="Expiry Date"   value={ins.expiryDate} color={isExpired(ins.expiryDate) ? T.red : T.green} />
                  <InfoRow label="Annual Premium" value={`₹${ins.premiumAnnual?.toLocaleString()}`} />
                  <InfoRow label="Insured Value" value={`₹${ins.insuredValue?.toLocaleString()}`} />
                  <InfoRow label="Contact"       value={ins.contactNo} />
                </>) : <p style={{ color: T.dim, fontSize: 13, fontStyle: 'italic' }}>No insurance record on file.</p>}
              </div>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAINTENANCE & SERVICE TRACKING PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const MaintenancePage = ({ user, vehicles, orgs, maintenance, setMaintenance }) => {
  const [search,   setSearch]   = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modal,    setModal]    = useState(null); // null | 'add' | 'detail'
  const [selVehicle, setSelVehicle] = useState(null);
  const [form,     setForm]     = useState({});

  const mv = user.role === 'super_admin' ? vehicles : vehicles.filter(v => v.orgId === user.orgId);
  const canEdit = ['super_admin', 'org_admin', 'fleet_manager'].includes(user.role);

  const getRecords   = vid => [...maintenance].filter(m => m.vehicleId === vid).sort((a, b) => b.date.localeCompare(a.date));
  const getLastRecord = vid => getRecords(vid)[0] || null;

  const getServiceStatus = vid => {
    const v   = mv.find(x => x.id === vid);
    const rec = getLastRecord(vid);
    if (!rec) return 'no_record';
    const dateOverdue = rec.nextServiceDate && new Date(rec.nextServiceDate) < new Date();
    const kmOverdue   = rec.nextServiceKm  && v && v.km >= rec.nextServiceKm;
    const dateDays    = rec.nextServiceDate ? expiresInDays(rec.nextServiceDate) : null;
    if (dateOverdue || kmOverdue)          return 'overdue';
    if (dateDays !== null && dateDays <= 30) return 'due_soon';
    return 'ok';
  };

  const SVC_STATUS = {
    ok:        { label: 'Up to Date',  color: T.green,  bg: T.greenBg  },
    due_soon:  { label: 'Due Soon',    color: T.amber,  bg: T.amberBg  },
    overdue:   { label: 'Overdue',     color: T.red,    bg: T.redBg    },
    no_record: { label: 'No History',  color: T.muted,  bg: 'rgba(148,163,184,0.08)' },
  };

  const summary = {
    ok:        mv.filter(v => getServiceStatus(v.id) === 'ok').length,
    due_soon:  mv.filter(v => getServiceStatus(v.id) === 'due_soon').length,
    overdue:   mv.filter(v => getServiceStatus(v.id) === 'overdue').length,
    no_record: mv.filter(v => getServiceStatus(v.id) === 'no_record').length,
    totalCost: maintenance.filter(m => mv.some(v => v.id === m.vehicleId)).reduce((s, m) => s + (m.cost || 0), 0),
  };

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return mv.filter(v =>
      (!s || v.name.toLowerCase().includes(s) || v.plate.toLowerCase().includes(s))
    );
  }, [mv, search]);

  const allRecordsFiltered = useMemo(() => {
    return [...maintenance]
      .filter(m => mv.some(v => v.id === m.vehicleId) && (!typeFilter || m.type === typeFilter))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 50);
  }, [maintenance, mv, typeFilter]);

  const openAdd = v => {
    setSelVehicle(v);
    setForm({ vehicleId: v.id, type: 'Oil Change', date: fd(nowD), kmAtService: String(v.km || 0), cost: '', technician: '', notes: '', nextServiceKm: '', nextServiceDate: ad(180) });
    setModal('add');
  };

  const openDetail = v => { setSelVehicle(v); setModal('detail'); };

  const saveService = () => {
    if (!form.type || !form.date) return;
    const rec = {
      id: Date.now(), vehicleId: selVehicle.id,
      type: form.type, date: form.date,
      kmAtService: +form.kmAtService || selVehicle.km,
      cost: +form.cost || 0,
      technician: form.technician,
      notes: form.notes,
      nextServiceKm: +form.nextServiceKm || 0,
      nextServiceDate: form.nextServiceDate,
    };
    setMaintenance(p => [...p, rec]);
    setModal(null);
  };

  const SERVICE_ICONS = {
    'Oil Change': '🛢️', 'Tire Rotation': '🔄', 'Brake Inspection': '🔧',
    'Air Filter': '💨', 'Battery Check': '🔋', 'Full Service': '⭐',
    'Transmission Service': '⚙️', 'Coolant Flush': '💧', 'Wheel Alignment': '🎯', 'A/C Service': '❄️',
  };

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: T.text, fontSize: 24, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Maintenance & Service</h1>
        <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>Service history, upcoming maintenance, and overdue alerts</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { icon: CheckSquare,  label: 'Up to Date', value: summary.ok,        color: T.green  },
          { icon: Clock,        label: 'Due Soon',   value: summary.due_soon,   color: T.amber  },
          { icon: AlertOctagon, label: 'Overdue',    value: summary.overdue,    color: T.red    },
          { icon: Package,      label: 'No Records', value: summary.no_record,  color: T.muted  },
          { icon: TrendingUp,   label: 'Total Spend',value: `₹${(summary.totalCost).toLocaleString()}`, color: T.cyan },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={{ flex: 1, minWidth: 130, background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: T.muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>{label}</p>
                <p style={{ color, fontSize: typeof value === 'string' && value.length > 5 ? 16 : 26, fontWeight: 800, margin: 0 }}>{value}</p>
              </div>
              <div style={{ background: `${color}18`, borderRadius: 10, padding: 10 }}><Icon size={18} color={color} /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 20, alignItems: 'start' }}>

        {/* LEFT — Vehicle Fleet Status */}
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.muted }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vehicles…" style={{ width: '100%', padding: '8px 8px 8px 30px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(v => {
              const st  = getServiceStatus(v.id);
              const cfg = SVC_STATUS[st];
              const org = orgs.find(o => o.id === v.orgId);
              const last = getLastRecord(v.id);
              const recs = getRecords(v.id);
              const totalSpend = recs.reduce((s, r) => s + (r.cost || 0), 0);
              const dateDays = last?.nextServiceDate ? expiresInDays(last.nextServiceDate) : null;

              return (
                <div key={v.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = T.borderHi}
                  onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                >
                  <div style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <span style={{ color: T.accent, fontSize: 11, fontFamily: 'monospace', fontWeight: 700 }}>{v.plate}</span>
                          <span style={{ color: T.dim, fontSize: 11 }}>{org?.code}</span>
                        </div>
                        <p style={{ color: T.text, fontSize: 14, fontWeight: 700, margin: 0 }}>{v.name}</p>
                      </div>
                      <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}44`, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{cfg.label}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                      <div style={{ minWidth: 80 }}>
                        <p style={{ color: T.dim, fontSize: 10, margin: '0 0 2px', fontWeight: 600, textTransform: 'uppercase' }}>Odometer</p>
                        <p style={{ color: T.text, fontSize: 13, fontWeight: 600, margin: 0 }}>{v.km?.toLocaleString()} km</p>
                      </div>
                      <div style={{ minWidth: 80 }}>
                        <p style={{ color: T.dim, fontSize: 10, margin: '0 0 2px', fontWeight: 600, textTransform: 'uppercase' }}>Service Count</p>
                        <p style={{ color: T.text, fontSize: 13, fontWeight: 600, margin: 0 }}>{recs.length} records</p>
                      </div>
                      <div style={{ minWidth: 80 }}>
                        <p style={{ color: T.dim, fontSize: 10, margin: '0 0 2px', fontWeight: 600, textTransform: 'uppercase' }}>Total Spend</p>
                        <p style={{ color: T.cyan, fontSize: 13, fontWeight: 600, margin: 0 }}>₹{totalSpend.toLocaleString()}</p>
                      </div>
                      {last && (
                        <div style={{ minWidth: 80 }}>
                          <p style={{ color: T.dim, fontSize: 10, margin: '0 0 2px', fontWeight: 600, textTransform: 'uppercase' }}>Last Service</p>
                          <p style={{ color: T.muted, fontSize: 13, fontWeight: 600, margin: 0 }}>{last.date}</p>
                        </div>
                      )}
                    </div>

                    {last && last.nextServiceDate && (
                      <div style={{ background: `${cfg.color}0a`, border: `1px solid ${cfg.color}22`, borderRadius: 8, padding: '8px 12px', marginBottom: 10 }}>
                        <p style={{ color: T.dim, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 3px' }}>Next Service</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: T.text, fontSize: 12, fontWeight: 600 }}>{last.type} · {last.nextServiceDate}</span>
                          {dateDays !== null && (
                            <span style={{ color: cfg.color, fontSize: 11, fontWeight: 700 }}>
                              {dateDays < 0 ? `${Math.abs(dateDays)}d overdue` : `in ${dateDays}d`}
                            </span>
                          )}
                        </div>
                        {last.nextServiceKm > 0 && (
                          <div style={{ marginTop: 4 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                              <span style={{ color: T.dim, fontSize: 10 }}>KM progress to next service</span>
                              <span style={{ color: T.dim, fontSize: 10 }}>{v.km?.toLocaleString()} / {last.nextServiceKm?.toLocaleString()}</span>
                            </div>
                            <div style={{ height: 4, background: T.border, borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${Math.min(100, ((v.km - last.kmAtService) / (last.nextServiceKm - last.kmAtService)) * 100)}%`, background: cfg.color, borderRadius: 2, transition: 'width 0.4s' }} />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openDetail(v)} style={{ flex: 1, padding: '7px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, color: T.muted, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        <ClipboardList size={12} /> History
                      </button>
                      {canEdit && (
                        <button onClick={() => openAdd(v)} style={{ flex: 1, padding: '7px', background: T.accentBg, border: `1px solid ${T.accent}33`, borderRadius: 8, color: T.accent, cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                          <PlusCircle size={12} /> Log Service
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT — Recent Service Log */}
        <div style={{ position: 'sticky', top: 16 }}>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: T.text, fontSize: 14, fontWeight: 700 }}>Recent Service Log</span>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: '5px 10px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 6, color: T.muted, fontSize: 12, outline: 'none', cursor: 'pointer' }}>
                <option value="">All Types</option>
                {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ maxHeight: 600, overflowY: 'auto' }}>
              {allRecordsFiltered.length === 0 ? (
                <p style={{ color: T.dim, fontSize: 13, textAlign: 'center', padding: 32 }}>No service records found.</p>
              ) : allRecordsFiltered.map((rec, i) => {
                const v = mv.find(x => x.id === rec.vehicleId);
                return (
                  <div key={rec.id} style={{ padding: '12px 20px', borderBottom: i < allRecordsFiltered.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{SERVICE_ICONS[rec.type] || '🔧'}</span>
                        <div>
                          <p style={{ color: T.text, fontSize: 13, fontWeight: 600, margin: 0 }}>{rec.type}</p>
                          <p style={{ color: T.muted, fontSize: 11, margin: '1px 0 0' }}>{v?.name} · <span style={{ color: T.accent, fontFamily: 'monospace' }}>{v?.plate}</span></p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ color: T.cyan, fontSize: 13, fontWeight: 700, margin: 0 }}>₹{rec.cost?.toLocaleString()}</p>
                        <p style={{ color: T.dim, fontSize: 11, margin: '2px 0 0' }}>{rec.date}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginBottom: rec.notes ? 4 : 0 }}>
                      <span style={{ color: T.dim, fontSize: 11 }}>@ {rec.kmAtService?.toLocaleString()} km</span>
                      {rec.technician && <span style={{ color: T.dim, fontSize: 11 }}>· {rec.technician}</span>}
                    </div>
                    {rec.notes && <p style={{ color: T.muted, fontSize: 11, margin: '3px 0 0', fontStyle: 'italic' }}>{rec.notes}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Log Service Modal ─────────────────────────────────────────────────── */}
      {modal === 'add' && selVehicle && (
        <Modal title={`Log Service — ${selVehicle.name}`} onClose={() => setModal(null)}>
          <div style={{ background: T.bg, borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 16 }}>
            <div><p style={{ color: T.dim, fontSize: 10, margin: '0 0 2px', fontWeight: 700, textTransform: 'uppercase' }}>PLATE</p><p style={{ color: T.accent, fontFamily: 'monospace', fontSize: 13, fontWeight: 700, margin: 0 }}>{selVehicle.plate}</p></div>
            <div><p style={{ color: T.dim, fontSize: 10, margin: '0 0 2px', fontWeight: 700, textTransform: 'uppercase' }}>ODOMETER</p><p style={{ color: T.text, fontSize: 13, fontWeight: 600, margin: 0 }}>{selVehicle.km?.toLocaleString()} km</p></div>
          </div>
          <Field label="Service Type"       value={form.type}           onChange={v => setForm(f => ({ ...f, type: v }))}           options={SERVICE_TYPES} />
          <Field label="Service Date"       value={form.date}           onChange={v => setForm(f => ({ ...f, date: v }))}           type="date" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="KM at Service"    value={form.kmAtService}    onChange={v => setForm(f => ({ ...f, kmAtService: v }))}    type="number" placeholder="0" />
            <Field label="Cost (₹)"         value={form.cost}           onChange={v => setForm(f => ({ ...f, cost: v }))}           type="number" placeholder="0" />
          </div>
          <Field label="Technician"         value={form.technician}     onChange={v => setForm(f => ({ ...f, technician: v }))}     placeholder="Name of mechanic / workshop" />
          <Field label="Notes"              value={form.notes}          onChange={v => setForm(f => ({ ...f, notes: v }))}          placeholder="Parts replaced, observations…" />
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14, marginTop: 4 }}>
            <p style={{ color: T.text, fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Next Service Schedule</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Next Service KM"   value={form.nextServiceKm}   onChange={v => setForm(f => ({ ...f, nextServiceKm: v }))}   type="number" placeholder="e.g. 20000" />
              <Field label="Next Service Date"  value={form.nextServiceDate}  onChange={v => setForm(f => ({ ...f, nextServiceDate: v }))}  type="date" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={saveService} disabled={!form.type || !form.date}><Wrench size={14} /> Log Service</Btn>
          </div>
        </Modal>
      )}

      {/* ── Vehicle History Modal ─────────────────────────────────────────────── */}
      {modal === 'detail' && selVehicle && (
        <Modal title={`Service History — ${selVehicle.name}`} onClose={() => setModal(null)} wide>
          <div style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
            {[
              { label: 'Total Records', value: getRecords(selVehicle.id).length, color: T.blue },
              { label: 'Total Spend',   value: `₹${getRecords(selVehicle.id).reduce((s,r)=>s+(r.cost||0),0).toLocaleString()}`, color: T.cyan },
              { label: 'Last Service',  value: getLastRecord(selVehicle.id)?.date || '—', color: T.green },
              { label: 'Odometer',      value: `${selVehicle.km?.toLocaleString()} km`, color: T.accent },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ flex: 1, minWidth: 100, background: T.bg, borderRadius: 10, padding: '12px 16px' }}>
                <p style={{ color: T.dim, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 4px' }}>{label}</p>
                <p style={{ color, fontSize: 15, fontWeight: 800, margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>
          {getRecords(selVehicle.id).length === 0 ? (
            <p style={{ color: T.dim, fontSize: 13, textAlign: 'center', padding: 32 }}>No service records for this vehicle yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.border}` }}>
              {getRecords(selVehicle.id).map((rec, i) => (
                <div key={rec.id} style={{ padding: '14px 18px', background: i % 2 === 0 ? T.card : T.bg, display: 'flex', gap: 16, alignItems: 'center' }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{SERVICE_ICONS[rec.type] || '🔧'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                      <p style={{ color: T.text, fontSize: 14, fontWeight: 700, margin: 0 }}>{rec.type}</p>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <span style={{ color: T.muted, fontSize: 12 }}>{rec.date}</span>
                        <span style={{ color: T.cyan, fontSize: 14, fontWeight: 700 }}>₹{rec.cost?.toLocaleString()}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                      <span style={{ color: T.dim, fontSize: 12 }}>📍 {rec.kmAtService?.toLocaleString()} km</span>
                      {rec.technician && <span style={{ color: T.dim, fontSize: 12 }}>👤 {rec.technician}</span>}
                      {rec.nextServiceDate && <span style={{ color: T.muted, fontSize: 12 }}>→ Next: {rec.nextServiceDate}</span>}
                    </div>
                    {rec.notes && <p style={{ color: T.muted, fontSize: 12, margin: '4px 0 0', fontStyle: 'italic' }}>{rec.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default function FleetApp() {
  useEffect(() => {
    const link  = document.createElement('link');
    link.href   = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap';
    link.rel    = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const [currentUser, setCurrentUser] = useState(null);
  const [page,        setPage]        = useState('dashboard');
  const [orgs,        setOrgs]        = useState(ORGS0);
  const [vehicles,    setVehicles]    = useState(VEHICLES0);
  const [schedules,   setSchedules]   = useState(SCHEDULES0);
  const [users,       setUsers]       = useState(USERS0);
  const [ownership,   setOwnership]   = useState(OWNERSHIP0);
  const [insurance,   setInsurance]   = useState(INSURANCE0);
  const [maintenance, setMaintenance] = useState(MAINTENANCE0);
  const [apiUrl,      setApiUrl]      = useState('http://localhost:8000');
  const [connected,   setConnected]   = useState(false);
  const [telemetry,   dispatch]       = useReducer(telemetryReducer, undefined, initTelemetry);

  useEffect(() => {
    const ping = async () => {
      try {
        const r = await abortableFetch(`${apiUrl}/`);
        setConnected(r.ok);
      } catch {
        setConnected(false);
      }
    };
    ping();
    const t = setInterval(ping, 10000);
    return () => clearInterval(t);
  }, [apiUrl]);

  useEffect(() => {
    const t = setInterval(() => {
      dispatch({ timestamp: new Date().toISOString() });
    }, 2000);
    return () => clearInterval(t);
  }, []);

  // ⚠ liveAlerts must be computed BEFORE any conditional return (Rules of Hooks: no hooks after conditional)
  const liveAlerts = Object.values(telemetry.sim).filter(s => s.activeAnomaly).length;

  if (!currentUser) {
    return <LoginScreen onLogin={u => { setCurrentUser(u); setPage('dashboard'); }} />;
  }

  const p = { user: currentUser, orgs, vehicles, schedules, users, setOrgs, setVehicles, setSchedules, setUsers, ownership, setOwnership, insurance, setInsurance, maintenance, setMaintenance };

  const renderPage = () => {
    switch (page) {
      case 'dashboard':     return <Dashboard     {...p} simState={telemetry.sim} />;
      case 'telemetry':     return <TelemetryPage simState={telemetry.sim} history={telemetry.history} apiUrl={apiUrl} setApiUrl={setApiUrl} connected={connected} />;
      case 'map':           return <MapPage simState={telemetry.sim} />;
      case 'vehicles':      return <VehiclesPage  {...p} />;
      case 'identity':      return <IdentityPage  {...p} />;
      case 'maintenance':   return <MaintenancePage {...p} />;
      case 'schedules':     return <SchedulesPage {...p} />;
      case 'organizations': return <OrgsPage      {...p} />;
      case 'users':         return <UsersPage     {...p} />;
      case 'reports':       return <ReportsPage   {...p} history={telemetry.history} />;
      default:              return <Dashboard     {...p} simState={telemetry.sim} />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: T.bg, fontFamily: '"Outfit",system-ui,sans-serif', color: T.text, overflow: 'hidden' }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        *,*::before,*::after { box-sizing: border-box; }
        html,body,#root { height:100%; margin:0; }
        .leaflet-container { background: #0d1b2e !important; }
        .leaflet-tile-pane { filter: invert(100%) hue-rotate(180deg) brightness(90%) saturate(120%); }
        .leaflet-marker-pane, .leaflet-overlay-pane, .leaflet-shadow-pane,
        .leaflet-popup-pane, .leaflet-control-container { filter: none !important; }
        .leaflet-control-attribution { background: rgba(6,16,31,0.85) !important; color: #94a3b8 !important; font-size: 10px !important; }
        .leaflet-control-attribution a { color: #60a5fa !important; }
        .leaflet-control-zoom a { background: #0c1524 !important; color: #94a3b8 !important; border-color: rgba(148,163,184,0.2) !important; line-height:28px !important; }
        .leaflet-control-zoom a:hover { background: #111e30 !important; color: #e2e8f0 !important; }
        .leaflet-div-icon { background: none !important; border: none !important; }
      `}</style>
      <Sidebar user={currentUser} page={page} setPage={setPage} onLogout={() => setCurrentUser(null)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopBar page={page} user={currentUser} alerts={liveAlerts} />
        <main style={{ flex: 1, overflow: page === 'map' ? 'hidden' : 'auto', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
