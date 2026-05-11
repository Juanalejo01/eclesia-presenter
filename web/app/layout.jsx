import './globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export const metadata = {
  title: 'EclesiaPresenter — Software de presentación para iglesias',
  description: 'La forma moderna de proyectar versículos, canciones y videos en tu iglesia. Sin red, sin latencia, capturable por OBS.',
  keywords: ['iglesia', 'presentación', 'biblia', 'cantos', 'proyección', 'OBS', 'streaming'],
  openGraph: {
    title: 'EclesiaPresenter',
    description: 'Software profesional para iglesias hispanohablantes',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
