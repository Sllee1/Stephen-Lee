-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "userId" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "heightCm" DOUBLE PRECISION NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "activity" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "unitPref" TEXT NOT NULL,
    "goalWeightKg" DOUBLE PRECISION,
    "physique" TEXT,
    "targetBodyFatPct" DOUBLE PRECISION,
    "motivationMode" TEXT NOT NULL DEFAULT 'none',
    "dietStyle" TEXT NOT NULL DEFAULT 'balanced',
    "bmiPreference" TEXT NOT NULL DEFAULT 'standard',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Meal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "thumbUrl" TEXT,
    "time" TIMESTAMP(3) NOT NULL,
    "calories" DOUBLE PRECISION NOT NULL,
    "protein_g" DOUBLE PRECISION NOT NULL,
    "carbs_g" DOUBLE PRECISION NOT NULL,
    "fat_g" DOUBLE PRECISION NOT NULL,
    "satFat_g" DOUBLE PRECISION NOT NULL,
    "fiber_g" DOUBLE PRECISION NOT NULL,
    "sugar_g" DOUBLE PRECISION NOT NULL,
    "sodium_mg" DOUBLE PRECISION NOT NULL,
    "cholesterol_mg" DOUBLE PRECISION NOT NULL,
    "vitD_mcg" DOUBLE PRECISION NOT NULL,
    "calcium_mg" DOUBLE PRECISION NOT NULL,
    "iron_mg" DOUBLE PRECISION NOT NULL,
    "potassium_mg" DOUBLE PRECISION NOT NULL,
    "vitA_mcg" DOUBLE PRECISION NOT NULL,
    "vitC_mg" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealItem" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" TEXT,
    "calories" DOUBLE PRECISION NOT NULL,
    "protein_g" DOUBLE PRECISION NOT NULL,
    "carbs_g" DOUBLE PRECISION NOT NULL,
    "fat_g" DOUBLE PRECISION NOT NULL,
    "satFat_g" DOUBLE PRECISION NOT NULL,
    "fiber_g" DOUBLE PRECISION NOT NULL,
    "sugar_g" DOUBLE PRECISION NOT NULL,
    "sodium_mg" DOUBLE PRECISION NOT NULL,
    "cholesterol_mg" DOUBLE PRECISION NOT NULL,
    "vitD_mcg" DOUBLE PRECISION NOT NULL,
    "calcium_mg" DOUBLE PRECISION NOT NULL,
    "iron_mg" DOUBLE PRECISION NOT NULL,
    "potassium_mg" DOUBLE PRECISION NOT NULL,
    "vitA_mcg" DOUBLE PRECISION NOT NULL,
    "vitC_mg" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MealItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "notifyStart" BOOLEAN NOT NULL DEFAULT false,
    "notifyEnd" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TemplateEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DateEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "notifyStart" BOOLEAN NOT NULL DEFAULT false,
    "notifyEnd" BOOLEAN NOT NULL DEFAULT false,
    "sourceTemplateEventId" TEXT,

    CONSTRAINT "DateEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeightEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "WeightEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "normalized" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "WorkoutResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodyAnalysis" (
    "userId" TEXT NOT NULL,
    "thumbUrl" TEXT NOT NULL,
    "build" TEXT NOT NULL,
    "bmiOffset" DOUBLE PRECISION NOT NULL,
    "confidence" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BodyAnalysis_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Entitlement" (
    "userId" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'free',
    "provider" TEXT,
    "productId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entitlement_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "PushToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsdaFoodCache" (
    "fdcId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "serving" TEXT NOT NULL,
    "calories" DOUBLE PRECISION NOT NULL,
    "protein_g" DOUBLE PRECISION NOT NULL,
    "carbs_g" DOUBLE PRECISION NOT NULL,
    "fat_g" DOUBLE PRECISION NOT NULL,
    "satFat_g" DOUBLE PRECISION NOT NULL,
    "fiber_g" DOUBLE PRECISION NOT NULL,
    "sugar_g" DOUBLE PRECISION NOT NULL,
    "sodium_mg" DOUBLE PRECISION NOT NULL,
    "cholesterol_mg" DOUBLE PRECISION NOT NULL,
    "vitD_mcg" DOUBLE PRECISION NOT NULL,
    "calcium_mg" DOUBLE PRECISION NOT NULL,
    "iron_mg" DOUBLE PRECISION NOT NULL,
    "potassium_mg" DOUBLE PRECISION NOT NULL,
    "vitA_mcg" DOUBLE PRECISION NOT NULL,
    "vitC_mg" DOUBLE PRECISION NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsdaFoodCache_pkey" PRIMARY KEY ("fdcId")
);

-- CreateTable
CREATE TABLE "UsdaSearchCache" (
    "query" TEXT NOT NULL,
    "fdcIds" INTEGER[],
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsdaSearchCache_pkey" PRIMARY KEY ("query")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Meal_userId_date_idx" ON "Meal"("userId", "date");

-- CreateIndex
CREATE INDEX "TemplateEvent_userId_day_idx" ON "TemplateEvent"("userId", "day");

-- CreateIndex
CREATE INDEX "DateEvent_userId_date_idx" ON "DateEvent"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "WeightEntry_userId_date_key" ON "WeightEntry"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutResult_userId_normalized_date_key" ON "WorkoutResult"("userId", "normalized", "date");

-- CreateIndex
CREATE UNIQUE INDEX "PushToken_token_key" ON "PushToken"("token");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealItem" ADD CONSTRAINT "MealItem_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateEvent" ADD CONSTRAINT "TemplateEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DateEvent" ADD CONSTRAINT "DateEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeightEntry" ADD CONSTRAINT "WeightEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutResult" ADD CONSTRAINT "WorkoutResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodyAnalysis" ADD CONSTRAINT "BodyAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entitlement" ADD CONSTRAINT "Entitlement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushToken" ADD CONSTRAINT "PushToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
