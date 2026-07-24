import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { menuEntrySchema } from "@tombo/content";

export const collections = {
  "menu-es": defineCollection({
    loader: file("src/data/menu-es.json"),
    schema: menuEntrySchema,
  }),
  "menu-en": defineCollection({
    loader: file("src/data/menu-en.json"),
    schema: menuEntrySchema,
  }),
};
