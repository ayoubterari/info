import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api.js";

// Hook pour récupérer les utilisateurs
export function useUsers() {
  return useQuery(api.users.getUsers);
}

// Hook pour récupérer un utilisateur par ID
export function useUser(userId) {
  return useQuery(api.users.getUserById, userId ? { id: userId } : "skip");
}

// Hook pour créer un utilisateur
export function useCreateUser() {
  return useMutation(api.users.createUser);
}

// Hook pour mettre à jour un utilisateur
export function useUpdateUser() {
  return useMutation(api.users.updateUser);
}

// Hook pour supprimer un utilisateur
export function useDeleteUser() {
  return useMutation(api.users.deleteUser);
}

// Hook pour récupérer les posts publiés
export function usePublishedPosts() {
  return useQuery(api.posts.getPublishedPosts);
}

// Hook pour récupérer tous les posts
export function useAllPosts() {
  return useQuery(api.posts.getAllPosts);
}

// Hook pour récupérer un post par ID
export function usePost(postId) {
  return useQuery(api.posts.getPostById, postId ? { id: postId } : "skip");
}

// Hook pour récupérer les posts d'un auteur
export function usePostsByAuthor(authorId) {
  return useQuery(
    api.posts.getPostsByAuthor,
    authorId ? { authorId } : "skip"
  );
}

// Hook pour créer un post
export function useCreatePost() {
  return useMutation(api.posts.createPost);
}

// Hook pour mettre à jour un post
export function useUpdatePost() {
  return useMutation(api.posts.updatePost);
}

// Hook pour supprimer un post
export function useDeletePost() {
  return useMutation(api.posts.deletePost);
}

// Hook pour publier/dépublier un post
export function useTogglePublishPost() {
  return useMutation(api.posts.togglePublishPost);
}

// Hook pour récupérer les commentaires d'un post
export function useCommentsByPost(postId) {
  return useQuery(
    api.comments.getCommentsByPost,
    postId ? { postId } : "skip"
  );
}

// Hook pour créer un commentaire
export function useCreateComment() {
  return useMutation(api.comments.createComment);
}

// Hook pour mettre à jour un commentaire
export function useUpdateComment() {
  return useMutation(api.comments.updateComment);
}

// Hook pour supprimer un commentaire
export function useDeleteComment() {
  return useMutation(api.comments.deleteComment);
}
