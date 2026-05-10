# 🚀 BartaFlow Frontend

This directory contains the premium landing page and admin dashboard for the BartaFlow platform.

## 📂 Structure
- `index.html`: The main high-conversion landing page.
- `admin.html`: The white-label admin dashboard for client management.
- `assets/`: 
    - `css/`: Modular stylesheets (Modern Dark/Light themes).
    - `js/`: Feature-specific logic (Leads, Auth, AI Bots, Voice).
- `debug/`: Tools for health auditing and error logging.

## 🛠️ Connectivity
The frontend is pre-configured to talk to the local backend at `http://localhost:5000`.
- Use the **Watchdog** script (`api-check.js`) to monitor backend status in real-time.
- All lead captures are automatically synced to the backend CSV database.

## 🚀 Getting Started
1. Ensure the **Backend** is running (`cd ../backend && npm start`).
2. Open `index.html` in any modern browser.
3. Use the "View Leads" panel (top right) or `admin.html` to see data flow.
