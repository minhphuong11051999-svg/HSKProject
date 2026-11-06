-- AlterTable
ALTER TABLE "QuizQuestion" ADD COLUMN     "correctedHtml" TEXT,
ADD COLUMN     "mode" TEXT NOT NULL DEFAULT 'choice';

-- CreateTable
CREATE TABLE "LessonExercise" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "hints" JSONB NOT NULL DEFAULT '[]',
    "answer" TEXT NOT NULL DEFAULT '',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LessonExercise_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LessonExercise" ADD CONSTRAINT "LessonExercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
