# System Architecture & Design Specification

## 1. Architectural Style
The application employs a **Layered Monolithic Architecture** with pure separation of concerns across presentation, business logic, data persistence, and algorithmic graph computation:

```
+--------------------------------------------------------------------------+
|                  React.js Presentation Layer                             |
|  * Travivu Consumer UI (Explore, Booking, Smart Planner Wizard)           |
|  * Gotrips Operator Dashboard (Package Mgmt, Inventory, Bookings)         |
+--------------------------------------------------------------------------+
                                    |
                                    | REST / JSON over HTTP
                                    v
+--------------------------------------------------------------------------+
|                  Pure Core Java HttpServer (Port 8080)                   |
|  * ThreadPool Executor (16 Worker Threads)                               |
|  * HttpUtils & Zero-Dependency JsonParser                                |
|  * AuthFilter (HMAC-SHA256 Token Validator & RBAC Guard)                 |
+--------------------------------------------------------------------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
            v                                               v
+-----------------------+                       +-----------------------+
|    Service Layer      |                       | Smart Planner Engine  |
| * AuthService         |                       | * AttractionGraph     |
| * PackageService      |                       | * DijkstraRouter      |
| * BookingService      |                       | * TSPOrderOptimizer   |
| * DestinationService  |                       | * BudgetEstimator     |
+-----------------------+                       +-----------------------+
            |                                               |
            +-----------------------+-----------------------+
                                    |
                                    v
+--------------------------------------------------------------------------+
|                  Repository Layer (Pure JDBC)                            |
|  * PreparedStatement (SQL Injection Immune)                              |
|  * Atomic Transaction Demarcation (setAutoCommit(false))                 |
|  * Concurrency Locking (Conditional Updates & Row Level Safety)          |
+--------------------------------------------------------------------------+
                                    |
                                    v
+--------------------------------------------------------------------------+
|                  MySQL 8.0 Relational Database                           |
|  * 18 Normalized Tables (3NF)                                            |
|  * Foreign Key Referential Integrity & Unique Indexes                    |
+--------------------------------------------------------------------------+
```

## 2. Algorithmic Breakdown (Smart Planner)
- **Time Complexity of Dijkstra**: $\mathcal{O}((V + E) \log V)$ using a binary min-heap (`PriorityQueue`).
- **Time Complexity of TSP 2-Opt Heuristic**: $\mathcal{O}(M^2)$ per day, where $M$ is the number of attractions visited in a single day (typically $2 \le M \le 5$). Since $M$ is small, 2-Opt runs in sub-millisecond execution time while eliminating crossed travel segments.

