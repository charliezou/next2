// pages/index.js
import { useState } from 'react';

export default function Home() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError('');
    setWeather(null);

    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      const data = await res.json();

      if (res.ok) {
        setWeather(data);
      } else {
        setError(data.error || 'Failed to get weather');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const [inputText, setInputText] = useState('hello chat');
  const [result, setResult] = useState(null);


  const handleValidate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) throw new Error('验证失败');

      const data = await response.json();
      setResult(data.isGreeting);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [text, setText] = useState('这是通过安全代理调用 Qwen-TTS 的示例。');
  //const [audioSrc, setAudioSrc] = useState('');

  const playTTS = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError('');
    let audioUrl = '';

    try {
      // 调用本地代理接口
      const response = await fetch('/api/tts-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Request failed');
      }

      const data = await response.json();

      if (!data.output?.audio) {
        throw new Error('No audio returned');
      }

      audioUrl = data.output.audio.url;
      // 自动播放
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (err) {
      console.error('TTS Error:', err);
      setError(`语音合成失败: ${err.message}`);
    } finally {
      setLoading(false);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">Weather App (Secure Proxy)</h1>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
          className="px-4 py-2 border rounded"
        />
        <button
          onClick={fetchWeather}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Get Weather'}
        </button>
      </div>

      {weather && (
        <div className="bg-white p-6 rounded shadow max-w-md w-full">
          <h2 className="text-2xl font-bold">{weather.name}, {weather.sys.country}</h2>
          <p className="text-4xl my-2">{Math.round(weather.main.temp)}°C</p>
          <p>{weather.weather[0].description}</p>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to validate"
          className="px-4 py-2 border rounded"
        />
        <button
          onClick={handleValidate}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Validating...' : 'Validate'}
        </button>
      </div>

      {result !== null && (
        <p className="mt-2 text-lg">
          {result ? '是问候语' : '不是问候语'}
        </p>
      )}
      <h1 className="text-3xl font-bold mb-6">🔒 安全版 Qwen-TTS</h1>
      <textarea 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        rows={4} cols={50}
        placeholder="Enter text to tts"
        className="px-4 py-2 border rounded" 
      />
      <br />
      
      <button
        onClick={playTTS}
        disabled={loading || !text.trim()}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: loading ? '#ccc' : '#1890ff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? '合成中...' : '🔊 播放语音'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
    
  );
}