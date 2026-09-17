import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeMovieDetail,
  normalizeTvDetail,
  normalizeTvSeason,
} from "../src/lib/metadata/normalize";
import type {
  TMDBMovieDetail,
  TMDBTvDetail,
  TMDBSeasonDetail,
} from "../src/types/tmdb";

describe("Content Details Normalization & Route Validation", () => {
  describe("Route ID Validation", () => {
    const isValidId = (id: string | null | undefined): boolean => {
      return Boolean(id && /^\d+$/.test(id));
    };

    it("accepts valid numeric string IDs", () => {
      assert.equal(isValidId("27205"), true);
      assert.equal(isValidId("1399"), true);
      assert.equal(isValidId("1"), true);
    });

    it("rejects non-numeric, alphanumeric, negative, or empty IDs", () => {
      assert.equal(isValidId("abc"), false);
      assert.equal(isValidId("123abc"), false);
      assert.equal(isValidId("-5"), false);
      assert.equal(isValidId(""), false);
      assert.equal(isValidId("   "), false);
      assert.equal(isValidId(null), false);
      assert.equal(isValidId(undefined), false);
    });
  });

  describe("Movie Detail Integrity & Fallbacks", () => {
    it("normalizes complete movie detail without fabricating unsupported badges", () => {
      const raw: TMDBMovieDetail = {
        id: 27205,
        title: "Inception",
        original_title: "Inception",
        tagline: "Your mind is the scene of the crime.",
        overview: "Cobb, a skilled thief...",
        poster_path: "/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg",
        backdrop_path: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
        media_type: "movie",
        release_date: "2010-07-15",
        vote_average: 8.368,
        vote_count: 36000,
        popularity: 120.5,
        runtime: 148,
        status: "Released",
        genres: [
          { id: 28, name: "Action" },
          { id: 878, name: "Science Fiction" },
        ],
        credits: {
          cast: [
            {
              id: 6193,
              name: "Leonardo DiCaprio",
              character: "Dom Cobb",
              profile_path: "/wo2YrW09z7b0q7un9.jpg",
              order: 0,
            },
          ],
        },
        similar: {
          page: 1,
          results: [],
          total_pages: 0,
          total_results: 0,
        },
      };

      const detail = normalizeMovieDetail(raw);

      assert.equal(detail.id, "27205");
      assert.equal(detail.title, "Inception");
      assert.equal(detail.tagline, "Your mind is the scene of the crime.");
      assert.equal(detail.duration, "2h 28m");
      assert.equal(detail.runtimeMinutes, 148);
      assert.equal(detail.rating, 8.4);
      assert.equal(detail.voteCount, 36000);
      assert.equal(detail.status, "Released");
      assert.deepEqual(detail.genres, ["Action", "Science Fiction"]);
      assert.equal(detail.cast.length, 1);
      assert.equal(detail.cast[0]?.name, "Leonardo DiCaprio");
      assert.equal(detail.cast[0]?.character, "Dom Cobb");
    });

    it("handles movie with missing optional fields gracefully", () => {
      const minimalMovie: TMDBMovieDetail = {
        id: 8888,
        title: "Indie Film",
        tagline: null,
        overview: "",
        poster_path: null,
        backdrop_path: null,
        vote_average: 0,
        vote_count: 0,
        popularity: 0,
        runtime: 0,
        status: "In Production",
        genres: [],
      };

      const detail = normalizeMovieDetail(minimalMovie);

      assert.equal(detail.id, "8888");
      assert.equal(detail.title, "Indie Film");
      assert.equal(detail.tagline, null);
      assert.equal(detail.duration, undefined);
      assert.equal(detail.runtimeMinutes, null);
      assert.equal(detail.posterUrl, null);
      assert.equal(detail.backdropUrl, null);
      assert.equal(detail.rating, 0);
      assert.equal(detail.voteCount, 0);
      assert.deepEqual(detail.genres, []);
      assert.deepEqual(detail.cast, []);
      assert.deepEqual(detail.similar, []);
    });
  });

  describe("TV Show & Season Detail Integrity", () => {
    it("normalizes TV details with seasons list and episode counts", () => {
      const rawTv: TMDBTvDetail = {
        id: 1399,
        name: "Game of Thrones",
        tagline: "Winter Is Coming",
        overview: "Seven noble families fight for control of Westeros.",
        poster_path: "/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
        backdrop_path: "/suopoADq0k8YZr4dQXLi6q0xHHO.jpg",
        vote_average: 8.45,
        vote_count: 23000,
        popularity: 250.0,
        status: "Ended",
        number_of_seasons: 8,
        number_of_episodes: 73,
        genres: [{ id: 10765, name: "Sci-Fi & Fantasy" }],
        seasons: [
          {
            id: 3624,
            season_number: 0,
            name: "Specials",
            overview: "",
            poster_path: null,
            episode_count: 10,
            air_date: null,
          },
          {
            id: 3625,
            season_number: 1,
            name: "Season 1",
            overview: "Season 1 overview",
            poster_path: "/s1.jpg",
            episode_count: 10,
            air_date: "2011-04-17",
          },
        ],
      };

      const detail = normalizeTvDetail(rawTv);

      assert.equal(detail.id, "1399");
      assert.equal(detail.title, "Game of Thrones");
      assert.equal(detail.numberOfSeasons, 8);
      assert.equal(detail.numberOfEpisodes, 73);
      assert.equal(detail.status, "Ended");
      // Specials (season 0) are filtered from regular season lists
      assert.equal(detail.seasons?.length, 1);
      assert.equal(detail.seasons?.[0]?.seasonNumber, 1);
      assert.equal(detail.seasons?.[0]?.episodeCount, 10);
    });

    it("normalizes Season detail with its full episode list", () => {
      const rawSeason: TMDBSeasonDetail = {
        id: 3625,
        season_number: 1,
        name: "Season 1",
        overview: "The first season.",
        poster_path: "/s1.jpg",
        episodes: [
          {
            id: 63056,
            episode_number: 1,
            season_number: 1,
            name: "Winter Is Coming",
            overview: "Jon Arryn is dead.",
            still_path: "/still.jpg",
            air_date: "2011-04-17",
            vote_average: 8.7,
            runtime: 62,
          },
          {
            id: 63057,
            episode_number: 2,
            season_number: 1,
            name: "The Kingsroad",
            overview: "Bran's fate remains in doubt.",
            still_path: null,
            air_date: "2011-04-24",
            vote_average: 8.5,
            runtime: 56,
          },
        ],
      };

      const season = normalizeTvSeason(rawSeason);

      assert.equal(season.seasonNumber, 1);
      assert.equal(season.episodeCount, 2);
      assert.equal(season.episodes?.length, 2);
      assert.equal(season.episodes?.[0]?.name, "Winter Is Coming");
      assert.equal(season.episodes?.[0]?.duration, "1h 2m");
      assert.equal(season.episodes?.[1]?.stillUrl, null);
      assert.equal(season.episodes?.[1]?.duration, "56m");
    });
  });
});
