import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api.js";

export function useOpenAI() {
  const chatAction = useAction(api.openai.chat);

  const generateResponse = async (prompt, agentName) => {
    try {
      const result = await chatAction({
        prompt,
        agentName,
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
