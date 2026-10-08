import './globals.css';
import type { Metadata } from 'next';
export const metadata:Metadata={title:'WellPath — Wellness Guide',description:'Personalized general wellness guidance by selected health conditions.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
