import { Link } from 'react-router-dom';
import { Scissors, Sparkles, Heart, Star, Clock, ArrowRight, Phone, MapPin, AtSign, LayoutDashboard } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const featuredServices = [
  { icon: Scissors, name: 'Corte & Peinado', desc: 'Cortes modernos y peinados para cada ocasión', price: 'Desde 15€', color: 'bg-rose-50 text-rose-500' },
  { icon: Sparkles, name: 'Color & Mechas', desc: 'Tintes, mechas y balayage con productos premium', price: 'Desde 45€', color: 'bg-pink-50 text-pink-500' },
  { icon: Heart, name: 'Manicura & Uñas', desc: 'Uñas naturales, semipermanentes y acrílicas', price: 'Desde 20€', color: 'bg-amber-50 text-amber-500' },
  { icon: Star, name: 'Tratamientos', desc: 'Faciales, keratina y tratamientos capilares', price: 'Desde 40€', color: 'bg-purple-50 text-purple-500' },
];

const reasons = [
  { title: 'Más de 10 años de experiencia', desc: 'Profesionales especializadas con formación continua en las últimas tendencias.' },
  { title: 'Productos de alta calidad', desc: 'Trabajamos exclusivamente con marcas premium que cuidan tu cabello y piel.' },
  { title: 'Ambiente acogedor', desc: 'Un espacio diseñado para que te sientas cómoda y disfrutes de cada visita.' },
  { title: 'Resultados garantizados', desc: 'Tu satisfacción es nuestra prioridad. No descansamos hasta que estés feliz.' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fdf9f7]">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <Badge variant="rose" className="mb-4 text-xs font-medium px-3 py-1">
                ✨ Peluquería & Estética
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-display font-bold text-stone-800 leading-tight">
                Tu belleza,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">
                  nuestra pasión
                </span>
              </h1>
            </div>
            <p className="text-lg text-stone-500 leading-relaxed max-w-md">
              Transforma tu look con nuestros servicios de peluquería, estética y uñas.
              Más de 10 años cuidando tu imagen con dedicación y profesionalidad.
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-rose-400 to-pink-500 border-0 shadow-md hover:shadow-lg hover:from-rose-500 hover:to-pink-600 transition-all text-base">
                  <Link to="/reservar">
                    Reservar cita ahora
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-rose-200 text-rose-500 hover:bg-rose-50 text-base">
                  <Link to="/servicios">Ver servicios</Link>
                </Button>
              </div>
              <Button asChild size="lg" variant="outline" className="rounded-full border-stone-200 text-stone-500 hover:bg-stone-50 text-base w-full">
                <Link to="/admin">
                  <LayoutDashboard className="w-4 h-4" />
                  Administración
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 text-sm text-stone-500">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-400" />
                <span>Lun–Sáb 9:00–20:00</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>+500 clientas satisfechas</span>
              </div>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-rose-200 to-pink-300 rotate-3" />
              <div className="absolute inset-2 rounded-[2.5rem] bg-gradient-to-br from-rose-300 to-pink-400 -rotate-1 flex items-center justify-center">
                <div className="text-center text-white space-y-4 p-8">
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm mx-auto flex items-center justify-center">
                    <Scissors className="w-12 h-12 text-white" />
                  </div>
                  <p className="font-display text-2xl font-semibold">Ana Varela</p>
                  <p className="text-white/80 text-sm">Peluquería & Estética</p>
                  <div className="flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-white text-white" />
                    ))}
                  </div>
                  <p className="text-white/70 text-xs">5.0 · +200 reseñas</p>
                </div>
              </div>
            </div>
            {/* Floating badges */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-emerald-500 fill-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-stone-500">Clientas felices</p>
                <p className="font-semibold text-stone-800 text-sm">+500 este año</p>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
              <div>
                <p className="text-xs text-stone-500">Valoración media</p>
                <p className="font-semibold text-stone-800 text-sm">5.0 estrellas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios destacados */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <Badge variant="rose" className="mb-3 text-xs">Nuestros servicios</Badge>
            <h2 className="text-4xl font-display font-bold text-stone-800 mb-4">
              Todo lo que necesitas
            </h2>
            <p className="text-stone-500 max-w-md mx-auto">
              Ofrecemos una gama completa de servicios de belleza para que salgas sintiéndote espectacular.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map((s) => (
              <Card key={s.name} className="group hover:shadow-md transition-all duration-300 border-stone-100 hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-6 text-center space-y-4">
                  <div className={`w-14 h-14 rounded-2xl ${s.color} flex items-center justify-center mx-auto`}>
                    <s.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-stone-800 mb-1">{s.name}</h3>
                    <p className="text-xs text-stone-500 leading-relaxed">{s.desc}</p>
                  </div>
                  <Badge variant="outline" className="text-rose-500 border-rose-200 text-xs">
                    {s.price}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button asChild variant="outline" className="rounded-full border-rose-200 text-rose-500 hover:bg-rose-50">
              <Link to="/servicios">
                Ver todos los servicios
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Por qué nosotras */}
      <section className="py-24 bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="rose" className="mb-3 text-xs">¿Por qué elegirnos?</Badge>
              <h2 className="text-4xl font-display font-bold text-stone-800 mb-6">
                La diferencia está en los detalles
              </h2>
              <p className="text-stone-500 mb-8 leading-relaxed">
                En Ana Varela Peluquería nos comprometemos a ofrecerte una experiencia única,
                combinando técnica, calidad y un trato cercano que te hará sentir especial desde el momento en que entras.
              </p>
              <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-rose-400 to-pink-500 border-0 shadow-md hover:shadow-lg transition-all">
                <Link to="/reservar">Reserva tu cita</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {reasons.map((r, i) => (
                <Card key={i} className="border-rose-100/50 bg-white/70 backdrop-blur-sm hover:shadow-sm transition-shadow">
                  <CardContent className="p-5">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center mb-3">
                      <Star className="w-4 h-4 text-rose-500 fill-rose-200" />
                    </div>
                    <h3 className="font-semibold text-stone-800 text-sm mb-1.5">{r.title}</h3>
                    <p className="text-xs text-stone-500 leading-relaxed">{r.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24 bg-gradient-to-r from-rose-400 to-pink-500">
        <div className="max-w-3xl mx-auto px-4 text-center text-white space-y-6">
          <h2 className="text-4xl font-display font-bold">¿Lista para tu cambio?</h2>
          <p className="text-white/80 text-lg">
            Reserva tu cita en segundos y deja que nos encarguemos del resto.
          </p>
          <Button asChild size="lg" className="rounded-full bg-white text-rose-500 hover:bg-rose-50 border-0 shadow-md hover:shadow-lg transition-all text-base font-semibold">
            <Link to="/reservar">
              Reservar ahora — es gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
                <Scissors className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-display text-white font-semibold">Ana Varela</span>
            </div>
            <p className="text-sm leading-relaxed">
              Peluquería y centro de estética con más de 10 años de experiencia.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Contacto</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-rose-400" />
                <span>+34 600 000 000</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>Calle Ejemplo 1, Ciudad</span>
              </div>
              <div className="flex items-center gap-2">
                <AtSign className="w-4 h-4 text-rose-400" />
                <span>@anavarela.peluqueria</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Horario</h4>
            <div className="space-y-1 text-sm">
              <p>Lunes – Viernes: 9:00 – 20:00</p>
              <p>Sábados: 9:00 – 15:00</p>
              <p>Domingos: Cerrado</p>
            </div>
          </div>
        </div>
        <div className="border-t border-stone-800 mt-10 pt-6 text-center text-xs text-stone-600">
          © 2025 Ana Varela Peluquería · Todos los derechos reservados
        </div>
      </footer>
    </div>
  );
}
