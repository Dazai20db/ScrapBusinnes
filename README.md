# ReviveIndustrial 🏭♻️

**ReviveIndustrial** is a B2B circular marketplace and logistics coordination platform designed for Indian manufacturing hubs (Chakan-Pune, Peenya-Bengaluru, Oragadam-Chennai, Manesar-Gurugram, Sanand-Gujarat, and Jamshedpur). It connects industrial scrap and surplus sellers with verified buyers, while dynamically pairing cargo with empty-return freight trucks to dramatically lower logistics overhead and carbon emissions.

---

## 🌟 Key Features

### 1. Transparent 5% Commission Policy
ReviveIndustrial maintains an equitable, transparent **5% flat platform fee** across all participants:
- **Sellers:** 5% liquidation fee deducted from the material sale price.
- **Buyers:** 5% material facilitation and digital escrow verification fee added to the subtotal.
- **Transporters:** 5% logistics coordination fee on the agreed freight value.
- **Acceptance & Calculator:** A top-of-site acceptance banner (`CommissionTopTab`) and interactive calculation modal (`CommissionTermsModal`) allow parties to test exact fee breakdowns, GST, and net payouts prior to transacting.

### 2. Buyer-Controlled Truck Selection & Booking
- **No Direct Forced Assignment:** When purchasing an industrial scrap lot, logistics are never auto-assigned without buyer approval.
- **Empty-Return Haul Matching:** Buyers can browse a verified fleet of commercial haulers (Tata Prima, BharatBenz, Ashok Leyland) that are returning empty on key industrial corridors.
- **Corridor Discounts:** Up to 40% backhaul discounts for taking cargo on existing return routes.
- **Interactive Booking:** Buyers inspect truck type, capacity, current corridor route, driver rating, transit ETA, and book their preferred truck directly from the lot view or cart.

### 3. Industrial Quality Grading Rubric (Grade A / B / C)
- **Grade A (Near-Prime Surplus):** Factory overstock or offcuts with 0% oxidation and mill test certificates (MTC). Ready for direct secondary stamping or fabrication.
- **Grade B (Industrial Scrap):** Segregated stamping scrap or machine turnings with minor surface oxidation. Requires minor processing/shearing before reuse.
- **Grade C (Remelt / Salvage):** Mixed foundry salvage and heavy machinery turnings designated for furnace remelting.

### 4. Corridor Freight Matrix & Landed Cost Optimizer
- Real-time transit cost benchmarks (₹/MT-km) across key Indian industrial corridors.
- Economic viability threshold checker: alerts buyers if transport cost exceeds circular economic limits (>15%–22% of total material value).
- CO₂ emissions reduction tracker showing kilograms of carbon avoided by filling empty backhauls instead of commissioning dedicated empty runs.

### 5. Seller Portal & GST/e-Way Bill Verification
- Instant material valuation and HSN code classification with 18% GST calculation.
- Automated GSTIN & PAN regex verification with jurisdiction corridor mapping.
- Digital dispatch documentation and e-Way Bill compliance checking.

---

## 🛠️ Tech Stack

- **Frontend Framework:** React 19 (TypeScript)
- **Bundler & Build Tool:** Vite
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite` and `@import "tailwindcss";`)
- **Icons:** Lucide React (`lucide-react`)
- **Backend Server:** Node.js + Express (`server.ts`) via `tsx`
- **AI & Metallurgical Valuation:** `@google/genai` (Gemini 3.8 Flash) with a deterministic domain-rules fallback engine when offline.

---

## 📂 Project Structure

```text
├── index.html                   # HTML entry point with metadata and fonts
├── package.json                 # Dependencies and npm run scripts
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite configuration with Tailwind CSS plugin
├── server.ts                    # Express API server (port 3000) & Vite middleware
├── src/
│   ├── main.tsx                 # Client application entry point
│   ├── App.tsx                  # Core app layout, navigation, role switching & modals
│   ├── index.css                # Global styles and Tailwind imports
│   ├── types.ts                 # TypeScript interfaces (ScrapItem, Truck, Corridor, etc.)
│   ├── data/
│   │   └── mockData.ts          # Seed data for industrial lots, corridors, and trucks
│   └── components/
│       ├── CommissionTopTab.tsx      # Sticky 5% commission notice & agreement bar
│       ├── CommissionTermsModal.tsx  # Interactive 5% commission fee calculator
│       ├── Navbar.tsx                # Main navigation with search, role toggle, and cart
│       ├── RoleContextBar.tsx        # Role switcher (Buyer / Seller / Transporter)
│       ├── HeroBanner.tsx            # Corridor statistics and circular mission hero
│       ├── CatalogView.tsx           # Scrap & surplus catalog with filters and truck booking
│       ├── ItemDetailModal.tsx       # Lot details, specs, and truck selection modal
│       ├── AllocationsModal.tsx      # Buyer order summary and freight allocation review
│       ├── SellerPortal.tsx          # Material listing form with AI/rule quality grader
│       ├── TransporterHub.tsx        # Fleet management and empty-run route registration
│       ├── CorridorMatrix.tsx        # Inter-city freight calculator & landed cost analyzer
│       ├── GradingRubricView.tsx     # Guide to Grade A/B/C quality specifications
│       ├── CO2ImpactChart.tsx        # Visual metrics on emissions and waste diverted
│       ├── IndustrialGraphic.tsx     # Responsive vector diagrams for corridors
│       └── Footer.tsx                # Platform disclaimer, corridors, and documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or bun

### Installation

1. Clone or download the repository into your local workspace.
2. Install dependencies:
   ```bash
   npm install
   ```

### Development Server

Run the development server with hot reload and the Express API server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Type Checking & Linting

Verify TypeScript types across the codebase:
```bash
npm run lint
```

### Production Build

Create an optimized production bundle:
```bash
npm run build
```

Run the built application:
```bash
npm start
```

---

## 🛡️ License & Platform Guidelines

- All materials listed on ReviveIndustrial comply with the Central Pollution Control Board (CPCB) and State Pollution Control Board (SPCB) guidelines for recyclable industrial non-hazardous scrap.
- Commercial transporters must possess valid RTO commercial permits, active FASTag, and e-Way bill compliance.
