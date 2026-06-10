// Preset avatars — emoji + color combos, Netflix-style
export const AVATARS = [
  { id: "lion",       emoji: "🦁", bg: "#C9A84C", label: "Lion" },
  { id: "eagle",      emoji: "🦅", bg: "#003F8A", label: "Eagle" },
  { id: "wolf",       emoji: "🐺", bg: "#4B5563", label: "Wolf" },
  { id: "tiger",      emoji: "🐯", bg: "#D97706", label: "Tiger" },
  { id: "shark",      emoji: "🦈", bg: "#0EA5E9", label: "Shark" },
  { id: "dragon",     emoji: "🐉", bg: "#7C3AED", label: "Dragon" },
  { id: "phoenix",    emoji: "🦜", bg: "#DC2626", label: "Phoenix" },
  { id: "bear",       emoji: "🐻", bg: "#92400E", label: "Bear" },
  { id: "fox",        emoji: "🦊", bg: "#EA580C", label: "Fox" },
  { id: "panther",    emoji: "🐆", bg: "#1F2937", label: "Panther" },
  { id: "bull",       emoji: "🐂", bg: "#B91C1C", label: "Bull" },
  { id: "falcon",     emoji: "🦉", bg: "#065F46", label: "Falcon" },
  { id: "cobra",      emoji: "🐍", bg: "#166534", label: "Cobra" },
  { id: "rhino",      emoji: "🦏", bg: "#6B7280", label: "Rhino" },
  { id: "cheetah",    emoji: "🐈", bg: "#B45309", label: "Cheetah" },
  { id: "gorilla",    emoji: "🦍", bg: "#374151", label: "Gorilla" },
  { id: "horse",      emoji: "🐎", bg: "#7C2D12", label: "Horse" },
  { id: "dolphin",    emoji: "🐬", bg: "#0284C7", label: "Dolphin" },
  { id: "panda",      emoji: "🐼", bg: "#111827", label: "Panda" },
  { id: "rocket",     emoji: "🚀", bg: "#1D4ED8", label: "Rocket" },
];

export function getAvatar(avatarId) {
  return AVATARS.find((a) => a.id === avatarId) || AVATARS[0];
}

export function AvatarBubble({ avatarId, size = "md", className = "" }) {
  const av = getAvatar(avatarId);
  const sizes = {
    xs: "w-6 h-6 text-sm",
    sm: "w-8 h-8 text-base",
    md: "w-10 h-10 text-xl",
    lg: "w-14 h-14 text-3xl",
    xl: "w-20 h-20 text-4xl",
  };
  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 ${sizes[size]} ${className}`}
      style={{ backgroundColor: av.bg }}
    >
      {av.emoji}
    </div>
  );
}
