-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('PRACTICE', 'EXAM');

-- CreateEnum
CREATE TYPE "QuizKind" AS ENUM ('THEORY', 'ERROR_ANALYSIS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleZh" TEXT NOT NULL,
    "titleVi" TEXT NOT NULL,
    "description" TEXT,
    "themeKey" TEXT NOT NULL DEFAULT 'indigo',
    "type" "LessonType" NOT NULL DEFAULT 'PRACTICE',
    "examMonth" INTEGER,
    "examYear" INTEGER,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonSection" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'text',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LessonSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SampleDocument" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "audience" TEXT,
    "body" TEXT NOT NULL,
    "signerOrg" TEXT,
    "date" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SampleDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabTerm" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "literary" TEXT NOT NULL,
    "colloquial" TEXT NOT NULL,
    "meaningVi" TEXT NOT NULL,
    "example" TEXT,

    CONSTRAINT "VocabTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixedPhrase" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "chinese" TEXT NOT NULL,
    "viExplanation" TEXT NOT NULL,

    CONSTRAINT "FixedPhrase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "kind" "QuizKind" NOT NULL DEFAULT 'THEORY',
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctIndex" INTEGER NOT NULL,
    "explanation" TEXT,
    "draftHtml" TEXT,
    "draftHtmlMarked" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClozeExercise" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "templateHtml" TEXT NOT NULL,
    "blanks" JSONB NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ClozeExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchItem" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "leftLabelVi" TEXT NOT NULL,
    "rightLabelZh" TEXT NOT NULL,
    "correctKey" TEXT NOT NULL,
    "explanation" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MatchItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WritingTask" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "facts" JSONB NOT NULL,
    "requiredKeywords" JSONB NOT NULL,
    "hint" TEXT,
    "referenceAnswer" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WritingTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuidedWritingField" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "placeholder" TEXT,
    "inputType" TEXT NOT NULL DEFAULT 'text',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GuidedWritingField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuidedWritingScenario" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "situationPrompt" TEXT NOT NULL,
    "modelAnswer" TEXT NOT NULL,
    "targetWordCount" INTEGER,

    CONSTRAINT "GuidedWritingScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "exerciseType" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "answerPayload" JSONB NOT NULL,
    "score" INTEGER,
    "maxScore" INTEGER,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_slug_key" ON "Lesson"("slug");

-- AddForeignKey
ALTER TABLE "LessonSection" ADD CONSTRAINT "LessonSection_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleDocument" ADD CONSTRAINT "SampleDocument_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabTerm" ADD CONSTRAINT "VocabTerm_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedPhrase" ADD CONSTRAINT "FixedPhrase_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClozeExercise" ADD CONSTRAINT "ClozeExercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchItem" ADD CONSTRAINT "MatchItem_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingTask" ADD CONSTRAINT "WritingTask_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuidedWritingField" ADD CONSTRAINT "GuidedWritingField_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuidedWritingScenario" ADD CONSTRAINT "GuidedWritingScenario_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
