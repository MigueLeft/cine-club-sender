"use client"

interface WhatsAppPreviewProps {
  message: string
  imagePreview?: string | null
}

export default function WhatsAppPreview({ message, imagePreview }: WhatsAppPreviewProps) {
  const currentTime = new Date().toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="bg-card rounded-2xl shadow-lg p-6 border border-border">
      <h2 className="text-lg font-bold mb-4 text-foreground flex items-center gap-2">
        <span>👁️</span> Vista Previa WhatsApp
      </h2>

      {/* WhatsApp-style background */}
      <div className="bg-[#e5ddd5] rounded-xl p-4 min-h-[200px] relative overflow-hidden">
        {/* WhatsApp pattern background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Message bubble */}
        <div className="relative flex justify-end">
          <div className="max-w-[85%] bg-[#dcf8c6] rounded-lg shadow-sm overflow-hidden">
            {imagePreview && (
              <div className="w-full">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full max-h-64 object-cover"
                />
              </div>
            )}

            <div className={imagePreview ? "px-3 pt-2 pb-2" : "px-3 py-2"}>
              {message ? (
                <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{message}</p>
              ) : !imagePreview ? (
                <p className="text-sm text-gray-400 italic">Tu mensaje aparecerá aquí...</p>
              ) : null}

              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-[10px] text-gray-500">{currentTime}</span>
                <svg viewBox="0 0 16 15" width="16" height="15" className="text-blue-500">
                  <path
                    fill="currentColor"
                    d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-center">Así verán tu mensaje los destinatarios</p>
    </div>
  )
}
