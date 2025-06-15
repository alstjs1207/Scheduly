import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD;
  if (!defaultPassword) {
    throw new Error('ADMIN_DEFAULT_PASSWORD 환경 변수가 설정되지 않았습니다.');
  }

  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const admin = await prisma.student.create({
    data: {
      name: '관리자',
      type: 'ADMIN',
      state: 'NORMAL',
      region: '서울',
      age: '30',
      description: '시스템 관리자',
      startDate: new Date(),
      parentInfo: '-',
      phoneNumber: 'admin',
      password: hashedPassword,
    },
  });

  console.log('Created admin account:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 