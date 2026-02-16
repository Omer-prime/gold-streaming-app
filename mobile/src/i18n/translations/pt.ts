// src/i18n/pt.ts
export default {
    common: {
        ok: "OK",
        cancel: "Cancelar",
        loading: "...",
        loadingText: "Carregando…",

        error: "Erro",
        success: "Sucesso",
        done: "Concluído",
        failed: "Falhou",

        edit: "Editar",
        block: "Bloquear",
        remove: "Remover",
        you: "Você",

        sendCode: "Enviar código",
        verifyAndBind: "Verificar e vincular",
        bind: "Vincular",
        unbind: "Desvincular",
        changePhoneNumber: "Alterar número de telefone",
        userFallback: "Usuário",

        codeSent: "Código enviado",
    },
    errors: {
        userNotFound: "Usuário não encontrado, faça login novamente.",
        updateFailed: "Falha ao atualizar o idioma.",
    },

    settings: {
        title: "Configurações",
        versionText: "1.0.0 (Gold Live)",

        items: {
            accountAndSecurity: "Conta e segurança",
            securityPassword: "Senha de segurança",
            languageSetting: "Configuração de idioma",

            blacklist: "Lista de bloqueados",
            privilegeSettings: "Configurações de privilégios",
            newMessagesNotification: "Notificação de novas mensagens",
            privacy: "Privacidade",

            version: "Versão",
            aboutGoldLive: "Sobre o Gold Live",
            clearCache: "Limpar cache",
        },

        security: {
            levelPrefix: "Nível de segurança:",
            levelLow: "Baixo",
            levelMedium: "Médio",
            levelHigh: "Alto",
        },

        actions: {
            clearCacheTitle: "Limpar cache",
            clearCacheMsg: "Cache do app limpo (isso não faz logout).",

            switchAccountTitle: "Trocar conta",
            switchAccountMsg: "Deseja trocar de conta?",
            switch: "Trocar",
            switchAccountBtn: "Trocar conta",

            logoutTitle: "Sair",
            logoutMsg: "Tem certeza de que deseja sair?",
            logout: "Sair",
            logoutBtn: "Sair",
        },

        language: {
            title: "Configuração de idioma",
            followSystem: "Seguir o sistema",
            english: "English",
            traditionalChinese: "繁體中文",
            arabic: "العربية",
            urdu: "اردو",
            portuguese: "Português",
            spanish: "Español",
        },
    },

    accountSecurity: {
        title: "Conta e segurança",
        levelText: "O nível de segurança da sua conta é {{level}}.",
        tip: "Vincular um número de celular ou e-mail pode aumentar seu nível de segurança.",

        rows: {
            setPassword: "Definir senha",
            phoneNumber: "Número de telefone",
            email: "E-mail",
            google: "Google",
            facebook: "Facebook",
            instagram: "Instagram",
            tiktok: "TikTok",
            deviceManagement: "Gerenciamento de dispositivos",
        },

        trailing: {
            modify: "Modificar",
            set: "Definir",
            bound: "Vinculado",
            bind: "Vincular",
        },

        cancel: {
            title: "Cancelar conta",
            msg: "O fluxo de cancelamento de conta será implementado depois.",
            button: "Cancelar conta",
        },
    },

    securityPassword: {
        title: "Senha de segurança",

        fields: {
            current: "Senha atual",
            new: "Nova senha",
            confirm: "Confirmar nova senha",
        },

        actions: {
            save: "Salvar",
            saving: "Salvando...",
        },

        errors: {
            title: "Erro",
            enterNew: "Por favor, digite a nova senha.",
            mismatch: "A nova senha e a confirmação não coincidem.",
            updateFailed: "Falha ao atualizar a senha",
            network: "Erro de rede, tente novamente.",
        },

        success: {
            title: "Sucesso",
            msg: "Senha atualizada com sucesso.",
        },
    },

    bindPhone: {
        title: "Vincular telefone",
        subtitle:
            "Vincule seu número de celular para proteger sua conta Gold Live e facilitar o login.",
        currentBoundLabel: "Telefone atualmente vinculado:",

        sections: {
            enterPhone: "Digite o telefone",
            enterCode: "Digite o código",
        },

        labels: {
            sentTo: "Enviado para: {{phone}}",
        },

        placeholders: {
            phone: "Digite seu número de telefone",
            code: "Código de verificação",
        },

        alerts: {
            codeSentMsg: "Enviamos um código para {{phone}}.",
            devCode: "CÓDIGO DEV: {{code}}",
            successMsg: "Telefone vinculado com sucesso.",
        },

        terms: {
            prefix: "Eu li e concordo com os ",
            tos: "Termos de Serviço do Gold Live",
            and: " e a ",
            privacy: "Política de Privacidade",
            suffix: ".",
        },
    },

    bindEmail: {
        title: "Vincular e-mail",
        currentBoundLabel: "E-mail atualmente vinculado:",
        noBoundYet: "Nenhum e-mail vinculado ainda.",

        labels: {
            email: "E-mail",
            code: "Código de verificação",
        },

        placeholders: {
            email: "Digite seu e-mail",
            code: "Digite o código",
        },

        alerts: {
            codeSentMsg: "Enviamos um código para {{email}}.",
            devCode: "CÓDIGO DEV: {{code}}",
            successMsg: "E-mail vinculado com sucesso.",
        },
    },

    bindSocial: {
        providers: {
            google: "Google",
            facebook: "Facebook",
            instagram: "Instagram",
            tiktok: "TikTok",
        },

        titles: {
            google: "Vincular Google",
            facebook: "Vincular Facebook",
            instagram: "Vincular Instagram",
            tiktok: "Vincular TikTok",
        },

        status: {
            notBound: "Ainda não vinculado.",
            currentlyBound: "Atualmente vinculado: {{id}}",
        },

        tempBackendHint:
            "Vinculação temporária pelo backend (substituir por OAuth depois). Digite o id do {{provider}}:",

        placeholders: {
            google: "googleId (do OAuth depois)",
            facebook: "facebookId (do OAuth depois)",
            instagram: "instagramId (do OAuth depois)",
            tiktok: "tiktokId (do OAuth depois)",
        },

        alerts: {
            loadFailed: "Falha ao carregar o status de vinculação",
            boundSuccess: "{{provider}} vinculado com sucesso.",
            unboundSuccess: "{{provider}} desvinculado.",
        },
    },

    deviceManagement: {
        title: "Gerenciamento de dispositivos",

        labels: {
            empty: "Ainda não há informações de dispositivos.",
            unknownDevice: "Dispositivo desconhecido",
            lastActiveTime: "Última atividade: {{time}}",
            friendlyName: "Dispositivo {{platform}}",
        },

        badges: {
            current: "Dispositivo atual",
            trusted: "Confiar no dispositivo",
        },

        errors: {
            notLoggedIn: "Não logado. Faça login novamente.",
            loadFailed: "Falha ao carregar dispositivos.",
            network: "Erro de rede ao carregar dispositivos.",
        },
    },

    blacklist: {
        title: "Lista de bloqueados",
        searchPlaceholder: "Digite o ID ou nome de usuário",
        empty: "Nenhum usuário bloqueado",

        labels: {
            id: "ID: {{id}}",
        },

        errors: {
            addFailed: "Falha ao adicionar à lista de bloqueados.",
        },
    },

    privilegeSettings: {
        title: "Configurações de privilégios",
        items: {
            invisibleVisitor: {
                label: "Visitante invisível",
                description:
                    "Visite outras pessoas sem deixar registro, e elas também não podem ver quem visitou a página inicial.",
            },
            mysteryLive: {
                label: "Homem misterioso na sala AO VIVO",
                description: "Apenas o destinatário do presente pode ver sua identidade nas salas AO VIVO.",
            },
            mysteryRank: {
                label: "Homem misterioso no ranking",
                description: "Seus presentes não aparecerão no ranking de fãs do anfitrião.",
            },
            invisibleOnline: {
                label: "Online invisível",
                description:
                    "Mantenha sempre um status invisível; entre em salas ao vivo de forma invisível.",
            },
            exclusiveEmail: {
                label: "Notificação exclusiva por e-mail",
                description:
                    "Receba notificações exclusivas por e-mail após a resposta do suporte.",
            },
            hideLiveLevel: {
                label: "Ocultar nível de livestream",
                description:
                    "Quando ativado, outras pessoas não poderão ver seu nível de livestream no seu perfil.",
            },
        },
    },

    newMessageNotification: {
        title: "Notificações",
        searchPlaceholder: "Pesquisar configurações de notificação",
        inboxSearchPlaceholder: "Pesquisar notificações...",

        sections: {
            notificationsList: "Lista de notificações",
            searchResults: "Resultados da pesquisa",
            notificationSettings: "Configurações de notificação",
        },

        actions: {
            markAllRead: "Marcar tudo como lido",
        },

        empty: "Ainda não há notificações.",

        errors: {
            missingUserId: "userId ausente no AsyncStorage ({{key}})",
            loadFailed: "Falha ao carregar notificações",
            network: "Erro de rede ao carregar notificações",
        },

        debugLine: "uid: {{uid}} • total: {{total}} • não lidas: {{unread}}",

        settings: {
            liveAlerts: "Alertas de abertura de sala ao vivo",
            messageSwitch: "Alternar notificação de mensagens",
            sound: "Som",
            vibrate: "Vibrar",
            mutualFollowers: "Seguidores mútuos",
            myFollowing: "Quem eu sigo",
            stranger: "Desconhecido",
        },
    },

    privacySettings: {
        title: "Privacidade",

        sections: {
            livePrivacy: "Privacidade do ao vivo",
            permissionPrivacy: "Privacidade de permissões",
        },

        items: {
            hideMicStatus: "Ocultar status do microfone",
        },

        trailing: {
            on: "Ativado",
            goSettings: "Ir para configurações",
        },

        errors: {
            openSettingsFailed: "Não foi possível abrir as configurações do sistema neste dispositivo.",
        },

        permissions: {
            camera: {
                label: "Permitir que o Gold Live acesse sua câmera",
                subLabel: "Para tirar fotos, gravar vídeos etc.",
            },
            voice: {
                label: "Permitir que o Gold Live acesse suas mensagens de voz",
                subLabel: "Para gravação de vídeo e envio de voz etc.",
            },
            notifications: {
                label: "Permitir que a plataforma obtenha sua permissão de notificações",
                subLabel: "Para alertas de mensagens não lidas etc.",
            },
            bluetooth: {
                label: "Permitir que a plataforma acesse permissões de Bluetooth.",
                subLabel: "Conectar fones Bluetooth e garantir o funcionamento adequado.",
            },
            location: {
                label: "Permitir que a plataforma obtenha permissão de localização",
                subLabel: "Usado para encontrar streamers próximos.",
            },
        },
    },

    aboutGoldLive: {
        title: "Sobre o Gold Live",
        versionText: "GOLD LIVE 1.0.0",

        items: {
            privacyPolicy: "Política de Privacidade",
            termsOfService: "Termos de Serviço",
            liveAgreement: "Acordo de Live",
            userRechargeAgreement: "Acordo de Recarga do Usuário",
            noChildEndangermentPolicy: "Política de Não Colocação de Crianças em Risco",
        },

        alerts: {
            comingSoon: "A página {{label}} será adicionada depois para o Gold Live.",
        },
    },
    legalDocs: {
        common: {
            lastUpdated: "Última atualização: 16 de fevereiro de 2026",
        },

        privacy: {
            title: "Política de Privacidade",
            intro:
                "O Gold Live coleta e usa dados apenas quando necessário para operar a plataforma. Não vendemos seus dados pessoais.",

            sections: {
                transparency: {
                    title: "1) Quais dados coletamos",
                    p1:
                        "Podemos coletar informações da conta (nome de usuário, e-mail, foto de perfil) e o conteúdo que você envia (chats, comentários, transmissões ao vivo).",
                    p2:
                        "Podemos coletar dados técnicos (endereço IP, dispositivo, sistema operacional, logs) para manter o app estável e seguro.",
                    p3:
                        "Podemos coletar dados de transações (histórico de compras de moedas, diamantes e presentes virtuais). Não coletamos dados sensíveis como biometria, informações médicas ou localização precisa em tempo real.",
                },

                usage: {
                    title: "2) Como usamos os dados",
                    p1:
                        "Usamos os dados para operar e manter as transmissões ao vivo, permitir a interação entre usuários, processar compras no app e prevenir fraude, abuso e atividade ilegal.",
                    p2:
                        "Não usamos seus dados para venda ou compartilhamento inadequado.",
                },

                sharing: {
                    title: "3) Compartilhamento com terceiros",
                    p1:
                        "Podemos compartilhar dados limitados com processadores de pagamento aprovados (Google Play Billing / Apple In-App Purchase), provedores de hospedagem e segurança e autoridades legais quando exigido por lei.",
                    p2:
                        "Todos os terceiros devem seguir regras rigorosas de proteção de dados.",
                },

                iap: {
                    title: "4) Compras no app",
                    p1:
                        "O Gold Live usa os sistemas oficiais: Google Play Billing e Apple In-App Purchases.",
                    p2:
                        "Não armazenamos os dados completos do cartão de pagamento em nossos servidores.",
                },

                analytics: {
                    title: "5) Anúncios e análises",
                    p1:
                        "O Gold Live pode usar ferramentas de análise para melhorar a experiência do usuário e o desempenho do app.",
                    p2:
                        "Essas ferramentas não vendem dados pessoais e são projetadas para não identificar usuários individualmente.",
                },

                ugc: {
                    title: "6) Conteúdo gerado pelo usuário",
                    p1:
                        "Os usuários são responsáveis pelo conteúdo que publicam. O Gold Live oferece ferramentas de denúncia e pode remover conteúdo ilegal, abusivo ou inadequado.",
                    p2:
                        "Contas que violarem os Termos podem ser suspensas ou encerradas.",
                },

                children: {
                    title: "7) Privacidade de menores (apenas 18+)",
                    p1:
                        "O Gold Live não é destinado a pessoas com menos de 18 anos.",
                    p2:
                        "Não coletamos intencionalmente dados de menores. Contas identificadas como pertencentes a menores podem ser removidas.",
                    p3:
                        "Seguimos proteções de privacidade infantil (incluindo a COPPA quando aplicável).",
                },

                rights: {
                    title: "8) Seus direitos",
                    p1:
                        "Você pode solicitar acesso aos seus dados, corrigir/atualizar suas informações, solicitar a exclusão da conta ou retirar o consentimento quando aplicável.",
                    p2:
                        "As solicitações podem ser feitas pelo e-mail oficial de suporte.",
                },

                retention: {
                    title: "9) Retenção e exclusão de dados",
                    p1:
                        "Mantemos os dados apenas pelo tempo necessário para a plataforma e para requisitos legais.",
                    p2:
                        "Após a exclusão da conta, os dados são removidos ou anonimizados quando possível.",
                },

                changes: {
                    title: "10) Alterações nesta política",
                    p1:
                        "Podemos atualizar esta Política de Privacidade a qualquer momento. As alterações entram em vigor quando publicadas.",
                },

                contact: {
                    title: "11) Contato",
                    p1:
                        "Telefone de suporte: +33-6498415115",
                    p2:
                        "goldlive@gmail.com",
                },
            },
        },

        terms: {
            title: "Termos de Serviço",
            intro:
                "Estes Termos explicam como usar o Gold Live. Ao usar o app, você concorda em seguir estas regras.",

            sections: {
                eligibility: {
                    title: "1) Elegibilidade",
                    p1:
                        "O Gold Live é para usuários com 18 anos ou mais. Se você for menor de 18, não deve usar o app.",
                },

                account: {
                    title: "2) Sua conta",
                    p1:
                        "Você é responsável pela atividade da sua conta e por manter seus dados de login seguros.",
                    p2:
                        "Você deve fornecer informações corretas e não deve se passar por outras pessoas.",
                },

                userContent: {
                    title: "3) Conteúdo e comportamento",
                    p1:
                        "Você é responsável por tudo o que publicar, transmitir ou compartilhar (incluindo chats e comentários).",
                    p2:
                        "Conteúdo ilegal, abusivo ou inadequado não é permitido. Podemos remover conteúdo e tomar medidas contra contas que violarem as regras.",
                },

                purchases: {
                    title: "4) Moedas, presentes e compras",
                    p1:
                        "As compras são processadas pelo Google Play Billing ou Apple In-App Purchase.",
                    p2:
                        "O Gold Live não armazena os dados completos do cartão de pagamento em seus servidores.",
                },

                enforcement: {
                    title: "5) Aplicação",
                    p1:
                        "Podemos suspender ou encerrar contas que violarem estes Termos ou criarem risco para usuários ou para a plataforma.",
                    p2:
                        "Podemos cooperar com autoridades legais quando exigido por lei.",
                },

                changes: {
                    title: "6) Atualizações",
                    p1:
                        "Podemos atualizar estes Termos. As alterações entram em vigor quando publicadas no app ou em nossas páginas oficiais.",
                },

                contact: {
                    title: "7) Contato",
                    p1:
                        "Se você tiver dúvidas, entre em contato com o suporte usando os dados na página de Política de Privacidade.",
                },
            },
        },

        liveAgreement: {
            title: "Acordo de Transmissão ao Vivo",
            intro:
                "Este acordo se aplica quando você hospeda ou participa de transmissões ao vivo no Gold Live.",

            sections: {
                content: {
                    title: "1) Regras de conteúdo ao vivo",
                    p1:
                        "Você não deve transmitir conteúdo ilegal, abusivo ou inadequado. Você deve respeitar outros usuários.",
                    p2:
                        "Você é responsável por tudo o que mostrar ou disser durante sua transmissão ao vivo.",
                },
                reporting: {
                    title: "2) Denúncias e moderação",
                    p1:
                        "O Gold Live oferece ferramentas de denúncia. Podemos revisar denúncias e remover conteúdo que viole as regras.",
                },
                actions: {
                    title: "3) Ações na conta",
                    p1:
                        "Se você violar as regras, sua transmissão ao vivo pode ser limitada, seu conteúdo removido ou sua conta suspensa/encerrada.",
                    p2:
                        "Podemos tomar medidas para prevenir fraude, abuso ou atividade ilegal.",
                },
                age: {
                    title: "4) Apenas 18+",
                    p1:
                        "Transmissão ao vivo não está disponível para menores de 18. Contas identificadas como de menores podem ser removidas.",
                },
            },
        },

        recharge: {
            title: "Acordo de Recarga do Usuário",
            intro:
                "Este acordo explica como funcionam as compras de moedas/diamantes e os presentes virtuais no Gold Live.",

            sections: {
                providers: {
                    title: "1) Sistemas oficiais de pagamento",
                    p1:
                        "As compras são feitas pelo Google Play Billing e Apple In-App Purchases.",
                },
                storage: {
                    title: "2) Dados de pagamento",
                    p1:
                        "O Gold Live não armazena os dados completos do cartão de pagamento em seus servidores.",
                },
                delivery: {
                    title: "3) Registros de compra",
                    p1:
                        "Mantemos registros do histórico de compras (moedas, diamantes, presentes) para rastreamento de conta e transações.",
                },
                support: {
                    title: "4) Suporte",
                    p1:
                        "Se você tiver problemas com compras, entre em contato com o suporte. O tratamento de reembolsos depende das regras da loja de apps.",
                },
            },
        },

        childPolicy: {
            title: "Política de Não Colocar Menores em Risco",
            intro:
                "O Gold Live tem compromisso com a proteção de crianças. A plataforma não é destinada a usuários menores de 18.",

            sections: {
                age: {
                    title: "1) Apenas 18+",
                    p1:
                        "O Gold Live não é para menores. Se identificarmos uma conta pertencente a um menor, podemos removê-la.",
                },
                noCollection: {
                    title: "2) Sem coleta intencional",
                    p1:
                        "Não coletamos intencionalmente dados pessoais de menores.",
                },
                enforcement: {
                    title: "3) Aplicação",
                    p1:
                        "Podemos remover conteúdo, suspender transmissões e encerrar contas envolvidas em colocar menores em risco ou exploração.",
                },
                reporting: {
                    title: "4) Denúncias",
                    p1:
                        "Use as ferramentas de denúncia dentro do app para reportar conteúdo prejudicial.",
                    p2:
                        "Você também pode entrar em contato com o suporte usando os dados oficiais de contato na página de Política de Privacidade.",
                },
            },
        },
    },

    ranking: {
        title: "Ranking",
        tabs: { host: "Host", rich: "Rico", gift: "Presente" },
        period: { daily: "Diário", weekly: "Semanal", monthly: "Mensal" },
        filters: {
            region: "Região",
            periodLabel: "{{period}}: {{range}}",
        },
        datePicker: {
            selectDate: "Selecionar data",
            done: "Concluído",
        },
        states: {
            loading: "Carregando ranking...",
            retry: "Tentar novamente",
        },
        errors: {
            loadFailed: "Falha ao carregar ranking",
            network: "Erro de rede ao carregar ranking",
        },
        labels: {
            id: "ID: {{id}}",
            userFallback: "Usuário",
        },
        distance: {
            label: "A distância para subir no ranking é: {{distance}}",
            top: "Você está no topo (ou não há ranking mais alto disponível).",
        },
    },

    reward: {
        title: "Recompensa",
        banner: {
            title: "Tarefas do host e recompensas",
            subtitle: "Conclua tarefas diárias e semanais para ganhar mais pontos.",
        },
        tabs: {
            pkMission: "Missão PK",
            activity: "Atividade",
            fanClub: "Fã-clube",
            invite: "Convidar",
        },
        pk: {
            todayRecord: "Registro de PK de hoje",
            recordLink: "Registro PK >>",
            highestStreak: "Maior sequência efetiva de vitórias",
            effectiveWins: "Vitórias efetivas",
        },
        states: {
            loading: "Carregando tarefas...",
            empty: "Nenhuma tarefa configurada ainda.",
        },
        errors: {
            notLoggedIn: "Não logado.",
            loadFailed: "Falha ao carregar tarefas de recompensa.",
            network: "Erro de rede ao carregar tarefas de recompensa.",
        },
        actions: {
            go: "IR",
            confirm: "Confirmar",
        },
        rule: {
            title: "Regra de recompensa",
            daily: "Tarefas diárias: atualizam diariamente às 00:00:00 (UTC+8).",
            weekly: "Tarefas semanais: atualizam toda segunda-feira às 00:00:00 (UTC+8).",
        },
    },

    store: {
        title: "Loja",
        popular: "Popular",
        states: {
            loading: "Carregando loja…",
            empty: "Nenhum item encontrado",
        },
        actions: {
            refresh: "Atualizar",
            all: "Todos >",
            recharge: "Recarregar",
        },
        labels: {
            coins: "Moedas",
            preview: "Pré-visualizar",
            balance: "Seu saldo",
            balanceHint: "Recarregue moedas para comprar itens da loja instantaneamente.",
            durationDays: "{{days}} dias",
            permanent: "Permanente",
        },
        errors: {
            missingUser: "Falta userId. Faça login novamente.",
        },
        purchase: {
            confirmTitle: "Confirmar compra",
            confirmMsg: 'Comprar "{{title}}" por {{price}} moedas?',
            successTitle: "Comprado",
            successMsg: "O item foi adicionado à sua conta.",
            failedTitle: "Falha na compra",
            failedMsg: "Tente novamente.",
            insufficientTitle: "Moedas insuficientes",
            insufficientMsg: "Recarregue moedas para comprar este item.",
            actions: {
                buy: "Comprar agora",
                buying: "Comprando...",
                recharge: "Recarregar",
            },
        },
    },
    invite: {
        title: "Bônus de convite",
        tabs: {
            myRewards: "Minhas recompensas",
            incomeRank: "Ranking de ganhos",
        },
        banner: {
            small: "Convide alguém",
            title: "Ganhe recompensas convidando amigos",
            subtitle: "Compartilhe seu link ou código de convite. Contaremos seus convidados automaticamente.",
        },
        stats: {
            claimed: "Recompensas resgatadas",
            invitees: "Número de convidados",
            availableToday: "Disponível para hoje: {{count}}",
        },
        list: {
            title: "Convites dos últimos 7 dias ({{count}})",
            more: "Mais >",
            loading: "Carregando…",
            empty: "Nenhum convite ainda",
            myCode: "Meu código: {{code}}",
            linkPlaceholder: "Link de convite não pronto (toque em atualizar)",
        },
        qr: {
            title: "Escaneie para entrar",
        },
        actions: {
            receive: "Receber",
            inviteNow: "Convidar agora",
            share: "Compartilhar",
            copyLink: "Copiar link",
        },
        alerts: {
            errorTitle: "Erro de convite",
            loadFailed: "Falha ao carregar dados de convite",
            inviteTitle: "Convidar",
            codeNotReady: "Código de convite não pronto. Toque em atualizar.",
            linkNotReady: "Link de convite não pronto. Toque em atualizar.",
            clipboardNotReadyTitle: "Área de transferência indisponível",
            clipboardNotReadyMsg:
                "O módulo de clipboard não está no seu Dev Client. Refaça o build do Dev Client para habilitar copiar.",
            copiedTitle: "Copiado",
            codeCopied: "Código de convite copiado",
            linkCopied: "Link de convite copiado",
            soonTitle: "Em breve",
            receiveSoon: "O resgate será habilitado quando as regras de recompensa de convite forem adicionadas.",
            inviteCodeMissing: "Código de convite ausente na resposta do backend",
        },
        badge: {
            registered: "Registrado",
            qualified: "Qualificado",
            rewarded: "Recompensado",
        },
        labels: {
            userFallback: "Usuário",
        },
        shareMessage: "Entre comigo no Gold Live 🎥\nUse meu código de convite: {{code}}\n{{link}}",
    },

    guardian: {
        defaultTitle: "Abrir Guardião",

        metaLine: "Planos: {{activePlans}}/{{totalPlans}} • Pacotes: {{activePackages}}",

        errors: {
            missingUser: "userId ausente. Faça login novamente.",
            missingUserShort: "userId ausente",
            selectUser: "Selecione um usuário para guardar primeiro",
            selectDuration: "Selecione a duração primeiro",
            activateFailed: "Falha na ativação",
            apiNonJson: "A API retornou conteúdo não-JSON. Prévia: {{preview}}",
            plansExistEmpty:
                "Planos existem, mas retornaram vazio. Verifique se há pacotes ativos para planos ativos.",
        },

        labels: {
            noUserSelected: "Nenhum usuário selecionado",
            tierLine: "{{tier}} Guardião",
        },

        sections: {
            guardSomeone: "Quero guardar alguém",
            coinsNeeded: "Moedas necessárias: {{coins}}",
            privileges: "Privilégios do guardião",
            noPrivileges: "Nenhum privilégio configurado.",
        },

        links: {
            myGuardian: "Meu guardião",
            guardingCount: "Você está guardando: {{count}}",
            guardMe: "Guarde-me",
            guardMeNone: "Ninguém está te guardando ainda",
            guardMeWith: "Guardião: {{name}}",
        },

        actions: {
            select: "Selecionar",
            activate: "Ativar Guardião {{tier}}",
            activating: "Ativando...",
            refresh: "Atualizar",
            search: "Pesquisar",
        },

        picker: {
            title: "Selecionar usuário",
            placeholder: "Pesquisar por usuário ou apelido...",
            empty: "Digite pelo menos 2 caracteres e pesquise.",
        },

        empty: {
            title: "Nenhum plano encontrado",
            hint: "Isso significa que a API retornou 0 planos ativos (isActive=true). Verifique guardianPlan + pacotes.",
        },
    },

    fanClub: {
        title: "Fã-clube",
        topTabs: { fanClub: "Fã-clube", fanGroup: "Grupo de fãs" },
        subTabs: { joined: "Clubes que entrei", my: "Meu clube" },
        empty: "Sem mais dados",
        frozenLink: "Fã-clube congelado >",
    },

    medalWall: {
        title: "Mural de Medalhas",
        obtain: "Obtidas: {{obtained}}/{{total}}",
        loading: "Carregando...",
        level: "Nível: {{level}}",
        achievementTitle: "Medalha de Conquista",
        unlocked: "Desbloqueada",
        empty:
            "Nenhuma medalha encontrada. Adicione medalhas no BD (HonorItem tipo MEDAL) ou garanta que a API retorne medalhas calculadas.",
        errors: {
            missingUserId: "userId ausente. Passe { userId } ao navegar para MedalWall.",
            loadFailed: "Falha ao carregar medalhas",
        },
    },

    profile: {
        header: {
            title: "Eu",
        },

        loggedOut: {
            title: "Você saiu da conta",
            subtitle: "Faça login novamente para ver seu perfil.",
        },

        states: {
            loading: "Carregando perfil...",
            retry: "Tentar novamente",
        },

        errors: {
            notLoggedIn: "Não logado.",
            loadFailed: "Falha ao carregar perfil.",
            network: "Erro de rede ao carregar perfil.",
        },

        labels: {
            guest: "Visitante",
            online: "Online",

            id: "ID {{id}}",

            vipLevel: "VIP {{level}}",
            levelShort: "NV.{{level}}",

            level: "Nível: {{level}}",
            coins: "Moedas",
            followers: "Seguidores",
            following: "Seguindo",
            likes: "Curtidas",
            visits: "Visitas",
        },

        completion: {
            text: "Seu perfil está {{completion}}% completo. Finalize para fazer amigos mais facilmente no Gold Live.",
        },

        stats: {
            friends: "Amigos",
            following: "Seguindo",
            followers: "Seguidores",
            visitors: "Visitantes",
        },

        wallet: {
            coins: "Moedas",
            points: "Pontos",
        },

        vipCard: {
            cta: "VIP • Atualize para VIP e aproveite benefícios exclusivos",
        },

        notice: {
            title: "AVISO",
            subtitle: "Padrões de conduta do usuário e atividades proibidas no Gold Live.",
        },

        tiles: {
            reward: "Recompensa",
            ranking: "Ranking",
            store: "Loja",
            invite: "Convidar",
            guardian: "Guardião",
            fanClub: "Fã-clube",
            medalWall: "Mural de Medalhas",
        },

        rows: {
            liveData: "Dados de live",
            help: "Ajuda",
            myAgency: "Minha agência",
            level: "Nível",
            auth: "Autenticação",
            backpack: "Mochila",
            followUs: "Siga-nos",
        },

        actions: {
            editProfile: "Editar perfil",
            editAvatar: "Editar foto do perfil",
            copyId: "Copiar ID",
            shareProfile: "Compartilhar perfil",
            follow: "Seguir",
            following: "Seguindo",
            message: "Mensagem",

            goToLogin: "Ir para login",
            view: "Ver >",
        },

        menu: {
            ranking: "Ranking",
            reward: "Recompensa",
            store: "Loja",
            invite: "Bônus de convite",
            guardian: "Abrir Guardião",
            fanClub: "Fã-clube",
            medalWall: "Mural de Medalhas",
            settings: "Configurações",
            about: "Sobre o Gold Live",
            logout: "Sair",
        },

        alerts: {
            copiedTitle: "Copiado",
            idCopied: "ID do usuário copiado",
            comingSoonTitle: "Em breve",
            comingSoonMsg: "Este recurso será adicionado depois.",

            missingUserTitle: "Usuário ausente",
            missingUserMsg: "Faça login novamente.",
        },
    },

    /* ✅ NEW: Live data screen */
    liveData: {
        tabs: {
            live: "Dados de live",
            pk: "Dados de PK",
        },

        range: {
            daily: "Dados diários",
            weekly: "Dados semanais",
            monthly: "Dados mensais",
        },

        stats: {
            wonPoints: "Pontos ganhos",
            liveDuration: "Duração da live",
            liveEarnings: "Ganhos da live",
            partyDuration: "Duração da party",
            partyEarnings: "Ganhos da party",
            partyCrownDuration: "Duração da coroa na party",
            newFans: "Número de novos fãs",
            newFanClubMembers: "Novos membros do fã-clube",

            avgOnline: {
                daily: "Número médio de usuários online hoje",
                weekly: "Número médio de usuários online esta semana",
                monthly: "Número médio de usuários online este mês",
            },
        },

        actions: {
            getMorePoints: "Obter mais pontos",
            contribution: "Contribuição",
        },

        help: {
            title: "Descrição",
            line1: "1. O ciclo de apuração é 00:00:00–23:59:59 em UTC+8.",
            confirm: "Confirmar",
        },

        errors: {
            notLoggedIn: "Não logado.",
            loadFailedLive: "Falha ao carregar dados de live.",
            loadFailedPk: "Falha ao carregar dados de PK.",
            emptyResponse: "Resposta vazia do servidor.",
        },

        pk: {
            tabs: {
                random: "PK aleatório",
                friend: "PK com amigo",
                team: "PK em equipe",
            },
            range: {
                today: "Hoje",
                recent7: "Últimos 7 dias",
                monthly: "Mensal",
            },
            cards: {
                winRate: "Vitórias%",
                pkScore: "Pontuação PK",
                sessions: "Sessões",
            },
            history: {
                title: "Registro histórico",
                loading: "Carregando histórico de PK...",
                empty: "Sem registros. Convide amigos para PK.",
                unknownOpponent: "Desconhecido",
            },
            result: {
                win: "Vitória",
                lose: "Derrota",
                draw: "Empate",
                score: "Pontuação: {{score}}",
            },
        },
    },

    /* ✅ NEW: Fans ranking screen */
    fansRanking: {
        title: "Ranking de fãs",

        summary: {
            totalContribution: "Contribuição total",
            myRank: "Meu ranking: {{rank}}",
            myCoins: "Minhas moedas: {{coins}}",
        },

        states: {
            loading: "Carregando ranking...",
        },

        labels: {
            levelShort: "Lv.{{level}}",
            unknownUser: "Desconhecido",
        },

        errors: {
            notLoggedIn: "Não logado.",
            loadFailed: "Falha ao carregar ranking de fãs.",
            network: "Erro de rede ao carregar ranking de fãs.",
        },

        empty: "Ainda não há contribuições de fãs.",
    },

    /* ✅ NEW: Help screen */
    help: {
        title: "Ajuda",

        fallbackCategories: {
            frequent: "Frequentes",
            livestream: "Livestream",
            recharge: "Recarga",
            report: "Denúncia",
            account: "Conta",
        },

        states: {
            loadingFaqs: "Carregando FAQs...",
            noFaqs: "Nenhuma FAQ encontrada para esta categoria.",
        },

        actions: {
            myFeedback: "Meu feedback",
            messageFeedback: "Feedback por mensagem",
        },

        compose: {
            title: "Enviar feedback",
            typeLabel: "Tipo",
            subjectOptional: "Assunto (opcional)",
            subjectPlaceholder: "Título curto",
            messageLabel: "Mensagem",
            messagePlaceholder: "Escreva os detalhes aqui...",
            send: "Enviar",
        },

        feedback: {
            types: {
                general: "GERAL",
                bug: "BUG",
                payment: "PAGAMENTO",
                account: "CONTA",
                stream: "STREAM",
                report: "DENÚNCIA",
            },
        },

        myFeedback: {
            title: "Meu feedback",
            empty: "Nenhum feedback enviado ainda.",
            adminReplyTitle: "Resposta do admin",
            noAdminReply: "Ainda não há resposta do admin.",
        },

        alerts: {
            missingMessageTitle: "Mensagem ausente",
            missingMessageMsg: "Por favor, escreva sua mensagem de feedback.",
            sentTitle: "Enviado",
            sentMsg: "Seu feedback foi enviado ao admin.",
            failedTitle: "Falhou",
            failedMsg: "Não foi possível enviar o feedback. Tente novamente.",
        },
    },

    /* ✅ NEW: My Agency screen */
    myAgency: {
        title: "Minha agência",

        hero: {
            title: "Escolha Método 1 ou Método 2",
            subtitle: "Entre em uma agência existente ou aguarde um convite do seu agente.",
        },

        method1: {
            badge: "Método 1",
            title: "Entrar no agente",
            subtitle: "O ID do agente será fornecido pelo seu agente.",
            placeholder: "Digite o ID do agente",
            button: "Entrar no agente",
        },

        method2: {
            badge: "Método 2",
            title: "Aguardando convite do agente",
            subtitle: "Compartilhe seu ID e o código de host com seu agente para receber um convite.",
            userIdLabel: "ID do usuário:",
            hostCodeLabel: "Código de host:",
        },
    },

    /* ✅ NEW: Level screen */
    level: {
        header: {
            wealthTitle: "Nível de riqueza",
            liveTitle: "Nível de livestream",
        },

        tabs: {
            wealth: "Nível de riqueza",
            live: "Nível de livestream",
        },

        labels: {
            levelShort: "Lv.{{level}}",
        },

        progress: {
            maxLevelReached: "Nível máximo atingido",
            distanceToUpgrade: "Distância para subir · {{exp}}",
            exp: "EXP: {{exp}}",
        },

        sections: {
            myBenefits: "Meus benefícios",
            lockedBenefits: "Benefícios bloqueados",
        },

        states: {
            loadingBenefits: "Carregando benefícios...",
            noBenefits: "Nenhum benefício desbloqueado ainda.",
            noLocked: "Nenhum marco bloqueado.",
        },

        benefits: {
            titleWithLevel: "{{title}} (Lv.{{level}})",
        },

        locked: {
            unlocksAt: "Desbloqueia em Lv.{{level}}",
            unlocksAtWithPreview: "Desbloqueia em Lv.{{level}} · {{preview}}",
        },
    },

    auth: {
        title: "Autenticação",
        card: {
            title: "Minha autenticação",
            subtitle:
                "Para garantir a segurança da sua conta e dos seus ativos, recomendamos que você se autentique.",
        },
        rows: {
            faceAuthTitle: "Autenticação facial",
            faceAuthDesc: "Conclua o processo de autenticação primeiro.",
            faceAuthBtn: "Ir",

            bindPhoneTitle: "Vincular telefone",
            bindPhoneDesc: "Vincule seu telefone para proteger sua conta.",
            bindPhoneBtn: "Vincular",
        },
    },

    faceScan: {
        titles: {
            submitted: "Verificação enviada",
            verified: "Verificado",
            rejected: "Rejeitado",
            default: "Verificação facial",
        },

        permission: {
            title: "Permissão de câmera necessária",
            text: "Precisamos de acesso à sua câmera para concluir a verificação de pessoa real.",
            button: "Conceder permissão",
        },

        hints: {
            placeFace: "Posicione seu rosto dentro da moldura.",
            keepInside: "Mantenha seu rosto dentro da moldura.",
            moveCloser: "Aproxime-se da câmera.",
            moveBack: "Afaste um pouco.",
            centerFace: "Centralize seu rosto na moldura.",
            headStraight: "Mantenha a cabeça reta.",
            perfectHold: "Perfeito. Fique parado…",
            visibleLight: "Certifique-se de que seu rosto esteja visível com boa luz.",
            adjustLighting: "Ajuste a iluminação e mantenha seu rosto centralizado.",
            capturing: "Capturando…",
            uploading: "Enviando…",
            bottom:
                "Mantenha todo o seu rosto dentro da moldura. A captura ocorre automaticamente quando estiver alinhado.",
        },

        states: {
            waitTitle: "Aguarde aprovação",
            waitText:
                "Seu scan facial foi enviado. Nossa equipe vai revisar e aprovar sua solicitação.",
            autoChecking: "Verificando status automaticamente…",

            alreadyVerified: "Você já está verificado",
            closing: "Fechando automaticamente…",
            continue: "Continuar",

            notApproved: "Não aprovado",
            rejectedText:
                "Sua verificação foi rejeitada. Tente novamente com boa iluminação e um rosto bem visível.",
            rescan: "Refazer scan",

            checking: "Verificando o status da sua verificação…",
            tryAgain: "Tentar novamente",
        },

        errors: {
            loginFirst: "Faça login primeiro.",
            statusFailed: "Falha ao verificar status",
            captureFailed: "Falha ao capturar imagem. Tente novamente.",
            network: "Erro de rede/inesperado durante o scan.",
            imageTooLarge:
                "Falha no envio: imagem muito grande (413). Reduza a qualidade ou aumente os limites do servidor.",
            uploadFailed: "Falha no envio ({{code}}).",
        },
    },

    outfit: {
        title: "Meu look",

        tabs: {
            backpack: "Presentes da mochila",
            avatar: "Moldura de avatar",
            party: "Tema de festa",
        },

        states: {
            loading: "Carregando seus itens…",
        },

        actions: {
            retry: "Tentar novamente",
            equip: "Equipar",
            unequip: "Desequipar",
        },

        errors: {
            loginRequired: "Login obrigatório (gl_user_id não encontrado).",
            loadFailed: "Falha ao carregar os itens do look",
        },

        empty: {
            backpack: "Ainda não há presentes na mochila",
            avatar: "Ainda não há molduras de avatar",
            party: "Ainda não há temas de festa",
            hint:
                "Compre itens na loja. Esta página mostra apenas os itens que você possui (UserStoreItem).",
        },

        labels: {
            permanent: "Permanente",
            limited: "Limitado",
            expired: "Expirado",
            oneDayLeft: "Falta 1 dia",
            daysLeft: "Faltam {{count}} dias",

            owned: "Possuído",
            item: "Item",

            equipped: "Equipado",
            tapToUse: "Toque para equipar/desequipar",
        },
    },
    giftGallery: {
        title: "Galeria de presentes",
        states: {
            loading: "Carregando…",
        },
        errors: {
            notLoggedIn: "Usuário não encontrado, faça login novamente.",
            loadFailed: "Falha ao carregar a galeria de presentes.",
            network: "Erro de rede. Tente novamente.",
        },
        summary: {
            totalValue: "Valor total dos presentes",
            totalGifts: "{{count}} presentes",
            uniqueGifts: "{{count}} tipos",
        },
        actions: {
            goToPoints: "Ir para Pontos",
        },
        labels: {
            coins: "moedas",
            qtyLine: "x{{qty}} • {{unit}} moedas cada",
        },
        empty: "Ainda não recebeu presentes.",
    },

    followUs: {
        title: "Siga-nos",

        brandName: "Gold Live",
        tagline: "Comunidade global",

        hero: {
            subtitle:
                "Descubra conteúdo premium e conecte-se com pessoas do mundo inteiro.\nEntre nas comunidades abaixo e comece sua jornada social.",
        },

        sectionTitle: "Comunidades recomendadas",

        states: {
            loading: "Carregando comunidades…",
        },

        errors: {
            backendMissing:
                "Rota do backend não encontrada (usando links padrão). Se quiser controle via backend, adicione GET /api/public/follow-us.",
            linkTitle: "Erro de link",
            cannotOpen: "Não é possível abrir este link neste dispositivo.",
            openFailed: "Não foi possível abrir o link",
        },

        social: {
            facebook: "Facebook",
            youtube: "YouTube",
            instagram: "Instagram",
            tiktok: "TikTok",
            telegram: "Telegram",
            discord: "Discord",
            x: "X",
            community: "Comunidade",
        },
    },

    editProfile: {
        title: "Editar perfil",
        actions: { save: "Salvar", addTag: "Adicionar" },
        states: { loadingProfile: "Carregando dados do perfil..." },
        sections: { myProfile: "Meu perfil", interestTags: "Tags de interesse" },
        fields: {
            nickname: "Apelido",
            gender: "Gênero (Masculino/Feminino)",
            dob: "Data de nascimento",
            country: "País",
            selfIntro: "Autoapresentação",
        },
        placeholders: {
            enterNickname: "Digite o apelido",
            selectDate: "Selecionar data",
            writeBio: "Escreva algo sobre você",
            typeTag: "Digite uma tag",
        },
        helpers: {
            cannotModify: "[Não pode ser modificado]",
            noTags: "Nenhuma tag ainda. Adicione algumas abaixo.",
            longPressRemove: "Pressione e segure uma tag para remover.",
        },
        labels: {
            notSet: "Não definido",
            userFallback: "Usuário",
        },
        gender: { male: "Masculino", female: "Feminino", other: "Outro" },
        alerts: {
            notLoggedInTitle: "Não logado",
            loginAgainMsg: "Faça login novamente.",
            permissionNeededTitle: "Permissão necessária",
            permissionNeededMsg: "Permita acesso às fotos para escolher uma foto de perfil.",
            duplicateTagTitle: "Tag duplicada",
            duplicateTagMsg: "Você já adicionou esta tag.",
            savedTitle: "Salvo",
            savedMsg: "Perfil atualizado com sucesso.",
            loadFailedMsg: "Falha ao carregar perfil",
            updateFailedMsg: "Falha ao atualizar perfil",
            networkLoadMsg: "Erro de rede ao carregar o perfil.",
            networkSaveMsg: "Erro de rede ao salvar o perfil.",
            galleryFailedMsg: "Não foi possível abrir a galeria.",
        },
    },

    explore: {
        tabs: { following: "Seguindo", explore: "Explorar", new: "Novo", near: "Perto" },
        search: { placeholder: "Pesquisar", cancel: "Cancelar" },
        chips: { popular: "Popular", more: "Mais" },
        actions: { live: "Live" },
        states: {
            loadingCountries: "Carregando países...",
            refreshingList: "Atualizando lista de lives...",
            empty: "Nenhum host ao vivo encontrado. Tente mudar os filtros.",
        },
        errors: {
            loadCountries: "Falha ao carregar países",
            networkCountries: "Erro de rede ao carregar países",
            loadFeed: "Falha ao carregar feed de explorar",
            networkFeed: "Erro de rede ao carregar o feed",
        },
        alerts: {
            liveEndedTitle: "Live encerrada",
            liveEndedMsg: "Esta live já terminou.",
        },
        labels: {
            liveBadge: "LIVE",
            userFallback: "Usuário",
            viewers: "👀 {{count}}",
        },
    },

    guardMe: {
        title: "Guarde-me",
        actions: { goBack: "Voltar" },
        states: { loading: "Carregando…", empty: "Ninguém está te guardando ainda" },
        labels: { currentGuardian: "Seu guardião atual", tier: "Tier", ends: "Termina", started: "Iniciou" },
        errors: {
            missingUser: "userId ausente. Faça login novamente.",
            loadFailed: "Falha ao carregar",
        },
    },

    coins: {
        title: "Moedas",
        pointsTab: "Pontos",
        labels: {
            remainingCoins: "Moedas restantes",
            balanceAfter: "Saldo: {{balance}}",
            pkgCoins: "{{coins}} moedas",
            pkgId: "Pacote: {{id}}",
            coinsUnit: "MOEDAS",
        },
        actions: { topUp: "Recarregar", refresh: "Atualizar" },
        filters: { all: "Todos", topups: "Recargas", spent: "Gasto" },
        states: {
            loading: "Carregando…",
            empty: "Sem histórico",
            scrollMore: "Role para ver mais…",
            end: "Fim",
            loadingPackages: "Carregando pacotes…",
            noPackages: "Sem pacotes",
        },
        types: { topup: "Recarga", giftSent: "Presente enviado" },
        modal: {
            title: "Recarregar",
            note:
                "Nota: Esta recarga é apenas em modo de teste. Pagamentos reais serão adicionados mais tarde.",
        },
        alerts: {
            walletErrorTitle: "Erro na carteira",
            historyErrorTitle: "Erro no histórico",
            topupErrorTitle: "Erro na recarga",
            loginRequiredTitle: "Login obrigatório",
            topupFailedTitle: "Falha na recarga",
            successTitle: "Sucesso",
            addedCoinsMsg: "Adicionadas {{coins}} moedas",
        },
        errors: {
            loadWallet: "Falha ao carregar a carteira",
            loadHistory: "Falha ao carregar o histórico",
            loadMore: "Falha ao carregar mais",
            loadPackages: "Falha ao carregar os pacotes",
            topupFailed: "Falha na recarga",
        },
    },
    liveApplication: {
        title: "Aplicação de live",
        states: { loading: "Carregando..." },
        labels: { status: "Status:" },

        status: {
            none: "Nenhum",
            pending: "Pendente",
            approved: "Aprovado",
            rejected: "Rejeitado",
        },

        defaults: {
            liveTitle: "Minha Live",
            hostName: "Host",
        },

        rows: {
            faceAuthTitle: "Autenticação facial",
            faceAuthNeed: "Conclua o processo de autenticação primeiro.",
            livePhotoTitle: "Foto da live",
            livePhotoNeed: "Envie a capa da live novamente.",
            wealthTitle: "Nível de riqueza ≥ nível {{level}}",
            wealthSubtitle: "Seu nível: {{level}}",
            completed: "Concluído",
            uploaded: "Enviado",
        },

        actions: { goLive: "Ir ao vivo", applyOrComplete: "Aplicar / Concluir etapas" },

        errors: {
            loginRequired: "Login necessário",
            loadFailed: "Falha ao carregar status da live",
            network: "Erro de rede",
            notLoaded: "Status da live ainda não carregado.",
            submitFailed: "Falha ao enviar aplicação",
            submitNetwork: "Erro de rede ao enviar aplicação",
            startFailed: "Falha ao iniciar live",
            startNetwork: "Erro de rede ao iniciar live",
        },

        alerts: {
            wealthRequiredTitle: "Nível de riqueza necessário",
            wealthRequiredMsg: "Você precisa do nível {{level}}.",
            underReviewTitle: "Em análise",
            underReviewMsg: "Aguarde a aprovação do admin.",
            submittedTitle: "Enviado",
            submittedMsg: "Sua solicitação foi enviada. Aguarde a análise.",
            infoTitle: "Info",
            wealthInfoMsg: "Aumente o nível de riqueza gastando/enviando presentes etc.",
        },
    },

    // ✅ NEW: Home Feed
    homeFeed: {
        tabs: {
            following: "Seguindo",
            square: "Square",
            video: "Vídeo",
        },

        search: {
            squarePlaceholder: "Pesquisar posts, tópicos, usuários",
            videoPlaceholder: "Pesquisar vídeos, usuários",
        },

        time: {
            secondsAgo: "há {{count}}s",
            minutesAgo: "há {{count}} min",
            hoursAgo: "há {{count}} h",
            daysAgo: "há {{count}} d",
        },

        eventBanner: {
            title: "EVENTO DE TÓPICO DO FÃ-CLUBE",
            dateRange: "12/11/2025 - 18/11/2025 [UTC+8]",
        },

        alerts: {
            loginRequiredTitle: "Login necessário",
            loginToLikePosts: "Faça login para curtir posts.",
            loginToLikeVideos: "Faça login para curtir vídeos.",
        },

        following: {
            chips: {
                popular: "Popular",
                pakistan: "Paquistão",
                philippines: "Filipinas",
                more: "Mais",
            },
            empty: "Ainda não há salas ao vivo de pessoas que você segue.",
            errors: {
                loadFailed: "Falha ao carregar feed de seguindo",
                network: "Erro de rede ao carregar feed de seguindo",
            },
        },

        square: {
            hotTopics: "Tópicos em alta",
            more: "Mais >",
            noTopicsYet: "Ainda não há tópicos",
            emptySearch: "Nenhum resultado encontrado.",
            emptyFeed: "Ainda não há posts. Seja o primeiro a compartilhar algo!",
            hotBadge: "HOT",
            viewAllComments: "Ver todos os {{count}} comentários",
            errors: {
                loadFailed: "Falha ao carregar feed do Square",
                network: "Erro de rede ao carregar feed do Square",
            },
        },

        video: {
            states: {
                loadingVideos: "Carregando vídeos...",
                empty: "Ainda não há vídeos.",
            },
            actions: {
                share: "Compartilhar",
            },
            labels: {
                originalSound: "Som original",
            },
            tip: {
                title: "Dica",
                label: "Dica",
                msg: "Envio de presentes para vídeo pode ser adicionado depois (precisa de um modelo de transação no BD).",
            },
            errors: {
                loadFailed: "Falha ao carregar feed de vídeo",
                network: "Erro de rede ao carregar feed de vídeo",
                videoFailed: "Falha ao carregar vídeo",
                debugHint:
                    "Se ficar preto, verifique headers do servidor: Content-Type video/mp4 + Accept-Ranges bytes",
            },
        },
    },

    // ✅ NEW: Honor Wall
    honorWall: {
        title: "Mural de Honra",
        tabs: {
            data: "Dados",
            honor: "Mural de Honra",
        },
        states: {
            loading: "Carregando mural de honra...",
        },
        cards: {
            tagWall: "Mural de Tags",
            medalWall: "Mural de Medalhas",
            giftCollection: "Coleção de Presentes",
            vehicleWall: "Mural de Veículos",
            notObtained: "Ainda não obtido",
            countMore: "{{count}} >",
        },
    },

    // ✅ NEW: Host Live Room
    hostLiveRoom: {
        defaults: {
            liveTitle: "Minha Live",
            hostName: "Host",
        },
        states: {
            preparing: "Preparando sala ao vivo...",
            stopping: "Encerrando live...",
        },
        permission: {
            required: "Permissão de câmera necessária",
            grant: "Conceder permissão",
        },
        labels: {
            liveBadge: "LIVE",
            liveTitle: "Título da live",
        },
        placeholders: {
            liveTitle: "Digite o título da live...",
            chat: "Diga algo...",
        },
        actions: {
            goLive: "Ir ao vivo",
            stop: "Parar",
        },
        alerts: {
            stopTitle: "Parar live?",
            stopMsg: "Isso encerrará sua transmissão ao vivo.",
        },
        chat: {
            welcome: "Bem-vindo à sua sala ao vivo 👋",
            guest: "Visitante",
            line: "{{name}}: {{text}}",
            meLine: "Eu: {{text}}",
            system: "ℹ️ {{text}}",
        },
        errors: {
            cameraRequiredToGoLive: "❗ Permissão de câmera é necessária para iniciar a live.",
        },
        messages: {
            liveNow: "🔴 Você está AO VIVO agora!",
        },
    },

    // ✅ NEW: Hot Topics
    hotTopics: {
        title: "Tópicos em alta",
        tabs: {
            daily: "Diário",
            official: "Oficial",
            normal: "Normal",
        },
        labels: {
            hotCount: "HOT {{count}}",
        },
        empty: "Ainda não há tópicos nesta categoria.",
        errors: {
            loadFailed: "Falha ao carregar tópicos",
            network: "Erro de rede ao carregar tópicos",
        },
    },

    // ✅ NEW: Live Cover
    liveCover: {
        title: "Capa da live",
        card: {
            title: "Enviar foto de capa da live",
            subtitle: "Esta foto é usada como capa da sua live. Use boa iluminação e uma imagem nítida.",
        },
        states: {
            checking: "Verificando…",
            uploading: "Enviando sua capa da live…",
            checkingStatus: "Verificando status da sua capa…",
            uploaded: "Enviado com sucesso",
        },
        labels: {
            alreadyUploaded: "Você já enviou uma capa da live.",
            preview: "Prévia",
            selectCover: "Selecionar imagem de capa",
            cameraSide: "Câmera: {{side}}",
            front: "Frontal",
            back: "Traseira",
        },
        actions: {
            change: "Alterar",
            upload: "Enviar",
            uploadCover: "Enviar capa",
            camera: "Câmera",
            gallery: "Galeria",
        },
        alerts: {
            permissionNeededTitle: "Permissão necessária",
            galleryPermissionMsg: "Permita acesso à galeria.",
            cameraPermissionMsg: "Permita acesso à câmera.",
        },
        errors: {
            loginRequired: "Login necessário",
            loadFailed: "Falha ao carregar status",
            network: "Erro de rede",
            selectPhotoFirst: "Selecione uma foto primeiro.",
            imageTooLarge: "Imagem muito grande (413). Tente outra foto.",
            uploadFailed: "Falha no envio ({{code}})",
            uploadFailedGeneric: "Falha no envio",
            noImageReturned: "Nenhuma imagem retornada.",
            cameraNoImage: "A câmera não retornou imagem.",
            cannotReadBase64: "Não foi possível ler a imagem em base64. Tente outra imagem.",
            openGalleryFailed: "Falha ao abrir a galeria",
            openCameraFailed: "Falha ao abrir a câmera",
            androidEmulatorHint: "Se estiver no emulador Android: a câmera geralmente não funciona. Tente um dispositivo real.",
        },
    },

    vipCenter: {
        title: "Central VIP",
        states: {
            loading: "Carregando VIP...",
        },
        current: {
            none: "Atual: Sem VIP",
            active: "Atual: {{name}} • {{days}} dias restantes",
        },
        labels: {
            perMonth: "/M",
            defaultDescription: "Seja VIP e aproveite privilégios",
            privilegesCount: "Privilégios exclusivos VIP {{count}}/{{total}}",
        },
        actions: {
            open: "Ativar {{name}}",
        },
        alerts: {
            purchaseTitle: "Compra VIP",
            purchaseMsg: "Iniciar fluxo de compra para {{tier}}.",
        },
    },

    topicDetail: {
        states: {
            empty: "Ainda não há momentos neste tópico.",
        },
        errors: {
            loadFailed: "Falha ao carregar feed do tópico",
            network: "Erro de rede ao carregar feed do tópico",
        },
        alerts: {
            loginRequiredTitle: "Login necessário",
            loginRequiredMsg: "Faça login para curtir posts.",
            likeFailedTitle: "Erro",
            likeFailedMsg: "Não foi possível curtir este post agora.",
        },
    },

    visitProfile: {
        titleFallback: "Perfil",
        labels: {
            id: "ID: {{id}}",
            followers: "Seguidores",
            following: "A seguir",
        },
        actions: {
            follow: "Seguir",
            following: "A seguir",
            pleaseWait: "Por favor, aguarde...",
            unblock: "Desbloquear",
        },
        states: {
            notFound: "Utilizador não encontrado.",
            noMoments: "Ainda não há momentos.",
            blockedChip: "Bloqueaste este utilizador",
            blockedBody: "Bloqueaste este utilizador. Desbloqueia para ver os momentos.",
        },
        menu: {
            title: "Opções",
            blockTitle: "Bloquear utilizador",
            blockMsg:
                "Já não verás o conteúdo dele e ele poderá não conseguir interagir contigo.",
            block: "Bloquear",
            unblock: "Desbloquear",
        },
        alerts: {
            loginRequired: "Início de sessão obrigatório.",
            loginToBlock: "Início de sessão obrigatório para bloquear utilizadores.",
            blockedTitle: "Bloqueado",
            blockedFollowMsg: "Desbloqueia este utilizador primeiro para seguir.",
            navigationErrorTitle: "Erro de navegação",
            profileTabMissing:
                "Separador de Perfil não encontrado. Certifica-te de que as tuas tabs inferiores têm 'Perfil'.",
            errorTitle: "Erro",
        },
        errors: {
            blockFailed: "Falha ao bloquear o utilizador",
            unblockFailed: "Falha ao desbloquear o utilizador",
        },
    },

    realPersonAuth: {
        title: "Autenticação",
        hero: {
            title: "A verificação de pessoa real começará em breve.",
            subtitle: "Certifique-se de que você é o usuário",
        },
        tips: {
            avoidCover: "Evite cobrir",
            enoughLight: "Tenha luz suficiente",
            minorsProhibited: "Menores são proibidos",
        },
        actions: {
            start: "Iniciar verificação",
        },
    },

    postMoment: {
        title: "Postar momentos",
        actions: {
            post: "Postar",
            posting: "Postando...",
            refresh: "Atualizar",
        },
        labels: {
            postingTo: "Postando em #{{topic}}",
            recommended: "Tópicos recomendados",
        },
        placeholders: {
            input: "Diga algo para registrar este momento...",
        },
        sheets: {
            title: "Adicionar",
            message: "Escolha o tipo de mídia",
            addPhotos: "Adicionar fotos",
            addVideos: "Adicionar vídeos",
        },
        permissions: {
            title: "Permissão necessária",
            libraryMsg: "Permita acesso para poder enviar.",
            cameraMsg: "Permita acesso à câmera.",
        },
        alerts: {
            nothingTitle: "Nada para postar",
            nothingMsg: "Escreva algo ou adicione uma foto/vídeo.",
            notLoggedInTitle: "Não logado",
            notLoggedInMsg: "Faça login novamente.",
            errorTitle: "Erro",
            postFailed: "Falha ao postar momento.",
            postedTitle: "Postado",
            postedVideo: "Seu vídeo aparecerá na aba Vídeo.",
            postedSquare: "Seu post aparecerá no Square.",
        },
        errors: {
            notLoggedIn: "Não logado",
            uploadFailed: "Falha no envio",
            uploadEmpty: "O envio retornou URL vazia",
            networkPost: "Erro de rede ao postar momento.",
        },
        recommendedFallback: [
            "#Rocket Host Video Collection",
            "#Outfit Of The Day(OOTD)",
            "#Everyday life",
            "#SHOW YOURSELF",
            "#Topics you are interested in",
            "#The most beautiful travel photos",
            "#Recommend a movie",
            "#My hobby",
        ],
    },

    points: {
        title: "Pontos",
        coinsTab: "Moedas",
        actions: {
            details: "Detalhes",
            withdraw: "Sacar agora",
            exchange: "Trocar pontos por moedas",
            exchanging: "Trocando...",
            refresh: "Atualizar",
        },
        labels: {
            available: "Pontos disponíveis",
            total: "Total: {{count}}",
            unconfirmed: "Não confirmados: {{count}}",
            income: "Receita",
            last30: "Últimos 30 dias",
        },
        income: {
            livestream: "Transmissão ao vivo",
            party: "Festa",
            platformRewards: "Recompensas da plataforma",
        },
        states: {
            loading: "Carregando…",
        },
        hints: {
            exchangeRate:
                "A taxa de troca pode ser alterada mais tarde no backend (POINTS_PER_COIN).",
        },
        alerts: {
            errorTitle: "Erro",
            successTitle: "Sucesso",
            loginRequiredTitle: "Login obrigatório",
            loginRequiredMsg: "Faça login novamente.",
            detailsSoon: "A tela de detalhes será adicionada em breve.",
            withdrawSoon: "O recurso de saque será adicionado em breve.",
            exchangeFailedTitle: "Falha na troca",
            exchangeSuccessMsg: "Trocou {{points}} pontos → {{coins}} moedas.",
        },
        errors: {
            loadFailed: "Falha ao carregar os pontos",
            exchangeFailed: "Falha ao trocar pontos",
        },
        ranges: {
            title: "Selecionar período",
            last7: "Últimos 7 dias",
            last30: "Últimos 30 dias",
            last90: "Últimos 90 dias",
        },
        withdraw: {
            title: "Sacar pontos",
            available: "Disponíveis: {{points}} pontos",
            fields: {
                points: "Pontos para sacar",
                method: "Método",
                account: "Detalhes da conta",
            },
            placeholders: {
                account: "ex.: 03xx-xxxxxxx / IBAN / Nome da conta",
            },
            actions: {
                submit: "Enviar solicitação",
                submitting: "Enviando...",
            },
            note:
                "As solicitações de saque vão para o admin para aprovação. Os pontos podem ficar retidos até o processamento.",
            alerts: {
                successTitle: "Enviado",
                successMsg: "Sua solicitação de saque foi enviada.",
                failedTitle: "Falha no saque",
            },
            errors: {
                invalidPoints: "Digite uma quantidade válida de pontos.",
                accountRequired: "Informe os detalhes da conta.",
                failed: "Não foi possível enviar a solicitação de saque.",
            },
        },
        details: {
            title: "Detalhes de pontos",
            intro: "Veja como os pontos funcionam na plataforma:",
            lines: {
                available:
                    "Pontos disponíveis são os pontos que você pode trocar ou sacar.",
                unconfirmed:
                    "Pontos não confirmados ainda estão sendo verificados e podem mudar.",
                total:
                    "Pontos totais incluem disponíveis + não confirmados.",
                income:
                    "Receita mostra de onde vieram seus pontos no período selecionado.",
                exchange:
                    "Trocar converte pontos em moedas. A taxa pode mudar conforme as regras da plataforma.",
                withdraw:
                    "Solicitações de saque são revisadas antes do pagamento. Verifique se os dados da sua conta estão corretos.",
            },
            footer:
                "Se você tiver algum problema, entre em contato com o suporte na tela de Perfil.",
        },
    },
    momentComments: {
        title: "Momentos de {{owner}}",
        empty: "Ainda não há comentários. Seja o primeiro a responder!",
        placeholder: "Escreva um comentário...",
    },

    myGuardian: {
        title: "Meu guardião",
        empty: "Você ainda não guardou ninguém.",
        actions: {
            goBack: "Voltar",
        },
        card: {
            meta: "Tier: {{tier}} • Termina: {{ends}}",
        },
        errors: {
            missingUserId: "userId ausente. Faça login novamente.",
            loadFailed: "Falha ao carregar",
        },
    },

    myProfile: {
        tabs: {
            posts: "Posts",
        },
        items: {
            giftGallery: "Galeria de presentes",
            contribution: "Contribuição",
        },
        sections: {
            personalInfo: "Informações pessoais",
        },
        labels: {
            idLine: "ID: {{id}}",
            followingFollowers: "Seguindo {{following}} · Seguidores {{followers}}",
            fansCount: "{{count}} Fãs",
            lit: "Lit: {{current}}/{{total}}",
            participantsRank: "Participantes no ranking: {{count}}",
        },
        defaults: {
            bio: "Ela/Ele foi preguiçoso e não deixou nada para trás.",
        },
        alerts: {
            waitTitle: "Aguarde",
            profileLoadingMsg: "O perfil ainda está carregando.",
        },
    },

    notificationsInbox: {
        postOwnerName: "Post",
        inboxSearchPlaceholder: "Pesquisar notificações...",
    },

    party: {
        tabs: {
            following: "Seguindo",
            party: "Party",
        },
        search: {
            placeholder: "Pesquisar salas de party",
        },
        filters: {
            popular: "Popular",
            pakistan: "Paquistão",
            philippines: "Filipinas",
            more: "Mais",
        },
        labels: {
            defaultTag: "Party",
        },
        states: {
            empty: "Nenhuma sala encontrada. Tente mudar o filtro ou pesquisar.",
        },
        errors: {
            loadFailed: "Falha ao carregar salas de party",
            network: "Erro de rede ao carregar salas de party",
        },
    },
};
