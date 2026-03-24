import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { generateFashionQueries } from "./src/services/geminiService.js";
import { searchProducts } from "./src/services/serpService.js";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/search", async (req, res) => {
    try {
      const { style } = req.body;
      if (!style) {
        return res.status(400).json({ error: "Style description is required" });
      }

      // 1. Get queries from Gemini
      const geminiResult = await generateFashionQueries(style);
      
      if (!geminiResult || !geminiResult.queries) {
        throw new Error("Invalid response from Gemini API");
      }

      // 2. Fetch products from SerpApi
      const results = await searchProducts(geminiResult.queries);

      res.json({
        styleResume: geminiResult.styleResume,
        results
      });
    } catch (error: any) {
      console.error("Search error:", error);
      res.status(500).json({ error: error.message || "An error occurred during search" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
