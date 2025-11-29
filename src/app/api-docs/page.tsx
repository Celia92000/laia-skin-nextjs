'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/docs')
      .then(res => res.json())
      .then(data => {
        setSpec(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Erreur chargement spec:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la documentation...</p>
        </div>
      </div>
    )
  }

  if (!spec) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Erreur de chargement de la documentation API</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <style jsx global>{`
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info { margin-bottom: 30px; }
        .swagger-ui .info .title { color: #7c3aed; }
        .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #10b981; }
        .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #3b82f6; }
        .swagger-ui .opblock.opblock-put .opblock-summary-method { background: #f59e0b; }
        .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #ef4444; }
        .swagger-ui .btn.execute { background: #7c3aed; }
        .swagger-ui .btn.execute:hover { background: #6d28d9; }
      `}</style>
      <SwaggerUI spec={spec} />
    </div>
  )
}
