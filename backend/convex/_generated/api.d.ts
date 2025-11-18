/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as appSettings from "../appSettings.js";
import type * as auth from "../auth.js";
import type * as comments from "../comments.js";
import type * as commissionStats from "../commissionStats.js";
import type * as conversations from "../conversations.js";
import type * as dashboard from "../dashboard.js";
import type * as demandes from "../demandes.js";
import type * as files from "../files.js";
import type * as meetSessions from "../meetSessions.js";
import type * as migrations from "../migrations.js";
import type * as offres from "../offres.js";
import type * as openai from "../openai.js";
import type * as posts from "../posts.js";
import type * as stream from "../stream.js";
import type * as stripeConnect from "../stripeConnect.js";
import type * as transactions from "../transactions.js";
import type * as userQuestions from "../userQuestions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  appSettings: typeof appSettings;
  auth: typeof auth;
  comments: typeof comments;
  commissionStats: typeof commissionStats;
  conversations: typeof conversations;
  dashboard: typeof dashboard;
  demandes: typeof demandes;
  files: typeof files;
  meetSessions: typeof meetSessions;
  migrations: typeof migrations;
  offres: typeof offres;
  openai: typeof openai;
  posts: typeof posts;
  stream: typeof stream;
  stripeConnect: typeof stripeConnect;
  transactions: typeof transactions;
  userQuestions: typeof userQuestions;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
