// Aurora — a landing-page design prototype.
// Deep indigo night sky, ice-white text, a periwinkle accent on links.
// High-contrast serif display over a clean sans body. Left-aligned column.

const Aurora = () => (
  <div
    style={{
      background: "#0b1020",
      color: "#e6e8f0",
      fontFamily: "Inter, sans-serif",
      minHeight: "100vh",
      padding: "120px 96px",
      maxWidth: 820,
    }}
  >
    <h1
      style={{
        fontFamily: "'Playfair Display', serif",
        fontWeight: 500,
        fontSize: 88,
        lineHeight: 1.0,
        letterSpacing: "-0.02em",
        color: "#f4f6ff",
        margin: "0 0 2.5rem",
      }}
    >
      Aurora
    </h1>

    <p style={{ color: "#9aa3b2", fontSize: 18, lineHeight: 1.7, maxWidth: 560 }}>
      A calm place to write. Built for long-form thinking, not notifications.{" "}
      <a
        href="#"
        style={{
          color: "#e6e8f0",
          textDecoration: "none",
          borderBottom: "1px solid #7c9cff",
        }}
      >
        Read the manifesto
      </a>{" "}
      or browse the archive.
    </p>
  </div>
);

window.Aurora = Aurora;
