-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "cards" TEXT[],
ADD COLUMN     "flippedIndices" TEXT[],
ADD COLUMN     "matchedPairs" TEXT[];
