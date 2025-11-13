"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import jwt from "jsonwebtoken";

// Clé secrète Stream.io (à mettre dans les variables d'environnement en production)
const STREAM_API_SECRET = "vhdu8u2eb5cjmzcffkucuv7w3murwvzvyd9bktjbzp8zs9a3he5tz5ch766963zq";

// Générer un token Stream.io pour un utilisateur
export const generateStreamToken = action({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Generating token for user:", args.userId);
      
      // Créer le payload du token
      const payload = {
        user_id: args.userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 heures
      };

      console.log("Token payload:", payload);

      // Signer le token avec la clé secrète
      const token = jwt.sign(payload, STREAM_API_SECRET, { algorithm: "HS256" });

      console.log("Generated token:", token.substring(0, 50) + "...");

      return { token };
    } catch (error) {
      console.error("Error generating Stream token:", error);
      throw new Error("Failed to generate Stream token");
    }
  },
});
