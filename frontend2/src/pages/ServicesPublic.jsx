import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Scissors, Sparkles, Heart, Star } from 'lucide-react';
import api from '../config/api';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

const categoryConfig = {
  'Peluquería': { color: 'bg-rose-50 text-rose-500 border-rose-200', dot: 'bg-rose-400', icon: Scissors },
  'Uñas':       { color: 'bg-pink-50 text-pink-500 border-pink-200',  dot: 'bg-pink-400',  icon: Heart },
  'Estética':   { color: 'bg-amber-50 text-amber-600 border-amber-200', dot: 'bg-amber-400', icon: Sparkles },
};

export default function ServicesPublic() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/services').then(r => setServices(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const categories = ['Todas', ...Object.keys(categoryConfig)];
  const grouped = categories.slice(1).reduce((acc, cat) => {
    acc[cat] = services.filter(s => s.category === cat);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#fdf9f7]">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <Badge variant="rose" className="mb-3 text-xs">Carta de servicios</Badge>
          <h1 className="text-5xl font-display font-bold text-stone-800 mb-4">
            Nuestros servicios
          </h1>
          <p className="text-stone-500 max-w-md mx-auto text-lg leading-relaxed">
            Descubre todo lo que podemos hacer por ti. Todos los precios incluyen IVA.
          </p>
        </div>
      </div>

      {/* Services grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-stone-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <Tabs defaultValue="Todas">
            <TabsList className="mb-8 bg-white border border-stone-200 shadow-sm rounded-full p-1 h-auto flex-wrap gap-1">
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

            {/* All */}
            <TabsContent value="Todas">
              {Object.entries(grouped).map(([cat, items]) => items.length > 0 && (
                <div key={cat} className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-2 h-2 rounded-full ${categoryConfig[cat]?.dot}`} />
                    <h2 className="text-2xl font-display font-semibold text-stone-800">{cat}</h2>
                    <Badge variant="outline" className="text-stone-400 border-stone-200 text-xs ml-1">
                      {items.length} servicios
                    </Badge>
                  </div>
                  <ServiceGrid items={items} categoryConfig={categoryConfig} />
                </div>
              ))}
            </TabsContent>

            {/* By category */}
            {categories.slice(1).map(cat => (
              <TabsContent key={cat} value={cat}>
                <ServiceGrid items={grouped[cat] || []} categoryConfig={categoryConfig} />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-rose-400 to-pink-500 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center text-white space-y-5">
          <h2 className="text-3xl font-display font-bold">¿Tienes dudas sobre qué servicio elegir?</h2>
          <p className="text-white/80">Contáctanos y te asesoramos sin compromiso.</p>
          <Button asChild size="lg" className="rounded-full bg-white text-rose-500 hover:bg-rose-50 border-0 shadow-md font-semibold">
            <Link to="/reservar">
              Reservar cita
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function ServiceGrid({ items, categoryConfig }) {
  if (!items.length) return <p className="text-stone-400 text-sm py-8 text-center">No hay servicios disponibles.</p>;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map(service => {
        const cfg = categoryConfig[service.category] || {};
        const Icon = cfg.icon || Star;
        return (
          <Card key={service.id} className="group hover:shadow-md transition-all duration-300 border-stone-100 hover:-translate-y-0.5 bg-white">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${cfg.color?.replace('text-', 'bg-').split(' ')[0] || 'bg-rose-50'}`}>
                    <Icon className={`w-5 h-5 ${cfg.color?.split(' ')[1] || 'text-rose-500'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-800 leading-tight">{service.name}</h3>
                    <Badge className={`mt-1 text-xs border ${cfg.color}`} variant="outline">
                      {service.category}
                    </Badge>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-rose-500">{service.price}€</p>
                </div>
              </div>
              {service.description && (
                <p className="text-xs text-stone-500 leading-relaxed">{service.description}</p>
              )}
              <div className="flex items-center gap-1.5 text-xs text-stone-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{service.duration} min</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
