CREATE SCHEMA "taxes";
--> statement-breakpoint
CREATE TYPE "taxes"."language" AS ENUM('es', 'en', 'de', 'fr');--> statement-breakpoint
CREATE TYPE "taxes"."owner_type" AS ENUM('individual', 'company');--> statement-breakpoint
CREATE TYPE "taxes"."street_type" AS ENUM('calle', 'avenida', 'plaza', 'paseo', 'carretera', 'camino', 'travesia', 'urbanizacion', 'otro');--> statement-breakpoint
CREATE TABLE "taxes"."owner_properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"property_id" uuid NOT NULL,
	"ownership_percentage" numeric(5, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "taxes"."owners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"owner_type" "taxes"."owner_type" NOT NULL,
	"tax_id" varchar(20) NOT NULL,
	"tax_id_type" varchar(10),
	"first_name" varchar(100),
	"last_name" varchar(100),
	"company_name" varchar(200),
	"residence_country" varchar(2) NOT NULL,
	"residence_address" text NOT NULL,
	"residence_city" varchar(100) NOT NULL,
	"residence_postal_code" varchar(10) NOT NULL,
	"iban" varchar(34),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "taxes"."properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"street_type" "taxes"."street_type" NOT NULL,
	"street_name" varchar(200) NOT NULL,
	"street_number" varchar(10) NOT NULL,
	"floor" varchar(10),
	"door" varchar(10),
	"staircase" varchar(10),
	"block" varchar(10),
	"city" varchar(100) NOT NULL,
	"province" varchar(100) NOT NULL,
	"postal_code" varchar(5) NOT NULL,
	"cadastral_reference" varchar(20) NOT NULL,
	"cadastral_value" numeric(12, 2) NOT NULL,
	"collective_revision" boolean DEFAULT false,
	"revision_year" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "taxes"."user_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"preferred_language" "taxes"."language" DEFAULT 'es' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "taxes"."owner_properties" ADD CONSTRAINT "owner_properties_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "taxes"."owners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taxes"."owner_properties" ADD CONSTRAINT "owner_properties_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "taxes"."properties"("id") ON DELETE cascade ON UPDATE no action;