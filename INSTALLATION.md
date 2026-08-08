# Installation Guide

## Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas URI)
- Docker & Docker Compose (for production deployment)

## Local Development Setup

1. **Clone the repository**
2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```
3. **Configure Environment Variables**
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/marketing-app
   JWT_SECRET=your_super_secret_key
   ```
4. **Start Backend Server**
   ```bash
   npm run dev
   ```
5. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```
6. **Start Frontend Dev Server**
   ```bash
   npm run dev
   ```
7. **Access Application**
   Open your browser to `http://localhost:5173`

## Production Deployment (Docker)

1. Ensure ports 80, 5000, and 27017 are free.
2. In the root directory, run:
   ```bash
   docker-compose up --build -d
   ```
3. The frontend is now served via Nginx on port 80.
