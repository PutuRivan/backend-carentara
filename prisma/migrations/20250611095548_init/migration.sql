/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phoneNumber` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "phoneNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_phoneNumber_key" ON "Booking"("phoneNumber");
