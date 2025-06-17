
---

## 📁 `backend/README.md`

```markdown
# 🚀 Option Chain – Backend

Backend server for the Option Chain trading platform, built with **Node.js**, **TypeScript**, **Express**, **Apollo GraphQL**, and integrated with **Redis**, **MongoDB**, and **PM2** for production.

---

## 🧠 Features

- GraphQL API for orders, user info, option data
- WebSocket connection with Firstock API
- Live trade/order updates pushed to frontend
- Redis for caching option chain and LTPs
- MongoDB for storing user and order history
- Logging system for all user activity
- Supports live pricing, MTM, and PnL calculations
- PM2 for production process management

---

## 🧰 Tech Stack

- Node.js
- TypeScript
- Express.js
- Apollo Server
- WebSocket (Firstock)
- Redis
- MongoDB
- PM2

---

## ⚙️ Setup Instructions

### 1. Install dependencies

```bash
npm install
