# FarmPulse | Farm Operations, Water Management & Resource Allocation Platform

FarmPulse is an elite, production-ready agricultural resource operations platform designed for precision irrigation tracking, SI-compliant chemical formulation calculations, Open-Meteo agricultural telemetry with drift hazard intelligence, and operational expense burn-rate analytics.

---

## 🌟 Key Functional Pillars

### 1. Geospatial Field & Plot Manager (`/fields`)
- Full CRUD operations to create, inspect, edit, and delete agricultural plots.
- **Interactive Leaflet Map:**
  - Tile switcher: High-resolution OpenStreetMap vs Esri World Imagery Satellite layers.
  - Pin-drop coordinate picker: Click anywhere on the map to pinpoint GPS coordinates for new plots.
  - Boundary polygon overlays and interactive plot overview cards displaying crop type, acreage, and aggregate historical metrics.
- Global field context selector in the status bar to toggle between whole-farm aggregation and plot-specific focus.

### 2. Dual-Water Irrigation Engine (`/irrigation`)
- **Strict Separation:**
  - **Normal Water:** Tube well, borewell, canal, or rainwater harvest reservoir.
  - **Liquid Water:** Nutrient-enriched solutions, fertigation blends, biological slurry, or liquid compost extracts.
- **Automated Duration & Volume Calculation:**
  - Computes run duration from Start Time and End Time (gracefully handles overnight transitions).
  - Pure SI pump discharge formulas:
    $$\text{Volume (L)} = \text{Duration (min)} \times \text{Pump Flow Rate (L/min)}$$
  - Pre-calibrated motor horsepower discharge presets (3.0 HP @ 450 L/min, 5.0 HP @ 750 L/min, 7.5 HP @ 1,125 L/min, 10.0 HP @ 1,500 L/min, 15.0 HP @ 2,250 L/min) or custom flow rate override.
  - Delivery system modes: Drip, Micro-Sprinkler, and Furrow/Flood.

### 3. Pesticide Engine with SI Unit Conversion & Calculation (`/pesticides`)
- **Dynamic SI Concentration Unit Engine:**
  - **Liquid Formulations:** `mL/L` and `L/L`
  - **Dry Powder / Granular Formulations:** `g/L` and `kg/L`
- **Reactive Formulation Dosing Math:**
  $$\text{Net Active Chemical} = \text{Spray Tank Volume (L)} \times \text{Dosage Rate}$$
  - Live auto-normalization of scalable display units:
    - Liquid: $\ge 1,000 \text{ mL} \leftrightarrow \text{Liters (L)}$
    - Dry Powder: $\ge 1,000 \text{ g} \leftrightarrow \text{Kilograms (kg)}$
- **Search & Compliance Feed:**
  - Full-text fuzzy search filtering by chemical name, target pest, or plot.
  - Day-by-day click calendar filtering.
  - **Daily Usage Rollup:** Real-time banner computing total chemical spray mix (L), active liquid chemical (L), and active dry powder (kg) applied across the farm on any selected date.

### 4. Daily Farm Expenditures & Burn-Rate Tracker (`/expenses`)
- Categorized operational spend tracking:
  - **Labour:** Built-in calculator ($\text{Headcount} \times \text{Daily Wage}$) with operation logging (weeding, harvesting, pruning).
  - **Fuel:** Fuel metering calculator ($\text{Liters} \times \text{Price/Liter}$) for tractors, pumps, and generators.
  - **Inputs & Pesticides:** Commercial acquisition and chemical billing.
  - **Machinery Maintenance:** Drip pipe repairs, valve replacements, motor servicing.
- **Real-Time Financial Analytics:**
  - Total farm expenditure to-date.
  - Current month spend and daily average burn rate.
  - **Projected Monthly Burn:** Statistical extrapolation for seasonal budgeting.
  - Field-wise cost allocations and categorized percentage progress bars.

### 5. Weather & Agricultural Drift Intelligence
- **Zero-Key Open-Meteo Integration:**
  - Live coordinates-based telemetry: Ambient temperature, relative humidity, wind speed, wind direction, precipitation, and rain probability.
- **Drift Hazard & Washout Assessment Matrix:**
  - **Optimal Window (Green):** Wind $3 - 15 \text{ km/h}$, Humidity $40\% - 80\%$, Rain $< 10\%$.
  - **Atmospheric Inversion Warning (Yellow):** Wind $< 3 \text{ km/h}$ (temperature inversions trap fine droplets that drift uncontrollably).
  - **Evaporation Risk (Yellow):** Humidity $< 40\%$ (fine droplets evaporate before canopy contact).
  - **Severe Drift Hazard (Red):** Wind $> 20 \text{ km/h}$.
  - **Washout Risk (Red):** Precipitation $> 0.2 \text{ mm}$ or rain probability $\ge 40\%$.

---

## 🛠️ Technology Stack
- **Framework:** Next.js 14 (App Router, Server Actions, TypeScript)
- **Database & ORM:** Prisma ORM with SQLite (zero-config local persistence, switchable to PostgreSQL via `DATABASE_URL`)
- **State Management:** Zustand (reactive form calculation states, active field focus, filters)
- **Styling:** Tailwind CSS with daylight agricultural palette (serene greens, soft sky blues, gentle sage neutrals)
- **Geospatial & Mapping:** Leaflet & React-Leaflet with OpenStreetMap and Satellite tile layers
- **Icons:** Lucide React

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Seed
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
