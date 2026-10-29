import { test, expect } from "@playwright/test";

const UNKNOWN_USER = "e2e-user-with-no-books";

test.describe("GET /api/books", () => {
  test("returns an empty page for a user with no books", async ({ request }) => {
    const response = await request.get("/api/books", {
      params: { user: UNKNOWN_USER },
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({
      books: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 0,
      pageSize: 25,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });

  test("clamps out-of-range pagination values", async ({ request }) => {
    const response = await request.get("/api/books", {
      params: { user: UNKNOWN_USER, page: "0", pageSize: "1000" },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.currentPage).toBe(1);
    expect(body.pageSize).toBe(100);
  });

  test("accepts status, ordering and direction filters", async ({ request }) => {
    const response = await request.get("/api/books", {
      params: {
        user: UNKNOWN_USER,
        status: "1",
        order: "bookTitle",
        desc: "true",
        page: "2",
        pageSize: "10",
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({
      books: [],
      totalCount: 0,
      currentPage: 2,
      pageSize: 10,
      totalPages: 0,
      hasPreviousPage: true,
    });
  });

  test("returns 404 for a book the user does not have", async ({ request }) => {
    const response = await request.get(
      `/api/books/${UNKNOWN_USER}/999999999`
    );

    expect(response.status()).toBe(404);
    expect(await response.json()).toMatchObject({ error: "Book not found" });
  });
});
