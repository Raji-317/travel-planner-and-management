# Travivu & Gotrips: Travel & Tourism Management System with Smart Travel Planner

A full-stack, responsive, and robust **Travel & Tourism Management System with a Smart Travel Planner**, engineered to academic computer science standards and production software engineering practices.

Developed with **Pure Core Java (SE)**, Java's built-in `com.sun.net.httpserver.HttpServer`, **JDBC**, **MySQL**, and **React.js**.

---

## 1. Technology Requirements & Architecture

### Backend (Strict Core Java)
- **Runtime**: Pure Java SE (Java 17 / 21 / 25 compatible).
- **HTTP Server**: Java's built-in `com.sun.net.httpserver.HttpServer` with a 16-thread fixed executor pool.
- **Persistence**: Raw JDBC with `PreparedStatement` and manual transaction demarcation (`setAutoCommit(false)`, `commit()`, `rollback()`).
- **External JARs**: Official `mysql-connector-j-8.3.0.jar` (configured in `backend/lib/`).
- **JSON Processing**: Zero-dependency, pure-Java JSON serializer and recursive-descent parser (`JsonParser.java`).
- **Security**: Cryptographic password hashing using `PBKDF2WithHmacSHA512` with random salts, plus stateless `HMAC-SHA256` authentication tokens.
- **Strictly Prohibited & Excluded**: No Spring Boot, no Spring Framework, no Hibernate, no JPA, no Maven, no Gradle, no Express.js.

### Frontend
- **Framework**: React.js 19 with React Router v7.
- **Design System**: Faithful reproduction of the reference screens:
  - **Travivu (Consumer/Tourist Experience)**: Sticky navbar, panoramic ocean hero banner, floating pill search widget (`Location`, `Trip Type`, `Duration`, `Price`), trust badges, 5-card destination layout with heart bookmarks and star rating overlays.
  - **Gotrips (Operator & Admin Management Portal)**: Soft warm canvas (`#F7F4ED`), pill navigation bar (`Dashboard`, `Bookings`, `Packages`), `+ Add New Package` action bar, grid/list view switcher, country filters, and frosted tour package cards with durations, price in gold, and booking totals.
- **Icons**: Lucide React.
- **Responsiveness**: Complete mobile, tablet, and widescreen desktop layout.

---

## 2. Smart Travel Planner — Algorithmic Innovation

The Smart Travel Planner creates a personalized, day-wise travel itinerary based on tourist input rather than static mockups.

### Algorithmic Pipeline
1. **Attraction Scoring Function**:
   $$\text{Score}(A) = w_1 \cdot \text{CategoryMatch}(A, \text{Interests}) + w_2 \cdot \text{Popularity}(A) - w_3 \cdot \left(\frac{\text{TicketPrice}(A)}{\text{DailyBudget}}\right)$$
2. **Geographic Proximity Partitioning**:
   - Groups top candidate attractions into clusters across travel days based on spatial proximity, preventing tourists from zigzagging across the city on the same day.
3. **Intra-Day Route Optimization (Dijkstra + 2-Opt TSP)**:
   - Evaluates travel times between attractions using stored distance/transit matrices.
   - Applies Dijkstra's algorithm for shortest-path transit times.
   - Refines visiting sequences via 2-Opt local search to eliminate intersecting paths.
4. **Time Window Scheduling**:
   - Assigns visits into **Morning**, **Afternoon**, and **Evening** slots.
   - Accounts for operating hours, estimated visit durations, transit intervals, and mid-day meal breaks.
5. **Itemized Trip Budget Estimation**:
   - Calculates expenses for **Transport**, **Accommodation**, **Food**, and **Entry Tickets**.
   - Evaluates total cost against target budget and provides feasibility feedback.

---

## 3. Concurrency & Overbooking Protection

To prevent overbooking when multiple tourists attempt to book the final available seats simultaneously:
```sql
UPDATE package_departures 
SET available_slots = available_slots - ? 
WHERE departure_id = ? AND available_slots >= ?;
```
If rows updated equals `0`, the transaction rolls back cleanly, throwing an insufficient slot exception before any reservation records are written.

---

## 4. User Roles & Demo Credentials

| Role | Email | Password | Access / Capabilities |
| :--- | :--- | :--- | :--- |
| **Tourist** | `tourist@gmail.com` | `Password@123` | Search, book packages, run smart planner, manage bookings, write reviews |
| **Operator** | `operator@gotrips.com` | `Password@123` | Create packages, set itineraries, manage departure seat inventories |
| **Admin** | `admin@travivu.com` | `Password@123` | Verify/approve operators, inspect platform revenue, manage users |

*Note: You can also register new accounts directly from the UI.*

---

## 5. Project Directory Structure

```
Travel-Tourism-System/
|-- backend/
|   |-- lib/
|   |   +-- mysql-connector-j-8.3.0.jar      (JDBC Driver)
|   |-- out/                                 (Compiled .class bytecode)
|   |-- sources.txt                          (Generated compilation manifest)
|   |-- build.ps1                            (Windows PowerShell compilation script)
|   |-- run.ps1                              (Windows PowerShell server startup script)
|   |-- src/
|       +-- com/travel/
|           |-- Main.java                    (Server bootstrap on port 8080)
|           |-- config/                      (DatabaseConfig & ServerConfig)
|           |-- model/                       (User, Package, Booking, Itinerary POJOs)
|           |-- repository/                  (Pure JDBC PreparedStatements)
|           |-- service/                     (Business logic & transactions)
|           |-- controller/                  (HttpServer endpoint handlers)
|           |-- security/                    (PBKDF2 Hasher, HMAC TokenService, AuthFilter)
|           |-- planner/                     (Graph, Dijkstra, 2-Opt TSP, BudgetEstimator)
|           |-- util/                        (Zero-dependency JsonParser & HttpUtils)
|           |-- exception/                   (AppException & ValidationException)
|           |-- test/                        (SystemTest.java pure Java test suite)
|
|-- frontend/
|   |-- src/
|   |   |-- api/                             (apiClient.js)
|   |   |-- context/                         (AuthContext.jsx)
|   |   |-- components/                      (Navbar, HeroSearch, Cards, Modals, Footer)
|   |   |-- pages/                           (Home, Destinations, Packages, Planner, Dashboards)
|   |   |-- styles/                          (App.css - Travivu & Gotrips styling)
|   |   |-- App.jsx, main.jsx
|   |-- package.json, vite.config.js
|
|-- database/
|   |-- schema.sql                           (18 normalized tables with foreign keys & indexes)
|   |-- sample_data.sql                      (Seed destinations, attractions, distance matrix, tours)
|
|-- docs/
|   |-- architecture.md
|   |-- api-documentation.md
|   |-- database-design.md
|
|-- README.md
```

---

## 6. Step-by-Step Setup & Execution Guide

### Prerequisites
1. **Java Development Kit (JDK 17 or higher)** (`javac -version`, `java -version`).
2. **MySQL Server 8.0+** running on `localhost:3306`.
3. **Node.js 18+ and npm** (`node -v`, `npm -v`).

---

### Step 1: Database Initialization
Open Windows PowerShell and run:
```powershell
cd c:\Users\rajya\OneDrive\Desktop\travel\database

# Method A: Automatic PowerShell Script (Recommended)
.\init_db.ps1

# OR Method B: Direct PowerShell Pipe Commands
Get-Content schema.sql -Raw -Encoding UTF8 | mysql -u root -p
Get-Content sample_data.sql -Raw -Encoding UTF8 | mysql -u root -p travel_planner_db

# OR Method C: Using cmd.exe
cmd.exe /c "mysql -u root -p < schema.sql"
cmd.exe /c "mysql -u root -p travel_planner_db < sample_data.sql"
```

---

### Step 2: Compile & Run Pure Java Backend
In Windows PowerShell:
```powershell
cd c:\Users\rajya\OneDrive\Desktop\travel\backend

# Compile all Java sources using javac (without Maven/Gradle)
.\build.ps1

# Run the unit test suite
java -cp "out;lib/*" com.travel.test.SystemTest

# Start the HttpServer on port 8080
.\run.ps1
```
*Health Check endpoint: [http://localhost:8080/api/health](http://localhost:8080/api/health)*

---

### Step 3: Run React Frontend Development Server
In a second Windows PowerShell terminal:
```powershell
cd c:\Users\rajya\OneDrive\Desktop\travel\frontend

# Start Vite React server
npm run dev
```
Open your browser at **[http://localhost:5173](http://localhost:5173)** to explore the system!

---

## 7. Built-in Test Suite Verification

Run the test suite directly from the command line:
```powershell
java -cp "out;lib/*" com.travel.test.SystemTest
```

Expected output:
```text
==================================================================
   PURE JAVA SYSTEM & ALGORITHM TEST SUITE (ZERO FRAMEWORKS)      
==================================================================
[TEST 1] PBKDF2 Password Hashing & Salt Verification: PASSED
[TEST 2] HMAC-SHA256 Stateless Token Authentication: PASSED
[TEST 3] Zero-Dependency JsonParser Engine: PASSED
[TEST 4] Dijkstra Shortest Path & 2-Opt TSP Route Ordering: PASSED
[TEST 5] Dynamic Budget Feasibility & Cost Estimator: PASSED
==================================================================
   TEST EXECUTION SUMMARY: 5 PASSED, 0 FAILED
==================================================================
```

