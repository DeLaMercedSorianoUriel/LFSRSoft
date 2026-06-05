import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [sesion] = useState(() => {
    if (typeof window !== 'undefined') {
      let s = localStorage.getItem('sesion_id');
      if (!s) { s = 'sesion_' + Math.random().toString(36).substr(2,9); localStorage.setItem('sesion_id', s); }
      return s;
    }
    return 'sesion_default';
  });

  useEffect(() => {
    fetch(`${BACKEND_URL}/licencias`)
      .then(r => r.json())
      .then(d => setProductos((d || []).slice(0, 6)))
      .catch(() => {});
    fetch(`${BACKEND_URL}/carrito/${sesion}`)
      .then(r => r.json())
      .then(d => setCarrito(d || []))
      .catch(() => {});
  }, []);

  const getCatImg = (cat) => {
    const map = { 'Sistemas Operativos': 'so', 'Diseno y 3D': 'diseno', 'Diseño y 3D': 'diseno',
      'Desarrollo': 'devops', 'Desarrollo y DevOps': 'devops', 'Videojuegos': 'videojuegos',
      'Videojuegos y Motores': 'videojuegos', 'Datos e IA': 'datos', 'Análisis de Datos e IA': 'datos',
      'Nube': 'nube', 'Infraestructura y Nube': 'nube', 'Seguridad': 'seguridad',
      'Ciberseguridad': 'seguridad', 'Ofimatica': 'ofimatica', 'Automatización y Ofimática': 'ofimatica' };
    return map[cat] || 'devops';
  };

  const categorias = [
    { nombre: 'Sistemas Operativos', img: 'so', color: '#1d4ed8' },
    { nombre: 'Diseño y 3D', img: 'diseno', color: '#7c3aed' },
    { nombre: 'Desarrollo y DevOps', img: 'devops', color: '#047857' },
    { nombre: 'Videojuegos', img: 'videojuegos', color: '#d97706' },
    { nombre: 'Datos e IA', img: 'datos', color: '#dc2626' },
    { nombre: 'Infraestructura y Nube', img: 'nube', color: '#0891b2' },
    { nombre: 'Ciberseguridad', img: 'seguridad', color: '#374151' },
    { nombre: 'Ofimática', img: 'ofimatica', color: '#6d28d9' },
  ];

  const features = [
    { icon: '⚡', titulo: 'Entrega Inmediata', desc: 'Tu licencia se genera en segundos con cifrado AES-256' },
    { icon: '🔒', titulo: 'Cifrado AES-256', desc: 'Cada clave es única, generada con UUID v4 y cifrado militar' },
    { icon: '☁️', titulo: 'Kubernetes Cloud', desc: 'Infraestructura desplegada en cluster de 3 nodos con alta disponibilidad' },
    { icon: '📊', titulo: 'Monitoreo 24/7', desc: 'Prometheus + Grafana monitoreando cada componente en tiempo real' },
  ];

  return (
    <>
      <Head>
        <title>LFSRSoft — Software Profesional y Licencias Digitales</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Inter', system-ui, sans-serif; background: #f8fafc; color: #0f172a; }
          a { text-decoration: none; color: inherit; }
          button { font-family: inherit; cursor: pointer; }
          .cat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.12); }
          .cat-card { transition: all 0.2s ease; }
          .prod-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
          .prod-card { transition: all 0.2s ease; }
          .nav-link:hover { color: #f8fafc !important; background: rgba(255,255,255,0.1) !important; }
          .nav-link { transition: all 0.15s; }
        `}</style>
      </Head>

      {/* NAVBAR */}
      <nav style={{ background: '#0f172a', height: '64px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem',
        position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>

        <Link href="/">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <img src="/images/ui/logo.png" alt="LFSRSoft"
              style={{ height: '34px' }} onError={e => e.target.style.display = 'none'} />
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#f8fafc', letterSpacing: '-0.3px' }}>LFSRSoft</div>
              <div style={{ fontSize: '0.58rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Licencias Digitales</div>
            </div>
          </div>
        </Link>

        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          {[{ label: 'Inicio', href: '/' }, { label: 'Catalogo', href: '/catalogo' }, { label: 'Nosotros', href: '/nosotros' }].map(item => (
            <Link key={item.href} href={item.href}>
              <div className="nav-link" style={{
                color: item.href === '/' ? '#60a5fa' : '#94a3b8',
                fontWeight: item.href === '/' ? 700 : 500,
                fontSize: '0.85rem', padding: '0.4rem 0.85rem', borderRadius: '6px',
                background: item.href === '/' ? 'rgba(96,165,250,0.1)' : 'transparent',
                cursor: 'pointer' }}>
                {item.label}
              </div>
            </Link>
          ))}
          <Link href="/catalogo">
            <div style={{ background: '#1d4ed8', color: 'white', fontWeight: 700,
              fontSize: '0.85rem', padding: '0.45rem 1.1rem', borderRadius: '6px',
              marginLeft: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              🛒 Carrito
              {carrito.length > 0 && (
                <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%',
                  width: '18px', height: '18px', fontSize: '0.7rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {carrito.length}
                </span>
              )}
            </div>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ position: 'relative', overflow: 'hidden', minHeight: '520px',
        display: 'flex', alignItems: 'center' }}>
        <img src="/images/ui/banner.jpg" alt="Banner"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center' }}
          onError={e => { e.target.style.display = 'none'; }} />
        <div style={{ position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(15,23,42,0.95) 40%, rgba(15,23,42,0.6) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '4rem 2rem', maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'rgba(29,78,216,0.25)', border: '1px solid rgba(96,165,250,0.4)',
            borderRadius: '50px', padding: '0.3rem 0.9rem', fontSize: '0.75rem',
            color: '#93c5fd', fontWeight: 600, marginBottom: '1.25rem',
            textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <span>⚡</span> Generacion instantanea con AES-256
          </div>
          <h1 style={{ fontSize: '3.25rem', fontWeight: 900, color: '#f8fafc',
            lineHeight: 1.05, letterSpacing: '-0.5px', marginBottom: '1rem' }}>
            Software Profesional<br />
            <span style={{ background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              y Licencias Digitales
            </span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.65,
            marginBottom: '2rem', fontWeight: 400 }}>
            30 productos de software profesional con licencias generadas en tiempo real
            mediante cifrado AES-256 sobre infraestructura Kubernetes.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/catalogo">
              <div style={{ background: '#1d4ed8', color: 'white', fontWeight: 700,
                fontSize: '0.95rem', padding: '0.75rem 1.75rem', borderRadius: '8px',
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                Ver Catalogo →
              </div>
            </Link>
            <Link href="/nosotros">
              <div style={{ background: 'rgba(255,255,255,0.08)', color: '#e2e8f0',
                fontWeight: 600, fontSize: '0.95rem', padding: '0.75rem 1.75rem',
                borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)',
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                Conoce el proyecto
              </div>
            </Link>
          </div>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            {[['30', 'Productos'], ['8', 'Categorias'], ['AES-256', 'Cifrado'], ['K8s', 'Infraestructura']].map(([val, lab]) => (
              <div key={lab}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f8fafc' }}>{val}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{lab}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ background: '#0f172a', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {features.map(f => (
            <div key={f.titulo} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '1.5rem', flexShrink: 0, marginTop: '2px' }}>{f.icon}</div>
              <div>
                <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem',
                  marginBottom: '0.25rem' }}>{f.titulo}</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem' }}>

        {/* CATEGORIAS */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Explorar por Categoria</h2>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>8 categorias de software profesional</p>
            </div>
            <Link href="/catalogo">
              <div style={{ color: '#1d4ed8', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                Ver todo →
              </div>
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {categorias.map(cat => (
              <Link key={cat.nombre} href={`/catalogo?categoria=${encodeURIComponent(cat.nombre)}`}>
                <div className="cat-card" style={{ borderRadius: '12px', overflow: 'hidden',
                  cursor: 'pointer', position: 'relative', height: '120px',
                  border: '1px solid #e2e8f0' }}>
                  <img src={`/images/categorias/${cat.img}.jpg`} alt={cat.nombre}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.style.display = 'none'; }} />
                  <div style={{ position: 'absolute', inset: 0,
                    background: `linear-gradient(135deg, ${cat.color}dd, ${cat.color}88)` }} />
                  <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem',
                    color: 'white', fontWeight: 700, fontSize: '0.85rem',
                    textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                    {cat.nombre}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* PRODUCTOS DESTACADOS */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Productos Destacados</h2>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>Los mas populares de nuestro catalogo</p>
            </div>
            <Link href="/catalogo">
              <div style={{ color: '#1d4ed8', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                Ver catalogo completo →
              </div>
            </Link>
          </div>

          {productos.length === 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ background: '#e2e8f0', borderRadius: '12px', height: '280px',
                  animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {productos.map(p => (
                <div key={p.id} className="prod-card" style={{ background: 'white', borderRadius: '12px',
                  border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <div style={{ height: '140px', position: 'relative', background: '#f1f5f9' }}>
                    <img src={`/images/productos/${p.id}.jpg`} alt={p.producto}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => {
                        e.target.style.display = 'none';
                        e.target.parentNode.style.background = '#1d4ed8';
                        e.target.parentNode.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:white;font-size:2.5rem;font-weight:900">${p.producto[0]}</div>`;
                      }} />
                  </div>
                  <div style={{ padding: '0.875rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a',
                      marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap' }}>{p.producto}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.5rem' }}>{p.desarrollador}</div>
                    <div style={{ fontWeight: 800, color: '#1d4ed8', fontSize: '1rem', marginBottom: '0.75rem' }}>
                      ${(p.precio * 17.5).toLocaleString('es-MX', { minimumFractionDigits: 0 })} MXN
                    </div>
                    <Link href="/catalogo">
                      <div style={{ background: '#1d4ed8', color: 'white', fontWeight: 600,
                        fontSize: '0.75rem', padding: '0.45rem', borderRadius: '6px',
                        textAlign: 'center', cursor: 'pointer' }}>
                        Ver en Catalogo
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COMO FUNCIONA */}
        <div style={{ background: '#0f172a', borderRadius: '20px', padding: '3rem 2rem',
          marginBottom: '3.5rem', color: 'white' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', textAlign: 'center' }}>
            Como funciona
          </h2>
          <p style={{ color: '#64748b', textAlign: 'center', fontSize: '0.85rem', marginBottom: '2.5rem' }}>
            Compra y recibe tu licencia en menos de 60 segundos
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {[
              { num: '1', titulo: 'Explora el catalogo', desc: 'Navega entre 30 productos organizados en 8 categorias. Filtra por tipo o busca por nombre.', color: '#3b82f6' },
              { num: '2', titulo: 'Agrega al carrito', desc: 'Selecciona los productos que necesitas. El carrito persiste en tu sesion sin registro.', color: '#8b5cf6' },
              { num: '3', titulo: 'Genera tu licencia', desc: 'Al hacer checkout el sistema genera tu clave unica con UUID v4 y cifrado AES-256 GCM.', color: '#06b6d4' },
              { num: '4', titulo: 'Recibe tu clave', desc: 'Obtiens inmediatamente tu clave LFSR-XXXX-XXXX-XXXX con log de auditoria completo.', color: '#10b981' },
            ].map(paso => (
              <div key={paso.num} style={{ textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px',
                  background: paso.color, margin: '0 auto 1rem', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontWeight: 900,
                  fontSize: '1.25rem', color: 'white' }}>
                  {paso.num}
                </div>
                <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem',
                  marginBottom: '0.4rem' }}>{paso.titulo}</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.6 }}>{paso.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link href="/catalogo">
              <div style={{ display: 'inline-block', background: '#1d4ed8', color: 'white',
                fontWeight: 700, fontSize: '0.9rem', padding: '0.75rem 2rem',
                borderRadius: '8px', cursor: 'pointer' }}>
                Empezar ahora →
              </div>
            </Link>
          </div>
        </div>

        {/* TECH BADGE */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem',
          border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a',
            marginBottom: '1rem', textAlign: 'center' }}>
            Powered by — Proyecto Final DevOps Kubernetes 2026-2
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {['Kubernetes 1.28', 'Go + Fiber', 'Next.js 14', 'PostgreSQL', 'Prometheus', 'Grafana', 'Loki', 'ArgoCD', 'Tekton', 'Ansible', 'AES-256', 'NFS CSI'].map(tag => (
              <span key={tag} style={{ background: '#f1f5f9', color: '#475569',
                fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.7rem',
                borderRadius: '50px', border: '1px solid #e2e8f0' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer style={{ background: '#0f172a', color: '#64748b', padding: '2rem',
        textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem',
          marginBottom: '1rem', flexWrap: 'wrap' }}>
          {[{ label: 'Inicio', href: '/' }, { label: 'Catalogo', href: '/catalogo' },
            { label: 'Nosotros', href: '/nosotros' }].map(item => (
            <Link key={item.href} href={item.href}>
              <span style={{ color: '#64748b', fontSize: '0.85rem', cursor: 'pointer',
                fontWeight: 500 }}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
        <div style={{ fontSize: '0.8rem' }}>
          2026 LFSRSoft — Uriel Benjamin De La Merced Soriano — Equipo LFSR8
        </div>
        <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: '#1e293b' }}>
          Kubernetes · Go · Next.js · Prometheus · ArgoCD · AES-256
        </div>
      </footer>
    </>
  );
}
