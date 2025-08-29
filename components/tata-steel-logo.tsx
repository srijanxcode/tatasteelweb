import Image from "next/image"

interface TataSteelLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "full" | "icon"
  className?: string
}

export function TataSteelLogo({ size = "md", variant = "full", className = "" }: TataSteelLogoProps) {
  const sizeClasses = {
    sm: variant === "full" ? "h-8 w-auto" : "h-8 w-8",
    md: variant === "full" ? "h-12 w-auto" : "h-12 w-12",
    lg: variant === "full" ? "h-16 w-auto" : "h-16 w-16",
    xl: variant === "full" ? "h-20 w-auto" : "h-20 w-20",
  }

  if (variant === "icon") {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <Image
          src="/tata-steel-logo.png"
          alt="Tata Steel"
          width={48}
          height={48}
          className="w-full h-full object-contain"
        />
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${sizeClasses[size]}`}>
        <Image
          src="/tata-steel-logo.png"
          alt="Tata Steel"
          width={200}
          height={80}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  )
}
