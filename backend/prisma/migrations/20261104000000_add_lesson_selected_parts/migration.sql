-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN "selectedParts" TEXT[] NOT NULL DEFAULT ARRAY['theory', 'samples', 'quiz', 'cloze', 'error', 'vocab', 'writing']::TEXT[];
