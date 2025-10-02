# Getting Started with the E-Lapor Dinas Barantin Application

Follow these steps to set up the Emter API application on your local development environment.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

-   Git
-   Composer
-   PHP
-   MySQL
-   Node.js and npm

## Clone the Repository

Start by cloning the repository from GitHub:

```bash
git clone https://github.com/rachelardanaputraginting/e-perjadin-bki.git
```

## Install PHP Dependencies

Navigate to the project directory and install the PHP dependencies:

```bash
cd e-perjadin-bki/
composer install
```

## Environment Setup

Copy the example environment file and then configure your environment settings:

```bash
cp env.example .env
```

Edit the `.env` file and update the database settings:

```plaintext
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=e_perjadin
DB_USERNAME=root
DB_PASSWORD=
```

Make sure to adjust the `DB_HOST`, `DB_PORT`, `DB_USERNAME`, and `DB_PASSWORD` according to your local MySQL server configuration.

## Database Migration and Key Generation

Run the following commands to set up your database and application key:

```bash
php artisan migrate:fresh
php artisan key:generate
```

## Install JavaScript Dependencies

Install the necessary JavaScript packages using npm:

```bash
npm install
```

## Compile Assets

In one terminal, compile the front-end assets:

```bash
npm run dev
```

## Database Seeding

In another terminal, seed the database:

```bash
php artisan migrate:fresh --seed
```

## Start the Development Server

Finally, start the Laravel development server:

```bash
php artisan serve
```

## Access the Application

The application should now be running on:

```
http://127.0.0.1:8000
```

Navigate to this URL in your web browser to view the application.

```

```
