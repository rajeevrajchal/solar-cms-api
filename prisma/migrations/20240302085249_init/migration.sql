-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'WORKER', 'CUSTOMER', 'ENGINEER', 'PROJECT_MANAGER', 'SALE');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('NEW', 'SITE_SURVEY', 'CUSTOMER_INQUIRY', 'DESIGN_IN_PROGRESS', 'CUSTOMER_READY', 'INSTALLATION_IN_PROGRESS', 'ONLINE', 'EQUIPMENT_SELECTION');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'RESOURCE_BLOCKED', 'COMPLETE');

-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('DRAFT', 'ACTIVE', 'REMOVED');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('PENDING', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('ORDERED', 'CANCLED', 'PENDING');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ENGINEER',
    "type" TEXT,
    "location" TEXT,
    "phone" TEXT,
    "otp" TEXT,
    "refresh_token" TEXT,
    "reset_token" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "is_temp" BOOLEAN NOT NULL DEFAULT false,
    "otp_expiry" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "point" INTEGER DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_team_pivot" (
    "user_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "user_team_pivot_pkey" PRIMARY KEY ("user_id","team_id")
);

-- CreateTable
CREATE TABLE "customer_electric_load" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "watt" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "hour" DOUBLE PRECISION NOT NULL,
    "watt_per_hour" DOUBLE PRECISION NOT NULL,
    "project_id" TEXT NOT NULL,

    CONSTRAINT "customer_electric_load_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "location" TEXT,
    "mark_location_customer" BOOLEAN DEFAULT false,
    "estimated_area" DOUBLE PRECISION,
    "actual_area" DOUBLE PRECISION,
    "capacity" DOUBLE PRECISION,
    "sun_hour_summer" DOUBLE PRECISION,
    "sun_hour_winter" DOUBLE PRECISION,
    "sun_hour_monsoon" DOUBLE PRECISION,
    "sun_hour_average" DOUBLE PRECISION,
    "sun_direction" TEXT,
    "total_sun_power_need" DOUBLE PRECISION,
    "correction_factor" DOUBLE PRECISION,
    "power_out_watt" DOUBLE PRECISION,
    "power_out_voltage" DOUBLE PRECISION,
    "reserve_power_for" DOUBLE PRECISION,
    "panel_info" TEXT,
    "battery_type" TEXT,
    "cleaning" BOOLEAN NOT NULL DEFAULT false,
    "status" "ProjectStatus" NOT NULL DEFAULT 'NEW',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customer_id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "engineer_id" TEXT,
    "sale_user_id" TEXT,
    "parent_id" TEXT,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_model" (
    "id" TEXT NOT NULL,
    "model_url" TEXT NOT NULL,
    "image_id" TEXT NOT NULL,
    "type" TEXT,
    "project_id" TEXT NOT NULL,

    CONSTRAINT "project_model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_team_pivot" (
    "project_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,

    CONSTRAINT "project_team_pivot_pkey" PRIMARY KEY ("project_id","team_id")
);

-- CreateTable
CREATE TABLE "vendor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "nature" TEXT,
    "product_image" JSONB,
    "description" TEXT,
    "watt" DOUBLE PRECISION,
    "voltage" DOUBLE PRECISION,
    "ampere" DOUBLE PRECISION,
    "buying_cost" DOUBLE PRECISION NOT NULL,
    "selling_cost" DOUBLE PRECISION NOT NULL,
    "max_flat_discount" DOUBLE PRECISION NOT NULL,
    "max_discount" DOUBLE PRECISION NOT NULL,
    "status" "InventoryStatus" NOT NULL DEFAULT 'ACTIVE',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vendor_id" TEXT,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "information" TEXT,
    "component" TEXT NOT NULL,
    "connection" TEXT DEFAULT 'parallel',
    "set_name" TEXT,
    "voltage" DOUBLE PRECISION,
    "ampere" DOUBLE PRECISION,
    "watt" DOUBLE PRECISION,
    "inventory_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "inventory_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "net_total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "installation_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION DEFAULT 0,
    "adjustment" DOUBLE PRECISION DEFAULT 0,
    "vat" DOUBLE PRECISION DEFAULT 0,
    "verification_file" TEXT,
    "status" "QuoteStatus" NOT NULL DEFAULT 'PENDING',
    "project_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "payment" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "quote_id" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_service" (
    "id" TEXT NOT NULL,
    "status" "QuoteStatus" NOT NULL,
    "name" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "info" JSONB,
    "customer_service_id" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "teams_id_key" ON "teams"("id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_electric_load_id_key" ON "customer_electric_load"("id");

-- CreateIndex
CREATE UNIQUE INDEX "project_id_key" ON "project"("id");

-- CreateIndex
CREATE UNIQUE INDEX "project_model_id_key" ON "project_model"("id");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_id_key" ON "vendor"("id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_id_key" ON "inventory"("id");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_id_key" ON "equipment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "quote_id_key" ON "quote"("id");

-- CreateIndex
CREATE UNIQUE INDEX "order_id_key" ON "order"("id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_service_id_key" ON "customer_service"("id");

-- CreateIndex
CREATE UNIQUE INDEX "service_id_key" ON "service"("id");

-- AddForeignKey
ALTER TABLE "user_team_pivot" ADD CONSTRAINT "user_team_pivot_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_team_pivot" ADD CONSTRAINT "user_team_pivot_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_electric_load" ADD CONSTRAINT "customer_electric_load_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_engineer_id_fkey" FOREIGN KEY ("engineer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_sale_user_id_fkey" FOREIGN KEY ("sale_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_model" ADD CONSTRAINT "project_model_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_team_pivot" ADD CONSTRAINT "project_team_pivot_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_team_pivot" ADD CONSTRAINT "project_team_pivot_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote" ADD CONSTRAINT "quote_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote" ADD CONSTRAINT "quote_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote" ADD CONSTRAINT "quote_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_service" ADD CONSTRAINT "customer_service_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service" ADD CONSTRAINT "service_customer_service_id_fkey" FOREIGN KEY ("customer_service_id") REFERENCES "customer_service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
