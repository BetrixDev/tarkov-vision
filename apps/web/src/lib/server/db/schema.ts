import { relations } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const detectionRuns = sqliteTable("detection_runs", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: text("status", {
    enum: ["pending", "completed", "failed"],
  })
    .notNull()
    .default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  imageUrl: text("image_url").notNull(),
});

export const detectionRunsRelations = relations(detectionRuns, ({ many }) => ({
  detectionRunItems: many(detectionRunItems),
  flaggedDetectionRuns: many(flaggedDetectionRuns),
}));

export const detectionRunItems = sqliteTable("detection_run_items", {
  id: text("id")
    .$defaultFn(() => crypto.randomUUID())
    .primaryKey(),
  detectionRunId: text("detection_run_id")
    .notNull()
    .references(() => detectionRuns.id, { onDelete: "cascade" }),
  detectedItemId: text("detected_item_id").notNull(),
  boundingBox: text("bounding_box", { mode: "json" })
    .$type<{ x: number; y: number; width: number; height: number }>()
    .notNull(),
});

export const detectionRunItemsRelations = relations(
  detectionRunItems,
  ({ one, many }) => ({
    detectionRun: one(detectionRuns, {
      fields: [detectionRunItems.detectionRunId],
      references: [detectionRuns.id],
    }),
    flaggedDetectionItems: many(flaggedDetectionItems),
    tarkovItem: one(tarkovItems, {
      fields: [detectionRunItems.detectedItemId],
      references: [tarkovItems.id],
    }),
  })
);

export const flaggedDetectionItems = sqliteTable("flagged_detection_items", {
  id: text("id").primaryKey(),
  detectionRunItemId: text("detection_run_item_id")
    .notNull()
    .references(() => detectionRunItems.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const flaggedDetectionItemsRelations = relations(
  flaggedDetectionItems,
  ({ one }) => ({
    detectionRunItem: one(detectionRunItems, {
      fields: [flaggedDetectionItems.detectionRunItemId],
      references: [detectionRunItems.id],
    }),
  })
);

export const flaggedDetectionRuns = sqliteTable("flagged_detection_runs", {
  id: text("id").primaryKey(),
  detectionRunId: text("detection_run_id")
    .notNull()
    .references(() => detectionRuns.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const flaggedDetectionRunsRelations = relations(
  flaggedDetectionRuns,
  ({ one }) => ({
    detectionRun: one(detectionRuns, {
      fields: [flaggedDetectionRuns.detectionRunId],
      references: [detectionRuns.id],
    }),
  })
);

export const tarkovItems = sqliteTable("tarkov_items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  normalizedName: text("normalized_name").notNull(),
  basePrice: integer("base_price").notNull(),
  bestSell: text("best_sell", { mode: "json" })
    .$type<{
      vendor: string | null;
      price: number;
      priceRUB: number;
      currency: string;
    }>()
    .notNull(),
});

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const userRelations = relations(user, ({ many }) => ({
  detectionRuns: many(detectionRuns),
  sessions: many(session),
  accounts: many(account),
}));

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});
