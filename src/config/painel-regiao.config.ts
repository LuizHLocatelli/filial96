import {
  Headset,
  BarChart3,
  Video,
  Calculator,
  FileText,
} from "lucide-react";
import { PainelConfig } from "@/types/painel-regiao";

export const painelConfig: PainelConfig = {
  externalLinks: [
    {
      id: 'resolve-lebes',
      title: 'Resolve Lebes',
      description: 'Sistema de resolução de problemas',
      url: 'https://resolve.applebes.com.br',
      icon: Headset,
      iconColor: 'text-blue-600'
    },
    {
      id: 'zeev',
      title: 'Zeev',
      description: 'Sistema de abertura e acompanhamento de chamados',
      url: 'https://zeev.lebes.com.br',
      icon: FileText,
      iconColor: 'text-amber-600'
    },
    {
      id: 'planilha-indicadores',
      title: 'Planilha de Indicadores',
      description: 'Indicadores de performance da região',
      url: 'https://lojalebes-my.sharepoint.com/:x:/g/personal/ivane_severo_lebes_com_br/ER76e97GRspEkX2-48uxQ8MBiKhViLxokfIp62U0ETBEyQ?rtime=AyASzikF3kg',
      icon: BarChart3,
      iconColor: 'text-green-600'
    },
    {
      id: 'reuniao-regiao',
      title: 'Reunião da Região',
      description: 'Acesso rápido à reunião no Teams',
      url: 'https://teams.microsoft.com/l/meetup-join/19:meeting_YWI4NGY1ODgtNzc4NS00NmEyLWJmYWYtYjVhNjVjMzM2ZDAx@thread.v2/0?context=%7B%22Tid%22:%22ff11934e-6ffd-4c02-a9fe-212344e18575%22,%22Oid%22:%22a51e462d-4645-42dd-b918-3e1da85d8660%22%7D',
      icon: Video,
      iconColor: 'text-purple-600'
    }
  ],
  internalTools: [
    {
      id: 'calculadora-igreen',
      title: 'Calculadora iGreen',
      description: 'Calcule elegibilidade para desconto na energia',
      route: '/calculadora-igreen',
      icon: Calculator,
      iconColor: 'text-primary',
      badge: 'Popular'
    }
  ]
};
