import Head from 'next/head';
import Link from 'next/link';

export default function Nosotros() {
  return (
    <>
      <Head>
        <title>Nosotros — LFSRSoft</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Inter', system-ui, sans-serif; background: #f1f5f9; color: #0f172a; }
          button { font-family: inherit; cursor: pointer; }
          a { text-decoration: none; color: inherit; }
        `}</style>
      </Head>

      {/* NAV */}
      <nav style={{ background: '#0f172a', height: '64px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', position: 'sticky', top: 0, zIndex: 1000,
        boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
        <Link href="/">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <img src="/images/ui/logo.png" alt="LFSRSoft"
              style={{ height: '32px' }} onError={e => e.target.style.display = 'none'} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f8fafc', letterSpacing: '-0.3px' }}>LFSRSoft</div>
              <div style={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Licencias Digitales</div>
            </div>
          </div>
        </Link>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {[
            { label: 'Inicio', href: '/' },
            { label: 'Catalogo', href: '/catalogo' },
            { label: 'Nosotros', href: '/nosotros' },
          ].map(item => (
            <Link key={item.href} href={item.href}>
              <div style={{ color: item.href === '/nosotros' ? '#60a5fa' : '#94a3b8',
                fontWeight: item.href === '/nosotros' ? 700 : 500,
                fontSize: '0.85rem', padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                background: item.href === '/nosotros' ? 'rgba(96,165,250,0.1)' : 'transparent',
                cursor: 'pointer', transition: 'all 0.15s' }}>
                {item.label}
              </div>
            </Link>
          ))}
          <Link href="/catalogo">
            <div style={{ background: '#1d4ed8', color: 'white', fontWeight: 700,
              fontSize: '0.85rem', padding: '0.45rem 1.1rem',
              borderRadius: '6px', cursor: 'pointer' }}>
              Ver Catalogo
            </div>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%)',
        padding: '5rem 2rem', textAlign: 'center', color: 'white' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(96,165,250,0.15)',
            border: '1px solid rgba(96,165,250,0.3)', borderRadius: '50px',
            padding: '0.3rem 1rem', fontSize: '0.8rem', color: '#93c5fd',
            fontWeight: 600, marginBottom: '1.5rem', letterSpacing: '0.5px',
            textTransform: 'uppercase' }}>
            Proyecto Final DevOps — Equipo LFSR8
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.5px',
            marginBottom: '1rem', lineHeight: 1.1 }}>
            Quienes somos
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.7,
            fontWeight: 400 }}>
            LFSRSoft es una tienda digital de licencias de software desarrollada como proyecto
            final del curso de DevOps con Kubernetes, Semestre 2026-2.
          </p>
        </div>
      </div>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '4rem 2rem' }}>

        {/* MISION Y VISION */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '4rem' }}>
          {[
            {
              icon: '◎',
              title: 'Nuestra Mision',
              color: '#1d4ed8',
              bg: '#eff6ff',
              texto: 'Democratizar el acceso a software profesional mediante una plataforma segura, moderna y transparente. Cada licencia generada utiliza cifrado AES-256 garantizando autenticidad y trazabilidad completa desde la compra hasta la activacion.',
            },
            {
              icon: '◈',
              title: 'Nuestra Vision',
              color: '#7c3aed',
              bg: '#f5f3ff',
              texto: 'Ser la referencia tecnica de como una aplicacion empresarial real debe desplegarse en Kubernetes: con alta disponibilidad, observabilidad completa, CI/CD automatizado y seguridad zero-trust en cada capa del stack.',
            },
          ].map(card => (
            <div key={card.title} style={{ background: card.bg, borderRadius: '16px',
              padding: '2rem', border: `1px solid ${card.color}22` }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem', color: card.color }}>{card.icon}</div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a',
                marginBottom: '0.75rem' }}>{card.title}</h2>
              <p style={{ color: '#475569', lineHeight: 1.7, fontSize: '0.9rem' }}>{card.texto}</p>
            </div>
          ))}
        </div>

        {/* STACK TECNOLOGICO */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem',
            color: '#0f172a' }}>Stack Tecnologico</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Cada componente fue seleccionado y configurado siguiendo las mejores practicas de la industria DevOps.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { cat: 'Infraestructura', items: ['Kubernetes 1.28', 'Rocky Linux 9.7', 'Ansible', 'Flannel CNI', 'NFS CSI Driver'], color: '#0369a1', bg: '#e0f2fe' },
              { cat: 'Backend', items: ['Go 1.24', 'Fiber v2', 'PostgreSQL 15', 'AES-256 GCM', 'UUID v4'], color: '#047857', bg: '#d1fae5' },
              { cat: 'Frontend', items: ['Next.js 14', 'React 18', 'Inter Font', 'CSS-in-JS', 'NodePort 30080'], color: '#7c3aed', bg: '#ede9fe' },
              { cat: 'Observabilidad', items: ['Prometheus', 'Grafana', 'Loki', 'Promtail', 'Node Exporter'], color: '#b45309', bg: '#fef3c7' },
              { cat: 'CI/CD', items: ['Tekton Pipelines', 'ArgoCD', 'GitOps', 'Kaniko', 'Docker Hub'], color: '#dc2626', bg: '#fee2e2' },
              { cat: 'Seguridad', items: ['RBAC', 'NetworkPolicy', 'Secrets K8s', 'Zero-Trust', 'ServiceAccount'], color: '#0e7490', bg: '#cffafe' },
            ].map(stack => (
              <div key={stack.cat} style={{ background: stack.bg, borderRadius: '12px',
                padding: '1.25rem', border: `1px solid ${stack.color}22` }}>
                <div style={{ fontWeight: 700, color: stack.color, fontSize: '0.8rem',
                  textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
                  {stack.cat}
                </div>
                {stack.items.map(item => (
                  <div key={item} style={{ fontSize: '0.82rem', color: '#1e293b',
                    padding: '0.2rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)',
                    display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: stack.color, fontSize: '0.6rem' }}>▸</span>
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* COMO FUNCIONA */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>
            Como funciona LFSRSoft
          </h2>
          <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.9rem' }}>
            El proceso de compra y generacion de licencias es completamente automatizado y seguro.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { num: '01', titulo: 'Explora el catalogo', desc: 'Navega entre 30 productos de software profesional organizados en 8 categorias. Filtra por tipo, busca por nombre o desarrollador y consulta el detalle de cada producto.' },
              { num: '02', titulo: 'Agrega al carrito', desc: 'Selecciona los productos que necesitas. El carrito guarda tu seleccion de forma persistente en tu sesion del navegador sin requerir registro ni cuenta.' },
              { num: '03', titulo: 'Realiza tu pedido', desc: 'Al hacer checkout el sistema genera automaticamente una licencia unica por cada producto. El proceso usa el algoritmo AES-256 GCM con una clave maestra almacenada en un Kubernetes Secret.' },
              { num: '04', titulo: 'Recibe tu clave', desc: 'Inmediatamente obtienes tu clave en formato LFSR-XXXX-XXXX-XXXX junto con su version cifrada. Cada clave es unica, irrepetible y queda registrada en la base de datos con log de auditoria.' },
            ].map((paso, i) => (
              <div key={paso.num} style={{ display: 'flex', gap: '1.5rem',
                background: 'white', borderRadius: '12px', padding: '1.5rem',
                border: '1px solid #e2e8f0', alignItems: 'flex-start' }}>
                <div style={{ background: '#1d4ed8', color: 'white', fontWeight: 900,
                  fontSize: '0.9rem', width: '44px', height: '44px', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0 }}>
                  {paso.num}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a',
                    marginBottom: '0.3rem' }}>{paso.titulo}</div>
                  <div style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6 }}>{paso.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EQUIPO */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>
            El Equipo
          </h2>
          <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Equipo LFSR8 — Ingenieria en Computacion, Semestre 2026-2
          </p>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem',
            border: '1px solid #e2e8f0', display: 'flex', gap: '1.5rem',
            alignItems: 'center' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0 }}>
              <span style={{ color: 'white', fontWeight: 900, fontSize: '1.5rem' }}>U</span>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
                Uriel Benjamin De La Merced Soriano
              </div>
              <div style={{ color: '#1d4ed8', fontWeight: 600, fontSize: '0.85rem',
                marginTop: '0.2rem' }}>
                Estudiante de Ingenieria en Computacion
              </div>
              <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.5rem',
                lineHeight: 1.6 }}>
                Desarrollo completo del proyecto: arquitectura Kubernetes con Ansible,
                backend Go con generacion de licencias AES-256, frontend Next.js,
                stack de observabilidad Prometheus + Grafana + Loki, y pipeline
                GitOps con Tekton + ArgoCD.
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem',
                flexWrap: 'wrap' }}>
                {['Kubernetes', 'Go', 'Next.js', 'Ansible', 'Prometheus', 'ArgoCD'].map(tag => (
                  <span key={tag} style={{ background: '#eff6ff', color: '#1d4ed8',
                    fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.5rem',
                    borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ARQUITECTURA */}
        <div style={{ background: '#0f172a', borderRadius: '16px', padding: '2rem',
          marginBottom: '4rem', color: 'white' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem',
            color: '#f8fafc' }}>
            Arquitectura del Cluster
          </h2>
          <pre style={{ fontFamily: "'Courier New', monospace", fontSize: '0.78rem',
            color: '#94a3b8', lineHeight: 1.8, overflowX: 'auto' }}>
{`  master01-proyecto (192.168.28.138)
  ├── etcd, kube-apiserver, kube-scheduler
  ├── NFS Server (/srv/nfs/k8s-storage)
  ├── Ansible (playbooks de instalacion)
  └── kubectl (punto de control)
  
  worker01-proyecto (192.168.28.139)
  ├── lfsr-backend (Go + Fiber)
  ├── lfsr-frontend (Next.js)
  ├── node-exporter, promtail
  └── kube-proxy, flannel
  
  worker02-proyecto (192.168.28.128)
  ├── postgres-0 (StatefulSet + PVC NFS)
  ├── prometheus, grafana, loki
  ├── argocd-server, tekton-pipelines
  └── kube-proxy, flannel`}
          </pre>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
          borderRadius: '16px', padding: '3rem 2rem', color: 'white' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.5rem' }}>
            Listo para explorar el catalogo?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            30 productos de software profesional con licencias generadas en tiempo real
          </p>
          <Link href="/catalogo">
            <div style={{ display: 'inline-block', background: 'white', color: '#1d4ed8',
              fontWeight: 800, fontSize: '0.95rem', padding: '0.75rem 2rem',
              borderRadius: '8px', cursor: 'pointer' }}>
              Ver Catalogo de Productos
            </div>
          </Link>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ background: '#0f172a', color: '#64748b', padding: '2rem',
        textAlign: 'center', marginTop: '2rem' }}>
        <div style={{ fontSize: '0.8rem' }}>
          2026 LFSRSoft — Equipo LFSR8 — Ingenieria en Computacion 2026-2
        </div>
        <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: '#334155' }}>
          Powered by Kubernetes 1.28 · Go · Next.js · Prometheus · ArgoCD
        </div>
      </footer>
    </>
  );
}
