# One Swagger 🚀

**Universal 1-Tap API Documentation Explorer & Interactive Request Runner**

One Swagger is a lightweight API explorer web app & Chrome extension designed to load and interact with OpenAPI/Swagger specifications from any REST backend (FastAPI, Express, Spring Boot, Flask, Django, NestJS, ASP.NET, Go, etc.).

## Features ✨

- **Universal OpenAPI Parser**: Parses OpenAPI 2.0 / 3.0 / 3.1 specifications with recursive $ref schema resolution.
- **Swagger UI Color Styling**: Authentic method-tinted cards (GET blue, POST green, PUT orange, DELETE red, PATCH teal).
- **Interactive Playground**: Parameter table, schema-derived sample request body generation, and wide execute button.
- **Dark Code Response Inspector**: Live response status badges, latency, dark JSON viewer, response headers, and 1-click copy/download.
- **Universal Authorization**: OAuth2 password flow, Bearer JWT, and API Key support with interactive 1-click lock icons on route headers.
- **Request History Drawer**: Logged in localStorage with date grouping, search filter, JSON export, and 1-click replay.
- **Client Code Generator**: Generate cURL, Fetch, Axios, Python 
equests, and Go code snippets.
- **Zero-CORS**: Background proxy service worker for seamless local and remote API testing.

## Tech Stack 🛠️

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS / Custom CSS
- **Backend**: Python 3.11+, FastAPI, Uvicorn, PyJWT
- **Extension**: Chrome Extension Manifest V3

## Quick Start 🚀

### 1. Run Backend
`ash
cd backend
python -m venv .venv
source .venv/bin/activate  # Or .venv\Scripts\activate on Windows
pip install -r requirements.txt
python run.py
`

### 2. Run Frontend
`ash
cd frontend
npm install
npm run dev
`

Open http://localhost:5173/ in your browser.

## Chrome Extension Setup 🧩

1. Build production bundle:
   `ash
   cd frontend
   npm run build
   `
2. Open Chrome and navigate to chrome://extensions/.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select rontend/dist.
