# Restaurant POS System

A modern Point of Sale (POS) system for restaurants built with Laravel and React.

## Features

- Modern web-based POS interface
- User authentication and management
- Product catalog management
- Order processing
- Built with Laravel 12 and React 19

## Tech Stack

- **Backend**: Laravel 12
- **Frontend**: React 19 with Inertia.js
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

## Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/Restaurant-POS-System.git
cd Restaurant-POS-System
```

2. Install PHP dependencies:
```bash
composer install
```

3. Install Node dependencies:
```bash
npm install
```

4. Copy environment file:
```bash
cp .env.example .env
```

5. Generate application key:
```bash
php artisan key:generate
```

6. Run migrations:
```bash
php artisan migrate
```

7. Build assets:
```bash
npm run build
```

## Development

Run the development server:
```bash
composer run dev
```

This will start:
- Laravel development server
- Vite development server
- Queue worker
- Log viewer

## License

The Restaurant POS System is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
