import { useState } from 'react';
import './Gallery.css';

function Gallery() {
  // Imágenes de ejemplo - tu mujer puede reemplazarlas con sus propios trabajos
  const [images] = useState([
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500',
      title: 'Corte y Color',
      category: 'Peluquería'
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=500',
      title: 'Tratamiento Facial',
      category: 'Estética'
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500',
      title: 'Diseño de Uñas',
      category: 'Manicura'
    },
    {
      id: 4,
      url: 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=500',
      title: 'Peinado de Novia',
      category: 'Peluquería'
    },
    {
      id: 5,
      url: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500',
      title: 'Balayage',
      category: 'Peluquería'
    },
    {
      id: 6,
      url: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=500',
      title: 'Nail Art',
      category: 'Manicura'
    },
    {
      id: 7,
      url: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=500',
      title: 'Masaje Facial',
      category: 'Estética'
    },
    {
      id: 8,
      url: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500',
      title: 'Pedicura Spa',
      category: 'Manicura'
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = ['Todos', 'Peluquería', 'Estética', 'Manicura'];

  const filteredImages = selectedCategory === 'Todos' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  return (
    <div className="gallery">
      <div className="gallery-header">
        <h1>Galería de Trabajos</h1>
        <p>Descubre algunos de nuestros mejores trabajos</p>
      </div>

      <div className="gallery-filters">
        {categories.map(category => (
          <button
            key={category}
            className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="gallery-grid">
        {filteredImages.map(image => (
          <div key={image.id} className="gallery-item">
            <img src={image.url} alt={image.title} />
            <div className="gallery-item-overlay">
              <h3>{image.title}</h3>
              <span className="category-badge">{image.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Gallery;
