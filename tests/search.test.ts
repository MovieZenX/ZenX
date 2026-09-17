import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { searchMedia } from "../src/lib/metadata/tmdb";
import { normalizeTMDBItem } from "../src/lib/metadata/normalize";
import type { TMDBRawItem } from "../src/types/tmdb";

describe("Search Domain & Service Tests", () => {
  describe("searchMedia Query Validation", () => {
    it("returns empty result structure immediately for empty string", async () => {
      const result = await searchMedia("");
      assert.deepEqual(result, {
        page: 1,
        results: [],
        totalPages: 0,
        totalResults: 0,
      });
    });

    it("returns empty result structure for whitespace-only query", async () => {
      const result = await searchMedia("    ");
      assert.deepEqual(result, {
        page: 1,
        results: [],
        totalPages: 0,
        totalResults: 0,
      });
    });
  });

  describe("Media Normalization for Search Results", () => {
    it("filters and normalizes search result items correctly", () => {
      const rawMovie: TMDBRawItem = {
        id: 27205,
        title: "Inception",
        overview: "Cobb, a skilled thief...",
        poster_path: "/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg",
        backdrop_path: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
        media_type: "movie",
        release_date: "2010-07-15",
        vote_average: 8.368,
        vote_count: 36000,
        popularity: 120.5,
        genre_ids: [28, 878, 12],
      };

      const genreMap = { 28: "Action", 878: "Science Fiction", 12: "Adventure" };
      const item = normalizeTMDBItem(rawMovie, undefined, genreMap);

      assert.equal(item.id, "27205");
      assert.equal(item.title, "Inception");
      assert.equal(item.contentType, "movie");
      assert.equal(item.releaseYear, 2010);
      assert.equal(item.rating, 8.4);
      assert.deepEqual(item.genres, ["Action", "Science Fiction", "Adventure"]);
      assert.ok(item.posterUrl?.startsWith("https://image.tmdb.org/t/p/w500/"));
    });

    it("handles TV show item from multi-search response", () => {
      const rawTv: TMDBRawItem = {
        id: 1396,
        name: "Breaking Bad",
        overview: "Walter White, a New Mexico chemistry teacher...",
        poster_path: "/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
        backdrop_path: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
        media_type: "tv",
        first_air_date: "2008-01-20",
        vote_average: 8.91,
        vote_count: 14000,
        popularity: 180.2,
        genre_ids: [18, 80],
      };

      const item = normalizeTMDBItem(rawTv);
      assert.equal(item.id, "1396");
      assert.equal(item.title, "Breaking Bad");
      assert.equal(item.contentType, "tv");
      assert.equal(item.releaseYear, 2008);
      assert.equal(item.rating, 8.9);
    });

    it("safely handles malformed search item without crashing", () => {
      const malformed: TMDBRawItem = {
        id: 0,
        overview: "",
        poster_path: null,
        backdrop_path: null,
        vote_average: 0,
        vote_count: 0,
        popularity: 0,
      };

      const item = normalizeTMDBItem(malformed);
      assert.equal(item.id, "0");
      assert.equal(item.title, "Untitled");
      assert.equal(item.posterUrl, null);
      assert.equal(item.backdropUrl, null);
      assert.equal(item.releaseYear, null);
    });
  });

  describe("Search Pagination & Query Constraints", () => {
    it("validates page bounds and media types correctly", () => {
      // Test page number clamping logic
      const clampPage = (p: string | null) => {
        const pageNum = parseInt(p || "1", 10);
        return Number.isInteger(pageNum) ? Math.min(500, Math.max(1, pageNum)) : 1;
      };

      assert.equal(clampPage("1"), 1);
      assert.equal(clampPage("5"), 5);
      assert.equal(clampPage("0"), 1);
      assert.equal(clampPage("-5"), 1);
      assert.equal(clampPage("999"), 500);
      assert.equal(clampPage("invalid"), 1);
      assert.equal(clampPage(null), 1);

      // Test type parameter validation
      const validateType = (t: string | null): "all" | "movie" | "tv" => {
        return t === "movie" || t === "tv" ? t : "all";
      };

      assert.equal(validateType("all"), "all");
      assert.equal(validateType("movie"), "movie");
      assert.equal(validateType("tv"), "tv");
      assert.equal(validateType("other"), "all");
      assert.equal(validateType(null), "all");
    });
  });
});
