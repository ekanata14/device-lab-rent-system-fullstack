# 3D Prototype Lab Frontend

This Next.js Application implements the main UI and operational dashboards for managing 3D printers, reservations, and configurations. It is designed to consume data from the REST API rather than an internal interval mock.

## Technologies Used

- Next.js 15 (App Router)
- React 19
- Tailwind CSS
- shadcn/ui custom components

## Connecting to Backend

The app relies on the `NEXT_PUBLIC_API_URL` environment variable to locate its datastore backend APIs. If none is provided, it defaults to querying `http://localhost:3001/api`.
The backend handles operations like auto-cycling statuses from `buffer` to `available`.

## Setup and Installation

1. Install all dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables:
   Ensure you have a `.env` file in the root directory containing the required variables to connect to the backend. Example:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3005/api
   ```

## Running the Application

### Development Mode

To run the application in development mode with Turbopack (defaults to port 3002):

```bash
npm run dev
```

### Production Mode

This project is configured to output a [standalone build](https://nextjs.org/docs/app/api-reference/next-config-js/output) to significantly reduce the production deployment size.

1. Build the production application:

   ```bash
   npm run build
   ```

2. The optimized build output will be located in the `.next/standalone` directory. If you are moving this application to another server or container, you must copy the static assets into this folder as they are not included automatically:

   ```bash
   # From the project root, move the static assets to the standalone directory
   cp -r public .next/standalone/
   mkdir -p .next/standalone/.next
   cp -r .next/static .next/standalone/.next/
   ```

3. Start the standalone production server:
   ```bash
   node .next/standalone/server.js
   ```

_(Note: Ensure required environment variables like `NEXT_PUBLIC_API_URL` or standard variables like `PORT` and `HOSTNAME` are configured in the environment where `server.js` is running.)_

### Nginx Reverse Proxy Configuration

When running the standalone server, it is recommended to use Nginx as a reverse proxy to handle external requests, SSL, and serve static assets efficiently. Below is an example Nginx configuration:

```nginx
server {
    listen 80;
    server_name your_domain.com;

    # Gzip compression
    gzip on;
    gzip_proxied any;
    gzip_comp_level 4;
    gzip_types text/css application/javascript image/svg+xml;

    # Handle static assets directly through Nginx
    location /_next/static/ {
        alias /path/to/your/app/.next/standalone/.next/static/;
        expires 365d;
        access_log off;
    }

    # Proxy remaining requests to Next.js standalone server
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

_Replace `/path/to/your/app` with the actual path to your application and `your_domain.com` with your server's domain._

Visit the frontend dashboard (e.g., `http://localhost:3002` in development or `http://localhost:3000` in production) to monitor overall availability, inspect logs history, or update lab hours.
