import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Simulador de Forecast — V4 Company',
  description: 'Valide a viabilidade do modelo de negócio V4 para sua realidade.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
