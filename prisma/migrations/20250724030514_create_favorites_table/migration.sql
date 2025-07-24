/*
  Warnings:

  - You are about to drop the `_Users_Favorite_Articles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Users_Favorite_Articles" DROP CONSTRAINT "_Users_Favorite_Articles_A_fkey";

-- DropForeignKey
ALTER TABLE "_Users_Favorite_Articles" DROP CONSTRAINT "_Users_Favorite_Articles_B_fkey";

-- DropTable
DROP TABLE "_Users_Favorite_Articles";

-- CreateTable
CREATE TABLE "favorites" (
    "userId" INTEGER NOT NULL,
    "articleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("userId","articleId")
);

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
