-- CreateTable
CREATE TABLE `Student` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `state` ENUM('NORMAL', 'GRADUATE', 'DELETED') NOT NULL DEFAULT 'NORMAL',
    `type` ENUM('EXAMINEE', 'DROPPER', 'ADULT') NOT NULL,
    `region` VARCHAR(191) NOT NULL,
    `age`  VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL DEFAULT '',
    `startDate` DATE NOT NULL,
    `endDate` DATE NULL,
    `parentInfo` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
