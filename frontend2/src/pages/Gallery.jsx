import { useState } from 'react';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Scissors, Sparkles, Heart } from 'lucide-react';

// Placeholder gallery items — in production these would come from an API or CMS
const galleryItems = [
  { id: 1, category: 'Peluquería', title: 'Balayage natural', desc: 'Mechas rubias sobre base castaña' },
  { id: 2, category: 'Peluquería', title: 'Corte bob moderno', desc: 'Bob asimétrico con flequillo' },
  { id: 3, category: 'Peluquería', title: 'Tinte caoba', desc: 'Color intenso con brillo' },
  { id: 4, category: 'Peluquería', title: 'Ondas suaves', desc: 'Peinado para evento especial' },
  { id: 5, category: 'Manicura', title: 'French permanente', desc: 'Semipermanente de larga duración' },
  { id: 6, category: 'Manicura', title: 'Nail art floral', desc: 'Diseño pintado a mano' },
  { id: 7, category: 'Manicura', title: 'Acrílicas nude', desc: 'Extensiones con acabado natural' },
  { id: 8, category: 'Estética', title: 'Tratamiento facial', desc: 'Hidratación profunda y luminosidad' },
  { id: 9, category: 'Estética', title: 'Diseño de cejas', desc: 'Laminado y coloración' },
];

const gradients = [
  'from-rose-200 to-pink-300',
  'from-pink-200 to-rose-300',
  'from-amber-200 to-orange-300',
  'from-purple-200 to-pink-300',
  'from-rose-300 to-amber-200',
  'from-pink-300 to-purple-200',
  'from-amber-100 to-rose-200',
  'from-rose-100 to-pink-200',
  'from-pink-100 to-amber-200',
];

const categoryIcons = {
  'Peluquería': Scissors,
  'Manicura': Heart,
  'Estética': Sparkles,
};

const categories = ['Todos', 'Peluquería', 'Manicura', 'Estética'];

export default function Gallery() {
  return (
    <div className="min-h-screen bg-[#fdf9f7]">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <Badge variant="rose" className="mb-3 text-xs">Nuestros trabajos</Badge>
          <h1 className="text-5xl font-display font-bold text-stone-800 mb-4">Galería</h1>
          <p className="text-stone-500 max-w-md mx-auto text-lg leading-relaxed">
            Una muestra de los trabajos que más nos enorgullecen. Cada clienta es única.
          </p>
        </div>
      </div>

      {/* Gallery */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <Tabs defaultValue="Todos">
          <TabsList className="mb-10 bg-white border border-stone-200 shadow-sm rounded-full p-1 h-auto">
            {categories.map(cat => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="rounded-full px-4 py-1.5 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-400 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="Todos">
            <GalleryGrid items={galleryItems} />
          </TabsContent>
          {categories.slice(1).map(cat => (
            <TabsContent key={cat} value={cat}>
              <GalleryGrid items={galleryItems.filter(i => i.category === cat)} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

function GalleryGrid({ items }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((item, idx) => {
        const Icon = categoryIcons[item.category] || Scissors;
        return (
          <div
            key={item.id}
            className="relative group rounded-2xl overflow-hidden aspect-square cursor-pointer"
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Placeholder image with gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradients[idx % gradients.length]} transition-transform duration-500 group-hover:scale-105`} />

            {/* Icon watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <Icon className="w-24 h-24 text-white" />
            </div>

            {/* Overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300 ${hovered === item.id ? 'opacity-100' : 'opacity-0'}`} />

            {/* Info */}
            <div className={`absolute bottom-0 left-0 right-0 p-5 text-white transition-all duration-300 ${hovered === item.id ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
              <Badge className="bg-white/20 text-white border-white/30 text-xs mb-2">{item.category}</Badge>
              <h3 className="font-display font-semibold text-lg leading-tight">{item.title}</h3>
              <p className="text-white/80 text-sm mt-1">{item.desc}</p>
            </div>

            {/* Category badge always visible */}
            <div className="absolute top-3 left-3">
              <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                <Icon className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
