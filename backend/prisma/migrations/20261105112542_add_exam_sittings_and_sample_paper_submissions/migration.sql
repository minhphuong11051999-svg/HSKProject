-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "examSittingId" TEXT,
ADD COLUMN     "samplePaperId" TEXT,
ALTER COLUMN "lessonId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ExamYear" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamSitting" (
    "id" TEXT NOT NULL,
    "examYearId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "examDate" TIMESTAMP(3),
    "titleZh" TEXT NOT NULL,
    "titleVi" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamSitting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExamYear_year_key" ON "ExamYear"("year");

-- CreateIndex
CREATE UNIQUE INDEX "ExamSitting_slug_key" ON "ExamSitting"("slug");

-- AddForeignKey
ALTER TABLE "ExamSitting" ADD CONSTRAINT "ExamSitting_examYearId_fkey" FOREIGN KEY ("examYearId") REFERENCES "ExamYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_samplePaperId_fkey" FOREIGN KEY ("samplePaperId") REFERENCES "SamplePaper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_examSittingId_fkey" FOREIGN KEY ("examSittingId") REFERENCES "ExamSitting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
