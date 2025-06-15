-- CreateTable
CREATE TABLE `Student` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `externalId` VARCHAR(191) NOT NULL DEFAULT (UUID()),
    `name` VARCHAR(191) NOT NULL,
    `state` ENUM('NORMAL', 'GRADUATE', 'DELETED') NOT NULL DEFAULT 'NORMAL',
    `type` ENUM('EXAMINEE', 'DROPPER', 'ADULT') NOT NULL,
    `region` VARCHAR(191) NOT NULL,
    `age` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL DEFAULT '',
    `startDate` DATE NOT NULL,
    `endDate` DATE NULL,
    `parentInfo` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT '#3B82F6',

    UNIQUE INDEX `Student_externalId_key`(`externalId`),
    INDEX `Student_externalId_idx`(`externalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Schedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `isRecurring` BOOLEAN NOT NULL DEFAULT false,
    `recurrenceRule` VARCHAR(191) NULL,
    `recurrenceEndDate` VARCHAR(191) NULL,
    `parentScheduleId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Schedule_studentId_idx`(`studentId`),
    INDEX `Schedule_date_idx`(`date`),
    INDEX `Schedule_parentScheduleId_idx`(`parentScheduleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_parentScheduleId_fkey` FOREIGN KEY (`parentScheduleId`) REFERENCES `Schedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
