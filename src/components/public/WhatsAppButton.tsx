'use client';

import { usePathname } from 'next/navigation';

export default function WhatsAppButton() {
  const pathname = usePathname();

  // Don't show inside admin or professional panels to avoid UI overlap
  if (pathname.startsWith('/admin') || pathname.startsWith('/profesional')) {
    return null;
  }

  return (
    <a
      href="https://wa.me/5491123456789?text=Hola%2C%20quisiera%20consultar%20por%20un%20tratamiento%20en%20MOON%20Golden%20Beauty"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '20px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: '#25D366',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 6px 20px rgba(37, 211, 102, 0.45)',
        zIndex: 999,
        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1) translateY(0)')}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.974.532 1.875.82 2.796.82h.005c3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.766-5.773-5.766zm6.816 8.441c-.244.688-1.22 1.26-1.698 1.34-.452.076-1.025.137-3.031-.692-2.404-.993-3.929-3.468-4.048-3.628-.119-.16-1.002-1.332-1.002-2.541 0-1.209.633-1.802.859-2.048.225-.246.491-.308.655-.308.164 0 .328.002.471.01.152.008.355-.058.556.425.207.498.707 1.724.768 1.849.062.124.103.271.02.435-.082.164-.123.266-.245.41-.123.143-.258.321-.369.43-.123.123-.252.257-.109.503.143.246.637 1.05 1.368 1.701.94.838 1.733 1.097 1.979 1.22.246.123.389.103.533-.062.143-.164.615-.717.779-.963.164-.246.328-.205.553-.123.225.082 1.433.676 1.679.799.246.123.41.184.471.287.061.103.061.594-.183 1.282z"/>
      </svg>
    </a>
  );
}
