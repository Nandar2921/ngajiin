CREATE TABLE "topic_relations" (
	"id" serial PRIMARY KEY NOT NULL,
	"topic_id" integer NOT NULL,
	"content_type" varchar(50) NOT NULL,
	"content_id" integer NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100),
	"image" varchar(500),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "topics_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "topic_relations" ADD CONSTRAINT "topic_relations_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;