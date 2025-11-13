/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Vendor` table. All the data in the column will be lost.
  - Made the column `customerId` on table `Invoice` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_customerId_fkey";

-- DropIndex
DROP INDEX "Payment_invoiceId_key";

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "address" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "dueDate" TIMESTAMP(3),
ALTER COLUMN "customerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "category",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
