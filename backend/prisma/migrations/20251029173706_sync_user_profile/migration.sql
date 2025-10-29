-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletionCancelToken" TEXT,
ADD COLUMN     "deletionGraceUntil" TIMESTAMP(3),
ADD COLUMN     "deletionReason" TEXT,
ADD COLUMN     "deletionRequestedAt" TIMESTAMP(3),
ADD COLUMN     "isPendingDeletion" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
