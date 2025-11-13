/* eslint-disable */
/**
 * Generated data model types.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { DataModelFromSchemaDefinition } from "convex/server";
import type { DocumentByName, TableNamesInDataModel } from "convex/server";
import type { GenericId } from "convex/values";

/**
 * The names of all tables in your data model.
 */
export type TableNames = "users" | "posts" | "comments";

/**
 * The type of a document stored in a given table.
 *
 * @typeParam TableName - The name of the table.
 */
export type Doc<TableName extends TableNames> = DocumentByName<DataModel, TableName>;

/**
 * An identifier for a document in a given table.
 *
 * @typeParam TableName - The name of the table.
 */
export type Id<TableName extends TableNames> = GenericId<TableName>;

/**
 * The data model for your Convex deployment.
 */
export type DataModel = {
  users: {
    _id: GenericId<"users">;
    _creationTime: number;
    name: string;
    email: string;
    role: "admin" | "user";
    createdAt: number;
    tokenIdentifier?: string;
  };
  posts: {
    _id: GenericId<"posts">;
    _creationTime: number;
    title: string;
    content: string;
    authorId: GenericId<"users">;
    published: boolean;
    createdAt: number;
    updatedAt: number;
  };
  comments: {
    _id: GenericId<"comments">;
    _creationTime: number;
    postId: GenericId<"posts">;
    authorId: GenericId<"users">;
    content: string;
    createdAt: number;
  };
};
