import './globals.css'

export const metadata = {
  title: 'Public.com - Stock Time Machine',
  description: 'Time travel to see what would have happened if you invested years ago',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
