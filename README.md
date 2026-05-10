# 🤖 BartaFlow — Enterprise AI Chatbot & Voice Agent Platform

BartaFlow is a high-performance, modular AI SaaS platform designed for sales automation and customer engagement. This repository follows a professional **Frontend/Backend separation** architecture.

## 📁 Project Structure

### [frontend/](./frontend)
The premium client-side experience.
- **Landing Page**: Conversion-optimized UI with 3D Three.js hero.
- **Admin Dashboard**: White-label management interface with real-time analytics (Chart.js).
- **Design System**: Modular CSS with Glassmorphism and dark mode support.

### [backend/](./backend)
The robust API layer.
- **Express Server**: Node.js API handling data persistence.
- **Data Persistence**: File-based CSV storage for leads (convertible to SQL/NoSQL).
- **Environment Support**: Pre-configured `.env` support for Meta/OpenAI keys.

### [debug/](./debug)
Advanced developer tools for platform health.
- **Auditor**: Automated DOM/UX health checks.
- **Logger**: Persistent session-based error tracking.

## 🚀 Quick Start

1. **Start the Backend**:
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Launch the Frontend**:
   Open `frontend/index.html` in your browser.

3. **Admin Access**:
   Access the dashboard via `frontend/admin.html`.
   - **Credentials**: `admin@gmail.com` / `Admin@123`

## 🛠️ Tech Stack
- **Frontend**: Vanilla HTML/JS, Three.js, Chart.js.
- **Backend**: Node.js, Express, CSV-DB.
- **Tooling**: Custom Debug Suite, Watchdog Connectivity Check.

---
© 2025 BartaFlow Technologies Pvt. Ltd.
