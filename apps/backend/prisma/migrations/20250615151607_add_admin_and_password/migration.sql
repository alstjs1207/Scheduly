-- AlterTable
ALTER TABLE `Student` ADD COLUMN `password` VARCHAR(191) NULL DEFAULT '$2b$10$YourHashedDefaultPasswordHere';
