export interface Procedimento {
  id: string;
  fabricante: string;
  categoria: string;
  procedimento: string;
  canais: {
    tipo: string;
    valor: string;
    horario?: string;
  }[];
  observacoes?: string[];
  linksPrincipais?: {
    titulo: string;
    url: string;
  }[];
  contatosExclusivos?: {
    nome: string;
    tipo: string;
    valor: string;
  }[];
}

export const categorias = [
  "Linha Branca",
  "Eletroportáteis",
  "Áudio e Vídeo",
  "Informática",
  "Telefonia",
  "Cocção",
  "Automotivo",
  "Ferramentas",
  "Bicicletas",
  "Outros"
] as const;

export const procedimentosSSC: Procedimento[] = [
  {
    id: "acer",
    fabricante: "Acer",
    categoria: "Informática",
    procedimento: "O cliente deve ligar diretamente para o SAC ou solicitar atendimento via Chat Online no site.",
    canais: [
      { tipo: "SAC", valor: "0800 762 2237" },
      { tipo: "Chat Online", valor: "https://service.acer.com/chat/support/pt/BR/" },
      { tipo: "Centros de Reparo", valor: "https://www.acer.com/ac/pt/BR/content/repair-centers" }
    ]
  },
  {
    id: "antenas-aquarios",
    fabricante: "Antenas Aquários",
    categoria: "Áudio e Vídeo",
    procedimento: "O cliente deve acessar o link de garantia e assistência técnica para preencher um formulário ou usar os contatos disponíveis.",
    canais: [
      { tipo: "Link de Assistência", valor: "https://aquario.com.br/garantia-e-assistencia-tecnica-para-consumidores/" },
      { tipo: "SAC", valor: "0800 44 8000 ou (44) 3261-7344", horario: "8h às 18h, de segunda a sexta-feira (exceto feriados)" },
      { tipo: "WhatsApp", valor: "800 44 8000" },
      { tipo: "E-mail", valor: "sac@aquario.com.br" }
    ]
  },
  {
    id: "arno",
    fabricante: "Arno",
    categoria: "Eletroportáteis",
    procedimento: "O cliente precisa ligar para o SAC e solicitar a postagem. Se houver posto autorizado em um raio de até 30 km, o consumidor deve levar o produto.",
    canais: [
      { tipo: "SAC", valor: "011 2060 9777" },
      { tipo: "Postos Autorizados", valor: "https://www.arno.com.br/assistencia-tecnica" }
    ],
    observacoes: ["Casos Especiais: Solicitar apoio à equipe SSC pelo e-mail contato-ssc@lebes.com.br"]
  },
  {
    id: "arke",
    fabricante: "Arke",
    categoria: "Outros",
    procedimento: "Atendimento via canais diretos do fabricante.",
    canais: [
      { tipo: "Postos Autorizados", valor: "https://www.arke.com.br/index.php?route=information/assistance" },
      { tipo: "SAC", valor: "0800 600 3770", horario: "Segunda à Quinta (7h20 às 11h30 e 12h30 às 17h20). Sexta-feira (até 16h20)" },
      { tipo: "WhatsApp", valor: "(54) 9 9115-0222" },
      { tipo: "Formulário", valor: "https://www.arke.com.br/index.php?route=information/contact" }
    ],
    observacoes: ["Não atendem sábados, domingos e feriados"]
  },
  {
    id: "asus",
    fabricante: "Asus",
    categoria: "Informática",
    procedimento: "Atendimento pelo site ou SAC. Devido à LGPD, o cliente deve preencher um formulário online para solicitação de reparo (RMA).",
    canais: [
      { tipo: "SAC", valor: "(11) 3003-0398 (Capitais) / 0800 288 8888 (Demais regiões)" },
      { tipo: "Solicitação RMA", valor: "https://www2.uranet.com.br/callcenter/asus_rma_site.php" }
    ],
    observacoes: ["Cliente deve enviar número do protocolo para priorização da OS (RMA)"]
  },
  {
    id: "atlas",
    fabricante: "Atlas",
    categoria: "Cocção",
    procedimento: "Cliente acessa o link de apoio ao consumidor e escolhe a opção de atendimento (chat, SAC fone, e-mail, formulário, postos autorizados).",
    canais: [
      { tipo: "Link de Apoio", valor: "https://www.atlas.ind.br/apoio-ao-consumidor/" },
      { tipo: "SAC", valor: "0800 707 1696", horario: "Segunda a Sexta-feira, das 08h às 18h" }
    ]
  },
  {
    id: "dako",
    fabricante: "Dako",
    categoria: "Cocção",
    procedimento: "Cliente acessa o link de apoio ao consumidor e escolhe a opção de atendimento.",
    canais: [
      { tipo: "Link de Apoio", valor: "https://www.dako.ind.br/apoio-ao-consumidor/" },
      { tipo: "SAC", valor: "0800 601 0370", horario: "Segunda a Sexta-feira, das 08h às 18h" }
    ]
  },
  {
    id: "apple",
    fabricante: "Apple",
    categoria: "Telefonia",
    procedimento: "A Apple não aceita intervenção do lojista/revendedor. O cliente deve contatar diretamente os canais do fabricante.",
    canais: [
      { tipo: "Suporte", valor: "https://support.apple.com/pt-br" },
      { tipo: "SAC", valor: "0800 761 0880" }
    ],
    observacoes: ["Não aceita intervenção de revenda"]
  },
  {
    id: "amvox",
    fabricante: "Amvox",
    categoria: "Áudio e Vídeo",
    procedimento: "Atendimento via WhatsApp ou E-mail.",
    canais: [
      { tipo: "WhatsApp", valor: "https://api.whatsapp.com/send/?phone=5571992670131&text&type=phone_number&app_absent=0" },
      { tipo: "E-mail", valor: "assistec11@amvox.com.br" },
      { tipo: "SAC", valor: "(71) 3649-8900 ou 0800 284 5032" },
      { tipo: "Postos Autorizados", valor: "https://www.amvox.com.br/rede-de-assistencias/" },
      { tipo: "Solicitar Reparo", valor: "https://www.amvox.com.br/solicitar-reparo/" }
    ],
    contatosExclusivos: [
      { nome: "Larissa Souza", tipo: "E-mail", valor: "larissa.souza@amvox.com.br" },
      { nome: "Larissa Souza", tipo: "WhatsApp", valor: "(71) 9 9267-0131 (a partir das 09h)" }
    ]
  },
  {
    id: "bandeirantes",
    fabricante: "Bandeirantes",
    categoria: "Outros",
    procedimento: "A loja deve contatar as representantes comerciais para apoio.",
    canais: [
      { tipo: "WhatsApp Fábrica", valor: "11 4674-7244" }
    ],
    contatosExclusivos: [
      { nome: "Marli", tipo: "WhatsApp", valor: "51 98591-4022" },
      { nome: "Larissa", tipo: "WhatsApp", valor: "51 98549-4669" },
      { nome: "Escritório", tipo: "E-mail", valor: "lalarep.com@hotmail.com" }
    ]
  },
  {
    id: "bosch-skil",
    fabricante: "Bosch / Skil",
    categoria: "Ferramentas",
    procedimento: "Atendimento via canais diretos do fabricante (não atende pelo sistema de críticos).",
    canais: [
      { tipo: "SAC", valor: "0800 704 5446", horario: "Segunda - Sexta, 08:00 - 18:00" },
      { tipo: "WhatsApp", valor: "47 3802-2602" },
      { tipo: "Posto Bosch", valor: "https://www.bosch-professional.com/br/pt/dealers/" },
      { tipo: "Garantia Bosch", valor: "https://www.bosch-professional.com/br/pt/servicos/garantia-de-produtos/" },
      { tipo: "Pós-Vendas Skil", valor: "https://www.skil.com.br/br/pt/pos-vendas/" },
      { tipo: "Postos Skil", valor: "https://www.skil.com.br/br/pt/dltechnical/pesquisa-de-agentes-autorizados/dealersearch/" }
    ]
  },
  {
    id: "brastemp-consul",
    fabricante: "Brastemp / Consul",
    categoria: "Linha Branca",
    procedimento: "Atendimento 100% pelo portal SAR.",
    canais: [
      { tipo: "Portal SAR", valor: "https://www.portalrevendawhirlpool.com.br/Login/Login.aspx" },
      { tipo: "Formulário SAOR (Críticos)", valor: "https://docs.google.com/forms/d/e/1FAIpQLScWSUAhziwuW0-O_GZxzeI8kGOv7Zt3j4xHN9-ymWL4jpl-bw/viewform" }
    ],
    linksPrincipais: [
      { titulo: "Criar Cadastro (Vídeo)", url: "https://www.youtube.com/watch?v=fU7I51izeyg" },
      { titulo: "Criar Protocolo (Vídeo)", url: "https://www.youtube.com/watch?v=oQVLCIp6YR4" },
      { titulo: "Consultar Protocolo (Vídeo)", url: "https://www.youtube.com/watch?v=_dJ4ZQCpkeY" }
    ],
    observacoes: ["Resposta em até 48 horas para casos críticos"]
  },
  {
    id: "britania-philco",
    fabricante: "Britânia / Philco",
    categoria: "Eletroportáteis",
    procedimento: "O fabricante não aceita intervenção do varejista. O cliente deve usar os links para abrir reclamações.",
    canais: [
      { tipo: "Reclamações Críticas", valor: "https://base-britania.movidesk.com/kb" },
      { tipo: "Atendimento Britânia", valor: "https://britania.force.com/CA/s/" },
      { tipo: "Atendimento Philco", valor: "https://suporte.philco.com.br/s/" }
    ],
    observacoes: ["Não aceita intervenção de revenda", "Casos difíceis: procurar SSC"]
  },
  {
    id: "cadence-oster",
    fabricante: "Cadence / Oster",
    categoria: "Eletroportáteis",
    procedimento: "Atendimento pelo SAC, WhatsApp e site.",
    canais: [
      { tipo: "Apoio ao Consumidor", valor: "https://www.cadence.com.br/apoio-ao-consumidor" },
      { tipo: "WhatsApp", valor: "(47) 99117-2660" },
      { tipo: "Postos Autorizados", valor: "https://www.cadence.com.br/apoio-ao-consumidor/servico-tecnico-autorizado" }
    ]
  },
  {
    id: "clarice",
    fabricante: "Clarice",
    categoria: "Cocção",
    procedimento: "Atendimento via canais diretos do fabricante.",
    canais: [
      { tipo: "SAC", valor: "(49) 3366 5838", horario: "07:00 às 11:30 / 13:00 às 17:18" },
      { tipo: "Postos Autorizados", valor: "https://www.clarice.com.br/consumidor/assistencia-tecnica" },
      { tipo: "WhatsApp", valor: "https://api.whatsapp.com/send?phone=5549999320032" },
      { tipo: "Formulário SAC", valor: "https://www.clarice.com.br/consumidor/sac" },
      { tipo: "Vídeos de Apoio", valor: "https://www.clarice.com.br/videos" }
    ]
  },
  {
    id: "colormaq",
    fabricante: "Colormaq",
    categoria: "Linha Branca",
    procedimento: "Atendimento via canais diretos do fabricante.",
    canais: [
      { tipo: "SAC", valor: "0800 770 8517" },
      { tipo: "WhatsApp", valor: "(18) 99627-9693" },
      { tipo: "E-mail Geral", valor: "atendimento@colormaq.com.br" },
      { tipo: "E-mail Lojista", valor: "lojista@colormaq.com.br" },
      { tipo: "Dúvidas", valor: "https://blog.colormaq.com.br/duvidas-sobre-maquina-de-lavar-colormaq/" }
    ],
    observacoes: ["E-mail lojista não fornecer a clientes finais"]
  },
  {
    id: "continental",
    fabricante: "Continental Pneus",
    categoria: "Automotivo",
    procedimento: "A loja pode direcionar o cliente para revendedores. Casos sem atendimento devem ser abertos pelo ZEEV/automotivos.",
    canais: [
      { tipo: "Garantia", valor: "https://contipneus.zendesk.com/hc/pt-br?ref=3690488&navigationPath=plt-pt-br/duvidas" },
      { tipo: "Assistências", valor: "https://contipneus.zendesk.com/hc/pt-br/categories/360001954933-Assist%C3%AAncias-T%C3%A9cnicas-" },
      { tipo: "SAC", valor: "4003-9540 (Capitais) / 0800 17 00 061 (Demais)", horario: "Segunda à Sexta, 08h30-12h / 13h-16h30" }
    ],
    observacoes: ["Não anexar fotos com DDD no nome do arquivo"]
  },
  {
    id: "colli",
    fabricante: "Colli Bikes",
    categoria: "Bicicletas",
    procedimento: "Atendimento via canais diretos. ZEEV é o canal mais eficaz.",
    canais: [
      { tipo: "Mensagem", valor: "https://loja.collibike.com.br/fale-conosco/" },
      { tipo: "E-mail", valor: "assistencia@collibike.com.br" }
    ]
  },
  {
    id: "dream",
    fabricante: "Dream Fitness",
    categoria: "Outros",
    procedimento: "Atendimento por diversos canais.",
    canais: [
      { tipo: "SAC", valor: "0300 101 2555", horario: "Segunda à sexta, 8:00-17:30" },
      { tipo: "WhatsApp", valor: "https://api.whatsapp.com/send?phone=%205551996430030" },
      { tipo: "Fale Conosco", valor: "https://www.dream.com.br/fale-conosco" },
      { tipo: "Postos", valor: "https://www.dream.com.br/institucional/localize-uma-assistencia-tecnica" },
      { tipo: "Apoio Técnico", valor: "https://www.dream.com.br/institucional/assistencia-tecnica" }
    ]
  },
  {
    id: "electrolux",
    fabricante: "Electrolux",
    categoria: "Linha Branca",
    procedimento: "Primeiro atendimento deve ser pelos canais oficiais.",
    canais: [
      { tipo: "Canais Oficiais", valor: "https://cuida.electrolux.com.br/contato" },
      { tipo: "SAC Lojista", valor: "3004-2140 (Capitais) / 0800 741 2141 (Demais)" },
      { tipo: "E-mail Lojista", valor: "sac.revenda@electrolux.com.br" }
    ],
    observacoes: ["Contatos exclusivos para lojistas não fornecer a clientes"]
  },
  {
    id: "elgin",
    fabricante: "Elgin",
    categoria: "Linha Branca",
    procedimento: "O cliente deve entrar no link e solicitar o atendimento, ou verificar o posto autorizado.",
    canais: [
      { tipo: "Chamado", valor: "https://elginbematech.com.br/chamado/open.php" },
      { tipo: "Postos", valor: "https://www.elgin.com.br/SuporteTecnico/To/Contato" },
      { tipo: "SAC", valor: "0800 703 5446 (Geral) / 11 3383-5555 (Grande SP)" },
      { tipo: "WhatsApp", valor: "11 98386-0054" }
    ]
  },
  {
    id: "fischer",
    fabricante: "Fischer",
    categoria: "Eletroportáteis",
    procedimento: "O cliente deve localizar o posto autorizado mais próximo ou entrar em contato via SAC/E-mail.",
    canais: [
      { tipo: "Postos", valor: "https://www.fischer.com.br/assistencia-tecnica/#assistencia-tecnica" },
      { tipo: "Contato", valor: "https://www.fischer.com.br/contato/" },
      { tipo: "SAC", valor: "0800 747 3535 ou 0800 729 3535" },
      { tipo: "E-mail", valor: "sac@fischer.com.br" }
    ],
    observacoes: ["Casos Especiais: contato-ssc@lebes.com.br"]
  },
  {
    id: "fsound",
    fabricante: "F-sound",
    categoria: "Áudio e Vídeo",
    procedimento: "Atendimento 100% via ZEEV/Atendimentos Críticos. O fabricante retorna em até 48 horas.",
    canais: [
      { tipo: "ZEEV", valor: "Sistema interno" }
    ]
  },
  {
    id: "gama",
    fabricante: "Ga.ma Italy",
    categoria: "Eletroportáteis",
    procedimento: "O cliente deve localizar o posto autorizado ou solicitar postagem via SAC Fone/E-mail.",
    canais: [
      { tipo: "Postos", valor: "https://www.gamaitaly.com.br/institucional/assistencia-tecnica" },
      { tipo: "SAC", valor: "0800 724 4262" },
      { tipo: "E-mail", valor: "sac@gamaitaly.com.br" }
    ]
  },
  {
    id: "gradiente",
    fabricante: "Gradiente",
    categoria: "Áudio e Vídeo",
    procedimento: "Atendimento por diversas alternativas (site, SAC fone, chat, e-mail).",
    canais: [
      { tipo: "Site/Chat", valor: "https://www.gradiente.com.br/Institucional/assistencia-tecnica" },
      { tipo: "SAC", valor: "11 3339 9954 (SP) / 0800 772 9209 (Demais)" },
      { tipo: "E-mail Consumidor", valor: "sac@gradiente.com.br" },
      { tipo: "E-mail Lojista", valor: "sac_revenda@gradiente.com.br" }
    ],
    observacoes: ["E-mail revenda não repassar a consumidor"]
  },
  {
    id: "hisense",
    fabricante: "Hisense",
    categoria: "Linha Branca",
    procedimento: "O cliente deve ligar para o SAC para solicitar a abertura do atendimento.",
    canais: [
      { tipo: "SAC", valor: "0800 000 1454" },
      { tipo: "E-mail", valor: "sac@hisense.com.br" },
      { tipo: "WhatsApp", valor: "011 98990-8945" }
    ],
    contatosExclusivos: [
      { nome: "Sr. Antônio", tipo: "Telefone", valor: "51 993135055" },
      { nome: "Sr. Antônio", tipo: "E-mail", valor: "acs@aedrep.com.br" }
    ]
  },
  {
    id: "houston",
    fabricante: "Houston",
    categoria: "Bicicletas",
    procedimento: "Atendimento via SAC Fone e e-mail.",
    canais: [
      { tipo: "SAC 1", valor: "0800 703 3440" },
      { tipo: "SAC 2", valor: "0800 979 3434" },
      { tipo: "E-mail 1", valor: "sac1@houston.com.br" },
      { tipo: "E-mail 2", valor: "sac2@houston.com.br" }
    ],
    contatosExclusivos: [
      { nome: "Paulo Soares", tipo: "E-mail", valor: "paulosoares@houston.com.br" },
      { nome: "Paulo Soares", tipo: "WhatsApp", valor: "51 99849 8147" }
    ]
  },
  {
    id: "hp",
    fabricante: "HP",
    categoria: "Informática",
    procedimento: "O fabricante não aceita intervenção da revenda. Todo o processo deve ser feito pelo cliente via site.",
    canais: [
      { tipo: "Suporte Geral", valor: "https://support.hp.com/br-pt/printer" },
      { tipo: "Contato/Chat", valor: "https://support.hp.com/br-pt/contact/help/printer" },
      { tipo: "Garantia", valor: "https://support.hp.com/br-pt/contact/printer-serial-number" }
    ],
    observacoes: ["Não aceita intervenção de revenda"]
  },
  {
    id: "intelbras",
    fabricante: "Intelbras",
    categoria: "Telefonia",
    procedimento: "Atendimento por diversos canais.",
    canais: [
      { tipo: "SAC Técnico", valor: "(48) 2106 0006", horario: "Segunda a sexta: 08:00-20:00 / Sábado: 08:00-18:00" },
      { tipo: "SAC Geral", valor: "0800 704 2767", horario: "Segunda a sexta: 08:00-20:00 / Sábado: 08:00-14:00" },
      { tipo: "E-mail", valor: "https://www.intelbras.com/pt-br/contato/mensagem/" },
      { tipo: "Chat", valor: "https://chat.apps.intelbras.com.br/" },
      { tipo: "Postos", valor: "https://www.intelbras.com/pt-br/onde-encontrar/assistencia-tecnica/localizacao/produto/categoria/" }
    ]
  },
  {
    id: "jbl",
    fabricante: "JBL",
    categoria: "Áudio e Vídeo",
    procedimento: "Atendimento via SAC Fone, WhatsApp ou Chat Online.",
    canais: [
      { tipo: "SAC Fixo", valor: "0800 571 4161", horario: "Segunda a Sexta, 08h-18h" },
      { tipo: "SAC", valor: "(41) 3012-6100", horario: "Segunda a Sexta, 08h-18h" },
      { tipo: "WhatsApp", valor: "https://api.whatsapp.com/send/?phone=554121696702" },
      { tipo: "Site", valor: "https://support.jbl.com/br/pt/customer-service/assistencia.html" }
    ]
  },
  {
    id: "karcher",
    fabricante: "Karcher",
    categoria: "Eletroportáteis",
    procedimento: "Atendimento via SAC Fone, WhatsApp, Chat Online ou E-mail.",
    canais: [
      { tipo: "SAC", valor: "08000 176 111", horario: "Seg-Qui: 8-18h / Sex: 8-17h" },
      { tipo: "WhatsApp", valor: "https://api.whatsapp.com/send/?phone=551938849100" },
      { tipo: "Chat", valor: "https://nwdsk.co/chat-form/J74wU" },
      { tipo: "Formulário", valor: "https://portal.karcher.com.br/home/contato.aspx" },
      { tipo: "Postos", valor: "https://www.karcher.com.br/br/servicos/home-garden/assistencia-tecnica.html" }
    ]
  },
  {
    id: "lavorwash",
    fabricante: "Lavorwash",
    categoria: "Eletroportáteis",
    procedimento: "Atendimento por diversos canais.",
    canais: [
      { tipo: "SAL", valor: "0800 770 2715" },
      { tipo: "SAC", valor: "(19) 3936-8555" },
      { tipo: "WhatsApp", valor: "(19) 3312-5582" },
      { tipo: "E-mail", valor: "astec@lavorwash.com.br" }
    ]
  },
  {
    id: "lenovo",
    fabricante: "Lenovo",
    categoria: "Informática",
    procedimento: "O primeiro contato de assistência deve ser pelo link de suporte online. O fabricante tentará uma solução remota antes de passar o código de postagem.",
    canais: [
      { tipo: "Suporte", valor: "https://pcsupport.lenovo.com/br/pt/" },
      { tipo: "SAC", valor: "11 3140-0500 (SP) / 0800 885 0500 (Demais)", horario: "Seg-Sex: 08h-20h | Sáb: 08h-14h" }
    ],
    contatosExclusivos: [
      { nome: "Filial", tipo: "E-mail", valor: "svarejo1@lenovo.com" }
    ],
    observacoes: ["Prazo de retorno: 48h"]
  },
  {
    id: "lenoxx",
    fabricante: "Lenoxx",
    categoria: "Áudio e Vídeo",
    procedimento: "Atendimento por diversos canais.",
    canais: [
      { tipo: "Site/Postos", valor: "https://suportelenoxx.com.br/" },
      { tipo: "SAC", valor: "(11) 3339-9954 (SP) / 0800 772 9209 (Demais)" },
      { tipo: "E-mail Consumidor", valor: "sac@lenoxx.com.br" },
      { tipo: "E-mail Lojista", valor: "sac_revenda@lenoxx.com.br" }
    ],
    observacoes: ["E-mail revenda não repassar a consumidor"]
  },
  {
    id: "lg",
    fabricante: "LG",
    categoria: "Áudio e Vídeo",
    procedimento: "O cliente deve usar o link de suporte para acessar as ferramentas de apoio.",
    canais: [
      { tipo: "Suporte Geral", valor: "https://www.lg.com/br/suporte" },
      { tipo: "Reparo Celular", valor: "https://www.lg.com/br/suporte/reparo-garantia/solicitar-reparo-celular" },
      { tipo: "Visita Técnica TV", valor: "https://www.lg.com/br/suporte/reparo-garantia/solicitar-reparo" },
      { tipo: "Postos", valor: "https://www.lg.com/br/suporte/localizar-assistencia-tecnica" },
      { tipo: "WhatsApp", valor: "11 4004 5400" }
    ]
  },
  {
    id: "mallory",
    fabricante: "Mallory",
    categoria: "Eletroportáteis",
    procedimento: "Atendimento via canais diretos.",
    canais: [
      { tipo: "Postos", valor: "https://www.mallory.com.br/assistencia-tecnica" },
      { tipo: "Central", valor: "https://www.mallory.com.br/central-atendimento" },
      { tipo: "WhatsApp", valor: "11 4200 0140" }
    ],
    contatosExclusivos: [
      { nome: "Thales Valença", tipo: "Telefone", valor: "51 9 9806-3635" },
      { nome: "Thales Valença", tipo: "E-mail", valor: "thalescce@terra.com.br" }
    ]
  },
  {
    id: "metalfrio",
    fabricante: "Metalfrio",
    categoria: "Linha Branca",
    procedimento: "Atendimento via site, SAC Fone ou Chat Online.",
    canais: [
      { tipo: "Suporte/E-mail", valor: "https://www.metalfrio.com.br/servicos-e-suporte#" },
      { tipo: "SAC", valor: "0800 702 0052" },
      { tipo: "Chat", valor: "https://omne.link/4Q1ASA" }
    ]
  },
  {
    id: "metavila",
    fabricante: "Metávila",
    categoria: "Outros",
    procedimento: "O fornecedor não aceita intervenção de revenda. Todas as reclamações devem ser abertas pelo link.",
    canais: [
      { tipo: "Reclamações", valor: "https://metavila.movidesk.com/form/3201/" }
    ],
    observacoes: ["Não aceita intervenção de revenda", "Fabricante acerta diretamente com cliente"]
  },
  {
    id: "midea",
    fabricante: "Midea Carrier",
    categoria: "Linha Branca",
    procedimento: "O cliente deve acionar o SAC antes de acionar o posto autorizado.",
    canais: [
      { tipo: "SAC", valor: "3003 1005 (Capitais) / 0800 648 1005 (Demais)", horario: "Seg-Sex: 08h-20h / Sáb: 08h-14h" },
      { tipo: "Chat", valor: "https://chat.directtalk.com.br/static/?tenantId=fd48676d-d50f-4f54-9281-3bae22386b7a&templateId=e75075fd-4fd9-4c8e-b878-ea201202fda1&departmentId=8dac0bb3-2d9a-4c35-bea5-e66cd99372c9" },
      { tipo: "WhatsApp", valor: "11 3003-1005" },
      { tipo: "Postos (Consulta)", valor: "https://www.midea.com/br/assistencia-tecnica" }
    ],
    observacoes: ["Springer: 4003 6707 (Capitais) / 0800 887 6707 (Demais)"]
  },
  {
    id: "mondial",
    fabricante: "Mondial",
    categoria: "Eletroportáteis",
    procedimento: "Atendimento por diversas plataformas.",
    canais: [
      { tipo: "SAC", valor: "0800 55 0393", horario: "Seg-Sex: 07h-20h / Sáb: 07h-13h" },
      { tipo: "E-mail", valor: "sac@emondial.com" },
      { tipo: "Formulário", valor: "https://atendimento.emondial.com.br/contatosac/" },
      { tipo: "Chat", valor: "https://mondial.xgen.com.br/mondial/form_chat_cliente.html" },
      { tipo: "Postos", valor: "https://atendimento.emondial.com.br/autorizadas/" }
    ]
  },
  {
    id: "mor",
    fabricante: "Mor",
    categoria: "Outros",
    procedimento: "Atendimento via SAC Fone, E-mail ou formulário no site.",
    canais: [
      { tipo: "SAC", valor: "(51) 2106-7601", horario: "Seg-Sex: 8:30h-17h30h" },
      { tipo: "E-mail", valor: "sac@mor.com.br" },
      { tipo: "Mensagem", valor: "https://www.lojamor.com.br/institucional/sac" }
    ]
  },
  {
    id: "motorola",
    fabricante: "Motorola",
    categoria: "Telefonia",
    procedimento: "Atendimento por diversos canais de suporte online.",
    canais: [
      { tipo: "Suporte", valor: "https://motorola-global-portal-pt.custhelp.com/app/home" },
      { tipo: "SAC", valor: "4002 1244 (Capitais) / 0800 773 1244 (Demais)" }
    ],
    linksPrincipais: [
      { titulo: "Opções de Reparo", url: "https://motorola-global-portal-pt.custhelp.com/app/repair-faqs" },
      { titulo: "Envio para Reparo", url: "https://motorola-global-portal-pt.custhelp.com/app/repair-faqs/category/how-submit-repair" },
      { titulo: "Rastreio de Reparo", url: "https://motorola-global-portal-pt.custhelp.com/app/repair-faqs/category/how-track-service" }
    ]
  },
  {
    id: "moura-zeta",
    fabricante: "Moura / Zeta",
    categoria: "Automotivo",
    procedimento: "A loja deve abrir a reclamação via ZEEV/Automotivos e preencher todos os dados solicitados.",
    canais: [
      { tipo: "ZEEV Automotivos", valor: "Sistema interno" }
    ],
    observacoes: [
      "Bateria não pode ter danos nos polos/caixa externa",
      "Visor transparente deve estar verde",
      "Não pode ter vazamento de líquido/ácido",
      "Nunca trocar sem certificado de garantia",
      "Validade: 1º-9º mês (venda) / 10º-12º mês (trocar no SSC) / >12 meses (SUCATA)"
    ]
  },
  {
    id: "multilaser",
    fabricante: "Multilaser",
    categoria: "Telefonia",
    procedimento: "Atendimento via SAC Fone e WhatsApp.",
    canais: [
      { tipo: "SAC CRM", valor: "(11) 3198-0004", horario: "Seg-Sex: 08h-20h50 / Sáb: 08h-14h20" },
      { tipo: "WhatsApp", valor: "https://api.whatsapp.com/send/?phone=551131980004", horario: "Seg-Sex: 08h-20h / Sáb: 08h-14h20" },
      { tipo: "Mobilidade", valor: "(11) 3198-5812" },
      { tipo: "Instaladores", valor: "(11) 3198-5890", horario: "Seg-Sex: 08h-20h30 / Sáb: 08h-14h" }
    ]
  },
  {
    id: "nardelli",
    fabricante: "Nardelli",
    categoria: "Cocção",
    procedimento: "Atendimento via WhatsApp e listagem de postos autorizados. Não há atendimento via fone.",
    canais: [
      { tipo: "Postos", valor: "https://nardelli.com.br/assistencia" },
      { tipo: "WhatsApp", valor: "(47) 3236-1600" }
    ],
    observacoes: ["Não há atendimento via telefone"]
  },
  {
    id: "orient",
    fabricante: "Orient / Lince",
    categoria: "Outros",
    procedimento: "Atendimento via postos autorizados, E-mail e SAC Fone.",
    canais: [
      { tipo: "Postos RS", valor: "https://www.orientrelogios.com.br/assistencia/?estado=RS" },
      { tipo: "E-mail 1", valor: "sac@orientnet.com.br" },
      { tipo: "E-mail 2", valor: "postagem@orientnet.com.br" },
      { tipo: "E-mail 3", valor: "karen.santos@orientnet.com.br" },
      { tipo: "E-mail 4", valor: "solange.ferrao@orientnet.com.br" },
      { tipo: "SAC", valor: "(11) 3049-7777" }
    ]
  },
  {
    id: "panasonic",
    fabricante: "Panasonic",
    categoria: "Linha Branca",
    procedimento: "Atendimento por diversos canais (site, chat, SAC fone, formulário, postos autorizados).",
    canais: [
      { tipo: "Suporte/Chat", valor: "https://panasonic-br.zendesk.com/hc/pt-br/categories/360005501012" },
      { tipo: "SAC", valor: "0800 776 0000 / 4004 6600", horario: "Seg-Sex: 8h-20h / Sáb: 8h-14h" },
      { tipo: "Formulário", valor: "https://panasonic-br.zendesk.com/hc/pt-br/requests/new" },
      { tipo: "Postos", valor: "https://panasonic-br.zendesk.com/hc/pt-br/articles/360057195812" }
    ]
  },
  {
    id: "pneus-goodyear-pirelli",
    fabricante: "Goodyear / Pirelli",
    categoria: "Automotivo",
    procedimento: "A loja deve abrir a reclamação via ZEEV/Automotivos e preencher todos os dados solicitados.",
    canais: [
      { tipo: "ZEEV Automotivos", valor: "Sistema interno" }
    ],
    observacoes: [
      "Anexar cópia da NF de venda",
      "Enviar fotos para análise do fabricante"
    ]
  }
];
