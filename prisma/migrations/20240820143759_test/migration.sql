-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "Avatar" TEXT NOT NULL DEFAULT 'https://r2.catpics.xyz/default.png',
    "Banner" TEXT NOT NULL DEFAULT 'https://tenor.com/view/nettspend-nett-spend-plugg-laser-gif-384136205674952587',
    "About" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
