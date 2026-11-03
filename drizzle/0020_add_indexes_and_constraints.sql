-- Dedupe authors before adding the case-insensitive unique index. Books that
-- pointed at a duplicate are repointed at the oldest row, then the duplicate
-- is removed.
UPDATE book b
SET author_id = k.keep_id
FROM author a
JOIN (
	SELECT lower(name) AS lname, MIN(id) AS keep_id
	FROM author
	GROUP BY lower(name)
) k ON k.lname = lower(a.name)
WHERE b.author_id = a.id AND a.id <> k.keep_id;

DELETE FROM author a
USING (
	SELECT lower(name) AS lname, MIN(id) AS keep_id
	FROM author
	GROUP BY lower(name)
) k
WHERE lower(a.name) = k.lname AND a.id <> k.keep_id;

-- Collapse duplicate books per reader/hardcover id, moving notes and activity
-- log rows to the oldest surviving book first.
WITH keeper AS (
	SELECT user_id, hardcover_id, MIN(id) AS keep_id
	FROM book
	WHERE hardcover_id > 0 AND user_id IS NOT NULL
	GROUP BY user_id, hardcover_id
	HAVING COUNT(*) > 1
)
UPDATE book_note n
SET book_id = k.keep_id
FROM book b
JOIN keeper k
	ON k.user_id = b.user_id AND k.hardcover_id = b.hardcover_id
WHERE n.book_id = b.id AND b.id <> k.keep_id;

WITH keeper AS (
	SELECT user_id, hardcover_id, MIN(id) AS keep_id
	FROM book
	WHERE hardcover_id > 0 AND user_id IS NOT NULL
	GROUP BY user_id, hardcover_id
	HAVING COUNT(*) > 1
)
UPDATE user_activity_log l
SET book_id = k.keep_id
FROM book b
JOIN keeper k
	ON k.user_id = b.user_id AND k.hardcover_id = b.hardcover_id
WHERE l.book_id = b.id AND b.id <> k.keep_id;

WITH keeper AS (
	SELECT user_id, hardcover_id, MIN(id) AS keep_id
	FROM book
	WHERE hardcover_id > 0 AND user_id IS NOT NULL
	GROUP BY user_id, hardcover_id
	HAVING COUNT(*) > 1
)
DELETE FROM book b
USING keeper k
WHERE b.user_id = k.user_id
	AND b.hardcover_id = k.hardcover_id
	AND b.id <> k.keep_id;

-- One goal per reader per year.
DELETE FROM user_goal a
USING user_goal b
WHERE a.user_id = b.user_id
	AND a.goal_year = b.goal_year
	AND a.id > b.id;

CREATE UNIQUE INDEX IF NOT EXISTS "author_name_lower_idx"
	ON "author" (lower(name));

CREATE UNIQUE INDEX IF NOT EXISTS "book_user_hardcover_idx"
	ON "book" (user_id, hardcover_id)
	WHERE hardcover_id > 0;

CREATE UNIQUE INDEX IF NOT EXISTS "user_goal_user_year_idx"
	ON "user_goal" (user_id, goal_year);

CREATE INDEX IF NOT EXISTS "book_user_status_date_read_idx"
	ON "book" (user_id, status, date_read);

CREATE INDEX IF NOT EXISTS "book_user_hardcover_lookup_idx"
	ON "book" (user_id, hardcover_id);

CREATE INDEX IF NOT EXISTS "user_activity_log_user_updated_date_idx"
	ON "user_activity_log" (user_id, updated_date DESC);

CREATE INDEX IF NOT EXISTS "book_note_book_user_idx"
	ON "book_note" (book_id, user_id);
