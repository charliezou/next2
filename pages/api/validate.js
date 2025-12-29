// pages/api/validate.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { text } = req.body;

  // 构建提示词，让 Qwen 判断是否为问候语
  const prompt = `请判断以下文本是否为问候语，只回答“是”或“否”：\n\n"${text}"`;

  try {
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen-turbo', // 可选模型
        input: {
          messages: [
            { role: 'user', content: prompt }
          ]
        },
        parameters: {
          result_format: 'message'
        }
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'API 请求失败');
    }

    const result = data.output.choices[0]?.message?.content?.trim();
    // 简单判断 AI 返回的是“是”还是“否”
    const isGreeting = result.includes('是');
    res.status(200).json({ isGreeting, aiResponse: result });
  } catch (error) {
    console.error('Validation API Error:', error);
    res.status(500).json({ error: error.message });
  }
}