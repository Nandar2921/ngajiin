CREATE TABLE "hadith_gradings" (
	"id" serial PRIMARY KEY NOT NULL,
	"hadith_id" integer NOT NULL,
	"scholar" varchar(100) NOT NULL,
	"grade" varchar(50) NOT NULL,
	"reference" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hadith_translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"hadith_id" integer NOT NULL,
	"language" varchar(10) NOT NULL,
	"translator" varchar(100),
	"text" text NOT NULL,
	"source" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "hadith_books" ADD COLUMN "slug" varchar(100);--> statement-breakpoint
ALTER TABLE "hadith_books" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "hadiths" ADD COLUMN "chapter" varchar(255);--> statement-breakpoint
ALTER TABLE "hadiths" ADD COLUMN "source" varchar(255);--> statement-breakpoint
ALTER TABLE "hadith_gradings" ADD CONSTRAINT "hadith_gradings_hadith_id_hadiths_id_fk" FOREIGN KEY ("hadith_id") REFERENCES "public"."hadiths"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hadith_translations" ADD CONSTRAINT "hadith_translations_hadith_id_hadiths_id_fk" FOREIGN KEY ("hadith_id") REFERENCES "public"."hadiths"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hadiths" DROP COLUMN "translation";--> statement-breakpoint
ALTER TABLE "hadiths" DROP COLUMN "grade";--> statement-breakpoint
ALTER TABLE "hadiths" DROP COLUMN "reference";--> statement-breakpoint
ALTER TABLE "hadiths" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "hadith_books" ADD CONSTRAINT "hadith_books_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "hadiths" ADD CONSTRAINT "hadiths_book_id_number_unique" UNIQUE("book_id","number");