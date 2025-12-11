-- CreateEnum
CREATE TYPE "TopicCategory" AS ENUM ('OFFICIAL', 'EVENT', 'RECRUITMENT', 'DAILY');

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "category" "TopicCategory" NOT NULL DEFAULT 'OFFICIAL';
