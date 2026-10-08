import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'WellPath Ultimate — Wellness Companion',description:'Safety-first wellness education, condition explorer, daily planning and progress tracking.',manifest:'/manifest.webmanifest'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
