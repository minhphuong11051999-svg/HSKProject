-- CreateTable
CREATE TABLE "Flashcard" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "pinyin" TEXT NOT NULL DEFAULT '',
    "meaning" TEXT NOT NULL DEFAULT '',
    "partOfSpeech" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "phrases" JSONB NOT NULL DEFAULT '[]',
    "exampleZh" TEXT NOT NULL DEFAULT '',
    "exampleVi" TEXT NOT NULL DEFAULT '',
    "questions" JSONB NOT NULL DEFAULT '[]',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Flashcard_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
