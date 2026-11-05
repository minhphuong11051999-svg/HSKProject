-- AlterTable
ALTER TABLE "GuidedWritingField" ADD COLUMN     "group" TEXT NOT NULL DEFAULT 'writing';

-- AlterTable
ALTER TABLE "GuidedWritingScenario" ADD COLUMN     "group" TEXT NOT NULL DEFAULT 'writing';
