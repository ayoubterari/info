import { ConvexReactClient } from "convex/react";

// Initialiser le client Convex
export const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);
