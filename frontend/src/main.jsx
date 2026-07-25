// จุดเริ่มต้น (Entry Point) ของแอปพลิเคชัน React
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './index.css'

// รหัส Client ID สำหรับระบบล็อกอินผ่าน Google
const GOOGLE_CLIENT_ID = '341141094308-u1slnvmbmuf8dgubvtfs3g2t0q4nvgjl.apps.googleusercontent.com'

// เรนเดอร์ (Render) แอปพลิเคชันเข้าไปในแท็กที่มี id="root"
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <BrowserRouter>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </BrowserRouter>
        </GoogleOAuthProvider>
    </React.StrictMode>,
)
