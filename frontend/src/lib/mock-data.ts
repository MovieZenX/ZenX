/**
 * ============================================================================
 * VISUAL DEVELOPMENT MOCK DATA ONLY
 * ============================================================================
 *
 * NOTICE:
 * This file contains static mock data exclusively for visual and layout
 * development in Phase 2 (Design System & Core Layout).
 *
 * DO NOT use this as a replacement for real metadata API integrations.
 * Real data fetching will be connected in Phase 3 & 4 via Next.js server-side
 * API routes.
 * ============================================================================
 */

import type { ContentType } from "@/types";

export interface MockMediaItem {
  id: string;
  title: string;
  overview: string;
  posterUrl: string;
  backdropUrl: string;
  contentType: ContentType;
  releaseYear: number;
  rating: number; // e.g. 8.8
  duration?: string; // e.g. "2h 28m" or "3 Seasons"
  genres: string[];
  quality?: "4K" | "HD";
  ageRating?: string;
  featured?: boolean;
}

export const MOCK_HERO_ITEM: MockMediaItem = {
  id: "mock-hero-1",
  title: "Interstellar Odyssey",
  overview:
    "When Earth faces ecological collapse, a team of pioneering explorers undertakes the most vital mission in human history: venturing beyond this galaxy to discover whether mankind has a future among the stars.",
  posterUrl:
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop",
  backdropUrl:
    "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1920&auto=format&fit=crop",
  contentType: "movie",
  releaseYear: 2024,
  rating: 8.9,
  duration: "2h 49m",
  genres: ["Sci-Fi", "Adventure", "Drama"],
  quality: "4K",
  ageRating: "PG-13",
  featured: true,
};

export const MOCK_TRENDING_ITEMS: MockMediaItem[] = [
  {
    id: "mock-trend-1",
    title: "Shadow Protocol",
    overview: "An elite operative is disavowed after uncovering a conspiracy inside global intelligence agencies.",
    posterUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=600&auto=format&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200&auto=format&fit=crop",
    contentType: "movie",
    releaseYear: 2024,
    rating: 8.5,
    duration: "2h 14m",
    genres: ["Action", "Thriller"],
    quality: "4K",
  },
  {
    id: "mock-trend-2",
    title: "Chronicles of the Deep",
    overview: "Explorers descend into the uncharted Mariana Trench only to discover an ancient biome thriving in darkness.",
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop",
    contentType: "tv",
    releaseYear: 2023,
    rating: 8.7,
    duration: "2 Seasons",
    genres: ["Sci-Fi", "Mystery"],
    quality: "4K",
  },
  {
    id: "mock-trend-3",
    title: "Neon Horizon",
    overview: "In a sprawling neon metropolis, a freelance synth-runner takes a heist contract that could alter humanity's evolution.",
    posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop",
    contentType: "movie",
    releaseYear: 2024,
    rating: 7.9,
    duration: "1h 58m",
    genres: ["Cyberpunk", "Action"],
    quality: "HD",
  },
  {
    id: "mock-trend-4",
    title: "The Silent Valley",
    overview: "A remote Nordic settlement experiences inexplicable electromagnetic anomalies as winter approaches.",
    posterUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop",
    contentType: "tv",
    releaseYear: 2024,
    rating: 8.2,
    duration: "1 Season",
    genres: ["Drama", "Mystery"],
    quality: "4K",
  },
  {
    id: "mock-trend-5",
    title: "Eclipse Over Alexandria",
    overview: "An epic historical drama recounting the final days of the legendary ancient Library and scholars defying destiny.",
    posterUrl: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=600&auto=format&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=1200&auto=format&fit=crop",
    contentType: "movie",
    releaseYear: 2023,
    rating: 8.4,
    duration: "2h 35m",
    genres: ["History", "Drama"],
    quality: "4K",
  },
  {
    id: "mock-trend-6",
    title: "Solar Drift",
    overview: "A derelict cargo freighter carrying an experimental fusion core drifts toward the sun, sparking a high-stakes salvage operation.",
    posterUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
    contentType: "movie",
    releaseYear: 2024,
    rating: 8.1,
    duration: "2h 05m",
    genres: ["Sci-Fi", "Thriller"],
    quality: "HD",
  },
];
