-- CreateTable
CREATE TABLE "SentNotification" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "flag" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SentNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SentNotification_date_idx" ON "SentNotification"("date");

-- CreateIndex
CREATE UNIQUE INDEX "SentNotification_eventId_flag_date_key" ON "SentNotification"("eventId", "flag", "date");
