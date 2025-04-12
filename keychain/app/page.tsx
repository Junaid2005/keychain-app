import { HeroSection } from "@/components/hero-section"
import { Icons } from "@/components/ui/icons"

export default function Home() {
  return (
    <HeroSection
      title="Keychain"
      description="License music, all on the blockchain!"
      actions={[
        {
          text: "Get Started",
          href: "chat",
          variant: "default",
          type: "glow"
        },
        {
          text: "GitHub",
          href: "https://github.com/Junaid2005/keychain",
          variant: "default",
          icon: <Icons.gitHub className="h-4 w-4" />,
          target: "_blank",
        },
      ]}
    />
  )
}
