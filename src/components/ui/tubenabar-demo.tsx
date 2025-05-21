
import { Home, User, Briefcase, FileText, List, Calendar, BanknoteIcon, Coffee, KanbanSquare, FolderArchive } from 'lucide-react'
import { NavBar } from "@/components/ui/tubelight-navbar"
import { useLocation } from 'react-router-dom'

export function NavBarDemo() {
  const location = useLocation();
  
  const navItems = [
    { 
      name: 'Dashboard', 
      url: '/', 
      icon: Home, 
      hasInnerPages: false 
    },
    { 
      name: 'Crediário', 
      url: '/crediario', 
      icon: User, 
      hasInnerPages: true,
      innerPages: [
        { name: 'Listagens', url: '/crediario?tab=listagens', icon: List },
        { name: 'Clientes', url: '/crediario?tab=clientes', icon: Calendar },
        { name: 'Depósitos', url: '/crediario?tab=depositos', icon: BanknoteIcon },
        { name: 'Folgas', url: '/crediario?tab=folgas', icon: Coffee },
        { name: 'Kanban', url: '/crediario?tab=kanban', icon: KanbanSquare },
        { name: 'Diretório', url: '/crediario?tab=diretorio', icon: FolderArchive }
      ]
    },
    { 
      name: 'Venda O', 
      url: '/venda-o', 
      icon: Briefcase, 
      hasInnerPages: false 
    },
    { 
      name: 'Cards', 
      url: '/cards-promocionais', 
      icon: FileText, 
      hasInnerPages: false 
    }
  ]

  return <NavBar items={navItems} />
}
