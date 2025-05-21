
import { Home, User, Briefcase, FileText } from 'lucide-react'
import { NavBar } from "@/components/ui/tubelight-navbar"

export function NavBarDemo() {
  const navItems = [
    { name: 'Dashboard', url: '/', icon: Home },
    { name: 'Crediário', url: '/crediario', icon: User },
    { name: 'Venda O', url: '/venda-o', icon: Briefcase },
    { name: 'Cards', url: '/cards-promocionais', icon: FileText }
  ]

  return <NavBar items={navItems} />
}
