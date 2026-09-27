import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getPaginationRange } from "../src/components/ui/pagination";

describe("Pagination Utility & Range Tests", () => {
  it("returns full range when totalPages is 7 or fewer", () => {
    assert.deepEqual(getPaginationRange(1, 1), [1]);
    assert.deepEqual(getPaginationRange(1, 3), [1, 2, 3]);
    assert.deepEqual(getPaginationRange(4, 7), [1, 2, 3, 4, 5, 6, 7]);
  });

  it("shows first 5 pages, dots-right, and last page when near the beginning", () => {
    const range1 = getPaginationRange(1, 20);
    assert.deepEqual(range1, [1, 2, 3, 4, 5, "dots-right", 20]);

    const range2 = getPaginationRange(3, 20);
    assert.deepEqual(range2, [1, 2, 3, 4, 5, "dots-right", 20]);
  });

  it("shows first page, dots-left, and last 5 pages when near the end", () => {
    const rangeLast = getPaginationRange(20, 20);
    assert.deepEqual(rangeLast, [1, "dots-left", 16, 17, 18, 19, 20]);

    const rangeNearEnd = getPaginationRange(18, 20);
    assert.deepEqual(rangeNearEnd, [1, "dots-left", 16, 17, 18, 19, 20]);
  });

  it("shows first page, dots-left, current siblings, dots-right, and last page in middle", () => {
    const rangeMiddle = getPaginationRange(10, 20);
    assert.deepEqual(rangeMiddle, [1, "dots-left", 9, 10, 11, "dots-right", 20]);

    const rangeAnother = getPaginationRange(6, 15);
    assert.deepEqual(rangeAnother, [1, "dots-left", 5, 6, 7, "dots-right", 15]);
  });

  it("caps totalPages to maximum supported pages (500 by default)", () => {
    const rangeOver500 = getPaginationRange(1, 1200);
    assert.deepEqual(rangeOver500, [1, 2, 3, 4, 5, "dots-right", 500]);
  });

  it("handles negative or invalid page inputs gracefully", () => {
    const rangeClamped = getPaginationRange(-5, 10);
    assert.deepEqual(rangeClamped, [1, 2, 3, 4, 5, "dots-right", 10]);
  });

  describe("24 Cards Page Size & Grid Alignment Tests", () => {
    it("ensures 24 is cleanly divisible across all responsive grid column breakpoints", () => {
      const pageSize = 24;
      assert.equal(pageSize % 6, 0, "24 cards must divide evenly into 6 columns (4 rows)");
      assert.equal(pageSize % 4, 0, "24 cards must divide evenly into 4 columns (6 rows)");
      assert.equal(pageSize % 3, 0, "24 cards must divide evenly into 3 columns (8 rows)");
      assert.equal(pageSize % 2, 0, "24 cards must divide evenly into 2 columns (12 rows)");
    });

    it("calculates accurate item ranges for 24 items per page", () => {
      const calculateRange = (page: number, pageSize: number, total: number) => {
        const from = Math.min((page - 1) * pageSize + 1, total);
        const to = Math.min(page * pageSize, total);
        return { from, to };
      };

      assert.deepEqual(calculateRange(1, 24, 4722), { from: 1, to: 24 });
      assert.deepEqual(calculateRange(2, 24, 4722), { from: 25, to: 48 });
      assert.deepEqual(calculateRange(3, 24, 4722), { from: 49, to: 72 });
      assert.deepEqual(calculateRange(197, 24, 4722), { from: 4705, to: 4722 });
    });

    it("calculates correct totalPages with 24 items per page", () => {
      assert.equal(Math.ceil(4722 / 24), 197);
      assert.equal(Math.ceil(24 / 24), 1);
      assert.equal(Math.ceil(25 / 24), 2);
      assert.equal(Math.ceil(0 / 24), 0);
    });
  });
});

