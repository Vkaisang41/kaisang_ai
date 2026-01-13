import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Images = () => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await api.get('/images');
      setImages(response.data);
    } catch (err) {
      setError('Failed to fetch images');
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/images/generate', { prompt });
      setPrompt('');
      fetchImages();
    } catch (err) {
      setError('Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (image) => {
    const link = document.createElement('a');
    link.href = `http://localhost:5000/uploads/${image.filename}`;
    link.download = image.filename;
    link.click();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Images</h2>

      {/* Generate Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4">Generate New Image</h3>
        <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your image prompt..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </form>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((image) => (
          <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={`http://localhost:5000/uploads/${image.filename}`}
              alt={image.filename}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-2">{image.filename}</p>
              <button
                onClick={() => handleDownload(image)}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && !loading && (
        <p className="text-center text-gray-500 mt-8">No images yet. Generate your first image!</p>
      )}
    </div>
  );
};

export default Images;