/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * Generated from backend Convex project.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: {
    getCurrentUser: FunctionReference<"query">;
    signUp: FunctionReference<"mutation">;
    signIn: FunctionReference<"mutation">;
    signOut: FunctionReference<"mutation">;
  };
  openai: {
    chat: FunctionReference<"action">;
  };
  conversations: {
    saveConversation: FunctionReference<"mutation">;
    getConversations: FunctionReference<"query">;
    getConversationById: FunctionReference<"query">;
    deleteConversation: FunctionReference<"mutation">;
    clearHistory: FunctionReference<"mutation">;
  };
  userQuestions: {
    canAskQuestion: FunctionReference<"query">;
    incrementQuestionCount: FunctionReference<"mutation">;
    resetQuestionCount: FunctionReference<"mutation">;
    getUserStats: FunctionReference<"query">;
  };
  newQuestions: {
    canAskQuestion: FunctionReference<"query">;
    incrementQuestionCount: FunctionReference<"mutation">;
    resetQuestionCount: FunctionReference<"mutation">;
    getUserStats: FunctionReference<"query">;
  };
  comments: {
    getCommentsByPost: FunctionReference<"query">;
    getCommentsByAuthor: FunctionReference<"query">;
    getCommentById: FunctionReference<"query">;
    createComment: FunctionReference<"mutation">;
    updateComment: FunctionReference<"mutation">;
    deleteComment: FunctionReference<"mutation">;
  };
  posts: {
    getPublishedPosts: FunctionReference<"query">;
    getAllPosts: FunctionReference<"query">;
    getPostById: FunctionReference<"query">;
    getPostsByAuthor: FunctionReference<"query">;
    createPost: FunctionReference<"mutation">;
    updatePost: FunctionReference<"mutation">;
    deletePost: FunctionReference<"mutation">;
    togglePublishPost: FunctionReference<"mutation">;
  };
  users: {
    getUsers: FunctionReference<"query">;
    getUserById: FunctionReference<"query">;
    getUserByEmail: FunctionReference<"query">;
    createUser: FunctionReference<"mutation">;
    updateUser: FunctionReference<"mutation">;
    deleteUser: FunctionReference<"mutation">;
  };
}>;

export declare const api: FilterApi<
  ApiFromModules<{
    auth: {
      getCurrentUser: FunctionReference<"query">;
      signUp: FunctionReference<"mutation">;
      signIn: FunctionReference<"mutation">;
      signOut: FunctionReference<"mutation">;
    };
    openai: {
      chat: FunctionReference<"action">;
    };
    conversations: {
      saveConversation: FunctionReference<"mutation">;
      getConversations: FunctionReference<"query">;
      getConversationById: FunctionReference<"query">;
      deleteConversation: FunctionReference<"mutation">;
      clearHistory: FunctionReference<"mutation">;
    };
    userQuestions: {
      canAskQuestion: FunctionReference<"query">;
      incrementQuestionCount: FunctionReference<"mutation">;
      resetQuestionCount: FunctionReference<"mutation">;
      getUserStats: FunctionReference<"query">;
    };
    comments: {
      getCommentsByPost: FunctionReference<"query">;
      getCommentsByAuthor: FunctionReference<"query">;
      getCommentById: FunctionReference<"query">;
      createComment: FunctionReference<"mutation">;
      updateComment: FunctionReference<"mutation">;
      deleteComment: FunctionReference<"mutation">;
    };
    posts: {
      getPublishedPosts: FunctionReference<"query">;
      getAllPosts: FunctionReference<"query">;
      getPostById: FunctionReference<"query">;
      getPostsByAuthor: FunctionReference<"query">;
      createPost: FunctionReference<"mutation">;
      updatePost: FunctionReference<"mutation">;
      deletePost: FunctionReference<"mutation">;
      togglePublishPost: FunctionReference<"mutation">;
    };
    users: {
      getUsers: FunctionReference<"query">;
      getUserById: FunctionReference<"query">;
      getUserByEmail: FunctionReference<"query">;
      createUser: FunctionReference<"mutation">;
      updateUser: FunctionReference<"mutation">;
      deleteUser: FunctionReference<"mutation">;
    };
  }>,
  FunctionReference<any, "public">
>;

export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
