import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  authorScore,
  isConfident,
  normalize,
  titleScore,
  type Candidate,
  type PendingBook,
} from "../../lib/books/matching";

function candidate(overrides: Partial<Candidate> = {}): Candidate {
  return {
    id: 1,
    title: "",
    alternativeTitles: [],
    authorNames: [],
    releaseYear: null,
    titleScore: 0,
    authorScore: 0,
    score: 0,
    ...overrides,
  };
}

function pendingBook(overrides: Partial<PendingBook> = {}): PendingBook {
  return {
    id: 1,
    title: "The Hobbit",
    release_year: 1937,
    user_id: "user_1",
    author: "J. R. R. Tolkien",
    ...overrides,
  };
}

describe("normalize", () => {
  it("lowercases, strips accents and punctuation", () => {
    assert.equal(normalize("  Éowyn's  Song! "), "eowyn s song");
  });

  it("collapses whitespace", () => {
    assert.equal(normalize("A   B\tC"), "a b c");
  });
});

describe("titleScore", () => {
  it("scores identical titles as 1", () => {
    assert.equal(
      titleScore("The Hobbit", candidate({ title: "The Hobbit" })),
      1
    );
  });

  it("matches accent/case-insensitive titles", () => {
    assert.equal(titleScore("Eowyn", candidate({ title: "Éowyn" })), 1);
  });

  it("treats a subtitle as strong containment", () => {
    const score = titleScore(
      "The Hobbit",
      candidate({ title: "The Hobbit: There and Back Again" })
    );
    assert.equal(score, 0.95);
  });

  it("uses alternative titles", () => {
    const score = titleScore(
      "The Fellowship of the Ring",
      candidate({
        title: "LOTR",
        alternativeTitles: ["The Fellowship of the Ring"],
      })
    );
    assert.equal(score, 1);
  });

  it("returns 0 when nothing overlaps", () => {
    assert.equal(titleScore("The Hobbit", candidate({ title: "Dune" })), 0);
  });

  it("returns 0 for an empty title", () => {
    assert.equal(titleScore("", candidate({ title: "The Hobbit" })), 0);
  });
});

describe("authorScore", () => {
  it("scores identical authors as 1", () => {
    assert.equal(
      authorScore(
        "J. R. R. Tolkien",
        candidate({ authorNames: ["J.R.R. Tolkien"] })
      ),
      1
    );
  });

  it("scores name containment at 0.85", () => {
    assert.equal(
      authorScore("Tolkien", candidate({ authorNames: ["J. R. R. Tolkien"] })),
      0.85
    );
  });

  it("scores shared name tokens", () => {
    const score = authorScore(
      "Tolkien R",
      candidate({ authorNames: ["J. R. R. Tolkien"] })
    );
    assert.equal(score, 0.7);
  });

  it("returns 0 for an empty author", () => {
    assert.equal(authorScore("", candidate({ authorNames: ["Tolkien"] })), 0);
  });
});

describe("isConfident", () => {
  it("accepts a strong title and author match", () => {
    assert.equal(
      isConfident(
        pendingBook(),
        candidate({
          titleScore: 1,
          authorScore: 1,
          score: 1,
        })
      ),
      true
    );
  });

  it("rejects a weak title score", () => {
    assert.equal(
      isConfident(
        pendingBook(),
        candidate({ titleScore: 0.5, authorScore: 1, score: 0.9 })
      ),
      false
    );
  });

  it("rejects a weak author score when the book has an author", () => {
    assert.equal(
      isConfident(
        pendingBook(),
        candidate({ titleScore: 1, authorScore: 0.4, score: 0.9 })
      ),
      false
    );
  });

  it("does not require an author match when the book has no author", () => {
    assert.equal(
      isConfident(
        pendingBook({ author: null }),
        candidate({ titleScore: 1, authorScore: 0, score: 0.9 })
      ),
      true
    );
  });
});
