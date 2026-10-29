// if (import.meta.env.DEV) {
//   import("react-grab");
// }

import React from 'react'
import ReactDOM from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* One place decides what "reduced motion" means for the whole app:
        springs become short fades and the layout still settles, it just
        settles without travelling. */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </React.StrictMode>,
)
