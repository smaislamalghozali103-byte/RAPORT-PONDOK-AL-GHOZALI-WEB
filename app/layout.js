import "./globals.css";

export const metadata = {
  title: "Raport Pondok Modern Al-Ghozali",
  description: "Aplikasi raport web Pondok Modern Al-Ghozali"
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
