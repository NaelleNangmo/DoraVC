const OPENROUTER_API_KEY = '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';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const sendChatMessage = async (message: string): Promise<string> => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'microsoft/wizardlm-2-8x22b',
        messages: [
          {
            role: 'system',
            content: `Tu es DORA, un assistant virtuel expert en voyages et démarches de visa. Tu aides les utilisateurs avec des conseils pratiques, des informations sur les procédures de visa, et des recommandations de voyage. 

Caractéristiques de tes réponses :
- Toujours en français, ton amical et professionnel
- Utilise des emojis appropriés pour rendre tes réponses plus engageantes
- Structure tes réponses avec des listes à puces quand c'est pertinent
- Donne des conseils pratiques et actionables
- Mentionne les délais et coûts approximatifs quand possible
- Encourage l'utilisateur et reste positif
- Si tu ne connais pas une information précise, recommande de vérifier auprès des sources officielles

Domaines d'expertise :
- Procédures de visa pour tous pays
- Documents requis pour les demandes
- Délais de traitement
- Coûts approximatifs
- Conseils de voyage
- Hébergements et restaurants
- Sites touristiques
- Conversion de devises
- Préparation de voyage`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu traiter votre demande.';
  } catch (error) {
    console.error('Chatbot error:', error);
    return getFallbackResponse(message);
  }
};

const getFallbackResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('visa')) {
    return `🛂 **Demandes de visa**

Pour les demandes de visa, voici mes recommandations générales :

• **Vérifiez les exigences** spécifiques du pays sur notre plateforme
• **Préparez tous les documents** à l'avance (passeport, photos, justificatifs)
• **Respectez les délais** - comptez 2-4 semaines en moyenne
• **Gardez des copies** de tous vos documents

Chaque destination a ses propres critères et délais. Puis-je vous aider avec un pays en particulier ? 🌍`;
  }
  
  if (lowerMessage.includes('document')) {
    return `📄 **Documents pour visa**

Les documents généralement requis :

• **Passeport valide** (minimum 6 mois de validité)
• **Photos d'identité** au format requis
• **Formulaire de demande** complété
• **Justificatifs financiers** (relevés bancaires)
• **Réservation d'hôtel** ou lettre d'invitation
• **Billet d'avion** aller-retour
• **Assurance voyage** (selon le pays)

Voulez-vous des informations spécifiques pour une destination ? 🎯`;
  }
  
  if (lowerMessage.includes('délai') || lowerMessage.includes('temps') || lowerMessage.includes('durée')) {
    return `⏰ **Délais de traitement**

Les délais varient selon les pays :

• **Express** : 3-5 jours (frais supplémentaires)
• **Standard** : 10-15 jours (la plupart des pays)
• **Long** : 20-30 jours (certains pays)

**Conseil** : Faites votre demande au moins 1 mois avant votre départ pour éviter le stress ! 

Quel pays vous intéresse ? Je peux vous donner des délais plus précis. 🗓️`;
  }

  if (lowerMessage.includes('coût') || lowerMessage.includes('prix') || lowerMessage.includes('frais')) {
    return `💰 **Coûts des visas**

Les frais varient considérablement :

• **Gratuit** : Certains pays (exemption de visa)
• **50-100€** : Visas touristiques courts
• **100-200€** : Visas standards
• **200€+** : Visas longs séjours ou pays spécifiques

**N'oubliez pas** les frais annexes :
• Photos d'identité
• Traductions de documents
• Frais de service des centres de visa

Pour quel pays souhaitez-vous connaître les coûts ? 🌍`;
  }

  if (lowerMessage.includes('voyage') || lowerMessage.includes('conseil')) {
    return `✈️ **Conseils de voyage**

Voici mes conseils essentiels :

**Avant le départ :**
• Vérifiez la validité de votre passeport
• Souscrivez une assurance voyage
• Informez votre banque de votre voyage
• Téléchargez les apps utiles (traduction, cartes)

**Sur place :**
• Gardez des copies de vos documents
• Respectez les coutumes locales
• Ayez toujours de l'argent liquide
• Restez en contact avec vos proches

Quelle destination vous intéresse ? Je peux vous donner des conseils spécifiques ! 🗺️`;
  }
  
  return `👋 **Bonjour !**

Je suis DORA, votre assistant voyage spécialisé ! Je peux vous aider avec :

• 🛂 **Procédures de visa** et documents requis
• ⏰ **Délais et coûts** de traitement
• 🌍 **Informations sur les destinations**
• 🏨 **Conseils d'hébergement** et restaurants
• 💱 **Conversion de devises**
• ✈️ **Préparation de voyage**

N'hésitez pas à me poser vos questions spécifiques ! Comment puis-je vous aider aujourd'hui ? 😊`;
};

export const getChatHistory = (): ChatMessage[] => {
  if (typeof window === 'undefined') return [];
  
  const history = localStorage.getItem('chatHistory');
  if (!history) return [];
  
  try {
    const parsed = JSON.parse(history);
    return parsed.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
  } catch {
    return [];
  }
};

export const saveChatHistory = (messages: ChatMessage[]) => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('chatHistory', JSON.stringify(messages));
};