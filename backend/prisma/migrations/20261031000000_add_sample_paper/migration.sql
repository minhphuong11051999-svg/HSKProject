-- CreateTable
CREATE TABLE "SamplePaper" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleZh" TEXT NOT NULL,
    "titleVi" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SamplePaper_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SamplePaper_slug_key" ON "SamplePaper"("slug");
