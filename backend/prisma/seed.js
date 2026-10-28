const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const env = require('../src/config/env');

const prisma = new PrismaClient();

const NESTED_KEYS = [
  'sections',
  'sampleDocuments',
  'vocabTerms',
  'fixedPhrases',
  'quizQuestions',
  'clozeExercises',
  'matchItems',
  'writingTasks',
  'guidedWritingFields',
  'guidedWritingScenarios',
];

function loadContentFor(slug) {
  const file = path.join(__dirname, 'data', `${slug}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function buildNestedCreate(content) {
  const result = {};
  for (const key of NESTED_KEYS) {
    if (Array.isArray(content?.[key])) {
      result[key] = { create: content[key] };
    }
  }
  return result;
}

const LESSONS = [
  { slug: 'luyen-viet-thongbao', titleZh: '通知', titleVi: 'Thông báo Hành chính', themeKey: 'indigo', orderIndex: 1 },
  { slug: 'luyen-viet-qishi', titleZh: '启事', titleVi: 'Bố cáo / Thông báo', themeKey: 'sky', orderIndex: 2 },
  { slug: 'luyen-viet-tuijianxin', titleZh: '推荐信', titleVi: 'Thư giới thiệu', themeKey: 'indigo', orderIndex: 3 },
  { slug: 'luyen-viet-yaoqingxin', titleZh: '邀请信', titleVi: 'Thư mời', themeKey: 'indigo', orderIndex: 4 },
  { slug: 'luyen-viet-qingjiatiao', titleZh: '请假条', titleVi: 'Đơn xin nghỉ phép', themeKey: 'indigo', orderIndex: 5 },
  { slug: 'luyen-viet-qingjiatiao-shijia', titleZh: '请假条 (事假/事务类)', titleVi: 'Đơn xin nghỉ phép (việc riêng)', themeKey: 'indigo', orderIndex: 6 },
  { slug: 'luyen-viet-shenqingshu', titleZh: '申请书', titleVi: 'Đơn xin', themeKey: 'indigo', orderIndex: 7 },
];

async function main() {
  const passwordHash = await bcrypt.hash(env.seedAdmin.password, 10);
  await prisma.user.upsert({
    where: { email: env.seedAdmin.email },
    update: {},
    create: {
      email: env.seedAdmin.email,
      passwordHash,
      name: 'Admin',
      role: 'ADMIN',
    },
  });

  for (const lesson of LESSONS) {
    const existing = await prisma.lesson.findUnique({ where: { slug: lesson.slug } });
    const content = loadContentFor(lesson.slug);

    if (existing) {
      if (content) {
        await prisma.$transaction(
          NESTED_KEYS.map((key) => prisma[key].deleteMany({ where: { lessonId: existing.id } }))
        );
        await prisma.lesson.update({
          where: { id: existing.id },
          data: { ...lesson, ...buildNestedCreate(content) },
        });
      } else {
        await prisma.lesson.update({ where: { id: existing.id }, data: lesson });
      }
      continue;
    }

    await prisma.lesson.create({
      data: { ...lesson, type: 'PRACTICE', ...(content ? buildNestedCreate(content) : {}) },
    });
  }

  console.log('Seed completed. Admin login:', env.seedAdmin.email);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
