# Fashion Finder

A full-stack web application that lets users describe their clothing style in natural language, then finds the cheapest outfits with the best reviews on Google Shopping.

## Tech Stack
- **Frontend**: Vite + React + Tailwind CSS
- **Backend**: Node.js + Express
- **APIs**: Gemini API (gemini-2.5-flash), SerpApi (google_shopping)

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Environment Variables:
   Create a `.env` file in the root directory and add your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   SERPAPI_KEY=your_serpapi_key
   
   # Optional: Set to true to use mock data without calling APIs
   DEMO_MODE=false
   ```
   *Note: You can get a free SerpApi key at [serpapi.com](https://serpapi.com) (100 free searches/month).*

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture
This project uses a unified full-stack architecture with Express serving as the backend API and Vite acting as middleware for the React frontend during development.
