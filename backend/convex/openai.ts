import { action } from "./_generated/server";
import { v } from "convex/values";

// Action pour appeler l'API OpenAI
export const chat = action({
  args: {
    prompt: v.string(),
    agentName: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY n'est pas configurée");
    }

    // Configurer le modèle et le prompt selon l'agent
    let model = "gpt-4";
    let systemPrompt = "Tu es un assistant IA utile et précis.";

    switch (args.agentName) {
      case "GPT-4":
        model = "gpt-4";
        systemPrompt = "Tu es GPT-4, un modèle de langage avancé développé par OpenAI. Tu es capable de comprendre et de générer du texte de haute qualité sur une grande variété de sujets.";
        break;
      case "Claude":
        model = "gpt-4";
        systemPrompt = "Tu es Claude, un assistant IA développé par Anthropic. Tu es connu pour être utile, honnête et inoffensif. Tu fournis des réponses réfléchies et nuancées.";
        break;
      case "Student":
        model = "gpt-4";
        systemPrompt = "Tu es un assistant IA spécialisé pour les étudiants. Tu aides à comprendre les concepts académiques, à résoudre les exercices, à préparer les examens et à rédiger des travaux. Tu expliques de manière pédagogique, étape par étape, en adaptant ton niveau au contexte. Tu encourages l'apprentissage actif et la compréhension profonde plutôt que de simplement donner les réponses.";
        break;
      case "Code Expert":
        model = "gpt-4";
        systemPrompt = "Tu es un expert en programmation. Tu fournis du code propre, bien commenté et optimisé. Tu expliques les concepts techniques de manière claire et concise.";
        break;
      case "Creative":
        model = "gpt-4";
        systemPrompt = "Tu es un assistant créatif. Tu excelles dans la génération d'idées originales, l'écriture créative, et la résolution de problèmes de manière innovante.";
        break;
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: args.prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        response: data.choices[0].message.content,
        model: model,
        agentName: args.agentName,
      };
    } catch (error) {
      console.error("Erreur lors de l'appel à OpenAI:", error);
      throw new Error(`Erreur lors de la génération de la réponse: ${error.message}`);
    }
  },
});
