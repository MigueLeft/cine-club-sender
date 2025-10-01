"use client"

import { useState } from "react"

const EMOJI_CATEGORIES = {
  Smileys: [
    "😀",
    "😃",
    "😄",
    "😁",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🥸",
    "🤩",
    "🥳",
  ],
  Gestos: [
    "👋",
    "🤚",
    "🖐",
    "✋",
    "🖖",
    "👌",
    "🤌",
    "🤏",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "🖕",
    "👇",
    "☝️",
    "👍",
    "👎",
    "✊",
    "👊",
    "🤛",
    "🤜",
    "👏",
    "🙌",
    "👐",
    "🤲",
    "🤝",
    "🙏",
  ],
  Corazones: [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❤️‍🔥",
    "❤️‍🩹",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
  ],
  Objetos: [
    "📱",
    "💻",
    "⌨️",
    "🖥",
    "🖨",
    "🖱",
    "🖲",
    "💾",
    "💿",
    "📀",
    "📷",
    "📸",
    "📹",
    "🎥",
    "📞",
    "☎️",
    "📟",
    "📠",
    "📺",
    "📻",
    "🎙",
    "🎚",
    "🎛",
    "⏱",
    "⏲",
    "⏰",
    "🕰",
    "⌛",
    "⏳",
    "📡",
  ],
  Símbolos: [
    "✅",
    "❌",
    "⭐",
    "🌟",
    "💫",
    "✨",
    "🔥",
    "💥",
    "💯",
    "🎉",
    "🎊",
    "🎈",
    "🎁",
    "🏆",
    "🥇",
    "🥈",
    "🥉",
    "⚡",
    "💡",
    "🔔",
    "🔕",
    "📢",
    "📣",
    "💬",
    "💭",
    "🗯",
    "♠️",
    "♥️",
    "♦️",
    "♣️",
  ],
}

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
}

export default function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState("Smileys")

  return (
    <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
      {/* Category Tabs */}
      <div className="flex gap-1 p-2 bg-secondary/20 border-b border-border overflow-x-auto">
        {Object.keys(EMOJI_CATEGORIES).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === category
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-secondary"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="p-3 grid grid-cols-5 md:grid-cols-8 gap-1 max-h-48 overflow-y-auto bg-card">
        {EMOJI_CATEGORIES[activeCategory].map((emoji, index) => (
          <button
            key={index}
            onClick={() => onEmojiSelect(emoji)}
            className="flex items-center justify-center text-2xl hover:bg-accent/50 hover:scale-110 rounded-lg p-2 transition-all duration-150 active:scale-95"
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
