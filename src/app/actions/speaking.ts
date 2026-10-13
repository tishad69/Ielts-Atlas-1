"use server";

import { db } from "@/db";
import { speakingSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { analyzeSpeaking, SPEAKING_QUESTION_BANK } from "@/lib/speakingEngine";
import { aiEnabled, aiSpeakingFeedback, aiChatReply } from "@/lib/ai";

export async function submitSpeaking(formData: FormData) {
  const part = String(formData.get("part") || "part1");
  const question = String(formData.get("question") || "");
  const transcript = String(formData.get("transcript") || "").trim();
  const durationSeconds = Number(formData.get("durationSeconds") || 60);
  if (!transcript) return;

  const heuristic = analyzeSpeaking(transcript, durationSeconds);
  let record: { bandOverall: number; feedback: Record<string, unknown> } = {
    bandOverall: heuristic.bandOverall,
    feedback: {
      fluency: heuristic.bandFluency,
      lexical: heuristic.bandLexical,
      grammar: heuristic.bandGrammar,
      strengths: heuristic.strengths,
      issues: heuristic.issues,
      stats: heuristic,
    },
  };

  if (aiEnabled()) {
    try {
      const ai = await aiSpeakingFeedback(transcript, question, part);
      record = {
        bandOverall: ai.bandOverall,
        feedback: {
          fluency: ai.fluency,
          lexical: ai.lexical,
          grammar: ai.grammar,
          strengths: ai.strengths,
          issues: ai.issues,
          modelAnswer: ai.modelAnswer,
          stats: heuristic,
        },
      };
    } catch (err: any) {
      console.error("AI Evaluation error:", err);
      record = {
        bandOverall: heuristic.bandOverall,
        feedback: {
          fluency: heuristic.bandFluency,
          lexical: heuristic.bandLexical,
          grammar: heuristic.bandGrammar,
          strengths: heuristic.strengths,
          issues: [`⚠️ AI Error: ${err?.message || String(err)}`, ...heuristic.issues],
          stats: heuristic,
        },
      };
    }
  } else {
    record = {
      bandOverall: heuristic.bandOverall,
      feedback: {
        fluency: heuristic.bandFluency,
        lexical: heuristic.bandM�᥍���(���������Ʌ����聡��ɥ�ѥ������Ʌ���Ȱ(����������ɕ��ѡ�聡��ɥ�ѥ����ɕ��ѡ̰(�����������Օ��l(������������j���<�$�9�Ё�������5%9%}A%}-d��́��Ё��ѕ�ѕ�����͕�ٕȁ��٥ɽ����и��(����������������ɥ�ѥ�����Օ̰(��������t�(���������х��聡��ɥ�ѥ��(��������(������(���((���݅�Ё�����͕�С��������M��ͥ��̤�م�Օ̡�(�������а(�����Օ�ѥ���(�����Ʌ�͍ɥ�а(������Ʌѥ��M�����̰(����ݽɑ�A��5���є聡��ɥ�ѥ��ݽɑ�A��5���є�(�����������չ�聡��ɥ�ѥ���������չа(�������ɕ��ɐ�(�����((��ɕم����ѕA�Ѡ��������������(��ɕم����ѕA�Ѡ������)�()�����Ё��幌��չ�ѥ�������ѕM����������ɵ�ф��ɵ�ф���(������Ё����9յ��ȡ��ɵ�ф���Р�������(���݅�Ё�������є���������M��ͥ��̤�ݡ�ɔ��ġ��������M��ͥ��̹���������(��ɕم����ѕA�Ѡ��������������(��ɕم����ѕA�Ѡ������)�()�����Ё��幌��չ�ѥ���Ʌ����EՕ�ѥ����������ɥ�����(������Ё������MA-%9}EUMQ%=9}	9-m����t����MA-%9}EUMQ%=9}	9,�������(��ɕ��ɸ�����m5�Ѡ�����ȡ5�Ѡ�Ʌ������������������Ѡ�t�)�()����Ё11	-}=11=]UAL�I���ɐ���ɥ������ɥ��mt����(��������l(�����%�ѕɕ�ѥ�����ձ���ԁѕ����������Ё��ɔ�����Ёݡ�ѡ�Ё�����(�����9��������ԁѡ������ȁ�����������ѡ�́ݥ�������������ѡ������ɔ���(�����Q����́��ȁ͡�ɥ����!�܁��ѕ�����́ѡ�Ё���������ȁ�����(������������ݕȸ�����ԁ�����ɔ�ѡ�ЁݥѠ���܁ѡ���́ݕɔ�����܁啅�́������(��t�(��������l(�����ɕ�Ё�ѽ�䃊P�ݡ�Ё݅́ѡ�����Ё���������������Ё���ѡ�Ё����ɥ�������(�����Q��Ёͽչ�́����Ʌ�����!�܁�����Ё������ԁ�������ѕ�݅ɑ����(�����Q����́��ȁ��͍ɥ�����ѡ�и�]�ձ���ԁɕ���������ЁѼ��ѡ�����]�����(��t�(��������l(�����Q���q���́�����ȁ����и����ԁѡ����ѡ����ٕɹ���Ё͡�ձ�����䁄������ȁɽ�����ɔ���(�����%�ѕɕ�ѥ����������ѥٔ��P�ݡ�Ё����Ёѡ������ͥє�٥�ܰ��́ѡ�ɔ���ɥЁѼ������(����������!�܁����ԁѡ����ѡ�́���Ք�ݥ��������������啅�����(��t�)��()�չ�ѥ������ɥ�ѥ������9�є��͕�Q������ɥ�����(������Ё������̀��͕�Q��йѽ1�ݕ��͔�����э���q��յ�񱥭���ԁ����񤁵�����Յ����ͥ�����q��������mt������Ѡ�(������������̀��̤�ɕ��ɸ���mQ���$���ѥ��������܁�����ȁݽɑ̀�մ��������P�������ͥ���ͥ���ѱ䁥��ѕ���t��(�������͕�Q��й����Р�q̬������ѕȡ	������������Ѡ����Ԥ�ɕ��ɸ���mQ�����䁕�ѕ��������ȁ���ݕȁݥѠ���ɕ�ͽ����������ᅵ����t��(��ɕ��ɸ����)�()�����Ё��幌��չ�ѥ�������I���䡡��ѽ����Ʌ���ɽ�����ɥ��쁍��ѕ�����ɥ��������������ɥ�����(�������������������(��������(����������Ёɕ����݅�Ё�����I���䡡��ѽ�䁅́�ɽ��耉�͕Ȉ������ͥ�х�Ј�������ѕ��쁍��ѕ�����ɥ����mt��(������ɕ��ɸ�ɕ����(����􁍅э���(��������������ѡɽ՝��Ѽ����ɥ�ѥ�(�����(���(������Ё������11	-}=11=]UAMm����t����11	-}=11=]UAL�������(������Ё����U͕Ȁ�l������ѽ��t�ɕٕ�͔�������l���������ɽ�������͕Ȉ��(������Ё��є�􁱅��U͕Ȁ�����ɥ�ѥ������9�є�����U͕ȹ���ѕ�Ф�耈��(������ЁĀ�����m5�Ѡ�����ȡ5�Ѡ�Ʌ������������������Ѡ�t�(��ɕ��ɸ����������ѕ���)�(