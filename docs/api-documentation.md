# API Documentation — Travel & Tourism Management System

All endpoints communicate via JSON using standard HTTP status codes.

Base URL: `http://localhost:8080/api`

---

## 1. Authentication Endpoints

### Register Tourist
- **Method**: `POST`
- **Path**: `/auth/register`
- **Body**:
  ```json
  {
    "role": "TOURIST",
    "email": "tourist@example.com",
    "password": "Password@123",
    "fullName": "John Doe",
    "phone": "+91 9876543210"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "data": {
      "token": "encoded_hmac_token",
      "user": { "userId": 5, "email": "tourist@example.com", "role": "TOURIST" }
    }
  }
  ```

### Register Travel Operator
- **Method**: `POST`
- **Path**: `/auth/register`
- **Body**: Includes `role: "OPERATOR"`, `companyName`, `licenseNumber`, `yearsInBusiness`, `officeAddress`, `supportPhone`.

### Login
- **Method**: `POST`
- **Path**: `/auth/login`
- **Body**: `{ "email": "...", "password": "..." }`
- **Response** (`200 OK`): Token and user object.

### Current User Profile
- **Method**: `GET`
- **Path**: `/auth/me`
- **Header**: `Authorization: Bearer <token>`

---

## 2. Destinations & Attractions

### List Destinations
- **Method**: `GET`
- **Path**: `/destinations?search=&season=&maxBudget=&featured=`

### Destination Details
- **Method**: `GET`
- **Path**: `/destinations/{id}`

### List Attractions
- **Method**: `GET`
- **Path**: `/attractions?destinationId={id}&categoryId={optional}`

---

## 3. Packages & Departures

### Browse Public Packages
- **Method**: `GET`
- **Path**: `/packages?destination=&durationDays=&maxPrice=&search=`

### Package Details
- **Method**: `GET`
- **Path**: `/packages/{id}`
- **Response**: Includes package details, day-wise itineraries, and available departures.

### Operator: Create Package
- **Method**: `POST`
- **Path**: `/operator/packages`
- **Header**: `Authorization: Bearer <operator_token>`

---

## 4. Smart Travel Planner

### Generate Itinerary
- **Method**: `POST`
- **Path**: `/planner/generate`
- **Body**:
  ```json
  {
    "destinationId": 1,
    "startingLocation": "Bhimavaram",
    "travelDays": 3,
    "numTravelers": 2,
    "totalBudget": 10000.0,
    "interests": ["Beach", "Nature", "Heritage"],
    "travelPace": "BALANCED",
    "preferredTransport": "CAR"
  }
  ```
- **Response**: Day-wise morning/afternoon/evening schedule, transit intervals, Dijkstra-optimized route, and budget feasibility breakdown.

### Save Itinerary
- **Method**: `POST`
- **Path**: `/planner/save`
- **Header**: `Authorization: Bearer <token>`

---

## 5. Bookings & Reviews

### Create Booking
- **Method**: `POST`
- **Path**: `/bookings`
- **Header**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "departureId": 3,
    "numTravelers": 2,
    "paymentMethod": "CARD_SIMULATED",
    "specialRequests": "Ocean-facing room",
    "travelers": [
      { "fullName": "Rahul Sharma", "age": 28, "gender": "MALE", "idProofType": "AADHAAR", "idProofNumber": "XXXX-4512" },
      { "fullName": "Ananya Sharma", "age": 26, "gender": "FEMALE", "idProofType": "AADHAAR", "idProofNumber": "XXXX-8921" }
    ]
  }
  ```

### Cancel Booking
- **Method**: `POST`
- **Path**: `/bookings/{id}/cancel`
- **Header**: `Authorization: Bearer <token>`
- **Body**: `{ "reason": "Change of plans" }`

### Submit Review
- **Method**: `POST`
- **Path**: `/reviews`
- **Header**: `Authorization: Bearer <token>`
- **Body**: `{ "packageId": 5, "rating": 5, "reviewTitle": "...", "comment": "..." }`

