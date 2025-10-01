"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Loader, Smile, ImageIcon, X, Film } from "lucide-react"
import EmojiPicker from "@/components/emoji-picker"
import WhatsAppPreview from "@/components/whatsapp-preview"
import { fetchEmailOctopusContacts } from "./actions"

export default function CineClubSender() {
  // Configuración fija
  const config = {
    apiUrl: "http://localhost:8080",
    apiKey: "94fd843e9c33423136b47720ab6ca82458df822ad0490861fa7733bcb48cd6ef",
    instanceName: "nro_de_miguel",
  }

  const [message, setMessage] = useState("")
  const [phoneNumbers, setPhoneNumbers] = useState("584140551969\n5491112345678")
  const [sending, setSending] = useState(false)
  const [apiStatus, setApiStatus] = useState(null)
  const [instanceStatus, setInstanceStatus] = useState(null)
  const [contacts, setContacts] = useState([])
  const [loadingContacts, setLoadingContacts] = useState(false)
  const [showContactsModal, setShowContactsModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedContacts, setSelectedContacts] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0 })
  const [attachedImage, setAttachedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const logsEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)
  const emojiPickerRef = useRef(null)
  const emojiButtonRef = useRef(null)
  const modalContentRef = useRef(null)


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        window.innerWidth >= 768 && 
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showEmojiPicker])

  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/`, {
        headers: { apikey: config.apiKey },
      })
      setApiStatus(response.ok ? "connected" : "error")
    } catch (error) {
      setApiStatus("disconnected")
    }
  }

  const checkInstanceStatus = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/instance/connectionState/${config.instanceName}`, {
        headers: { apikey: config.apiKey },
      })
      const data = await response.json()
      setInstanceStatus(data.instance.state === "open" ? "connected" : "disconnected")
    } catch (error) {
      setInstanceStatus("error")
    }
  }

  useEffect(() => {
    checkApiStatus()
    checkInstanceStatus()
    const interval = setInterval(() => {
      checkApiStatus()
      checkInstanceStatus()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, { timestamp, message, type }])
  }

  const normalizePhoneNumber = (phone) => {
    if (!phone) return null

    const phoneStr = phone.toString().trim()

    // Lista de prefijos internacionales comunes
    const countryPrefixes = [
      "1", // USA, Canada
      "52", // México
      "51", // Peru
      "54", // Argentina
      "55", // Brasil
      "56", // Chile
      "57", // Colombia
      "58", // Venezuela
      "34", // España
      "44", // UK
      "33", // Francia
      "49", // Alemania
      "39", // Italia
      "351", // Portugal
      "591", // Bolivia
      "593", // Ecuador
      "595", // Paraguay
      "598", // Uruguay
      "506", // Costa Rica
      "507", // Panamá
      "503", // El Salvador
      "502", // Guatemala
      "504", // Honduras
      "505", // Nicaragua
      "1809", // República Dominicana
      "1829", // República Dominicana
      "1849", // República Dominicana
    ]

    // Remover el + si existe
    let normalized = phoneStr.replace(/^\+/, "")

    // Verificar si ya tiene un prefijo internacional
    const hasPrefix = countryPrefixes.some((prefix) => normalized.startsWith(prefix))

    if (hasPrefix) {
      return normalized
    }

    // Si no tiene prefijo, agregar 58 (Venezuela por defecto)
    return `58${normalized}`
  }

  const filteredContacts = contacts.filter((contact) => {
    if (!searchQuery.trim()) return true

    const query = searchQuery.toLowerCase().trim()
    const firstName = contact.fields?.FirstName?.toLowerCase() || ""
    const lastName = contact.fields?.LastName?.toLowerCase() || ""
    const fullName = `${firstName} ${lastName}`.trim()

    // Dividir la búsqueda en palabras
    const searchWords = query.split(/\s+/)

    // Si busca una sola palabra, debe coincidir con alguna parte del nombre o apellido
    if (searchWords.length === 1) {
      return firstName.includes(searchWords[0]) || lastName.includes(searchWords[0])
    }

    // Si busca múltiples palabras, todas deben estar en el nombre completo
    return searchWords.every((word) => fullName.includes(word))
  })

  const fetchAllContacts = async () => {
    setLoadingContacts(true)
    setContacts([])

    try {
      const result = await fetchEmailOctopusContacts()

      if (result.success) {
        setContacts(result.contacts)
        setShowContactsModal(true)
        addLog(`✅ Se cargaron ${result.contacts.length} contactos`, "success")
      } else {
        addLog(`❌ Error cargando contactos: ${result.error}`, "error")
      }
    } catch (error) {
      addLog(`❌ Error cargando contactos: ${error.message}`, "error")
    } finally {
      setLoadingContacts(false)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setAttachedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setAttachedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleEmojiSelect = (emoji) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newMessage = message.substring(0, start) + emoji + message.substring(end)
      setMessage(newMessage)

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length
        textarea.focus()
      }, 0)
    } else {
      setMessage(message + emoji)
    }
  }

  const sendMessageToNumber = async (phoneNumber, index, total) => {
    try {
      addLog(`[${index + 1}/${total}] Enviando a ${phoneNumber}...`, "info")

      if (attachedImage) {
        const reader = new FileReader()

        const base64Image = await new Promise((resolve, reject) => {
          reader.onloadend = () => {
            const base64 = reader.result.split(',')[1]
            resolve(base64)
          }
          reader.onerror = reject
          reader.readAsDataURL(attachedImage)
        })

        const response = await fetch(`${config.apiUrl}/message/sendMedia/${config.instanceName}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: config.apiKey,
          },
          body: JSON.stringify({
            number: phoneNumber,
            mediatype: "image",
            mimetype: attachedImage.type,
            caption: message,
            media: base64Image,
            delay: 1200,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          addLog(`✅ Enviado a ${phoneNumber}`, "success")
          return { success: true }
        } else {
          console.log("TIENE IMAGEN",data)
          const errorMsg = data.message || data.error || JSON.stringify(data)
          addLog(`❌ Error en ${phoneNumber}: ${errorMsg}`, "error")
          return { success: false }
        }
      } else {
        const response = await fetch(`${config.apiUrl}/message/sendText/${config.instanceName}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: config.apiKey,
          },
          body: JSON.stringify({
            number: phoneNumber,
            text: message,
            delay: 1200,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          addLog(`✅ Enviado a ${phoneNumber}`, "success")
          return { success: true }
        } else {
          const errorMsg = data.message || data.error || JSON.stringify(data)
          addLog(`❌ Error en ${phoneNumber}: ${errorMsg}`, "error")
          return { success: false }
        }
      }
    } catch (error) {
      addLog(`❌ Error de conexión con ${phoneNumber}: ${error.message}`, "error")
      return { success: false }
    }
  }

  const handleSendMessages = async () => {
    if (!message.trim()) {
      addLog("❌ Debes escribir un mensaje", "error")
      return
    }

    const numbers = phoneNumbers.split("\n").filter((n) => n.trim())

    if (numbers.length === 0) {
      addLog("❌ Debes agregar al menos un número", "error")
      return
    }

    setSending(true)
    setLogs([])
    setStats({ total: numbers.length, sent: 0, failed: 0 })

    addLog(`🚀 Iniciando envío masivo a ${numbers.length} números`, "info")

    let sent = 0
    let failed = 0

    for (let i = 0; i < numbers.length; i++) {
      const result = await sendMessageToNumber(numbers[i], i, numbers.length)

      if (result.success) {
        sent++
      } else {
        failed++
      }

      setStats({ total: numbers.length, sent, failed })

      if (i < numbers.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    addLog(`✅ Proceso completado: ${sent} enviados, ${failed} fallidos`, "success")
    setSending(false)
  }

  const StatusBadge = ({ status, label }) => {
    const colors = {
      connected: "bg-emerald-600",
      disconnected: "bg-rose-600",
      error: "bg-amber-600",
    }

    return (
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${colors[status] || "bg-gray-500"} animate-pulse`} />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-card rounded-2xl shadow-lg p-6 mb-6 border border-border">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-3 rounded-xl shadow-md">
                <Film className="text-primary-foreground" size={28} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Cine Club Sender</h1>
                <p className="text-sm text-muted-foreground">Envío masivo de mensajes</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <StatusBadge
                status={apiStatus}
                label={apiStatus === "connected" ? "API Conectada" : "API Desconectada"}
              />
              <StatusBadge
                status={instanceStatus}
                label={instanceStatus === "connected" ? "Instancia Activa" : "Instancia Inactiva"}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel izquierdo - Mensaje y números */}
          <div className="space-y-6">
            {/* Mensaje */}
            <div className="bg-card rounded-2xl shadow-lg p-6 border border-border">
              <h2 className="text-lg font-bold mb-4 text-foreground flex items-center gap-2">
                <span>📝</span> Mensaje
              </h2>

              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-input text-foreground"
                  rows="6"
                  placeholder="Escribe tu mensaje aquí... 😊"
                />

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-3 relative inline-block">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="max-w-full h-32 rounded-lg border border-border object-cover"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md hover:bg-destructive/90"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-2 relative">
                  <button
                    ref={emojiButtonRef}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 rounded-lg hover:bg-secondary transition-colors"
                    title="Agregar emoji"
                  >
                    <Smile size={20} className="text-muted-foreground" />
                  </button>

                  {showEmojiPicker && (
                    <>
                      {/* Mobile/Tablet: Bottom sheet */}
                      <div
                        ref={emojiPickerRef}
                        className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-card border-t border-border rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300"
                      >
                        <div className="flex items-center justify-between p-4 border-b border-border">
                          <span className="text-base font-semibold text-foreground">Emojis</span>
                          <button
                            onClick={() => setShowEmojiPicker(false)}
                            className="p-2 rounded-lg hover:bg-secondary transition-colors"
                          >
                            <X size={20} className="text-muted-foreground" />
                          </button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto">
                          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                        </div>
                      </div>

                      {/* Desktop: Popover */}
                      <div
                        ref={emojiPickerRef}
                        className="hidden md:block absolute top-12 left-0 z-50 bg-card border border-border rounded-xl shadow-2xl"
                      >
                        <div className="flex items-center justify-between p-3 border-b border-border">
                          <span className="text-sm font-semibold text-foreground">Emojis</span>
                          <button
                            onClick={() => setShowEmojiPicker(false)}
                            className="p-1 rounded-lg hover:bg-secondary transition-colors"
                          >
                            <X size={16} className="text-muted-foreground" />
                          </button>
                        </div>
                        <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                      </div>
                    </>
                  )}

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-lg hover:bg-secondary transition-colors"
                    title="Adjuntar imagen"
                  >
                    <ImageIcon size={20} className="text-muted-foreground" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <p className="text-sm text-muted-foreground">{message.length} caracteres</p>
              </div>
            </div>

            {/* WhatsApp Preview */}
            <WhatsAppPreview message={message} imagePreview={imagePreview} />

            {/* Números de teléfono */}
            <div className="bg-card rounded-2xl shadow-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span>📱</span> Números de Teléfono
                </h2>
                <button
                  onClick={fetchAllContacts}
                  disabled={loadingContacts}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  {loadingContacts ? (
                    <>
                      <Loader className="animate-spin" size={16} />
                      Cargando...
                    </>
                  ) : (
                    "Traer Contactos"
                  )}
                </button>
              </div>
              <textarea
                value={phoneNumbers}
                onChange={(e) => setPhoneNumbers(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-mono text-sm bg-input text-foreground"
                rows="6"
                placeholder="584140551969&#10;5491112345678&#10;5215512345678"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Un número por línea • Total: {phoneNumbers.split("\n").filter((n) => n.trim()).length} números
              </p>
            </div>

            {/* Botón de envío */}
            <button
              onClick={handleSendMessages}
              disabled={sending || apiStatus !== "connected" || instanceStatus !== "connected"}
              className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:bg-accent disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
            >
              {sending ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Enviar Mensajes
                </>
              )}
            </button>
          </div>

          {/* Panel derecho - Estadísticas y logs */}
          <div className="space-y-6">
            {/* Estadísticas */}
            <div className="bg-card rounded-2xl shadow-lg p-6 border border-border">
              <h2 className="text-lg font-bold mb-4 text-foreground flex items-center gap-2">
                <span>📊</span> Estadísticas
              </h2>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-secondary/30 rounded-xl p-4 text-center border border-border">
                  <div className="text-3xl font-bold text-foreground">{stats.total}</div>
                  <div className="text-sm text-muted-foreground mt-1">Total</div>
                </div>

                <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-200">
                  <div className="text-3xl font-bold text-emerald-700">{stats.sent}</div>
                  <div className="text-sm text-emerald-600 mt-1">Enviados</div>
                </div>

                <div className="bg-rose-50 rounded-xl p-4 text-center border border-rose-200">
                  <div className="text-3xl font-bold text-rose-700">{stats.failed}</div>
                  <div className="text-sm text-rose-600 mt-1">Fallidos</div>
                </div>
              </div>

              {stats.total > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2 text-foreground">
                    <span>Progreso</span>
                    <span>{Math.round(((stats.sent + stats.failed) / stats.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-secondary/30 rounded-full h-3 overflow-hidden border border-border">
                    <div
                      className="bg-primary h-full transition-all duration-500 rounded-full"
                      style={{ width: `${((stats.sent + stats.failed) / stats.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Terminal de logs */}
            <div className="bg-card rounded-2xl shadow-lg p-6 border border-border">
              <h2 className="text-lg font-bold mb-4 text-foreground flex items-center gap-2">
                <span>🖥️</span> Terminal
              </h2>

              <div className="bg-gray-900 rounded-xl p-4 h-96 overflow-y-auto font-mono text-sm">
                {logs.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">Esperando envío de mensajes...</div>
                ) : (
                  logs.slice(-10).map((log, index) => (
                    <div
                      key={index}
                      className={`mb-2 ${
                        log.type === "error"
                          ? "text-red-400"
                          : log.type === "success"
                            ? "text-green-400"
                            : "text-gray-300"
                      }`}
                    >
                      <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>

              {logs.length > 10 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Mostrando últimas 10 líneas de {logs.length} total
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal de Contactos */}
        {showContactsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col border border-border">
              {/* Header */}
              <div className="p-6 border-b border-border space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-foreground">
                      Contactos ({filteredContacts.length})
                    </h2>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={
                          selectedContacts.size === filteredContacts.filter((c) => c.fields?.Phone).length &&
                          filteredContacts.filter((c) => c.fields?.Phone).length > 0
                        }
                        onChange={(e) => {
                          const newSelected = new Set()
                          if (e.target.checked) {
                            filteredContacts.forEach((c) => {
                              if (c.fields?.Phone) {
                                newSelected.add(c.id)
                              }
                            })
                          }
                          setSelectedContacts(newSelected)
                        }}
                        className="cursor-pointer"
                      />
                      <span className="text-sm font-medium text-foreground">Agregar todos</span>
                    </label>
                  </div>
                  <button
                    onClick={() => {
                      setShowContactsModal(false)
                      setSelectedContacts(new Set())
                      setCurrentPage(1)
                      setSearchQuery("")
                    }}
                    className="p-2 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <X size={20} className="text-muted-foreground" />
                  </button>
                </div>

                {/* Search Input */}
                <input
                  type="text"
                  placeholder="Buscar por nombre o apellido..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1) // Reset to first page on search
                  }}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-foreground"
                />
              </div>

              {/* Table */}
              <div ref={modalContentRef} className="flex-1 overflow-auto p-6">
                <table className="w-full">
                  <thead className="sticky top-0 bg-card border-b border-border">
                    <tr>
                      <th className="text-left p-3 text-sm font-semibold text-foreground">
                        <input
                          type="checkbox"
                          checked={
                            filteredContacts.slice((currentPage - 1) * 20, currentPage * 20).length > 0 &&
                            filteredContacts
                              .slice((currentPage - 1) * 20, currentPage * 20)
                              .every((c) => selectedContacts.has(c.id))
                          }
                          onChange={(e) => {
                            const pageContacts = filteredContacts.slice((currentPage - 1) * 20, currentPage * 20)
                            const newSelected = new Set(selectedContacts)
                            if (e.target.checked) {
                              pageContacts.forEach((c) => newSelected.add(c.id))
                            } else {
                              pageContacts.forEach((c) => newSelected.delete(c.id))
                            }
                            setSelectedContacts(newSelected)
                          }}
                          className="cursor-pointer"
                        />
                      </th>
                      <th className="text-left p-3 text-sm font-semibold text-foreground">Nombre</th>
                      <th className="text-left p-3 text-sm font-semibold text-foreground">Apellido</th>
                      <th className="text-left p-3 text-sm font-semibold text-foreground">Teléfono</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.slice((currentPage - 1) * 20, currentPage * 20).map((contact) => (
                      <tr key={contact.id} className="border-b border-border hover:bg-secondary/20">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedContacts.has(contact.id)}
                            onChange={(e) => {
                              const newSelected = new Set(selectedContacts)
                              if (e.target.checked) {
                                newSelected.add(contact.id)
                              } else {
                                newSelected.delete(contact.id)
                              }
                              setSelectedContacts(newSelected)
                            }}
                            className="cursor-pointer"
                          />
                        </td>
                        <td className="p-3 text-sm text-foreground">{contact.fields?.FirstName || "-"}</td>
                        <td className="p-3 text-sm text-foreground">{contact.fields?.LastName || "-"}</td>
                        <td className="p-3 text-sm font-mono text-foreground">
                          {normalizePhoneNumber(contact.fields?.Phone) || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-border">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1))
                      modalContentRef.current?.scrollTo({ top: 0, behavior: "smooth" })
                    }}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {Math.ceil(filteredContacts.length / 20) || 1}
                  </span>
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.min(Math.ceil(filteredContacts.length / 20), p + 1))
                      modalContentRef.current?.scrollTo({ top: 0, behavior: "smooth" })
                    }}
                    disabled={currentPage === Math.ceil(filteredContacts.length / 20)}
                    className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Siguiente
                  </button>
                </div>

                <button
                  onClick={() => {
                    const selectedPhones = contacts
                      .filter((c) => selectedContacts.has(c.id) && c.fields?.Phone)
                      .map((c) => normalizePhoneNumber(c.fields.Phone))
                      .filter((phone) => phone !== null)
                      .join("\n")

                    if (selectedPhones) {
                      setPhoneNumbers((prev) => (prev ? `${prev}\n${selectedPhones}` : selectedPhones))
                      const contactsAdded = contacts.filter(
                        (c) => selectedContacts.has(c.id) && c.fields?.Phone
                      ).length
                      addLog(`✅ Se agregaron ${contactsAdded} contactos`, "success")
                    }

                    setShowContactsModal(false)
                    setSelectedContacts(new Set())
                    setCurrentPage(1)
                  }}
                  disabled={selectedContacts.size === 0}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Agregar Seleccionados ({selectedContacts.size})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
