import Link from 'next/link';
import {
  Sparkles,
  Calendar,
  Clock,
  Shield,
  Heart,
  Star,
  ArrowRight,
  ChevronRight,
  MapPin,
  Phone,
} from 'lucide-react';
import './page.css';

// Demo data - will be replaced by DB queries
const featuredTreatments = [
  {
    id: '1',
    name: 'Limpieza Facial Profunda',
    slug: 'limpieza-facial-profunda',
    description:
      'Limpieza profesional que elimina impurezas, desobstruye poros y devuelve la luminosidad natural a tu piel.',
    duration: 60,
    category: 'Facial',
    image: '/images/treatment-cleanse.jpg',
  },
  {
    id: '2',
    name: 'Radiofrecuencia Facial',
    slug: 'radiofrecuencia-facial',
    description:
      'Tratamiento no invasivo que estimula la producción de colágeno para una piel más firme y rejuvenecida.',
    duration: 45,
    category: 'Facial',
    image: '/images/treatment-radiofrequency.jpg',
  },
  {
    id: '3',
    name: 'Peeling Químico',
    slug: 'peeling-quimico',
    description:
      'Renovación celular que mejora la textura, reduce manchas y unifica el tono de la piel.',
    duration: 40,
    category: 'Facial',
    image: '/images/treatment-peeling.jpg',
  },
  {
    id: '4',
    name: 'Masaje Descontracturante',
    slug: 'masaje-descontracturante',
    description:
      'Masaje terapéutico que alivia tensiones musculares y promueve la relajación profunda.',
    duration: 50,
    category: 'Corporal',
    image: '/images/treatment-massage.jpg',
  },
];

const teamMembers = [
  {
    name: 'Laura Martínez',
    role: 'Especialista en Tratamientos Faciales',
    specialties: ['Limpieza Facial', 'Peeling', 'Radiofrecuencia'],
    image: '/images/team-laura.jpg',
  },
  {
    name: 'María González',
    role: 'Especialista en Tratamientos Corporales',
    specialties: ['Masajes', 'Tratamientos Corporales', 'Drenaje Linfático'],
    image: '/images/team-maria.jpg',
  },
  {
    name: 'Ana López',
    role: 'Especialista en Depilación y Dermaplaning',
    specialties: ['Depilación', 'Dermaplaning', 'Tratamientos Faciales'],
    image: '/images/team-ana.jpg',
  },
];

const benefits = [
  {
    icon: Shield,
    title: 'Profesionales Certificadas',
    description: 'Equipo altamente capacitado con formación continua.',
  },
  {
    icon: Sparkles,
    title: 'Tecnología Avanzada',
    description: 'Equipos de última generación para resultados superiores.',
  },
  {
    icon: Heart,
    title: 'Atención Personalizada',
    description: 'Cada tratamiento se adapta a tus necesidades específicas.',
  },
  {
    icon: Clock,
    title: 'Reserva Fácil',
    description: 'Agendá tu turno online en pocos pasos, cuando quieras.',
  },
];

const testimonials = [
  {
    name: 'Valentina R.',
    text: 'Increíble experiencia. El equipo es muy profesional y los resultados superaron mis expectativas. ¡Recomiendo totalmente!',
    rating: 5,
    treatment: 'Limpieza Facial Profunda',
  },
  {
    name: 'Carolina M.',
    text: 'Me encanta la atención personalizada. Siempre se toman el tiempo de explicar cada paso del tratamiento. Un lugar de confianza.',
    rating: 5,
    treatment: 'Radiofrecuencia Facial',
  },
  {
    name: 'Lucía S.',
    text: 'La mejor estética a la que he ido. Ambiente cálido, profesionales dedicadas y resultados visibles desde la primera sesión.',
    rating: 5,
    treatment: 'Peeling Químico',
  },
];

export default function HomePage() {
  return (
    <>
      {/* ─── HERO ──────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__bg" />
        <div className="hero__overlay" />
        <div className="hero__content container">
          <div className="hero__text">
            <p className="subtitle animate-fadeInUp">Bienvenida a MOON Golden Beauty Estética</p>
            <h1 className="hero__title animate-fadeInUp">
              Tu belleza,
              <br />
              <em>nuestra pasión</em>
            </h1>
            <p className="hero__description animate-fadeInUp">
              Tratamientos estéticos profesionales en un ambiente de cuidado,
              confianza y bienestar. Descubrí la mejor versión de vos.
            </p>
            <div className="hero__actions animate-fadeInUp">
              <Link href="/reservar" className="btn btn--primary btn--lg">
                <Calendar size={20} />
                Reservar Turno
              </Link>
              <Link href="/tratamientos" className="btn btn--secondary btn--lg">
                Ver Tratamientos
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
        <div className="hero__scroll-hint">
          <span>Descubrí más</span>
          <ChevronRight size={16} className="hero__scroll-icon" />
        </div>
      </section>

      {/* ─── BENEFITS BAR ──────────────────────────────────── */}
      <section className="benefits-bar">
        <div className="container">
          <div className="benefits-bar__grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-item">
                <div className="benefit-item__icon">
                  <benefit.icon size={24} />
                </div>
                <div className="benefit-item__text">
                  <h4 className="benefit-item__title">{benefit.title}</h4>
                  <p className="benefit-item__description">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT PREVIEW ─────────────────────────────────── */}
      <section className="section about-preview">
        <div className="container">
          <div className="about-preview__grid">
            <div className="about-preview__images">
              <div className="about-preview__image-main" />
              <div className="about-preview__image-accent" />
              <div className="about-preview__experience">
                <span className="about-preview__exp-number">10+</span>
                <span className="about-preview__exp-text">Años de experiencia</span>
              </div>
            </div>
            <div className="about-preview__content">
              <p className="subtitle">Sobre Nosotros</p>
              <h2 className="heading-section">
                Un espacio dedicado a tu bienestar
              </h2>
              <div className="divider divider--left" />
              <p className="about-preview__text">
                En Estética Studio creemos que cada persona merece sentirse bien
                consigo misma. Nuestro equipo de profesionales certificadas
                trabaja con las últimas tecnologías y técnicas para ofrecerte
                tratamientos personalizados que se adaptan a tus necesidades.
              </p>
              <p className="about-preview__text">
                Desde tratamientos faciales hasta corporales, cada servicio está
                diseñado para brindarte los mejores resultados en un ambiente
                cálido y profesional.
              </p>
              <Link href="/nosotros" className="btn btn--secondary mt-6">
                Conocenos
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TREATMENTS ────────────────────────────────────── */}
      <section className="section section--bg treatments-section">
        <div className="container">
          <div className="section__header">
            <p className="section__subtitle">Nuestros Servicios</p>
            <h2 className="section__title">Tratamientos Destacados</h2>
            <div className="divider" />
            <p className="section__description">
              Descubrí nuestra selección de tratamientos diseñados para realzar
              tu belleza natural y cuidar tu bienestar.
            </p>
          </div>
          <div className="treatments-grid">
            {featuredTreatments.map((treatment) => (
              <Link
                key={treatment.id}
                href={`/tratamientos/${treatment.slug}`}
                className="treatment-card card card--interactive"
              >
                <div className="treatment-card__image">
                  {treatment.image ? (
                    <img
                      src={treatment.image}
                      alt={treatment.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="treatment-card__image-placeholder">
                      <Sparkles size={32} />
                    </div>
                  )}
                  <span className="treatment-card__category">
                    {treatment.category}
                  </span>
                </div>
                <div className="card__body">
                  <h3 className="card__title">{treatment.name}</h3>
                  <p className="card__text">{treatment.description}</p>
                  <div className="treatment-card__meta">
                    <span className="treatment-card__duration">
                      <Clock size={14} />
                      {treatment.duration} min
                    </span>
                    <span className="treatment-card__link">
                      Ver más <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/tratamientos" className="btn btn--primary">
              Ver Todos los Tratamientos
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TEAM ──────────────────────────────────────────── */}
      <section className="section team-section">
        <div className="container">
          <div className="section__header">
            <p className="section__subtitle">Nuestro Equipo</p>
            <h2 className="section__title">Profesionales Dedicadas</h2>
            <div className="divider" />
            <p className="section__description">
              Conocé a las profesionales que harán de tu experiencia algo único
              y personalizado.
            </p>
          </div>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-card__image">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="team-card__image-placeholder">
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="team-card__info">
                  <h3 className="team-card__name">{member.name}</h3>
                  <p className="team-card__role">{member.role}</p>
                  <div className="team-card__specialties">
                    {member.specialties.map((spec) => (
                      <span key={spec} className="badge badge--gold">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/profesionales" className="btn btn--secondary">
              Conocer al Equipo
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ──────────────────────────────────── */}
      <section className="section section--bg testimonials-section">
        <div className="container">
          <div className="section__header">
            <p className="section__subtitle">Testimonios</p>
            <h2 className="section__title">Lo que dicen nuestras clientas</h2>
            <div className="divider" />
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card card">
                <div className="card__body">
                  <div className="testimonial-card__stars">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill="var(--accent-gold)"
                        color="var(--accent-gold)"
                      />
                    ))}
                  </div>
                  <p className="testimonial-card__text">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <div className="testimonial-card__author">
                    <div className="testimonial-card__avatar">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="testimonial-card__name">
                        {testimonial.name}
                      </p>
                      <p className="testimonial-card__treatment">
                        {testimonial.treatment}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="cta-section__bg" />
        <div className="container cta-section__content">
          <p className="subtitle" style={{ color: 'var(--accent-gold-light)' }}>
            ¿Lista para empezar?
          </p>
          <h2 className="heading-section" style={{ color: 'var(--text-white)' }}>
            Reservá tu turno hoy
          </h2>
          <p
            className="section__description"
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Elegí tu tratamiento, seleccioná tu profesional favorita y reservá
            en pocos pasos. Tu bienestar está a un clic de distancia.
          </p>
          <div className="cta-section__actions">
            <Link href="/reservar" className="btn btn--primary btn--lg">
              <Calendar size={20} />
              Reservar Turno
            </Link>
            <Link href="/contacto" className="btn btn--ghost btn--lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
              <Phone size={18} />
              Contactanos
            </Link>
          </div>
        </div>
      </section>

      {/* ─── LOCATION ──────────────────────────────────────── */}
      <section className="section location-section">
        <div className="container">
          <div className="location-grid">
            <div className="location-info">
              <p className="subtitle">Visitanos</p>
              <h2 className="heading-section">Nuestra Ubicación</h2>
              <div className="divider divider--left" />
              <div className="location-details">
                <div className="location-detail">
                  <MapPin size={20} className="location-detail__icon" />
                  <div>
                    <h4>Dirección</h4>
                    <p>Av. Principal 1234, Ciudad</p>
                  </div>
                </div>
                <div className="location-detail">
                  <Phone size={20} className="location-detail__icon" />
                  <div>
                    <h4>Teléfono</h4>
                    <p>+54 11 1234-5678</p>
                  </div>
                </div>
                <div className="location-detail">
                  <Clock size={20} className="location-detail__icon" />
                  <div>
                    <h4>Horarios</h4>
                    <p>Lunes a Viernes: 9:00 - 20:00</p>
                    <p>Sábados: 9:00 - 14:00</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="location-map">
              <div className="location-map__placeholder">
                <MapPin size={48} />
                <p>Mapa interactivo</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
