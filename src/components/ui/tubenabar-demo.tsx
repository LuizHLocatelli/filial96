
import { Home, User, Briefcase, FileText } from 'lucide-react'
import { NavBar } from "@/components/ui/tubelight-navbar"

export function NavBarDemo() {
  const navItems = [
    { name: 'Dashboard', url: '/', icon: Home, hasInnerPages: false },
    { name: 'Crediário', url: '/crediario', icon: User, hasInnerPages: true },
    { name: 'Venda O', url: '/venda-o', icon: Briefcase, hasInnerPages: false },
    { name: 'Cards', url: '/cards-promocionais', icon: FileText, hasInnerPages: false }
  ]

  return <NavBar items={navItems} />
}
