import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyApp",
  description: "Plataforma conectada con Odoo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <script
          // Set theme class before hydration (prevents flash).
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var m=localStorage.getItem('billnova.color_mode');if(m==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();",
          }}
        />
        {children}
      </body>
    </html>
  );
}
