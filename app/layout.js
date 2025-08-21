export const metadata = {
  title: "Clear — To-Do",
  description: "Lightweight to-do app with optional cloud sync"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "ui-sans-serif, system-ui", background:"#0b0b0c", color:"#f4f4f5", margin:0 }}>
        <div style={{ maxWidth: 720, margin: "32px auto", padding: "0 16px" }}>
          <header style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:"#7c3aed" }} />
            <h1 style={{ margin:0, fontSize:24 }}>Clear</h1>
          </header>
          {children}
          <footer style={{ marginTop:40, opacity:0.7, fontSize:12 }}>
            © {new Date().getFullYear()} Clear
          </footer>
        </div>
      </body>
    </html>
  );
}
