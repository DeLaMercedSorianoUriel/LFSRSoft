import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.28.138:30081';

const CATEGORIAS = [
  { label: 'Todo', value: 'Todas' },
  { label: 'Sistemas Operativos', value: 'Sistemas Operativos' },
  { label: 'Diseno y 3D', value: 'Diseno Grafico y 3D' },
  { label: 'Desarrollo', value: 'Desarrollo y DevOps' },
  { label: 'Videojuegos', value: 'Videojuegos y Motores' },
  { label: 'Datos e IA', value: 'Analisis de Datos e IA' },
  { label: 'Nube', value: 'Infraestructura y Nube' },
  { label: 'Seguridad', value: 'Ciberseguridad' },
  { label: 'Ofimatica', value: 'Automatizacion y Ofimatica' },
];

const COLORES = {
  'Sistemas Operativos':        '#0369a1',
  'Diseno Grafico y 3D':        '#7c3aed',
  'Desarrollo y DevOps':        '#047857',
  'Videojuegos y Motores':      '#b45309',
  'Analisis de Datos e IA':     '#b91c1c',
  'Infraestructura y Nube':     '#0e7490',
  'Ciberseguridad':             '#991b1b',
  'Automatizacion y Ofimatica': '#4338ca',
};

const CAT_KEY = {
  'Sistemas Operativos':        'so',
  'Diseno Grafico y 3D':        'diseno',
  'Desarrollo y DevOps':        'devops',
  'Videojuegos y Motores':      'videojuegos',
  'Analisis de Datos e IA':     'datos',
  'Infraestructura y Nube':     'nube',
  'Ciberseguridad':             'seguridad',
  'Automatizacion y Ofimatica': 'ofimatica',
};

function getSesion() {
  if (typeof window === 'undefined') return '';
  let s = localStorage.getItem('lfsr_sesion');
  if (!s) {
    s = 'ses-' + Math.random().toString(36).substr(2, 12);
    localStorage.setItem('lfsr_sesion', s);
  }
  return s;
}

function ProductoImg({ id, categoria, producto }) {
  const [fallback, setFallback] = useState(0);
  const srcs = [
    `/images/productos/${id}.jpg`,
    `/images/productos/${id}.png`,
    `/images/categorias/${CAT_KEY[categoria]}.jpg`,
  ];
  const src = srcs[fallback];

  if (!src) {
    return (
      <div style={{ width: '100%', height: '180px',
        background: COLORES[categoria] || '#1e40af',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '8px 8px 0 0' }}>
        <span style={{ color: 'white', fontSize: '3rem', fontWeight: 900, opacity: 0.6 }}>
          {producto.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '180px',
      background: COLORES[categoria] || '#1e40af',
      borderRadius: '8px 8px 0 0', overflow: 'hidden', position: 'relative' }}>
      <img src={src} alt={producto}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={() => setFallback(f => f + 1)} />
      <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem',
        background: COLORES[categoria] || '#1e40af',
        color: 'white', fontSize: '0.65rem', fontWeight: 700,
        padding: '0.2rem 0.5rem', borderRadius: '4px', letterSpacing: '0.5px' }}>
        {categoria}
      </div>
    </div>
  );
}

export default function Catalogo() {
  const [productos, setProductos]     = useState([]);
  const [categoria, setCategoria]     = useState('Todas');
  const [busqueda, setBusqueda]       = useState('');
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [carrito, setCarrito]         = useState({ items: [], total: 0 });
  const [carritoOpen, setCarritoOpen] = useState(false);
  const [pedidosOpen, setPedidosOpen] = useState(false);
  const [pedidos, setPedidos]         = useState([]);
  const [modal, setModal]             = useState(null);
  const [checkout, setCheckout]       = useState(null);
  const [procesando, setProcesando]   = useState(false);
  const [notif, setNotif]             = useState(null);
  const [sesion, setSesion]           = useState('');

  useEffect(() => { setSesion(getSesion()); }, []);

  useEffect(() => {
    if (!sesion) return;
    fetch(`${BACKEND}/licencias`)
      .then(r => r.json())
      .then(data => { setProductos(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setError('No se pudo conectar al servidor'); setLoading(false); });
    cargarCarrito();
  }, [sesion]);

  const cargarCarrito = useCallback(async () => {
    if (!sesion) return;
    try {
      const r = await fetch(`${BACKEND}/carrito/${sesion}`);
      const data = await r.json();
      setCarrito(data);
    } catch {}
  }, [sesion]);

  const toast = (msg, tipo = 'ok') => {
    setNotif({ msg, tipo });
    setTimeout(() => setNotif(null), 3000);
  };

  const agregar = async (p) => {
    try {
      const r = await fetch(`${BACKEND}/carrito/agregar`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sesion_id: sesion, licencia_id: p.id })
      });
      const data = await r.json();
      toast(data.mensaje || 'Agregado al carrito');
      cargarCarrito();
    } catch { toast('Error al agregar', 'error'); }
  };

  const eliminar = async (itemId) => {
    await fetch(`${BACKEND}/carrito/${sesion}/item/${itemId}`, { method: 'DELETE' });
    cargarCarrito();
  };

  const checkout_ = async () => {
    setProcesando(true);
    try {
      const r = await fetch(`${BACKEND}/pedidos/checkout`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sesion_id: sesion })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setCheckout(data);
      setCarritoOpen(false);
      cargarCarrito();
      setProductos(prev => prev.map(p =>
        data.items?.some(i => i.licencia_id === p.id)
          ? { ...p, stock: Math.max(0, (p.stock || 1) - 1) }
          : p
      ));
    } catch (e) { toast(e.message || 'Error en checkout', 'error'); }
    finally { setProcesando(false); }
  };

  const verPedidos = async () => {
    try {
      const r = await fetch(`${BACKEND}/pedidos/${sesion}`);
      const data = await r.json();
      setPedidos(Array.isArray(data) ? data : []);
      setPedidosOpen(true);
    } catch {}
  };

  const catalogo = productos.filter(p => {
    const enCat  = categoria === 'Todas' || p.categoria === categoria;
    const enBusq = !busqueda ||
      p.producto.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.desarrollador.toLowerCase().includes(busqueda.toLowerCase());
    return enCat && enBusq;
  });

  const totalItems = carrito.items?.length || 0;

  return (
    <>
      <Head>
        <title>Catalogo — LFSRSoft</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Inter', system-ui, sans-serif; background: #f1f5f9; color: #0f172a; }
          button { font-family: inherit; cursor: pointer; }
          input  { font-family: inherit; }
          a { text-decoration: none; color: inherit; }
        `}</style>
      </Head>

      {/* NOTIFICACION */}
      {notif && (
        <div style={{ position: 'fixed', top: '72px', right: '1rem', zIndex: 9999,
          background: notif.tipo === 'error' ? '#dc2626' : '#16a34a',
          color: 'white', padding: '0.6rem 1.25rem', borderRadius: '6px',
          fontWeight: 600, fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          {notif.msg}
        </div>
      )}

      {/* NAV */}
      <nav style={{ background: '#0f172a', height: '64px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', position: 'sticky', top: 0, zIndex: 1000,
        boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>

        {/* LOGO */}
        <Link href="/">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <img src="/images/ui/logo.png" alt="LFSRSoft"
              style={{ height: '32px' }} onError={e => e.target.style.display = 'none'} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f8fafc',
                letterSpacing: '-0.3px' }}>LFSRSoft</div>
              <div style={{ fontSize: '0.6rem', color: '#64748b',
                textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Licencias Digitales
              </div>
            </div>
          </div>
        </Link>

        {/* BUSCADOR */}
        <div style={{ flex: 1, maxWidth: '340px', margin: '0 1.5rem' }}>
          <input type="text" placeholder="Buscar software o desarrollador..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)}
            style={{ width: '100%', padding: '0.45rem 0.9rem', borderRadius: '6px',
              border: '1px solid #334155', background: '#1e293b',
              color: '#f8fafc', fontSize: '0.85rem', outline: 'none' }} />
        </div>

        {/* LINKS NAV + BOTONES */}
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <Link href="/">
            <div style={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.82rem',
              padding: '0.35rem 0.75rem', borderRadius: '6px', cursor: 'pointer' }}>
              Inicio
            </div>
          </Link>
          <Link href="/catalogo">
            <div style={{ color: '#60a5fa', fontWeight: 700, fontSize: '0.82rem',
              padding: '0.35rem 0.75rem', borderRadius: '6px', cursor: 'pointer',
              background: 'rgba(96,165,250,0.1)' }}>
              Catalogo
            </div>
          </Link>
          <Link href="/nosotros">
            <div style={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.82rem',
              padding: '0.35rem 0.75rem', borderRadius: '6px', cursor: 'pointer' }}>
              Nosotros
            </div>
          </Link>

          <div style={{ width: '1px', height: '24px', background: '#334155', margin: '0 0.25rem' }} />

          <button onClick={verPedidos}
            style={{ background: 'transparent', border: '1px solid #334155',
              color: '#94a3b8', padding: '0.4rem 0.85rem', borderRadius: '6px',
              fontSize: '0.8rem', fontWeight: 500 }}>
            Mis Pedidos
          </button>
          <button onClick={() => setCarritoOpen(true)}
            style={{ background: '#1d4ed8', border: 'none', color: 'white',
              padding: '0.45rem 1.1rem', borderRadius: '6px', fontWeight: 700,
              fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Carrito
            {totalItems > 0 && (
              <span style={{ background: '#f97316', borderRadius: '50%',
                width: '18px', height: '18px', fontSize: '0.65rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800 }}>
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ position: 'relative', height: '220px', overflow: 'hidden',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%)' }}>
        <img src="/images/ui/banner.jpg" alt="Banner"
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2 }}
          onError={e => e.target.style.display = 'none'} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', color: 'white', padding: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.5px',
            marginBottom: '0.5rem' }}>
            Catalogo de Software
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1rem' }}>
            Licencias autenticas generadas en tiempo real con cifrado AES-256
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.78rem',
            color: '#7dd3fc', fontWeight: 500 }}>
            <span>⚡ Entrega inmediata</span>
            <span>🔒 Cifrado AES-256</span>
            <span>📦 {productos.length} productos disponibles</span>
          </div>
        </div>
      </div>

      {/* BARRA DE CATEGORIAS */}
      <div style={{ background: '#1e293b', padding: '0.6rem 2rem',
        display: 'flex', gap: '0.4rem', overflowX: 'auto',
        borderBottom: '1px solid #334155' }}>
        {CATEGORIAS.map(cat => (
          <button key={cat.value} onClick={() => setCategoria(cat.value)}
            style={{ padding: '0.35rem 0.9rem', borderRadius: '4px', border: 'none',
              whiteSpace: 'nowrap', fontWeight: 600, fontSize: '0.78rem',
              letterSpacing: '0.2px', transition: 'all 0.15s',
              background: categoria === cat.value ? '#1d4ed8' : 'transparent',
              color: categoria === cat.value ? 'white' : '#94a3b8' }}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 2rem' }}>
        {loading && (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '4rem',
            fontSize: '0.9rem' }}>Cargando catalogo...</p>
        )}
        {error && (
          <p style={{ textAlign: 'center', color: '#dc2626', padding: '4rem',
            fontSize: '0.9rem' }}>{error}</p>
        )}

        {!loading && !error && (
          <>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '1.25rem',
              fontWeight: 500 }}>
              {catalogo.length} producto{catalogo.length !== 1 ? 's' : ''} encontrado{catalogo.length !== 1 ? 's' : ''}
              {categoria !== 'Todas' && ` en ${categoria}`}
            </p>

            <div style={{ display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1rem' }}>
              {catalogo.map(p => (
                <div key={p.id}
                  style={{ background: 'white', borderRadius: '8px',
                    border: '1px solid #e2e8f0', overflow: 'hidden',
                    cursor: 'pointer', transition: 'box-shadow 0.2s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.06)'}
                  onClick={() => setModal(p)}>

                  <ProductoImg id={p.id} categoria={p.categoria} producto={p.producto} />

                  <div style={{ padding: '0.9rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem',
                      color: '#0f172a', lineHeight: '1.3', marginBottom: '0.2rem' }}>
                      {p.producto}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem',
                      fontWeight: 500, marginBottom: '0.6rem' }}>
                      {p.desarrollador}
                    </div>

                    <div style={{ marginBottom: '0.5rem' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800,
                        color: '#1d4ed8', letterSpacing: '-0.3px' }}>
                        ${Number(p.precio_mxn || 0).toLocaleString('es-MX')}
                        <span style={{ fontSize: '0.7rem', fontWeight: 500,
                          color: '#94a3b8', marginLeft: '3px' }}>MXN</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        USD ${Number(p.precio || 0).toFixed(2)}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.68rem', color: '#64748b',
                      background: '#f8fafc', padding: '0.2rem 0.4rem',
                      borderRadius: '3px', marginBottom: '0.6rem', fontWeight: 500 }}>
                      {p.tipo_licencia}
                    </div>

                    <button
                      onClick={e => { e.stopPropagation(); agregar(p); }}
                      style={{ width: '100%', background: '#1d4ed8', color: 'white',
                        border: 'none', borderRadius: '5px', padding: '0.5rem',
                        fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.2px' }}>
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{ background: '#0f172a', color: '#64748b',
        padding: '2rem', marginTop: '3rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '2rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1rem',
              marginBottom: '0.4rem' }}>LFSRSoft</div>
            <div style={{ fontSize: '0.8rem', lineHeight: '1.6' }}>
              Tienda de software y licencias digitales. Generacion de claves en tiempo real con cifrado AES-256.
            </div>
          </div>
          <div>
            <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.85rem',
              marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Categorias
            </div>
            {CATEGORIAS.filter(c => c.value !== 'Todas').map(c => (
              <div key={c.value}
                style={{ fontSize: '0.8rem', marginBottom: '0.2rem', cursor: 'pointer' }}
                onClick={() => { setCategoria(c.value); window.scrollTo(0, 0); }}
                onMouseEnter={e => e.target.style.color = '#7dd3fc'}
                onMouseLeave={e => e.target.style.color = '#64748b'}>
                {c.label}
              </div>
            ))}
          </div>
          <div>
            <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.85rem',
              marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Navegacion
            </div>
            <Link href="/"><div style={{ fontSize: '0.8rem', marginBottom: '0.2rem', cursor: 'pointer' }}>Inicio</div></Link>
            <Link href="/catalogo"><div style={{ fontSize: '0.8rem', marginBottom: '0.2rem', cursor: 'pointer' }}>Catalogo</div></Link>
            <Link href="/nosotros"><div style={{ fontSize: '0.8rem', marginBottom: '0.2rem', cursor: 'pointer' }}>Nosotros</div></Link>
          </div>
          <div>
            <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.85rem',
              marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Informacion
            </div>
            <div style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>Entrega inmediata</div>
            <div style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>Licencias autenticas</div>
            <div style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>Cifrado AES-256</div>
            <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#3b82f6' }}>
              Powered by Kubernetes
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1rem',
          fontSize: '0.75rem', textAlign: 'center' }}>
          2026 LFSRSoft — Uriel Benjamin De La Merced Soriano — Equipo LFSR8
        </div>
      </footer>

      {/* MODAL PRODUCTO */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          zIndex: 2000, display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: '1rem' }}
          onClick={() => setModal(null)}>
          <div style={{ background: 'white', borderRadius: '10px',
            maxWidth: '480px', width: '100%', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}>
            <ProductoImg id={modal.id} categoria={modal.categoria} producto={modal.producto} />
            <div style={{ padding: '1.25rem' }}>
              <div style={{ fontWeight: 800, fontSize: '1.25rem',
                color: '#0f172a', marginBottom: '0.2rem', letterSpacing: '-0.3px' }}>
                {modal.producto}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.85rem',
                fontWeight: 500, marginBottom: '0.75rem' }}>
                {modal.desarrollador}
              </div>
              <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '0.85rem',
                marginBottom: '0.75rem' }}>
                {modal.descripcion}
              </p>
              <div style={{ background: '#f8fafc', borderRadius: '6px',
                padding: '0.6rem 0.75rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.15rem' }}>
                  Tipo de licencia
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  {modal.tipo_licencia}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900,
                    color: '#1d4ed8', letterSpacing: '-0.5px' }}>
                    ${Number(modal.precio_mxn || 0).toLocaleString('es-MX')}
                    <span style={{ fontSize: '0.75rem', fontWeight: 500,
                      color: '#94a3b8', marginLeft: '4px' }}>MXN</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    USD ${Number(modal.precio || 0).toFixed(2)}
                  </div>
                </div>
                <span style={{ background: '#dcfce7', color: '#15803d',
                  padding: '0.25rem 0.6rem', borderRadius: '4px',
                  fontSize: '0.75rem', fontWeight: 700 }}>
                  Disponible
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button onClick={() => setModal(null)}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '6px',
                    border: '1px solid #e2e8f0', background: 'transparent',
                    color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>
                  Cerrar
                </button>
                <button onClick={() => { agregar(modal); setModal(null); }}
                  style={{ flex: 2, padding: '0.6rem', borderRadius: '6px',
                    border: 'none', background: '#1d4ed8', color: 'white',
                    fontWeight: 700, fontSize: '0.9rem' }}>
                  Agregar al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CARRITO LATERAL */}
      {carritoOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 3000 }} onClick={() => setCarritoOpen(false)}>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0,
            width: '400px', background: 'white',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.12)',
            display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}>

            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0',
              background: '#0f172a', color: 'white',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>Carrito</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {totalItems} producto{totalItems !== 1 ? 's' : ''}
                </div>
              </div>
              <button onClick={() => setCarritoOpen(false)}
                style={{ background: 'transparent', border: 'none',
                  color: '#94a3b8', fontSize: '1.4rem', lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
              {(!carrito.items || carrito.items.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.4 }}>[ ]</div>
                  <p style={{ fontSize: '0.85rem' }}>Tu carrito esta vacio</p>
                </div>
              ) : (
                carrito.items.map(item => (
                  <div key={item.id}
                    style={{ display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', padding: '0.75rem',
                      border: '1px solid #f1f5f9', borderRadius: '6px',
                      marginBottom: '0.6rem', background: '#fafafa' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem',
                        color: '#0f172a' }}>{item.producto}</div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem',
                        marginBottom: '0.2rem' }}>{item.desarrollador}</div>
                      <div style={{ color: '#1d4ed8', fontWeight: 700, fontSize: '0.85rem' }}>
                        ${Number(item.precio * 17.50).toLocaleString('es-MX')} MXN
                      </div>
                    </div>
                    <button onClick={() => eliminar(item.id)}
                      style={{ background: '#fee2e2', color: '#dc2626',
                        border: 'none', borderRadius: '4px',
                        padding: '0.3rem 0.5rem', fontSize: '0.75rem',
                        fontWeight: 700, marginLeft: '0.6rem' }}>
                      Quitar
                    </button>
                  </div>
                ))
              )}
            </div>

            {carrito.items?.length > 0 && (
              <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between',
                  marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 600, color: '#64748b', fontSize: '0.85rem' }}>Total</span>
                  <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#1d4ed8' }}>
                    ${Number(carrito.total * 17.50).toLocaleString('es-MX')} MXN
                  </span>
                </div>
                <button onClick={checkout_} disabled={procesando}
                  style={{ width: '100%', background: procesando ? '#94a3b8' : '#1d4ed8',
                    color: 'white', border: 'none', borderRadius: '6px',
                    padding: '0.75rem', fontWeight: 800, fontSize: '0.9rem' }}>
                  {procesando ? 'Procesando...' : 'Realizar pedido'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT EXITOSO */}
      {checkout && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 4000, display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '10px',
            maxWidth: '540px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ background: '#15803d', color: 'white',
              padding: '1.25rem 1.5rem', borderRadius: '10px 10px 0 0', textAlign: 'center' }}>
              <div style={{ fontWeight: 900, fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                Pedido completado
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>
                Pedido {checkout.pedido_num}
              </div>
            </div>
            <div style={{ padding: '1.25rem' }}>
              <p style={{ color: '#64748b', fontSize: '0.82rem',
                textAlign: 'center', marginBottom: '1rem' }}>
                Guarda tus claves. No se volvera a mostrar la misma clave.
              </p>
              {checkout.items?.map((item, i) => (
                <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '6px',
                  padding: '0.85rem', marginBottom: '0.6rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem',
                    marginBottom: '0.15rem' }}>{item.producto}</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem',
                    marginBottom: '0.5rem' }}>{item.desarrollador}</div>
                  <div style={{ background: '#eff6ff', borderRadius: '4px',
                    padding: '0.4rem 0.6rem', fontFamily: 'monospace',
                    fontWeight: 700, color: '#1d4ed8', fontSize: '0.95rem',
                    letterSpacing: '1px' }}>
                    {item.clave_generada}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8',
                    marginTop: '0.2rem', wordBreak: 'break-all' }}>
                    AES-256: {item.clave_cifrada?.substring(0, 32)}...
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between',
                padding: '0.6rem 0', borderTop: '1px solid #f1f5f9', marginTop: '0.4rem' }}>
                <span style={{ fontWeight: 600, color: '#64748b', fontSize: '0.85rem' }}>
                  Total pagado
                </span>
                <span style={{ fontWeight: 900, color: '#1d4ed8', fontSize: '1rem' }}>
                  ${Number(checkout.total * 17.50).toLocaleString('es-MX')} MXN
                </span>
              </div>
              <button onClick={() => setCheckout(null)}
                style={{ width: '100%', background: '#0f172a', color: 'white',
                  border: 'none', borderRadius: '6px', padding: '0.7rem',
                  fontWeight: 700, marginTop: '0.75rem', fontSize: '0.85rem' }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PANEL MIS PEDIDOS */}
      {pedidosOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 3000 }} onClick={() => setPedidosOpen(false)}>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0,
            width: '460px', background: 'white',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.12)',
            display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}>

            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0',
              background: '#0f172a', color: 'white',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>Mis Pedidos</div>
              <button onClick={() => setPedidosOpen(false)}
                style={{ background: 'transparent', border: 'none',
                  color: '#94a3b8', fontSize: '1.4rem' }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
              {pedidos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem',
                  color: '#94a3b8', fontSize: '0.85rem' }}>
                  No tienes pedidos aun
                </div>
              ) : (
                pedidos.map(p => (
                  <div key={p.id} style={{ border: '1px solid #e2e8f0', borderRadius: '6px',
                    marginBottom: '0.75rem', overflow: 'hidden' }}>
                    <div style={{ background: '#f8fafc', padding: '0.6rem 0.85rem',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>
                          Pedido {p.pedido_num}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                          {new Date(p.fecha_pedido).toLocaleDateString('es-MX',
                            { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: '#1d4ed8', fontSize: '0.9rem' }}>
                          ${Number(p.total * 17.50).toLocaleString('es-MX')} MXN
                        </div>
                        <span style={{ background: '#dcfce7', color: '#15803d',
                          padding: '0.1rem 0.4rem', borderRadius: '3px',
                          fontSize: '0.65rem', fontWeight: 700 }}>
                          {p.estado}
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: '0.6rem 0.85rem' }}>
                      {p.items?.map((item, i) => (
                        <div key={i} style={{ marginBottom: '0.4rem',
                          paddingBottom: i < p.items.length - 1 ? '0.4rem' : 0,
                          borderBottom: i < p.items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#0f172a' }}>
                            {item.producto}
                          </div>
                          <div style={{ fontFamily: 'monospace', fontSize: '0.78rem',
                            color: '#1d4ed8', background: '#eff6ff',
                            padding: '0.15rem 0.35rem', borderRadius: '3px',
                            marginTop: '0.15rem', display: 'inline-block' }}>
                            {item.clave_generada}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}