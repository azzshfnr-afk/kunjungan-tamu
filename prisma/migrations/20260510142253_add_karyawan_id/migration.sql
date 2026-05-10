-- AlterTable
ALTER TABLE `Tamu` ADD COLUMN `karyawanId` VARCHAR(191) NULL,
    ADD COLUMN `tipeTamu` VARCHAR(191) NOT NULL DEFAULT 'regular';
