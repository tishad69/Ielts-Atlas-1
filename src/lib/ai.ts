// Dual-Engine AI Bridge: Supports 100% Free Google Gemini 1.5 Flash and OpenAI.

export function aiEnabled(): boolean {
  return Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
}

// Google Gemini 1.5 Flash Client
async function callGemini(systemPrompt: string, userPrompt: string, jsonMode = false): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not configured");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

  const payload: any = {
    contents: [
      {
        role: "user",
        parts: [
          { text: `${systemPrompt}\n\nCandidate Submission:\n${userPrompt}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
    }
  };

  if (jsonMode) {
    payload.generationConfig.responseMimeType = "application/json";
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Gemini API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini API");
  return text;
}

// OpenAI Client (Fallback)
async function callOpenAI(messages: Array<{ role: string; content: string }>, jsonMode = false): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY not configured");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.3,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });
�������ɕ̹�����(��������Ёѕ�Ѐ�݅�Ёɕ̹ѕ�Р��(����ѡɽ܁��܁�ɽȡ�=���$���ɽȀ��ɕ̹�х����耑�ѕ������(���((������Ё��ф��݅�Ёɕ̹�ͽ����(��ɕ��ɸ���ф����������l�t�����ͅ�������ѕ�Ё�́��ɥ���)�()��幌��չ�ѥ�������U����������ѕ�Aɽ������ɥ�����͕�Aɽ������ɥ�����ͽ�5����􁙅�͔��Aɽ��͔���ɥ�����(�������ɽ���̹��ع5%9%}A%}-d���(����ɕ��ɸ��������������ѕ�Aɽ��а��͕�Aɽ��а��ͽ�5�����(��􁕱͔������ɽ���̹��ع=A9%}A%}-d���(����ɕ��ɸ�����=���$�(������l(���������ɽ��耉���ѕ�������ѕ������ѕ�Aɽ��Ё��(���������ɽ��耉�͕Ȉ�����ѕ����͕�Aɽ��Ё�(������t�(�������ͽ�5���(������(��􁕱͔��(����ѡɽ܁��܁�ɽȠ�9��$�A$���䁍������ɕ�����(���)�((���$�]ɥѥ���م�Յѥ��)�����Ё��幌��չ�ѥ�����]ɥѥ������������ͅ�Q������ɥ�����ɽ������ɥ����хͭQ������ɥ�����(������Ё���ѕ�Aɽ��Ѐ�(�����e�ԁ�ɔ����������������ɥ����%1QL�ᅵ���ȸ�M��ɔ�ѡ����ͅ���ɥ�ѱ䁅�����Ё���������	�����͍ɥ�ѽ�̀�Q�ͬ�����ٕ���а����ɕ���������ͥ����1�᥍���I�ͽ�ɍ���Ʌ���ѥ����I����������Ʌ�䤸�I�������=91d�ݥѠ�������Ёم����)M=8��p�����Q�p�鸱p������p�鸱p�����1�p�鸱p������p�鸱p�����=ٕɅ��p�鸱p���ɕ��ѡ�p��m��ɥ��t�p����Օ�p��m��ɥ��t�p�ɕ�ɥѕp����ɥ�����	���́���Ё��������ԁ�ѕ�́�ɽ��āѼ�丈�((������Ё�͕�Aɽ��Ѐ�Q�ͬ�����耑�хͭQ����q�Aɽ���耑��ɽ��Ё�������Ё�ɽ٥������q�q�������є��ͅ��q����ͅ�Q������(������ЁɅ�)ͽ���݅�Ё����U����������ѕ�Aɽ��а��͕�Aɽ��а���Ք��(��ɕ��ɸ�)M=8����͔�Ʌ�)ͽ���)�((���$�M��������������ѥ�����������M�ɥ�Ё%1QL�I���م������	�����ԁMх���ɑ̤)�����Ё��幌��չ�ѥ�����M����������������Ʌ�͍ɥ�����ɥ�����Օ�ѥ�����ɥ�����������ɥ�����(������Ё���ѕ�Aɽ��Ѐ�(�����e�ԁ�ɔ������ѥ�����͕���ȁ���ɥ����%1QL�M���������ᅵ���ȁ�م�Յѥ������������є����������ȁ	�����Ը��͕�́��ɥ�ѱ䁽���Օ��䀘����ɕ�����1�᥍���I�ͽ�ɍ���Ʌ���ѥ����I����������Ʌ�䰁����Aɽ�չ���ѥ���q�q�I%Q%0�QM,�I1Y9�IU1����Ё���������ѡ���������є����Յ��䁅��ݕɕ��ѡ����ٕ���Օ�ѥ����%��ѡ��ɕ����͔��́����ѽ������مͥٔ�����͕�ͥ������ȁ݅����́��Ѽ�չɕ��ѕ���Չ����̰����٥��������锁�Օ��䀘����ɕ��������=ٕɅ���͍�ɔ�������������ѱ䁕�������ѡ����ɕ��م�������p����Օ�p��ݥѠ����p��j���<�=���ѽ���p��х��q�q�%���ѥ�䁕ᅍЁ�Ʌ���Ƚٽ���ձ���ͱ��́չ��ȁp����Օ�p���Aɽ٥���Ĵȁ��ѡ��ѥ����ɕ��ѡ́չ��ȁp���ɕ��ѡ�p���Aɽ٥��������ѡ��ѥ����������ٕ����ѥٔ�	�����ԁͅ��������ݕȁչ��ȁp��������ݕ�p��q�q�I�������=91d�ݥѠ�������Ёم����)M=8��p�����=ٕɅ��p�鸱p���Օ���p�鸱p���᥍��p�鸱p��Ʌ����p�鸱p���ɕ��ѡ�p��m��ɥ��t�p����Օ�p��m��ɥ��t�p��������ݕ�p����ɥ��������͍�ɕ́���Ё����ձѥ���́�����ԁ���ݕ���ĸ�����������((������Ё�͕�Aɽ��Ѐ�M��������A���耑������q�EՕ�ѥ���p����Օ�ѥ����������Ʌ��%1QL�M���������p�q�������є�QɅ�͍ɥ���p����Ʌ�͍ɥ���p���(������ЁɅ�)ͽ���݅�Ё����U����������ѕ�Aɽ��а��͕�Aɽ��а���Ք��(��ɕ��ɸ�)M=8����͔�Ʌ�)ͽ���)�((���$�M����������ٕ�ͅѥ���A��ѹ�Ȁ�5��Ԥ)�����Ё��幌��չ�ѥ��������I���䡡��ѽ����Ʌ���ɽ�����ɥ��쁍��ѕ�����ɥ��������(������Ё���ѕ�Aɽ��Ѐ�(�����e�ԁ�ɔ�5��԰���������Ʌ�������Ё�ɕ��͔����ɥ����%1QL�M���������ᅵ���ȸ�ͬ�����Ʌ��%1QL�A��Ѐļȼ́�����ܵ����Օ�ѥ��̰����ѱ䁹�є��Ʌ���ȁͱ��́����Ʌ����̰����������ɕ����͕́�����͔��չ��Ȁ���ݽɑ̤���((������Ё���ٕ�ͅѥ��Q��Ѐ􁡥�ѽ�乵�������������ɽ���ѽU�����͔���耑������ѕ������������q����(��ɕ��ɸ�����U����������ѕ�Aɽ��а����ٕ�ͅѥ��Q��а����͔��)�