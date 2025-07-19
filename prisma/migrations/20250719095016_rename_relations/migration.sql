/*
  Warnings:

  - You are about to drop the `_ArticleTags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FollowRelation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserFavorites` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ArticleTags" DROP CONSTRAINT "_ArticleTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_ArticleTags" DROP CONSTRAINT "_ArticleTags_B_fkey";

-- DropForeignKey
ALTER TABLE "_FollowRelation" DROP CONSTRAINT "_FollowRelation_A_fkey";

-- DropForeignKey
ALTER TABLE "_FollowRelation" DROP CONSTRAINT "_FollowRelation_B_fkey";

-- DropForeignKey
ALTER TABLE "_UserFavorites" DROP CONSTRAINT "_UserFavorites_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserFavorites" DROP CONSTRAINT "_UserFavorites_B_fkey";

-- DropTable
DROP TABLE "_ArticleTags";

-- DropTable
DROP TABLE "_FollowRelation";

-- DropTable
DROP TABLE "_UserFavorites";

-- CreateTable
CREATE TABLE "_Users_Favorite_Articles" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_Users_Favorite_Articles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_Articles_Have_Tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_Articles_Have_Tags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_Users_Follow_Users" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_Users_Follow_Users_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_Users_Favorite_Articles_B_index" ON "_Users_Favorite_Articles"("B");

-- CreateIndex
CREATE INDEX "_Articles_Have_Tags_B_index" ON "_Articles_Have_Tags"("B");

-- CreateIndex
CREATE INDEX "_Users_Follow_Users_B_index" ON "_Users_Follow_Users"("B");

-- AddForeignKey
ALTER TABLE "_Users_Favorite_Articles" ADD CONSTRAINT "_Users_Favorite_Articles_A_fkey" FOREIGN KEY ("A") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Users_Favorite_Articles" ADD CONSTRAINT "_Users_Favorite_Articles_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Articles_Have_Tags" ADD CONSTRAINT "_Articles_Have_Tags_A_fkey" FOREIGN KEY ("A") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Articles_Have_Tags" ADD CONSTRAINT "_Articles_Have_Tags_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Users_Follow_Users" ADD CONSTRAINT "_Users_Follow_Users_A_fkey" FOREIGN KEY ("A") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Users_Follow_Users" ADD CONSTRAINT "_Users_Follow_Users_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
