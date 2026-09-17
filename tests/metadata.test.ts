import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildImageUrl,
  extractYear,
  formatRuntime,
  normalizeTMDBItem,
  normalizeMovieDetail,
  normalizeTvDetail,
  normalizeTvSeason,
} from "../src/lib/metadata/normalize";
import type { TMDBRawItem, TMDBMovieDetail, TMDBTvDetail, TMDBSeasonDetail } from "../src/types/tmdb";

describe("Metadata Normalization Utilities", () => {
  describe("buildImageUrl", () => {
    it("returns correct CDN URL for valid paths", () => {
      const url = buildImageUrl("/poster123.jpg", "w500");
      assert.equal(url, "https://image.tmdb.org/t/p/w500/poster123.jpg");
    });

    it("handles paths without leading slash", () => {
      const url = buildImageUrl("poster123.jpg", "w500");
      assert.equal(url, "https://image.tmdb.org/t/p/w500/poster123.jpg");
    });

    it("returns null for null, undefined, or empty path", () => {
      assert.equal(buildImageUrl(null), null);
      assert.equal(buildImageUrl(undefined), null);
      assert.equal(buildImageUrl(""), null);
      assert.equal(buildImageUrl("   "), null);
    });
  });

  describe("extractYear", () => {
    it("extracts valid 4-digit year from ISO date strings", () => {
      assert.equal(extractYear("2024-07-15"), 2024);
      assert.equal(extractYear("1999-12-31"), 1999);
    });

    it("returns null for invalid or missing dates", () => {
      assert.equal(extractYear(null), null);
      assert.equal(extractYear(undefined), null);
      assert.equal(extractYear("invalid-date"), null);
      assert.equal(extractYear(""), null);
    });
  });

  describe("formatRuntime", () => {
    it("formats minutes into hours and minutes", () => {
      assert.equal(formatRuntime(148), "2h 28m");
      assert.equal(formatRuntime(120), "2h");
      assert.equal(formatRuntime(45), "45m");
    });

    it("returns undefined for zero or negative runtime", () => {
      assert.equal(formatRuntime(0), undefined);
      assert.equal(formatRuntime(-10), undefined);
      assert.equal(formatRuntime(null), undefined);
      assert.equal(formatRuntime(undefined), undefined);
    });
  });

  describe("normalizeTMDBItem", () => {
    it("normalizes a standard movie item", () => {
      const raw: TMDBRawItem = {
        id: 550,
        title: "Fight Club",
        overview: "An insomniac office worker and a devil-may-care soap maker form an underground fight club.",
        poster_path: "/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg",
        backdrop_path: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
        media_type: "movie",
        release_date: "1999-10-15",
        vote_average: 8.433,
        vote_count: 28000,
        popularity: 85.5,
        genre_ids: [18, 53],
      };

      const genreMap = { 18: "Drama", 53: "Thriller" };
      const item = normalizeTMDBItem(raw, "movie", genreMap);

      assert.equal(item.id, "550");
      assert.equal(item.title, "Fight Club");
      assert.equal(item.contentType, "movie");
      assert.equal(item.releaseYear, 1999);
      assert.equal(item.rating, 8.4);
      assert.equal(item.voteCount, 28000);
      assert.deepEqual(item.genres, ["Drama", "Thriller"]);
      assert.ok(item.posterUrl?.includes("bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg"));
      assert.ok(item.backdropUrl?.includes("hZkgoQYus5vegHoetLkCJzb17zJ.jpg"));
    });

    it("normalizes a TV show with first_air_date and name", () => {
      const raw: TMDBRawItem = {
        id: 1399,
        name: "Game of Thrones",
        overview: "Seven noble families fight for control of the mythical land of Westeros.",
        poster_path: "/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
        backdrop_path: "/suopoADq0k8YZr4dQXLi6q0xHHO.jpg",
        media_type: "tv",
        first_air_date: "2011-04-17",
        vote_average: 8.45,
        vote_count: 23000,
        popularity: 250.0,
      };

      const item = normalizeTMDBItem(raw, "tv");
      assert.equal(item.id, "1399");
      assert.equal(item.title, "Game of Thrones");
      assert.equal(item.contentType, "tv");
      assert.equal(item.releaseYear, 2011);
      assert.equal(item.rating, 8.4);
    });

    it("handles missing images and fields gracefully without throwing", () => {
      const raw: TMDBRawItem = {
        id: 99999,
        overview: "",
        poster_path: null,
        backdrop_path: null,
        vote_average: 0,
        vote_count: 0,
        popularity: 0,
      };

      const item = normalizeTMDBItem(raw);
      assert.equal(item.id, "99999");
      assert.equal(item.title, "Untitled");
      assert.equal(item.posterUrl, null);
      assert.equal(item.backdropUrl, null);
      assert.equal(item.releaseYear, null);
      assert.equal(item.rating, 0);
      assert.deepEqual(item.genres, []);
    });
  });

  describe("normalizeMovieDetail", () => {
    it("normalizes movie detail with runtime and credits", () => {
      const raw: TMDBMovieDetail = {
        id: 550,
        title: "Fight Club",
        tagline: "Mischief. Mayhem. Soap.",
        overview: "An insomniac office worker...",
        poster_path: "/poster.jpg",
        backdrop_path: "/backdrop.jpg",
        media_type: "movie",
        release_date: "1999-10-15",
        vote_average: 8.4,
        vote_count: 28000,
        popularity: 85.5,
        runtime: 139,
        status: "Released",
        genres: [{ id: 18, name: "Drama" }],
        credits: {
          cast: [
            { id: 819, name: "Edward Norton", character: "The Narrator", profile_path: "/edward.jpg", order: 0 },
            { id: 287, name: "Brad Pitt", character: "Tyler Durden", profile_path: "/brad.jpg", order: 1 },
          ],
        },
      };

      const detail = normalizeMovieDetail(raw);
      assert.equal(detail.id, "550");
      assert.equal(detail.tagline, "Mischief. Mayhem. Soap.");
      assert.equal(detail.duration, "2h 19m");
      assert.equal(detail.runtimeMinutes, 139);
      assert.equal(detail.cast.length, 2);
      assert.equal(detail.cast[0]?.name, "Edward Norton");
      assert.equal(detail.cast[1]?.character, "Tyler Durden");
      assert.deepEqual(detail.genres, ["Drama"]);
    });
  });

  describe("normalizeTvDetail", () => {
    it("normalizes TV detail with seasons", () => {
      const raw: TMDBTvDetail = {
        id: 1399,
        name: "Game of Thrones",
        tagline: "Winter Is Coming",
        overview: "Seven noble families...",
        poster_path: "/poster.jpg",
        backdrop_path: "/backdrop.jpg",
        media_type: "tv",
        first_air_date: "2011-04-17",
        vote_average: 8.4,
        vote_count: 23000,
        popularity: 250.0,
        status: "Ended",
        number_of_seasons: 8,
        number_of_episodes: 73,
        genres: [{ id: 10765, name: "Sci-Fi & Fantasy" }, { id: 18, name: "Drama" }],
        seasons: [
          { id: 3624, season_number: 0, name: "Specials", overview: "", poster_path: null, episode_count: 20, air_date: null },
          { id: 3625, season_number: 1, name: "Season 1", overview: "The first season...", poster_path: "/s1.jpg", episode_count: 10, air_date: "2011-04-17" },
        ],
      };

      const detail = normalizeTvDetail(raw);
      assert.equal(detail.id, "1399");
      assert.equal(detail.title, "Game of Thrones");
      assert.equal(detail.numberOfSeasons, 8);
      assert.equal(detail.duration, "8 Seasons");
      // Specials (season 0) are filtered out
      assert.equal(detail.seasons?.length, 1);
      assert.equal(detail.seasons?.[0]?.seasonNumber, 1);
      assert.equal(detail.seasons?.[0]?.name, "Season 1");
    });
  });

  describe("normalizeTvSeason", () => {
    it("normalizes season detail with episodes", () => {
      const raw: TMDBSeasonDetail = {
        id: 3625,
        season_number: 1,
        name: "Season 1",
        overview: "Trouble is brewing in Westeros.",
        poster_path: "/season1.jpg",
        episodes: [
          {
            id: 63056,
            episode_number: 1,
            season_number: 1,
            name: "Winter Is Coming",
            overview: "Jon Arryn is dead...",
            still_path: "/still1.jpg",
            air_date: "2011-04-17",
            vote_average: 8.7,
            runtime: 62,
          },
        ],
      };

      const season = normalizeTvSeason(raw);
      assert.equal(season.seasonNumber, 1);
      assert.equal(season.episodes?.length, 1);
      assert.equal(season.episodes?.[0]?.name, "Winter Is Coming");
      assert.equal(season.episodes?.[0]?.duration, "1h 2m");
    });
  });
});
