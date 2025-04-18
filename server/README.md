# Job Board Server

This is the Node.js/Express backend server for the Job Board application. It handles API requests, interacts with the database, and potentially scrapes job data.

## Tech Stack

- Node.js
- Express
- Sequelize (PostgreSQL ORM)
- PostgreSQL
- `dotenv` (for environment variables)
- `cors` (for Cross-Origin Resource Sharing)
- `puppeteer`, `cheerio`, `axios` (likely for web scraping)
- `nodemon` (for development auto-restart)

## Setup

1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables:
    - Create a `.env` file in the `server` directory (you can copy `.env.example` if one exists).
    - Configure necessary variables, especially database connection details (e.g., `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_HOST`).
4.  Set up the database:
    - Ensure you have PostgreSQL installed and running.
    - Create the database specified in your `.env` file.
    - Run database migrations (if using Sequelize CLI - check if `npx sequelize-cli db:migrate` is needed, based on project structure).

## Running the Server

- **Development (with auto-restart):**
  ```bash
  npm run dev
  ```
- **Production:**
  ```bash
  npm start
  ```

The server will typically run on the port specified in the `.env` file (e.g., 5000) or default to 5000.

**Note:** A cron job is configured within the application (`src/index.js`) using `node-cron` to automatically trigger the job scraping process (`POST /api/jobs/scrape`) daily at midnight UTC. Check the console logs for details when the server is running.

## API Endpoints

Base URL: `/api/jobs`

- `GET /` : Get all jobs (or a paginated list).
- `GET /search` : Search for jobs based on query parameters (e.g., `/api/jobs/search?keyword=React&location=Remote`).
- `GET /:id` : Get details for a specific job by its ID.
- `POST /scrape` : Trigger the job scraping process (internal use likely).

There is also a health check endpoint:

- `GET /health` : Returns `{ status: "ok" }`.
