-- CreateTable
CREATE TABLE "Log" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);
