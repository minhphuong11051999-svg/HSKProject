-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN "premiumParts" TEXT[] NOT NULL DEFAULT ARRAY['cloze', 'error', 'vocab', 'writing']::TEXT[];
