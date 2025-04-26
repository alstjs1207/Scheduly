// src/app.module.ts
import { Module } from '@nestjs/common';
import { StudentModule } from './modules/student.module';
import { PrismaService } from './services/prisma.service';

@Module({
  imports: [StudentModule],
  providers: [PrismaService],
})
export class AppModule {}

