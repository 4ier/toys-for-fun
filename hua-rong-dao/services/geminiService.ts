import { GoogleGenAI } from "@google/genai";

const getGeminiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
};

export const getStrategicHint = async (boardState: string): Promise<string> => {
  const ai = getGeminiClient();
  if (!ai) {
    return "请配置 API Key 以获取锦囊妙计。";
  }

  try {
    const prompt = `
      你是一位精通"华容道"（Klotski）的国手大师。
      游戏目标是将最大的方块（曹操，2x2，用C表示）移动到最底部的中间出口。
      当前棋盘布局如下 (C=曹操/目标, V=竖将, H=横将, S=小卒, .=空):
      
      ${boardState}
      
      请提供一句简短、玄妙但富有深意的战略提示（仅限一句话）。
      请用中文回答，风格模仿三国时期的谋士（如诸葛亮）。
      不要直接给出具体的移动坐标（如A1到B2），而是指出关键的阻碍或解题的大致方向（例如"先让张飞退避三舍"或"只需为曹公腾出中道"）。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "天机晦涩，云雾遮眼，暂无法窥探前路。";
  }
};