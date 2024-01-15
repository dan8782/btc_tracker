-- CreateTable
CREATE TABLE "BitcoinPrice" (
    "id" SERIAL NOT NULL,
    "currency" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "description" TEXT NOT NULL,
    "rate_float" DOUBLE PRECISION NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BitcoinPrice_pkey" PRIMARY KEY ("id")
);
