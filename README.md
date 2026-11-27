# BankEase – Mini Net Banking Application

A Java Full Stack web application providing core online banking features, built with Spring Boot, Spring Security + JWT, Spring Data JPA, MySQL, and React.js.

---

## 🏗️ Project Structure

```
bankease/
├── backend/                          # Spring Boot Application
│   ├── pom.xml
│   └── src/main/java/com/bankease/
│       ├── BankEaseApplication.java
│       ├── config/
│       │   └── SecurityConfig.java          # CORS + JWT Security Filter Chain
│       ├── controller/
│       │   ├── AuthController.java          # /api/auth/register, /api/auth/login
│       │   ├── AccountController.java       # /api/account/me, /api/account/lookup/{no}
│       │   └── TransactionController.java   # /api/transactions/transfer, /history, /recent
│       ├── dto/
│       │   ├── request/   (RegisterRequest, LoginRequest, TransferRequest)
│       │   └── response/  (AuthResponse, AccountResponse, TransactionResponse, ApiResponse)
│       ├── entity/
│       │   ├── User.java
│       │   ├── BankAccount.java
│       │   └── Transaction.java
│       ├── exception/
│       │   └── GlobalExceptionHandler.java
│       ├── repository/     (UserRepository, BankAccountRepository, TransactionRepository)
│       ├── security/
│       │   ├── JwtTokenProvider.java
│       │   ├── JwtAuthenticationFilter.java
│       │   └── CustomUserDetailsService.java
│       └── service/
│           ├── AuthService.java
│           ├── AccountService.java
│           └── TransactionService.java
│
├── frontend/                         # React + Vite Application
│   ├── package.json
│   ├── vite.config.js                # Proxy → localhost:8080
│   └── src/
│       ├── App.jsx                   # Router + Protected routes
│       ├── context/AuthContext.jsx   # JWT token + user state
│       ├── services/api.js           # Axios instance + interceptors
│       └── pages/
│           ├── LoginPage.jsx
│           ├── RegisterPage.jsx
│           ├── DashboardPage.jsx
│           ├── TransferPage.jsx
│           ├── TransactionsPage.jsx
│           └── ProfilePage.jsx
│
├── database/
│   └── bankease_schema.sql           # DB init + demo data
├── start-backend.bat
└── start-frontend.bat
```

---

## ⚙️ Prerequisites

| Tool | Version |
|------|---------|
| Java | 17+ |
| Maven | 3.8+ |
| Node.js | 18+ |
| MySQL | 8.0+ |

---

## 🚀 Getting Started

### 1. Database Setup

```sql
-- Run in MySQL client or Workbench:
source d:/bankease/database/bankease_schema.sql;
```

Or let Spring Boot auto-create tables (`ddl-auto=update` is set).

### 2. Configure Database Credentials

Edit [`backend/src/main/resources/application.properties`](backend/src/main/resources/application.properties):

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bankease_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD   # ← change this
```

### 3. Start the Backend

```bash
cd backend
mvn spring-boot:run
# Or double-click: start-backend.bat
```
Backend runs on **http://localhost:8080**

### 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev
# Or double-click: start-frontend.bat
```
Frontend runs on **http://localhost:3000**

---

## 🔑 Demo Accounts (after running SQL script)

| Name | Email | Password | Account No. |
|------|-------|----------|-------------|
| Ravi Kumar | ravi@example.com | password123 | 123400000001 |
| Priya Sharma | priya@example.com | password123 | 123400000002 |
| Admin User | admin@bankease.com | password123 | 123400000003 |

---

## 🌐 API Endpoints

### Auth (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register & auto-login (returns JWT) |
| POST | `/api/auth/login` | Login (returns JWT) |

### Account (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/account/me` | Get authenticated user's account |
| GET | `/api/account/lookup/{accountNo}` | Lookup recipient account |

### Transactions (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transactions/transfer` | Transfer money |
| GET | `/api/transactions/history?page=0&size=10` | Paginated history |
| GET | `/api/transactions/recent` | Last 5 transactions |

---

## 🔒 Security Architecture

```
Client → JWT Bearer Token → JwtAuthenticationFilter → SecurityContextHolder
                                       ↓
                              CustomUserDetailsService (loads from DB)
                                       ↓
                              BCrypt password validation
```

- Passwords hashed with **BCrypt** (strength 10)
- Stateless sessions using **JWT** (24h expiry)
- CORS restricted to `http://localhost:3000`
- Spring Security protects all `/api/**` except `/api/auth/**`

---

## 💡 Key Features

| Feature | Details |
|---------|---------|
| User Registration | Auto-creates bank account with ₹10,000 demo balance |
| Login | JWT token returned, stored in localStorage |
| Dashboard | Live balance, recent transactions, quick actions |
| Money Transfer | 3-step flow: verify recipient → review → confirm |
| Transaction History | Paginated table, search, credit/debit color coding |
| Profile | Full account & personal details view |

---

## 🗄️ Database Schema

```
users (id, full_name, email, password, phone_number, address, role, created_at, is_active)
   ↕ 1:1
bank_accounts (id, account_number, ifsc_code, account_type, balance, user_id, ...)
   ↕ 1:N
transactions (id, transaction_ref, amount, description, type, status, timestamp, 
              sender_account_id, receiver_account_id, balance_after_transaction)
```

---

## 🛠️ Tech Stack

**Backend:** Java 17 · Spring Boot 3.2 · Spring Security · Spring Data JPA · Hibernate · MySQL · jjwt · Lombok · Maven

**Frontend:** React 18 · React Router 6 · Vite · Axios · react-hot-toast · lucide-react · CSS Modules

