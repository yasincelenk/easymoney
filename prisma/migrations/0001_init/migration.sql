-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');
CREATE TYPE "Plan" AS ENUM ('FREE', 'STARTER', 'PRO');
CREATE TYPE "Jurisdiction" AS ENUM ('TR', 'INTL');
CREATE TYPE "Language" AS ENUM ('tr', 'en');
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'REVIEW', 'SIGNING', 'SIGNED', 'EXPIRED', 'CANCELLED');
CREATE TYPE "PartyRole" AS ENUM ('OWNER', 'COUNTERPARTY');
CREATE TYPE "SignatureProvider" AS ENUM ('MANUAL', 'EGUVEN', 'TURKTRUST');
CREATE TYPE "SignatureStatus" AS ENUM ('PENDING', 'SIGNED', 'DECLINED');
CREATE TYPE "ReminderKind" AS ENUM ('RENEWAL', 'EXPIRY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "Account" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "taxId" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'tr',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Istanbul',
    "esignProvider" "SignatureProvider" NOT NULL DEFAULT 'MANUAL',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "Membership" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "accountId" TEXT NOT NULL REFERENCES "Account"("id") ON DELETE CASCADE,
    "role" "Role" NOT NULL,
    CONSTRAINT membership_unique UNIQUE ("userId", "accountId")
);

CREATE TABLE "Subscription" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "accountId" TEXT NOT NULL REFERENCES "Account"("id") ON DELETE CASCADE,
    "plan" "Plan" NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodEnd" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "Template" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "accountId" TEXT NOT NULL REFERENCES "Account"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "jurisdiction" "Jurisdiction" NOT NULL,
    "language" "Language" NOT NULL,
    "bodyRichtext" JSONB NOT NULL,
    "placeholders" TEXT[] NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "Contract" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "accountId" TEXT NOT NULL REFERENCES "Account"("id") ON DELETE CASCADE,
    "templateId" TEXT REFERENCES "Template"("id") ON DELETE SET NULL,
    "title" TEXT NOT NULL,
    "type" TEXT,
    "language" "Language" NOT NULL,
    "status" "ContractStatus" NOT NULL,
    "effectiveAt" TIMESTAMP WITH TIME ZONE,
    "endAt" TIMESTAMP WITH TIME ZONE,
    "counterpartyName" TEXT,
    "counterpartyEmail" TEXT,
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "ContractVersion" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "contractId" TEXT NOT NULL REFERENCES "Contract"("id") ON DELETE CASCADE,
    "versionNo" INTEGER NOT NULL,
    "bodyRichtext" JSONB NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "Party" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "contractId" TEXT NOT NULL REFERENCES "Contract"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "PartyRole" NOT NULL
);

CREATE TABLE "Signature" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "contractId" TEXT NOT NULL REFERENCES "Contract"("id") ON DELETE CASCADE,
    "partyId" TEXT NOT NULL REFERENCES "Party"("id") ON DELETE CASCADE,
    "provider" "SignatureProvider" NOT NULL,
    "status" "SignatureStatus" NOT NULL,
    "signedAt" TIMESTAMP WITH TIME ZONE,
    "envelopeId" TEXT,
    "evidence" JSONB
);

CREATE TABLE "Reminder" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "contractId" TEXT NOT NULL REFERENCES "Contract"("id") ON DELETE CASCADE,
    "kind" "ReminderKind" NOT NULL,
    "dueAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "sentAt" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE "FileAsset" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "accountId" TEXT NOT NULL REFERENCES "Account"("id") ON DELETE CASCADE,
    "contractId" TEXT REFERENCES "Contract"("id") ON DELETE SET NULL,
    "path" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "AuditLog" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "accountId" TEXT NOT NULL REFERENCES "Account"("id") ON DELETE CASCADE,
    "actorId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "meta" JSONB,
    "contractId" TEXT REFERENCES "Contract"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX "Contract_account_status_idx" ON "Contract" ("accountId", "status");
CREATE INDEX "Contract_account_updated_idx" ON "Contract" ("accountId", "updatedAt" DESC);
CREATE INDEX "Contract_account_end_idx" ON "Contract" ("accountId", "endAt");
