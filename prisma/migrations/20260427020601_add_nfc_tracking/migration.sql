-- CreateTable
CREATE TABLE `Tamu` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `namaTamu` VARCHAR(191) NOT NULL,
    `asalInstansi` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `noTelp` VARCHAR(191) NULL,
    `nik` VARCHAR(191) NULL,
    `karyawanDituju` VARCHAR(191) NULL,
    `departemen` VARCHAR(191) NULL,
    `tujuanKunjungan` VARCHAR(191) NOT NULL,
    `tanggalKunjungan` DATETIME(3) NULL,
    `waktuCheckIn` DATETIME(3) NOT NULL,
    `waktuCheckOut` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL DEFAULT 'Menunggu Kedatangan',
    `nfcId` VARCHAR(191) NULL,
    `fotoKtp` VARCHAR(191) NULL,
    `statusKunjungan` VARCHAR(191) NULL DEFAULT 'MENUNGGU_GATE_1',
    `gedungTujuan` VARCHAR(191) NULL,
    `aksesAktif` VARCHAR(191) NULL,
    `aktualCheckIn` DATETIME(3) NULL,
    `aktualCheckOut` DATETIME(3) NULL,
    `kartuNfcId` INTEGER NULL,

    UNIQUE INDEX `Tamu_kartuNfcId_key`(`kartuNfcId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KartuNfc` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uidKartu` VARCHAR(191) NOT NULL,
    `kodeVisual` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'TERSEDIA',

    UNIQUE INDEX `KartuNfc_uidKartu_key`(`uidKartu`),
    UNIQUE INDEX `KartuNfc_kodeVisual_key`(`kodeVisual`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LogTracking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `waktuTap` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lokasiTap` VARCHAR(191) NOT NULL,
    `jenisTap` VARCHAR(191) NOT NULL,
    `kartuNfcId` INTEGER NOT NULL,
    `tamuId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnggotaRombongan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `noTelp` VARCHAR(191) NULL,
    `tamuId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'SATPAM_AREA',
    `lokasiTugas` VARCHAR(191) NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Tamu` ADD CONSTRAINT `Tamu_kartuNfcId_fkey` FOREIGN KEY (`kartuNfcId`) REFERENCES `KartuNfc`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogTracking` ADD CONSTRAINT `LogTracking_kartuNfcId_fkey` FOREIGN KEY (`kartuNfcId`) REFERENCES `KartuNfc`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogTracking` ADD CONSTRAINT `LogTracking_tamuId_fkey` FOREIGN KEY (`tamuId`) REFERENCES `Tamu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnggotaRombongan` ADD CONSTRAINT `AnggotaRombongan_tamuId_fkey` FOREIGN KEY (`tamuId`) REFERENCES `Tamu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
