-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY['javascript']::TEXT[],
ADD COLUMN     "starterCodes" JSONB;
