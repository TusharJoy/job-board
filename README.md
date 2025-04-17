# Job Board

A modern job board application that aggregates job listings from multiple sources including LinkedIn, RemoteOK, Relocate.me, Larajobs, JSJobs, and VueJobs.

## Features

- 🔍 Real-time job search with keyword and location filtering
- 💼 Multiple job sources in one place
- 🎯 Job type filtering (Full-time, Part-time, Contract, etc.)
- 🌐 Remote job listings
- 🎨 Modern UI with dark mode support
- 🔄 Automatic job scraping
- 📱 Responsive design

## Tech Stack

### Frontend

- React with Vite
- TailwindCSS for styling
- React Router for navigation
- Radix UI primitives
- TypeScript

### Backend

- Node.js with Express
- Puppeteer for web scraping
- PostgreSQL with Sequelize
- REST API

## Project Structure

```
job-board/
├── client/             # Frontend React application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/     # Page components
│   │   └── lib/       # Utilities and helpers
│   └── ...
└── server/            # Backend Node.js application
    ├── src/
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    │   └── services/
    └── ...
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd job-board
```

2. Install frontend dependencies:

```bash
cd client
npm install
```

3. Install backend dependencies:

```bash
cd ../server
npm install
```

4. Set up environment variables:

   - Copy `.env.example` to `.env` in the server directory
   - Update the database connection string and other required variables

5. Start the development servers:

Frontend:

```bash
cd client
npm run dev
```

Backend:

```bash
cd server
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## API Routes

- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/search` - Search jobs with filters
- `POST /api/jobs/scrape` - Trigger job scraping
- `GET /api/jobs/:id` - Get job details by ID

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [RemoteOK](https://remoteok.com) - Job listings
- [Relocate.me](https://relocate.me) - Job listings
- [Larajobs](https://larajobs.com) - Job listings
- [JSJobs](https://jsjobs.com) - Job listings
- [VueJobs](https://vuejobs.com) - Job listings
