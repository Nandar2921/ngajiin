CREATE TABLE "hadith_books" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"name_arabic" varchar(100),
	"name_indonesian" varchar(100),
	"total_hadith" integer
);
--> statement-breakpoint
CREATE TABLE "hadiths" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" integer NOT NULL,
	"number" integer NOT NULL,
	"arabic" text NOT NULL,
	"translation" text NOT NULL,
	"grade" varchar(50),
	"narrator" varchar(255),
	"reference" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "search_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"keyword" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "hadiths" ADD CONSTRAINT "hadiths_book_id_hadith_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."hadith_books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_history" ADD CONSTRAINT "search_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;