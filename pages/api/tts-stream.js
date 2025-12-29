

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text || typeof text !== 'string' || text.trim() === '') {
    return res.status(400).json({ error: 'Invalid input text' });
  }

  try {
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen-tts', // 使用最新 TTS 模型 qwen3-tts-flash
        input: {
          text: text.trim(),
        },
        parameters: {
          voice: 'Sunny',     // 推荐音色：知性女声
          format: 'mp3',
          sample_rate: 24000,
        },
      }),
    });

    const data = await response.json();
    res.status(200).json(data); // 返回完整响应（含 base64 音频）

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}