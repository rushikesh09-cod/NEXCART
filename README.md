# NEXCART 🛒

NEXCART is a full-stack e-commerce application built with a React
frontend and a Spring Boot backend. It provides customer shopping
features and an administration dashboard for managing products, users,
orders, and store operations.

## ✨ Features

### Customer Features

-   User registration and login
-   JWT-based authentication
-   Product browsing
-   Product details
-   Shopping cart management
-   Address management
-   Checkout and order placement
-   Order history and order details
-   Password reset workflow

### Admin Features

-   Admin authentication
-   Product management
-   Order management
-   User management
-   Category management
-   Sales statistics dashboard
-   Product and role data seeding

## 🧰 Technology Stack

### Frontend

-   React
-   Vite
-   JavaScript
-   CSS
-   npm

### Backend

-   Java 21
-   Spring Boot
-   Spring Security
-   JWT authentication
-   Spring Data JPA / Hibernate
-   Maven
-   Flyway database migrations

### Database

-   PostgreSQL

## 📁 Project Structure

``` text
NEXCART/
├── backend/
│   ├── src/
│   ├── pom.xml
│   └── mvnw.cmd
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
├── .gitignore
└── README.md
```

## ⚙️ Prerequisites

Install the following before running the project:

-   Java JDK 21
-   PostgreSQL
-   Node.js LTS
-   Git
-   A code editor such as IntelliJ IDEA or VS Code

## 🗄️ Database Setup

1.  Install and start PostgreSQL.
2.  Create a database named `nexcart`.
3.  Confirm that PostgreSQL is running on port `5432`.
4.  Configure the required environment variables.

Example PowerShell configuration:

``` powershell
$env:DB_PASSWORD = "YOUR_POSTGRES_PASSWORD"
$env:JWT_SECRET = "YOUR_JWT_SECRET"
$env:ADMIN_PASSWORD = "YOUR_ADMIN_PASSWORD"
```

Do not commit real passwords, JWT secrets, or other credentials to
GitHub.

## 🚀 Run the Backend

Open a terminal in the project root:

``` powershell
cd D:\NEXCART\backend
```

Set the required environment variables in the same terminal session,
then start the application:

``` powershell
.\mvnw.cmd spring-boot:run
```

The backend is configured to run on:

``` text
http://localhost:8081
```

The API base URL is:

``` text
http://localhost:8081/api
```

## 💻 Run the Frontend

Open a second terminal:

``` powershell
cd D:\NEXCART\frontend
npm.cmd install
npm.cmd run dev
```

Open the local Vite URL shown in the terminal, usually:

``` text
http://localhost:5173
```

## 🔐 Default Admin Account

The development data seeder creates an administrator account when the
required admin configuration is provided.

``` text
Email: admin@nexcart.com
Password: The value configured in ADMIN_PASSWORD
Role: ADMIN
```

For security, change development credentials before deploying the
application publicly.

## 🔄 Database Migrations

The project uses Flyway migrations to manage database changes. When the
backend starts, Flyway validates and applies available migrations
automatically according to the application configuration.

## 🧪 Testing Checklist

Before deploying or presenting the project, verify:

-   [ ] Backend starts without errors
-   [ ] Frontend starts successfully
-   [ ] User registration works
-   [ ] Customer login works
-   [ ] Admin login works
-   [ ] Products load correctly
-   [ ] Products can be managed by an administrator
-   [ ] Products can be added to the cart
-   [ ] Checkout and order placement work
-   [ ] Orders are visible in the customer and admin sections
-   [ ] Database records are created correctly

## 🔒 Security Notes

-   Keep database passwords and JWT secrets outside the source code.
-   Do not commit `.env` files or secret configuration files.
-   Use strong passwords for administrator accounts.
-   Configure HTTPS and production-grade secret management before
    deployment.
-   Review CORS, authentication, authorization, and error handling
    before public release.

## 📌 Future Improvements

Potential improvements include:

-   Online payment integration
-   Product search and filtering
-   Product reviews and ratings
-   Email notifications
-   Inventory alerts
-   Cloud deployment
-   Automated unit and integration testing
-   CI/CD pipeline
-   Responsive design improvements

## 👨‍💻 Author

**Rushikesh Patil**

Computer Science Engineering -- Artificial Intelligence and Machine
Learning

## 📄 License


Copyright (c) 2026 Rushikesh Patil

This project is licensed under the MIT License.

See the [LICENSE](LICENSE) file for more details.
