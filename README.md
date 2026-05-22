# PriceWatch — E-Commerce Price Tracker

A full-stack price tracking app for Amazon & Flipkart with wishlist, price-drop alerts, and email notifications.

##  Features

-  **Product Search** - Search products across Amazon & Flipkart
-  **Price History Charts** - Visual price trend graphs
-  **Wishlist** - Save products you want to track
-  **Price Drop Alerts** - Set target prices and get notified
- **Email Notifications** - Automatic emails when price drops
-**Auto Price Refresh** - Background job refreshes prices every 6 hours

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Recharts + Axios |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| Email | Nodemailer |
| Scheduler | node-cron |
| Scraping | Cheerio + Axios |




### Prerequisites
- Node.js (v18+)
- MongoDB (local or MongoDB Atlas free tier)
- Gmail account (for email notifications)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/price-tracker.git
cd price-tracker
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values (see below)
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 4. Environment Variables (backend/.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/pricetracker
JWT_SECRET=your_secret_key_here
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_gmail_app_password
SCRAPER_API_KEY=your_scraperapi_key  # free at scraperapi.com
```

##  API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/products/search | Search products |
| POST | /api/products/track | Add product to tracking |
| GET | /api/products/my | Get user's tracked products |
| DELETE | /api/products/:id | Remove tracked product |
| GET | /api/wishlist | Get wishlist |
| POST | /api/wishlist | Add to wishlist |
| POST | /api/alerts | Set price alert |
| GET | /api/alerts | Get user's alerts |


