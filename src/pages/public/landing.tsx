import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  Layout, Stack, VStack, HStack, Typography, Button, CardWrapper, Badge, Center
} from '@/shared/ui';
import { 
  PhoneIcon, 
  MapPinIcon, 
  ClockIcon,
  StarIcon,
  ShoppingBagIcon,
  UserIcon,
  CogIcon
} from '@heroicons/react/24/outline';

// Hero Section - Banner principal atractivo
function HeroSection() {
  const navigate = useNavigate();

  return (
    <Layout variant="container" padding="xl">
      <Stack direction="row" align="center" justify="space-between" gap="xl">
        <Stack gap="xl" width="50%">
          <Stack gap="md">
            <Typography variant="display" color="primary">
              Bienvenido a La Gigante
            </Typography>
            <Typography variant="title" color="secondary">
              Las mejores pizzas de la ciudad, ahora con pedidos online
            </Typography>
            <Typography variant="body" color="muted">
              Disfruta de nuestras especialidades artesanales preparadas con 
              ingredientes frescos y la receta tradicional de siempre.
            </Typography>
          </Stack>
          
          <HStack gap="md">
            <Button 
              size="lg" 
              colorPalette="accent" 
              onClick={() => navigate('/login')}
            >
              <ShoppingBagIcon style={{ width: '20px', height: '20px' }} />
              Hacer Pedido
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              colorPalette="accent"
              onClick={() => navigate('/menu')}
            >
              Ver Menú
            </Button>
          </HStack>
        </Stack>
        
        <Center width="50%">
          <CardWrapper variant="elevated" padding="none" rounded>
            <div style={{
              width: '400px',
              height: '300px',
              background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              🍕 Imagen Hero Pizza 🍕
            </div>
          </CardWrapper>
        </Center>
      </Stack>
    </Layout>
  );
}

// Sección de menú destacado
function FeaturedMenu() {
  const featuredItems = [
    {
      id: 1,
      name: 'Pizza Margherita',
      description: 'Salsa de tomate, mozzarella fresca y albahaca',
      price: '$18.90',
      image: '🍕',
      popular: true
    },
    {
      id: 2,
      name: 'Pizza Napolitana',
      description: 'Salsa de tomate, mozzarella, anchoas y aceitunas',
      price: '$21.50',
      image: '🍕',
      popular: false
    },
    {
      id: 3,
      name: 'Empanadas Criollas',
      description: 'Carne cortada a cuchillo, cebolla y especias',
      price: '$3.20',
      image: '🥟',
      popular: true
    },
    {
      id: 4,
      name: 'Milanesa Napolitana',
      description: 'Con jamón, queso y salsa de tomate',
      price: '$16.80',
      image: '🍖',
      popular: false
    }
  ];

  return (
    <Layout variant="container" padding="xl">
      <Stack gap="xl">
        <Stack gap="sm" align="center">
          <Typography variant="heading" color="primary" textAlign="center">
            Nuestras Especialidades
          </Typography>
          <Typography variant="body" color="muted" textAlign="center">
            Los platos más pedidos por nuestros clientes
          </Typography>
        </Stack>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '24px' 
        }}>
          {featuredItems.map((item) => (
            <CardWrapper key={item.id} variant="elevated" padding="md" interactive>
              <Stack gap="md">
                <HStack justify="space-between" align="start">
                  <div style={{ fontSize: '48px' }}>{item.image}</div>
                  {item.popular && (
                    <Badge colorPalette="accent" size="sm">
                      <StarIcon style={{ width: '12px', height: '12px' }} />
                      Popular
                    </Badge>
                  )}
                </HStack>
                
                <Stack gap="sm">
                  <Typography variant="title" color="primary">
                    {item.name}
                  </Typography>
                  <Typography variant="body" color="muted" size="sm">
                    {item.description}
                  </Typography>
                  <Typography variant="title" color="accent" size="lg">
                    {item.price}
                  </Typography>
                </Stack>
              </Stack>
            </CardWrapper>
          ))}
        </div>
      </Stack>
    </Layout>
  );
}

// Sección acerca del restaurante
function AboutSection() {
  return (
    <Layout variant="container" padding="xl">
      <CardWrapper variant="subtle" padding="xl">
        <Stack direction="row" align="center" gap="xl">
          <Stack gap="lg" width="60%">
            <Typography variant="heading" color="primary">
              Tradición y Sabor desde 1985
            </Typography>
            <Stack gap="md">
              <Typography variant="body" color="secondary">
                En La Gigante combinamos la tradición familiar con la innovación tecnológica. 
                Nuestras recetas han pasado de generación en generación, manteniendo ese 
                sabor auténtico que nos caracteriza.
              </Typography>
              <Typography variant="body" color="secondary">
                Ahora con nuestro sistema de pedidos online, puedes disfrutar de nuestras 
                especialidades desde la comodidad de tu hogar, manteniendo la misma calidad 
                y frescura de siempre.
              </Typography>
            </Stack>
            
            <HStack gap="md">
              <CardWrapper variant="outline" padding="md" width="fit">
                <HStack gap="sm" align="center">
                  <ClockIcon style={{ width: '20px', height: '20px', color: '#f7931e' }} />
                  <Stack gap="xs">
                    <Typography variant="label" color="primary">Entrega</Typography>
                    <Typography variant="body" size="sm" color="muted">30-45 min</Typography>
                  </Stack>
                </HStack>
              </CardWrapper>

              <CardWrapper variant="outline" padding="md" width="fit">
                <HStack gap="sm" align="center">
                  <StarIcon style={{ width: '20px', height: '20px', color: '#f7931e' }} />
                  <Stack gap="xs">
                    <Typography variant="label" color="primary">Rating</Typography>
                    <Typography variant="body" size="sm" color="muted">4.8/5 ⭐</Typography>
                  </Stack>
                </HStack>
              </CardWrapper>
            </HStack>
          </Stack>
          
          <Center width="40%">
            <div style={{
              width: '300px',
              height: '250px',
              background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              📷 Imagen del Restaurante
            </div>
          </Center>
        </Stack>
      </CardWrapper>
    </Layout>
  );
}

// Sección de testimonios
function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      name: 'María González',
      rating: 5,
      comment: 'La mejor pizza de la zona! El sistema de pedidos online es súper fácil de usar.',
      avatar: '👩'
    },
    {
      id: 2,
      name: 'Carlos Rodríguez',
      rating: 5,
      comment: 'Pedido llegó rapidísimo y caliente. Las empanadas son espectaculares.',
      avatar: '👨'
    },
    {
      id: 3,
      name: 'Ana Martínez',
      rating: 4,
      comment: 'Excelente atención y comida deliciosa. Ya es mi lugar favorito para pedir.',
      avatar: '👩‍🦱'
    }
  ];

  return (
    <Layout variant="container" padding="xl">
      <Stack gap="xl">
        <Stack gap="sm" align="center">
          <Typography variant="heading" color="primary" textAlign="center">
            Lo que dicen nuestros clientes
          </Typography>
          <Typography variant="body" color="muted" textAlign="center">
            Testimonios reales de quienes ya probaron nuestros sabores
          </Typography>
        </Stack>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '24px' 
        }}>
          {testimonials.map((testimonial) => (
            <CardWrapper key={testimonial.id} variant="outline" padding="lg">
              <Stack gap="md">
                <HStack justify="space-between" align="center">
                  <HStack gap="sm" align="center">
                    <div style={{ fontSize: '32px' }}>{testimonial.avatar}</div>
                    <Typography variant="title" color="primary">
                      {testimonial.name}
                    </Typography>
                  </HStack>
                  <HStack gap="xs">
                    {Array(testimonial.rating).fill(0).map((_, i) => (
                      <StarIcon key={i} style={{ width: '16px', height: '16px', color: '#f7931e' }} />
                    ))}
                  </HStack>
                </HStack>
                
                <Typography variant="body" color="secondary">
                  "{testimonial.comment}"
                </Typography>
              </Stack>
            </CardWrapper>
          ))}
        </div>
      </Stack>
    </Layout>
  );
}

// Sección de contacto
function ContactSection() {
  return (
    <Layout variant="container" padding="xl">
      <CardWrapper variant="subtle" padding="xl">
        <Stack direction="row" justify="space-between" gap="xl">
          <Stack gap="lg" width="50%">
            <Typography variant="heading" color="primary">
              Visitanos o pedí online
            </Typography>
            
            <Stack gap="md">
              <HStack gap="sm" align="start">
                <MapPinIcon style={{ width: '20px', height: '20px', color: '#f7931e', marginTop: '4px' }} />
                <Stack gap="xs">
                  <Typography variant="label" color="primary">Dirección</Typography>
                  <Typography variant="body" color="secondary">
                    Av. Principal 1234, Ciudad<br />
                    Provincia, Argentina
                  </Typography>
                </Stack>
              </HStack>
              
              <HStack gap="sm" align="start">
                <PhoneIcon style={{ width: '20px', height: '20px', color: '#f7931e', marginTop: '4px' }} />
                <Stack gap="xs">
                  <Typography variant="label" color="primary">Teléfono</Typography>
                  <Typography variant="body" color="secondary">
                    (011) 4567-8900<br />
                    WhatsApp: (011) 1234-5678
                  </Typography>
                </Stack>
              </HStack>
              
              <HStack gap="sm" align="start">
                <ClockIcon style={{ width: '20px', height: '20px', color: '#f7931e', marginTop: '4px' }} />
                <Stack gap="xs">
                  <Typography variant="label" color="primary">Horarios</Typography>
                  <Typography variant="body" color="secondary">
                    Lun a Dom: 18:00 - 00:00<br />
                    Pedidos online 24/7
                  </Typography>
                </Stack>
              </HStack>
            </Stack>
          </Stack>
          
          <Stack gap="lg" width="50%" align="center">
            <Typography variant="title" color="primary" textAlign="center">
              ¿Listo para ordenar?
            </Typography>
            
            <Stack gap="md" width="full">
              <Button 
                size="lg" 
                colorPalette="accent" 
                width="full"
                as={RouterLink}
                to="/login"
              >
                <ShoppingBagIcon style={{ width: '20px', height: '20px' }} />
                Hacer Pedido Online
              </Button>
              
              <HStack gap="sm" justify="center">
                <Typography variant="caption" color="muted">
                  ¿Sos parte del equipo?
                </Typography>
                <Button 
                  variant="ghost" 
                  size="sm"
                  as={RouterLink}
                  to="/admin"
                >
                  <CogIcon style={{ width: '16px', height: '16px' }} />
                  Acceso Staff
                </Button>
              </HStack>
            </Stack>
          </Stack>
        </Stack>
      </CardWrapper>
    </Layout>
  );
}

// Footer comercial
function Footer() {
  return (
    <Layout variant="panel" padding="lg" style={{ background: '#2d3748', color: 'white' }}>
      <Stack gap="md" align="center">
        <HStack gap="xl" justify="center">
          <Typography variant="title" color="white">
            🍕 La Gigante
          </Typography>
          <Typography variant="body" color="white" opacity={0.8}>
            • Tradición desde 1985 •
          </Typography>
        </HStack>
        
        <Typography variant="caption" color="white" opacity={0.6} textAlign="center">
          © 2025 La Gigante. Todos los derechos reservados. | Powered by G-Admin
        </Typography>
      </Stack>
    </Layout>
  );
}

// Página principal de landing
export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <HeroSection />
      <FeaturedMenu />
      <AboutSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </div>
  );
}