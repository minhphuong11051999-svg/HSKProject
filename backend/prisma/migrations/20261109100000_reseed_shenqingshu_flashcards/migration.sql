-- One-off data reset: drop the first draft of the 申请书 flashcards so the seed
-- (which only fills lessons that have no cards) loads the updated 7-topic set.
DELETE FROM "Flashcard"
WHERE "lessonId" IN (SELECT "id" FROM "Lesson" WHERE "slug" = 'luyen-viet-shenqingshu');
