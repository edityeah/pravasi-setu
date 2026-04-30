import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { setFavicon } from './utils/setFavicon'
import { BRAND_ASSETS } from './config/brandAssets'

// Runtime fallback: hosts/CDN proxies sometimes drop public/favicon.png from
// production builds. Pointing the icon at the hosted NSDC URL guarantees the
// browser tab shows the correct mark even if the local file is unavailable.
setFavicon(BRAND_ASSETS.favicon)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
