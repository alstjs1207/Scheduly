-- AlterTable
ALTER TABLE `Student` MODIFY `externalId` VARCHAR(191) NOT NULL DEFAULT (REPLACE(UUID(), '-', ''));
