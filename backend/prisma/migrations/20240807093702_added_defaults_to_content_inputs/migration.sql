-- AlterTable
ALTER TABLE "ContentInput" ALTER COLUMN "inputType" SET DEFAULT 'TEXT',
ALTER COLUMN "inputLabel" SET DEFAULT 'Input label',
ALTER COLUMN "maxChars" SET DEFAULT 100,
ALTER COLUMN "required" SET DEFAULT true;
