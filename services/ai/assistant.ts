// services/ai/assistant.ts — AI Asistan Servisi
// Not: Production'da Claude API key backend proxy üzerinden kullanılmalı.
// Bu dosya şimdilik doğrudan API çağrısı yapar (demo/MVP amaçlı).

import { Pet } from '../../types';

const API_URL = 'https://api.anthropic.com/v1/messages';

interface AssistantConfig {
  apiKey: string;
  pet: Pet;
}

function buildSystemPrompt(pet: Pet): string {
  const petAge = Math.floor(
    (Date.now() - new Date(pet.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365)
  );
  const petTypeNames: Record<string, string> = {
    dog: 'köpek', cat: 'kedi', rabbit: 'tavşan',
    hamster: 'hamster', bird: 'kuş', other: 'evcil hayvan',
  };
  const typeName = petTypeNames[pet.type] || 'evcil hayvan';

  return `Sen PawNest uygulamasının AI veteriner asistanısın. Adın "PawBot".
Kullanıcının hayvanı hakkında bilgi:
- İsim: ${pet.name}
- Tür: ${typeName}
- Irk: ${pet.breed}
- Cinsiyet: ${pet.gender === 'male' ? 'Erkek' : 'Dişi'}
- Yaş: yaklaşık ${petAge} yaşında
- Kilo: ${pet.weight} kg
- Renk: ${pet.color}
- Kısırlaştırma: ${pet.isNeutered ? 'Evet' : 'Hayır'}

Kuralların:
1. Türkçe yanıt ver
2. Kısa ve anlaşılır cevaplar ver (max 3 paragraf)
3. Ciddi semptomlar varsa mutlaka veterinere yönlendir
4. Tıbbi teşhis koyma, sadece bilgi ver ve önerilerde bulun
5. Hayvanın ismiyle hitap et, samimi ol
6. Emoji kullan ama abartma`;
}

export async function sendMessage(
  config: AssistantConfig,
  userMessage: string,
  history: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const { apiKey, pet } = config;

  // API key yoksa simüle et
  if (!apiKey || apiKey === 'demo') {
    return simulateResponse(pet, userMessage);
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: buildSystemPrompt(pet),
        messages: [
          ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API hatası');
    }

    const data = await response.json();
    return data.content[0]?.text || 'Yanıt alınamadı.';
  } catch (error: any) {
    if (error.message?.includes('API')) {
      return simulateResponse(pet, userMessage);
    }
    throw error;
  }
}

// Demo/offline mod için simüle edilmiş yanıtlar
function simulateResponse(pet: Pet, message: string): string {
  const msg = message.toLowerCase();
  const name = pet.name;

  if (msg.includes('mama') || msg.includes('beslen') || msg.includes('yem')) {
    return `🍽️ ${name} için beslenme önerileri:\n\n${pet.type === 'dog'
      ? `Yetişkin bir köpek için günde 2 öğün ideal. Kilosuna göre (${pet.weight}kg) porsiyon ayarı önemli. Kaliteli kuru mama + taze su her zaman erişilebilir olmalı.`
      : pet.type === 'cat'
      ? `Kediler doğal olarak günde birçok küçük öğün yer. ${name} için kaliteli yaş+kuru mama karışımı ideal. Taze su her zaman erişilebilir olmalı.`
      : `${name} için tür ve yaşına uygun kaliteli mama seçimi önemli. Veterinerinize danışarak en uygun beslenme planını oluşturabilirsiniz.`
    }\n\nDaha detaylı bilgi için veterinerinize danışmanızı öneririm! 🐾`;
  }

  if (msg.includes('kusma') || msg.includes('ishal') || msg.includes('hasta')) {
    return `⚠️ ${name}'in sağlık durumu önemli!\n\nBu belirtiler çeşitli nedenlere bağlı olabilir. Eğer ${name}:\n- 24 saatten fazla kusuyorsa\n- Kan görülüyorsa\n- Halsiz ve iştahsızsa\n\n**Lütfen en kısa sürede veterinerinize başvurun.** Bu belirtiler ciddi bir durumun işareti olabilir.\n\nSağlık sekmesinden belirti kaydı eklemeyi unutma! 🏥`;
  }

  if (msg.includes('aşı') || msg.includes('vaccine')) {
    return `💉 ${name} için aşı bilgisi:\n\n${pet.type === 'dog'
      ? 'Köpekler için temel aşılar: Karma (DHPPi), Kuduz, Leptospiroz. Yılda bir tekrar önerilir.'
      : pet.type === 'cat'
      ? 'Kediler için temel aşılar: Karma (FVRCP), Kuduz, FeLV. Yılda bir tekrar önerilir.'
      : 'Hayvanınızın türüne uygun aşı takvimi için veterinerinize danışın.'
    }\n\nSağlık sekmesinden aşı kayıtlarını takip edebilirsin! 📋`;
  }

  if (msg.includes('egzersiz') || msg.includes('yürüyüş') || msg.includes('oyun')) {
    return `🎾 ${name} için aktivite önerileri:\n\nGünlük egzersiz hem fiziksel hem mental sağlık için çok önemli! ${pet.weight}kg ağırlığında bir ${pet.breed} için günde en az 30 dakika aktif zaman ayırmanı öneririm.\n\nBakım sekmesinden yürüyüş ve oyun görevlerini takip edebilirsin! 🦮`;
  }

  return `Merhaba! Ben PawBot, ${name}'in sağlık asistanıyım 🐾\n\n${name} hakkında beslenme, sağlık, egzersiz, aşı takvimi veya bakım ile ilgili sorularını yanıtlayabilirim.\n\nSana nasıl yardımcı olabilirim?`;
}

// Hızlı soru önerileri
export function getQuickQuestions(pet: Pet): string[] {
  const base = [
    `${pet.name} ne kadar mama yemeli?`,
    `${pet.name} için aşı takvimi nasıl olmalı?`,
    `${pet.name} hasta gibi görünüyor, ne yapmalıyım?`,
  ];

  if (pet.type === 'dog') {
    return [...base, `${pet.name} ile günde ne kadar yürümeliyim?`];
  }
  if (pet.type === 'cat') {
    return [...base, `${pet.name} çok tüy döküyor, normal mi?`];
  }
  return [...base, `${pet.name} için bakım ipuçları neler?`];
}
