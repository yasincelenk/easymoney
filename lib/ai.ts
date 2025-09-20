export type ClauseSuggestion = {
  title: string;
  body: string;
};

export async function suggestClauses(draft: string): Promise<ClauseSuggestion[]> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  if (!draft) return [];
  return [
    {
      title: 'Gizlilik Maddesi',
      body: 'Taraflar, sözleşme süresince paylaşılan tüm bilgileri gizli tutmayı kabul eder.'
    },
    {
      title: 'Termination Clause',
      body: 'Either party may terminate this agreement with 30 days written notice.'
    }
  ];
}
