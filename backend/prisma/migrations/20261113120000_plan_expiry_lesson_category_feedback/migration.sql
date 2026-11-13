ALTER TABLE "User" ADD COLUMN "planExpiresAt" TIMESTAMP(3);

ALTER TABLE "Lesson" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Lesson" ADD COLUMN "category" TEXT;

CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT,
    "email" TEXT,
    "message" TEXT NOT NULL,
    "page" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Put the existing lessons into the categories of the former hard-coded map.
UPDATE "Lesson" SET "category" = 'loai1-ban-than' WHERE "slug" IN ('luyen-viet-qingjiatiao', 'luyen-viet-qingjiatiao-shijia', 'luyen-viet-shenqingshu', 'luyen-viet-qiuzhixin');
UPDATE "Lesson" SET "category" = 'loai1-nguoi-khac' WHERE "slug" = 'luyen-viet-tuijianxin';
UPDATE "Lesson" SET "category" = 'loai1-to-chuc' WHERE "slug" = 'luyen-viet-jianyixin';
UPDATE "Lesson" SET "category" = 'loai2-bao-cho-biet' WHERE "slug" IN ('luyen-viet-qishi', 'luyen-viet-thongbao', 'luyen-viet-tonggao', 'luyen-viet-shengming');
UPDATE "Lesson" SET "category" = 'loai2-tinh-cam' WHERE "slug" IN ('luyen-viet-ganxiexin', 'luyen-viet-hexin', 'luyen-viet-yaoqingxin', 'luyen-viet-zhici');
