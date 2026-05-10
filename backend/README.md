# 🚀 BartaFlow Backend

This is the server-side component of the BartaFlow platform. It handles lead storage, API requests, and data management.

## 🛠️ Setup

1. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Start the Server**:
   ```bash
   npm run dev
   ```

## 📂 Structure
- `server.js`: Main entry point (Express).
- `data/leads.csv`: Local database for captured leads.
- `package.json`: Project metadata and dependencies.

## 📡 API Endpoints
- `GET /api/health`: Check if server is running.
- `POST /api/leads`: Submit a new lead.
- `GET /api/leads`: Retrieve all leads.
