// pages/api/weather.js
export default async function handler(req, res) {
  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather`;
    const params = new URLSearchParams({
      q: city,
      appid: process.env.WEATHER_API_KEY,
      units: 'metric', // 摄氏度
    });

    const response = await fetch(`${url}?${params}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.message || 'Failed to fetch weather' });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}