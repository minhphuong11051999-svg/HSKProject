-- AlterTable
ALTER TABLE "ExamSitting" ADD COLUMN     "outline" TEXT,
ADD COLUMN     "requirements" TEXT;

-- AlterTable
ALTER TABLE "SamplePaper" ADD COLUMN     "outline" TEXT,
ADD COLUMN     "requirements" TEXT;
