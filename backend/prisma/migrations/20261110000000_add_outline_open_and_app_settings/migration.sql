-- AlterTable
ALTER TABLE "SamplePaper" ADD COLUMN     "outlineOpen" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ExamSitting" ADD COLUMN     "outlineOpen" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "AppSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("key")
);
