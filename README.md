# Netflix Recommendation Hub

A modern web application for discovering movies and TV shows using intelligent recommendation algorithms.

## 🎯 Features

- **Smart Recommendations**: AI-powered content suggestions using cosine similarity
- **Advanced Search & Filtering**: Find content by genre, rating, year, and more
- **Data Analytics Dashboard**: Insights into content trends and patterns
- **Dual Database Architecture**: PostgreSQL + MongoDB for optimal performance
- **Modern UI**: Netflix-inspired design with responsive layout

## 🛠 Tech Stack

### Frontend
- **Vite + React + TypeScript**: Modern frontend development
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Recharts**: Data visualization
- **Lucide React**: Modern icon library

### Backend
- **Node.js + Express + TypeScript**: RESTful API server
- **PostgreSQL (Supabase)**: Structured data storage
- **MongoDB**: Flexible data and caching
- **ml-matrix**: Machine learning computations

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (Supabase account)
- MongoDB database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd netflix-recommendation-hub
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

4. **Start Development Servers**
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm run dev
   
   # Frontend (Terminal 2) 
   cd frontend
   npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 📁 Project Structure

```
netflix-recommendation-hub/
├── backend/                # Node.js API server
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── routes/        # API endpoints
│   │   ├── types/         # TypeScript types
│   │   └── index.ts       # Main server file
│   ├── package.json
│   └── tsconfig.json
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   ├── package.json
│   └── tailwind.config.js
├── shared/                # Shared types and utilities
└── .env                   # Environment variables
```

## 🔧 Development

### Available Scripts

**Backend**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

**Frontend**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### API Endpoints

- `GET /health` - Health check
- `GET /api/movies` - Get movies with pagination/filtering
- `GET /api/movies/:id` - Get movie by ID
- `GET /api/tvshows` - Get TV shows with pagination/filtering
- `GET /api/genres` - Get all genres with content counts
- `GET /api/genres?hideTVShowOnly=true` - Hide genres with only TV shows
- `GET /api/genres?includeEmpty=true` - Include genres with no content
- `GET /api/genres/:id` - Get genre by ID with associated content
- `POST /api/search` - Advanced search with filters and sorting
- `GET /api/recommendations` - Get content recommendations

#### Advanced Search Filters
- **genre**: Filter by genre name
- **rating**: Filter by content rating (G, PG, PG-13, etc.)
- **releaseYear**: Filter by release year
- **country**: Filter by country
- **language**: Filter by language
- **sortBy**: Sort by title, release_year, date_added, or rating
- **sortOrder**: Sort order (asc or desc)

## 🎨 Features Overview

### 1. Content Discovery
- Browse movies and TV shows
- Advanced search functionality
- Filter by genre, rating, year, country

### 2. Recommendation Engine
- Genre-based similarity using one-hot encoding
- Cosine similarity calculations
- Confidence scoring for recommendations

### 3. Genre Management System
- **Smart Genre Splitting**: Automatically splits combined genres (e.g., "Action & Adventure" → "Action", "Adventure")
- **Genre Merging**: Combines similar genres (e.g., "Sci-Fi" merged with "Science Fiction")
- **TV-Only Filter**: Option to hide genres that only contain TV shows
- **Consistent Genre Distribution**: Ensures genre consistency across movies and TV shows

### 4. Advanced Search & Filtering
- Multi-criteria search with complex filtering
- Language-based filtering
- Sorting by multiple parameters (title, year, rating, date added)
- Real-time search with debouncing

### 5. Analytics Dashboard
- Content distribution by genre
- Rating analysis
- Data quality insights
- Country-wise content breakdown

### 6. Data Quality Management
- Missing data handling
- Confidence scoring
- Smart fallback mechanisms

## 📊 Database Schema

### PostgreSQL (Structured Data)
- `movies` - Movie information
- `tv_shows` - TV show information
- `genres` - Normalized genre data
- `cast_crew` - Cast and crew information

### MongoDB (Flexible Data)
- `recommendations` - Cached recommendation results
- `user_preferences` - User interaction data
- `analytics` - Pre-computed analytics data

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Netflix for inspiration
- The Movie Database (TMDB) for data structure reference
- Tailwind CSS for amazing utility classes
- React community for excellent tooling
