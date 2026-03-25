# TaskHub

**TaskHub** is a next-generation mobile marketplace connecting users with local task-runners. Unlike standard gig apps, TaskHub prioritizes **Trust & Safety** through an advanced, automated behavioral analysis engine.

Built with **React Native (Expo)** and a **Node.js (Express 5)** backend, this project demonstrates scalable architecture, real-time features, and security-first engineering.

---

## 🚀 Why This Project Stands Out

Beyond standard CRUD features, TaskHub implements complex business logic and security mechanisms found in enterprise-level applications:

### 🛡️ 1. Trust & Reliability Engine
The system doesn't just store users; it actively assigns a **Trust Score** to every participant based on behavioral signals:
- **Automated Penalties:** Automatically degrades score for suspicious activity (e.g., creating 3+ accounts from the same IP).
- **Verified Status:** Higher trust scores unlock "Pro" and "Verified" badges.
- **Dispute Resolution:** Integrated workflow for handling task disputes and arbitration.

### 🔒 2. Advanced Security Layer
Implements "invisible" security features to protect the marketplace:
- **Device Fingerprinting:** Tracks unique `device-id` to detect account farming.
- **Security Logging:** automatically logs critical security events (e.g., `DEVICE_MISMATCH` when a login occurs from a new device).
- **IP Mismatch Detection:** Alerts the system when a user's location abruptly changes, preventing account takeovers.

### 📊 3. Comprehensive Admin Dashboard
A feature-rich administrative portal included in the app:
- **Real-time Analytics:** Charts covering revenue, task completion rates, and user growth.
- **Risk Management:** Dedicated view for "Risky Jobs" and "Flagged Users" requiring manual review.
- **User Management:** Granular control to ban users, adjust trust scores, or resolve disputes.

---

## 🛠️ Tech Stack

### Mobile Frontend (`/TaskHubApp`)
*   **Framework:** React Native 0.81 with **Expo 54**
*   **Routing:** **Expo Router** (File-based routing)
*   **UI/UX:** Reanimated 3, Linear Gradient, Lottie Animations
*   **Maps:** `react-native-maps` with geolocation clustering
*   **State:** Context API + Persistent Storage
*   **Real-time:** `socket.io-client` for live chat and status updates

### Backend API (`/backend`)
*   **Runtime:** **Node.js** (ES Modules enabled)
*   **Framework:** **Express 5.0** (Leveraging modern async/await handling)
*   **Database:** 
    *   **MongoDB** (Mongoose v8) for core application data.
    *   **Supabase** for Auth integration and file storage.
*   **Security:** `bcryptjs` for hashing, `jsonwebtoken`, custom Rate Limiting.
*   **Testing:** **Jest** (Unit/Integration) and **k6** (Load Testing).

---

## 📂 Project Structure

```
.
├── TaskHubApp/          # React Native Expo Frontend
│   ├── app/             # Expo Router screens
│   ├── components/      # Reusable UI components
│   └── api/             # Axios interceptors & endpoints
│
├── backend/             # Node.js Express API
│   ├── src/
│   │   ├── controllers/ # Business logic
│   │   ├── models/      # Mongoose Schemas (User, Task, TrustScore)
│   │   ├── services/    # Email, Storage, TrustScore logic
│   │   └── middleware/  # Auth & Security checks
│   └── Dockerfile       # Containerization setup
```

---

## ⚡ Getting Started

### Prerequisites
*   Node.js v20+ (Required for modern dependencies)
*   MongoDB Instance (Local or Atlas)
*   Supabase Account (for Storage/Auth keys)

### 1. Backend Setup
```bash
cd backend
npm install

# Create .env file
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/taskhub
# JWT_SECRET=super_secret_key
# SUPABASE_URL=...

npm run dev
```

### 2. Mobile App Setup
```bash
cd TaskHubApp
npm install
npx expo start
```
*   Scan the QR code with **Expo Go** on your phone or run on an Emulator.

---

## 🧪 Testing

The backend includes a suite of tests to verify reliability:

```bash
# Run Unit & Integration Tests
cd backend
npm test

# Run Load Tests (k6)
k6 run loadtest.js
```

---

*This project was built to demonstrate full-stack proficiency, focusing on security, scalability, and polished user experience.*
