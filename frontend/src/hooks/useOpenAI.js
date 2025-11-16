import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api.js";

export function useOpenAI() {
  const chatAction = useAction(api.openai.chat);

  const generateResponse = async (prompt, agentName, userId) => {
    if (!userId) {
      throw new Error("Vous devez être connecté pour poser une question à l'IA");
    }
    
    try {
      const result = await chatAction({
        prompt,
        agentName,
        userId,
      });
      return result;
    } catch (error) {
      console.error("Erreur lors de la génération de la réponse:", error);
      throw error;
    }
  };

  return {
    generateResponse,
  };
}
