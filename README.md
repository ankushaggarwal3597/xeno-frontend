Xeno – Shopify Data Ingestion & Insights Platform

A full-stack multi-tenant system for onboarding Shopify stores, ingesting data (customers, orders, products), and generating insights.

1. Setup Instructions


git clone https://github.com/ankushaggarwal3597/xeno-backend
git clone https://github.com/ankushaggarwal3597/xeno-frontend


Backend Setup (Node + Express)

Install dependencies:

cd xeno-backend
npm install


Create .env file:

PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=xeno_db
DB_USER=root
DB_PASSWORD=yourpassword

# JWT
JWT_SECRET=your-secret
JWT_EXPIRE=7d

# Shopify
SHOPIFY_API_KEY=xxxx
SHOPIFY_API_SECRET=xxxx
SHOPIFY_SCOPES=read_products,read_customers,read_orders
SHOPIFY_REDIRECT_URL=http://localhost:5000/api/shopify/callback // for local server

# URLs// for local server
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000  

npm start

Frontend Setup React

cd xeno-frontend
npm install


Create .env:

REACT_APP_API_URL=http://localhost:5000/api // for local server

npm start


2. High-Level Architecture Diagram

                    ┌───────────────────────────────┐
                    │         React Frontend         │
                    │        (Vercel Hosted)         │
                    └───────────────┬───────────────┘
                                    │ HTTPS (Axios)
                                    ▼
                    ┌───────────────────────────────┐
                    │      Node.js Backend API       │
                    │      (Railway Deployment)      │
                    ├───────────────┬───────────────┤
                    │ Auth & OAuth  │  Analytics     │
                    │ Ingestion     │  Webhooks      │
                    └───────────────┴───────────────┘
                           │ Sequelize ORM
                           ▼
                    ┌───────────────────────────────┐
                    │         MySQL Database         │
                    │       (Railway Managed DB)     │
                    └───────────────────────────────┘
                           │
                           ▼
                    ┌───────────────────────────────┐
                    │       Shopify Admin API        │
                    │  OAuth • Products • Orders     │
                    │  Customers • Webhooks          │
                    └───────────────────────────────┘
3. API Endpoints

Authentication
Method	Endpoint	Description
POST	/api/auth/register	Register user
POST	/api/auth/login	Login & get JWT

Tenant & Shopify OAuth
Method	Endpoint	Description
GET	/api/tenants	Get user’s Shopify stores
GET	/api/shopify/auth	Start Shopify OAuth
GET	/api/shopify/callback	Complete OAuth & store token
POST	/api/tenants/:id/sync	Manual sync

Analytics APIs
Method	Endpoint	Description
GET	/api/analytics/overview?tenant_id=	Summary metrics
GET	/api/analytics/revenue?tenant_id=	Revenue over time
GET	/api/analytics/orders-by-date?tenant_id=	Orders timeline
GET	/api/analytics/top-customers?tenant_id=&limit=	Top customers

Customers
Method	Endpoint
GET	/api/customers?tenant_id=&page=&limit=
GET	/api/customers/:id

Products
Method	Endpoint
GET	/api/products?tenant_id=&page=&limit=
GET	/api/products/:id

Orders
Method	Endpoint
GET	/api/orders?tenant_id=&page=&limit=
GET	/api/orders/:id


4. Database Schema
Users
id (PK)
name
email
password_hash

Tenants
id (PK)
user_id (FK)
shop_domain
store_name
access_token
last_sync_at
is_active

Customers
id (PK)
tenant_id (FK)
name
email
total_spent
created_at

Orders
id (PK)
tenant_id (FK)
shopify_order_id
total_price
created_at
customer_id

Products
id (PK)
tenant_id (FK)
title
price
inventory
created_at

Known Limitations / Assumptions
Limitations

Sync runs every 6 hours, not real-time.

Analytics calculated in real-time → slower for huge datasets.

Webhook HMAC validation not added (can be added easily).

No retry mechanism for failed ingestion pages.

Assumptions

Shopify merchants approve required app scopes.

MySQL dataset fits in a single DB instance.

Cron schedule (6-hour ingestion) is acceptable for this assignment.

One Shopify store corresponds to one tenant.

