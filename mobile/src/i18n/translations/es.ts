// src/i18n/es.ts
export default {
 common: {
    ok: "OK",
    cancel: "Cancelar",
    loading: "...",
    loadingText: "Cargando…",

    error: "Error",
    success: "Éxito",
    done: "Hecho",
    failed: "Falló",

    edit: "Editar",
    block: "Bloquear",
    remove: "Eliminar",
    you: "Tú",

    sendCode: "Enviar código",
    verifyAndBind: "Verificar y vincular",
    bind: "Vincular",
    unbind: "Desvincular",
    changePhoneNumber: "Cambiar número de teléfono",
    userFallback: "Usuario",

    codeSent: "Código enviado",
  },

  errors: {
    userNotFound: "Usuario no encontrado, por favor inicia sesión de nuevo.",
    updateFailed: "No se pudo actualizar el idioma.",
  },

  settings: {
    title: "Ajustes",
    versionText: "1.0.0 (Gold Live)",

    items: {
      accountAndSecurity: "Cuenta y seguridad",
      securityPassword: "Contraseña de seguridad",
      languageSetting: "Configuración de idioma",

      blacklist: "Lista de bloqueados",
      privilegeSettings: "Configuración de privilegios",
      newMessagesNotification: "Notificación de nuevos mensajes",
      privacy: "Privacidad",

      version: "Versión",
      aboutGoldLive: "Acerca de Gold Live",
      clearCache: "Borrar caché",
    },

    security: {
      levelPrefix: "Nivel de seguridad:",
      levelLow: "Bajo",
      levelMedium: "Medio",
      levelHigh: "Alto",
    },

    actions: {
      clearCacheTitle: "Borrar caché",
      clearCacheMsg: "Caché de la app borrada (esto no cierra sesión).",

      switchAccountTitle: "Cambiar cuenta",
      switchAccountMsg: "¿Quieres cambiar de cuenta?",
      switch: "Cambiar",
      switchAccountBtn: "Cambiar cuenta",

      logoutTitle: "Cerrar sesión",
      logoutMsg: "¿Seguro que quieres cerrar sesión?",
      logout: "Cerrar sesión",
      logoutBtn: "Cerrar sesión",
    },

    language: {
      title: "Configuración de idioma",
      followSystem: "Seguir el sistema",
      english: "English",
      traditionalChinese: "繁體中文",
      arabic: "العربية",
      urdu: "اردو",
      portuguese: "Português",
      spanish: "Español",
    },
  },

  accountSecurity: {
    title: "Cuenta y seguridad",
    levelText: "Tu nivel de seguridad de cuenta es {{level}}.",
    tip: "Vincular un número móvil o un correo puede aumentar tu nivel de seguridad.",

    rows: {
      setPassword: "Establecer contraseña",
      phoneNumber: "Número de teléfono",
      email: "Correo electrónico",
      google: "Google",
      facebook: "Facebook",
      instagram: "Instagram",
      tiktok: "TikTok",
      deviceManagement: "Gestión de dispositivos",
    },

    trailing: {
      modify: "Modificar",
      set: "Establecer",
      bound: "Vinculado",
      bind: "Vincular",
    },

    cancel: {
      title: "Cancelar cuenta",
      msg: "El flujo de cancelación de cuenta se implementará más adelante.",
      button: "Cancelar cuenta",
    },
  },

  securityPassword: {
    title: "Contraseña de seguridad",

    fields: {
      current: "Contraseña actual",
      new: "Nueva contraseña",
      confirm: "Confirmar nueva contraseña",
    },

    actions: {
      save: "Guardar",
      saving: "Guardando...",
    },

    errors: {
      title: "Error",
      enterNew: "Por favor, introduce la nueva contraseña.",
      mismatch: "La nueva contraseña y la confirmación no coinciden.",
      updateFailed: "No se pudo actualizar la contraseña",
      network: "Error de red, inténtalo de nuevo.",
    },

    success: {
      title: "Éxito",
      msg: "Contraseña actualizada correctamente.",
    },
  },

  bindPhone: {
    title: "Vincular teléfono",
    subtitle:
      "Vincula tu número móvil para proteger tu cuenta de Gold Live y facilitar el inicio de sesión.",
    currentBoundLabel: "Teléfono vinculado actualmente:",

    sections: {
      enterPhone: "Introduce el teléfono",
      enterCode: "Introduce el código",
    },

    labels: {
      sentTo: "Enviado a: {{phone}}",
    },

    placeholders: {
      phone: "Introduce tu número de teléfono",
      code: "Código de verificación",
    },

    alerts: {
      codeSentMsg: "Enviamos un código a {{phone}}.",
      devCode: "CÓDIGO DEV: {{code}}",
      successMsg: "Teléfono vinculado correctamente.",
    },

    terms: {
      prefix: "He leído y acepto los ",
      tos: "Términos de servicio de Gold Live",
      and: " y la ",
      privacy: "Política de privacidad",
      suffix: ".",
    },
  },

  bindEmail: {
    title: "Vincular correo",
    currentBoundLabel: "Correo vinculado actualmente:",
    noBoundYet: "Aún no hay correo vinculado.",

    labels: {
      email: "Correo electrónico",
      code: "Código de verificación",
    },

    placeholders: {
      email: "Introduce tu correo",
      code: "Introduce el código",
    },

    alerts: {
      codeSentMsg: "Enviamos un código a {{email}}.",
      devCode: "CÓDIGO DEV: {{code}}",
      successMsg: "Correo vinculado correctamente.",
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
      notBound: "Aún no está vinculado.",
      currentlyBound: "Vinculado actualmente: {{id}}",
    },

    tempBackendHint:
      "Vinculación temporal por backend (reemplazar con OAuth más adelante). Introduce el id de {{provider}}:",

    placeholders: {
      google: "googleId (de OAuth más adelante)",
      facebook: "facebookId (de OAuth más adelante)",
      instagram: "instagramId (de OAuth más adelante)",
      tiktok: "tiktokId (de OAuth más adelante)",
    },

    alerts: {
      loadFailed: "No se pudo cargar el estado de vinculación",
      boundSuccess: "{{provider}} vinculado correctamente.",
      unboundSuccess: "{{provider}} desvinculado.",
    },
  },

  deviceManagement: {
    title: "Gestión de dispositivos",

    labels: {
      empty: "Aún no hay información de dispositivos.",
      unknownDevice: "Dispositivo desconocido",
      lastActiveTime: "Última actividad: {{time}}",
      friendlyName: "Dispositivo {{platform}}",
    },

    badges: {
      current: "Dispositivo actual",
      trusted: "Confiar en el dispositivo",
    },

    errors: {
      notLoggedIn: "No has iniciado sesión. Inicia sesión de nuevo.",
      loadFailed: "No se pudieron cargar los dispositivos.",
      network: "Error de red al cargar los dispositivos.",
    },
  },

  blacklist: {
    title: "Lista de bloqueados",
    searchPlaceholder: "Introduce el ID o nombre de usuario",
    empty: "No hay usuarios bloqueados",

    labels: {
      id: "ID: {{id}}",
    },

    errors: {
      addFailed: "No se pudo añadir a la lista de bloqueados.",
    },
  },

  privilegeSettings: {
    title: "Configuración de privilegios",
    items: {
      invisibleVisitor: {
        label: "Visitante invisible",
        description:
          "Visita a otros sin dejar registro, y los demás tampoco pueden ver quién visitó la página de inicio.",
      },
      mysteryLive: {
        label: "Hombre misterioso en la sala EN VIVO",
        description: "Solo el receptor del regalo puede ver tu identidad en las salas EN VIVO.",
      },
      mysteryRank: {
        label: "Hombre misterioso en el ranking",
        description: "Tus regalos no aparecerán en el ranking de fans del anfitrión.",
      },
      invisibleOnline: {
        label: "En línea invisible",
        description:
          "Mantén siempre un estado invisible; entra en salas de transmisión en vivo de forma invisible.",
      },
      exclusiveEmail: {
        label: "Notificación exclusiva por correo",
        description:
          "Recibe notificaciones exclusivas por correo después de que el soporte responda.",
      },
      hideLiveLevel: {
        label: "Ocultar nivel de livestream",
        description:
          "Al activarlo, otros no podrán ver tu nivel de livestream en tu perfil.",
      },
    },
  },

  newMessageNotification: {
    title: "Notificaciones",
    searchPlaceholder: "Buscar configuración de notificaciones",
    inboxSearchPlaceholder: "Buscar notificaciones...",

    sections: {
      notificationsList: "Lista de notificaciones",
      searchResults: "Resultados de búsqueda",
      notificationSettings: "Configuración de notificaciones",
    },

    actions: {
      markAllRead: "Marcar todo como leído",
    },

    empty: "Aún no hay notificaciones.",

    errors: {
      missingUserId: "Falta userId en AsyncStorage ({{key}})",
      loadFailed: "No se pudieron cargar las notificaciones",
      network: "Error de red al cargar notificaciones",
    },

    debugLine: "uid: {{uid}} • total: {{total}} • no leídas: {{unread}}",

    settings: {
      liveAlerts: "Alertas de apertura de sala en vivo",
      messageSwitch: "Interruptor de notificación de mensajes",
      sound: "Sonido",
      vibrate: "Vibración",
      mutualFollowers: "Seguidores mutuos",
      myFollowing: "A quién sigo",
      stranger: "Desconocido",
    },
  },

  privacySettings: {
    title: "Privacidad",

    sections: {
      livePrivacy: "Privacidad de live",
      permissionPrivacy: "Privacidad de permisos",
    },

    items: {
      hideMicStatus: "Ocultar estado del micrófono",
    },

    trailing: {
      on: "Activado",
      goSettings: "Ir a ajustes",
    },

    errors: {
      openSettingsFailed: "No se pueden abrir los ajustes del sistema en este dispositivo.",
    },

    permissions: {
      camera: {
        label: "Permitir que Gold Live acceda a tu cámara",
        subLabel: "Para tomar fotos, grabar vídeos, etc.",
      },
      voice: {
        label: "Permitir que Gold Live acceda a tus mensajes de voz",
        subLabel: "Para grabación de vídeo y envío de voz, etc.",
      },
      notifications: {
        label: "Permitir que la plataforma obtenga tu permiso de notificaciones",
        subLabel: "Para alertas de mensajes no leídos, etc.",
      },
      bluetooth: {
        label: "Permitir que la plataforma acceda a tus permisos de Bluetooth.",
        subLabel: "Conecta auriculares Bluetooth y garantiza el correcto funcionamiento.",
      },
      location: {
        label: "Permitir que la plataforma obtenga permiso de ubicación",
        subLabel: "Se usa para encontrar streamers cercanos.",
      },
    },
  },

  aboutGoldLive: {
    title: "Acerca de Gold Live",
    versionText: "GOLD LIVE 1.0.0",

    items: {
      privacyPolicy: "Política de privacidad",
      termsOfService: "Términos de servicio",
      liveAgreement: "Acuerdo de live",
      userRechargeAgreement: "Acuerdo de recarga del usuario",
      noChildEndangermentPolicy: "Política de no poner en peligro a menores",
    },

    alerts: {
      comingSoon: "La página {{label}} se añadirá más adelante para Gold Live.",
    },
  },

  ranking: {
    title: "Ranking",
    tabs: { host: "Host", rich: "Rico", gift: "Regalo" },
    period: { daily: "Diario", weekly: "Semanal", monthly: "Mensual" },
    filters: {
      region: "Región",
      periodLabel: "{{period}}: {{range}}",
    },
    datePicker: {
      selectDate: "Seleccionar fecha",
      done: "Hecho",
    },
    states: {
      loading: "Cargando ranking...",
      retry: "Reintentar",
    },
    errors: {
      loadFailed: "No se pudo cargar el ranking",
      network: "Error de red al cargar el ranking",
    },
    labels: {
      id: "ID: {{id}}",
      userFallback: "Usuario",
    },
    distance: {
      label: "La distancia para subir en el ranking es: {{distance}}",
      top: "Estás en la cima (o no hay un ranking superior disponible).",
    },
  },

  reward: {
    title: "Recompensa",
    banner: {
      title: "Tareas del host y recompensas",
      subtitle: "Completa tareas diarias y semanales para ganar más puntos.",
    },
    tabs: {
      pkMission: "Misión PK",
      activity: "Actividad",
      fanClub: "Club de fans",
      invite: "Invitar",
    },
    pk: {
      todayRecord: "Registro de PK de hoy",
      recordLink: "Registro PK >>",
      highestStreak: "Mayor racha efectiva de victorias",
      effectiveWins: "Victorias efectivas",
    },
    states: {
      loading: "Cargando tareas...",
      empty: "Aún no hay tareas configuradas.",
    },
    errors: {
      notLoggedIn: "No has iniciado sesión.",
      loadFailed: "No se pudieron cargar las tareas de recompensa.",
      network: "Error de red al cargar las tareas de recompensa.",
    },
    actions: {
      go: "IR",
      confirm: "Confirmar",
    },
    rule: {
      title: "Regla de recompensas",
      daily: "Tareas diarias: se actualizan diariamente a las 00:00:00 (UTC+8).",
      weekly: "Tareas semanales: se actualizan cada lunes a las 00:00:00 (UTC+8).",
    },
  },

 store: {
    title: "Tienda",
    popular: "Popular",
    states: {
      loading: "Cargando tienda…",
      empty: "No se encontraron artículos",
    },
    actions: {
      refresh: "Actualizar",
      all: "Ver todo >",
      recharge: "Recargar",
    },
    labels: {
      coins: "Monedas",
      preview: "Vista previa",
      balance: "Tu saldo",
      balanceHint: "Recarga monedas para comprar artículos de la tienda al instante.",
      durationDays: "{{days}} días",
      permanent: "Permanente",
    },
    errors: {
      missingUser: "Falta userId. Por favor inicia sesión de nuevo.",
    },
    purchase: {
      confirmTitle: "Confirmar compra",
      confirmMsg: "¿Comprar \"{{title}}\" por {{price}} monedas?",
      successTitle: "Comprado",
      successMsg: "El artículo se ha añadido a tu cuenta.",
      failedTitle: "Compra fallida",
      failedMsg: "Por favor, inténtalo de nuevo.",
      insufficientTitle: "No hay suficientes monedas",
      insufficientMsg: "Recarga monedas para comprar este artículo.",
      actions: {
        buy: "Comprar ahora",
        buying: "Comprando...",
        recharge: "Recargar",
      },
    },},

  invite: {
    title: "Bono de invitación",
    tabs: {
      myRewards: "Mis recompensas",
      incomeRank: "Ranking de ingresos",
    },
    banner: {
      small: "Invita a alguien",
      title: "Gana recompensas invitando amigos",
      subtitle:
        "Comparte tu enlace o código de invitación. Contaremos tus invitados automáticamente.",
    },
    stats: {
      claimed: "Recompensas reclamadas",
      invitees: "Número de invitados",
      availableToday: "Disponible para hoy: {{count}}",
    },
    list: {
      title: "Invitaciones de los últimos 7 días ({{count}})",
      more: "Más >",
      loading: "Cargando…",
      empty: "Aún no hay invitaciones",
      myCode: "Mi código: {{code}}",
      linkPlaceholder: "Enlace de invitación no listo (toca actualizar)",
    },
    qr: {
      title: "Escanea para unirte",
    },
    actions: {
      receive: "Recibir",
      inviteNow: "Invitar ahora",
      share: "Compartir",
      copyLink: "Copiar enlace",
    },
    alerts: {
      errorTitle: "Error de invitación",
      loadFailed: "No se pudieron cargar los datos de invitación",
      inviteTitle: "Invitar",
      codeNotReady: "Código de invitación no listo. Toca actualizar.",
      linkNotReady: "Enlace de invitación no listo. Toca actualizar.",
      clipboardNotReadyTitle: "Portapapeles no disponible",
      clipboardNotReadyMsg:
        "El módulo de portapapeles no está en tu Dev Client. Reconstruye el Dev Client para habilitar copiar.",
      copiedTitle: "Copiado",
      codeCopied: "Código de invitación copiado",
      linkCopied: "Enlace de invitación copiado",
      soonTitle: "Pronto",
      receiveSoon:
        "El canje se habilitará cuando se agreguen las reglas de recompensa de invitación.",
      inviteCodeMissing: "Falta el código de invitación en la respuesta del backend",
    },
    badge: {
      registered: "Registrado",
      qualified: "Calificado",
      rewarded: "Recompensado",
    },
    labels: {
      userFallback: "Usuario",
    },
    shareMessage: "Únete conmigo en Gold Live 🎥\nUsa mi código de invitación: {{code}}\n{{link}}",
  },

  guardian: {
    defaultTitle: "Abrir Guardián",

    metaLine: "Planes: {{activePlans}}/{{totalPlans}} • Paquetes: {{activePackages}}",

    errors: {
      missingUser: "Falta userId. Inicia sesión de nuevo.",
      missingUserShort: "Falta userId",
      selectUser: "Primero selecciona un usuario para proteger",
      selectDuration: "Primero selecciona la duración",
      activateFailed: "Falló la activación",
      apiNonJson: "La API devolvió contenido no JSON. Vista previa: {{preview}}",
      plansExistEmpty:
        "Existen planes pero devolvieron vacío. Verifica paquetes activos para planes activos.",
    },

    labels: {
      noUserSelected: "Ningún usuario seleccionado",
      tierLine: "Guardián {{tier}}",
    },

    sections: {
      guardSomeone: "Quiero proteger a alguien",
      coinsNeeded: "Monedas necesarias: {{coins}}",
      privileges: "Privilegios del guardián",
      noPrivileges: "No hay privilegios configurados.",
    },

    links: {
      myGuardian: "Mi guardián",
      guardingCount: "Estás protegiendo: {{count}}",
      guardMe: "Protégeme",
      guardMeNone: "Aún nadie te protege",
      guardMeWith: "Guardián: {{name}}",
    },

    actions: {
      select: "Seleccionar",
      activate: "Activar Guardián {{tier}}",
      activating: "Activando...",
      refresh: "Actualizar",
      search: "Buscar",
    },

    picker: {
      title: "Seleccionar usuario",
      placeholder: "Buscar usuario o apodo...",
      empty: "Escribe al menos 2 caracteres y busca.",
    },

    empty: {
      title: "No se encontraron planes",
      hint:
        "Esto significa que la API devolvió 0 planes activos (isActive=true). Revisa guardianPlan + paquetes.",
    },
  },

  fanClub: {
    title: "Club de fans",
    topTabs: { fanClub: "Club de fans", fanGroup: "Grupo de fans" },
    subTabs: { joined: "Clubes a los que me uní", my: "Mi club" },
    empty: "No hay más datos",
    frozenLink: "Club de fans congelado >",
  },

  medalWall: {
    title: "Muro de medallas",
    obtain: "Obtenidas: {{obtained}}/{{total}}",
    loading: "Cargando...",
    level: "Nivel: {{level}}",
    achievementTitle: "Medalla de logro",
    unlocked: "Desbloqueada",
    empty:
      "No se encontraron medallas. Agrega medallas en la BD (HonorItem tipo MEDAL) o asegúrate de que la API devuelva medallas calculadas.",
    errors: {
      missingUserId: "Falta userId. Pasa { userId } al navegar a MedalWall.",
      loadFailed: "No se pudieron cargar las medallas",
    },
  },

  profile: {
    header: {
      title: "Yo",
    },

    loggedOut: {
      title: "Has cerrado sesión",
      subtitle: "Inicia sesión de nuevo para ver tu perfil.",
    },

    states: {
      loading: "Cargando perfil...",
      retry: "Reintentar",
    },

    errors: {
      notLoggedIn: "No has iniciado sesión.",
      loadFailed: "No se pudo cargar el perfil.",
      network: "Error de red al cargar el perfil.",
    },

    labels: {
      guest: "Invitado",
      online: "En línea",

      id: "ID {{id}}",

      vipLevel: "VIP {{level}}",
      levelShort: "NV.{{level}}",

      level: "Nivel: {{level}}",
      coins: "Monedas",
      followers: "Seguidores",
      following: "Siguiendo",
      likes: "Me gusta",
      visits: "Visitas",
    },

    completion: {
      text: "Tu perfil está {{completion}}% completo. Termínalo para hacer amigos más fácil en Gold Live.",
    },

    stats: {
      friends: "Amigos",
      following: "Siguiendo",
      followers: "Seguidores",
      visitors: "Visitantes",
    },

    wallet: {
      coins: "Monedas",
      points: "Puntos",
    },

    vipCard: {
      cta: "VIP • Mejora a VIP y disfruta beneficios exclusivos",
    },

    notice: {
      title: "AVISO",
      subtitle: "Normas de conducta del usuario y actividades prohibidas en Gold Live.",
    },

    tiles: {
      reward: "Recompensa",
      ranking: "Ranking",
      store: "Tienda",
      invite: "Invitar",
      guardian: "Guardián",
      fanClub: "Club de fans",
      medalWall: "Muro de medallas",
    },

    rows: {
      liveData: "Datos de live",
      help: "Ayuda",
      myAgency: "Mi agencia",
      level: "Nivel",
      auth: "Autenticación",
      backpack: "Mochila",
      followUs: "Síguenos",
    },

    actions: {
      editProfile: "Editar perfil",
      editAvatar: "Editar foto de perfil",
      copyId: "Copiar ID",
      shareProfile: "Compartir perfil",
      follow: "Seguir",
      following: "Siguiendo",
      message: "Mensaje",

      goToLogin: "Ir a iniciar sesión",
      view: "Ver >",
    },

    menu: {
      ranking: "Ranking",
      reward: "Recompensa",
      store: "Tienda",
      invite: "Bono de invitación",
      guardian: "Abrir Guardián",
      fanClub: "Club de fans",
      medalWall: "Muro de medallas",
      settings: "Ajustes",
      about: "Acerca de Gold Live",
      logout: "Cerrar sesión",
    },

    alerts: {
      copiedTitle: "Copiado",
      idCopied: "ID de usuario copiado",
      comingSoonTitle: "Pronto",
      comingSoonMsg: "Esta función se añadirá más adelante.",

      missingUserTitle: "Falta usuario",
      missingUserMsg: "Inicia sesión de nuevo.",
    },
  },

  /* ✅ NEW: Live data screen */
  liveData: {
    tabs: {
      live: "Datos de live",
      pk: "Datos de PK",
    },

    range: {
      daily: "Datos diarios",
      weekly: "Datos semanales",
      monthly: "Datos mensuales",
    },

    stats: {
      wonPoints: "Puntos ganados",
      liveDuration: "Duración de la live",
      liveEarnings: "Ganancias de la live",
      partyDuration: "Duración de la party",
      partyEarnings: "Ganancias de la party",
      partyCrownDuration: "Duración de la corona en party",
      newFans: "Número de nuevos fans",
      newFanClubMembers: "Nuevos miembros del club de fans",

      avgOnline: {
        daily: "Número promedio de usuarios en línea hoy",
        weekly: "Número promedio de usuarios en línea esta semana",
        monthly: "Número promedio de usuarios en línea este mes",
      },
    },

    actions: {
      getMorePoints: "Conseguir más puntos",
      contribution: "Contribución",
    },

    help: {
      title: "Descripción",
      line1: "1. El ciclo de liquidación es 00:00:00–23:59:59 en UTC+8.",
      confirm: "Confirmar",
    },

    errors: {
      notLoggedIn: "No has iniciado sesión.",
      loadFailedLive: "No se pudieron cargar los datos de live.",
      loadFailedPk: "No se pudieron cargar los datos de PK.",
      emptyResponse: "Respuesta vacía del servidor.",
    },

    pk: {
      tabs: {
        random: "PK aleatorio",
        friend: "PK con amigo",
        team: "PK en equipo",
      },
      range: {
        today: "Hoy",
        recent7: "Últimos 7 días",
        monthly: "Mensual",
      },
      cards: {
        winRate: "Ganadas%",
        pkScore: "Puntuación PK",
        sessions: "Sesiones",
      },
      history: {
        title: "Registro histórico",
        loading: "Cargando historial de PK...",
        empty: "Sin registros. Invita amigos a PK.",
        unknownOpponent: "Desconocido",
      },
      result: {
        win: "Ganar",
        lose: "Perder",
        draw: "Empate",
        score: "Puntuación: {{score}}",
      },
    },
  },

  /* ✅ NEW: Fans ranking screen */
  fansRanking: {
    title: "Ranking de fans",

    summary: {
      totalContribution: "Contribución total",
      myRank: "Mi ranking: {{rank}}",
      myCoins: "Mis monedas: {{coins}}",
    },

    states: {
      loading: "Cargando ranking...",
    },

    labels: {
      levelShort: "Lv.{{level}}",
      unknownUser: "Desconocido",
    },

    errors: {
      notLoggedIn: "No has iniciado sesión.",
      loadFailed: "No se pudo cargar el ranking de fans.",
      network: "Error de red al cargar el ranking de fans.",
    },

    empty: "Aún no hay contribuciones de fans.",
  },

  /* ✅ NEW: Help screen */
  help: {
    title: "Ayuda",

    fallbackCategories: {
      frequent: "Frecuentes",
      livestream: "Livestream",
      recharge: "Recarga",
      report: "Denunciar",
      account: "Cuenta",
    },

    states: {
      loadingFaqs: "Cargando FAQs...",
      noFaqs: "No se encontraron FAQs para esta categoría.",
    },

    actions: {
      myFeedback: "Mis comentarios",
      messageFeedback: "Comentarios por mensaje",
    },

    compose: {
      title: "Enviar comentario",
      typeLabel: "Tipo",
      subjectOptional: "Asunto (opcional)",
      subjectPlaceholder: "Título corto",
      messageLabel: "Mensaje",
      messagePlaceholder: "Escribe los detalles aquí...",
      send: "Enviar",
    },

    feedback: {
      types: {
        general: "GENERAL",
        bug: "BUG",
        payment: "PAGO",
        account: "CUENTA",
        stream: "STREAM",
        report: "DENUNCIA",
      },
    },

    myFeedback: {
      title: "Mis comentarios",
      empty: "Aún no has enviado comentarios.",
      adminReplyTitle: "Respuesta del admin",
      noAdminReply: "Aún no hay respuesta del admin.",
    },

    alerts: {
      missingMessageTitle: "Falta mensaje",
      missingMessageMsg: "Por favor escribe tu mensaje.",
      sentTitle: "Enviado",
      sentMsg: "Tu comentario fue enviado al admin.",
      failedTitle: "Falló",
      failedMsg: "No se pudo enviar. Inténtalo de nuevo.",
    },
  },

  /* ✅ NEW: My Agency screen */
  myAgency: {
    title: "Mi agencia",

    hero: {
      title: "Elige Método 1 o Método 2",
      subtitle: "Únete a una agencia existente o espera una invitación de tu agente.",
    },

    method1: {
      badge: "Método 1",
      title: "Unirse al agente",
      subtitle: "El ID del agente será proporcionado por tu agente.",
      placeholder: "Introduce el ID del agente",
      button: "Unirse al agente",
    },

    method2: {
      badge: "Método 2",
      title: "Esperando invitación del agente",
      subtitle: "Comparte tu ID y el código de host con tu agente para recibir una invitación.",
      userIdLabel: "ID de usuario:",
      hostCodeLabel: "Código de host:",
    },
  },

  /* ✅ NEW: Level screen */
  level: {
    header: {
      wealthTitle: "Nivel de riqueza",
      liveTitle: "Nivel de livestream",
    },

    tabs: {
      wealth: "Nivel de riqueza",
      live: "Nivel de livestream",
    },

    labels: {
      levelShort: "Lv.{{level}}",
    },

    progress: {
      maxLevelReached: "Nivel máximo alcanzado",
      distanceToUpgrade: "Distancia para subir · {{exp}}",
      exp: "EXP: {{exp}}",
    },

    sections: {
      myBenefits: "Mis beneficios",
      lockedBenefits: "Beneficios bloqueados",
    },

    states: {
      loadingBenefits: "Cargando beneficios...",
      noBenefits: "Aún no hay beneficios desbloqueados.",
      noLocked: "No hay hitos bloqueados.",
    },

    benefits: {
      titleWithLevel: "{{title}} (Lv.{{level}})",
    },

    locked: {
      unlocksAt: "Desbloquea en Lv.{{level}}",
      unlocksAtWithPreview: "Desbloquea en Lv.{{level}} · {{preview}}",
    },
  },

  auth: {
    title: "Autenticación",
    card: {
      title: "Mi autenticación",
      subtitle:
        "Para garantizar la seguridad de tu cuenta y activos, te recomendamos autenticarte.",
    },
    rows: {
      faceAuthTitle: "Autenticación facial",
      faceAuthDesc: "Completa primero el proceso de autenticación.",
      faceAuthBtn: "Ir",

      bindPhoneTitle: "Vincular teléfono",
      bindPhoneDesc: "Vincula tu teléfono para proteger tu cuenta.",
      bindPhoneBtn: "Vincular",
    },
  },

  faceScan: {
    titles: {
      submitted: "Verificación enviada",
      verified: "Verificado",
      rejected: "Rechazado",
      default: "Verificación facial",
    },

    permission: {
      title: "Se necesita permiso de cámara",
      text: "Necesitamos acceso a tu cámara para completar la verificación de persona real.",
      button: "Conceder permiso",
    },

    hints: {
      placeFace: "Coloca tu cara dentro del marco.",
      keepInside: "Mantén tu cara dentro del marco.",
      moveCloser: "Acércate a la cámara.",
      moveBack: "Aléjate un poco.",
      centerFace: "Centra tu cara dentro del marco.",
      headStraight: "Mantén la cabeza recta.",
      perfectHold: "Perfecto. Mantente quieto…",
      visibleLight: "Asegúrate de que tu cara sea visible con buena luz.",
      adjustLighting: "Ajusta la luz y mantén tu cara centrada.",
      capturing: "Capturando…",
      uploading: "Subiendo…",
      bottom:
        "Mantén toda tu cara dentro del marco. La captura ocurre automáticamente cuando está alineado.",
    },

    states: {
      waitTitle: "Espera aprobación",
      waitText:
        "Tu escaneo facial se subió. Nuestro equipo lo revisará y aprobará tu solicitud.",
      autoChecking: "Comprobando estado automáticamente…",

      alreadyVerified: "Ya estás verificado",
      closing: "Cerrando automáticamente…",
      continue: "Continuar",

      notApproved: "No aprobado",
      rejectedText:
        "Tu verificación fue rechazada. Inténtalo de nuevo con buena luz y una cara clara.",
      rescan: "Reescanear",

      checking: "Comprobando el estado de tu verificación…",
      tryAgain: "Intentar de nuevo",
    },

    errors: {
      loginFirst: "Inicia sesión primero.",
      statusFailed: "No se pudo comprobar el estado",
      captureFailed: "No se pudo capturar la imagen. Inténtalo de nuevo.",
      network: "Error de red/inesperado durante el escaneo.",
      imageTooLarge:
        "Falló la subida: imagen demasiado grande (413). Reduce calidad o aumenta límites del servidor.",
      uploadFailed: "Falló la subida ({{code}}).",
    },
  },

  outfit: {
    title: "Mi atuendo",

    tabs: {
      backpack: "Regalos de mochila",
      avatar: "Marco de avatar",
      party: "Tema de fiesta",
    },

    states: {
      loading: "Cargando tus artículos…",
    },

    actions: {
      retry: "Reintentar",
      equip: "Equipar",
      unequip: "Desequipar",
    },

    errors: {
      loginRequired: "Se requiere iniciar sesión (gl_user_id no encontrado).",
      loadFailed: "No se pudieron cargar los artículos del atuendo",
    },

    empty: {
      backpack: "Aún no hay regalos en la mochila",
      avatar: "Aún no hay marcos de avatar",
      party: "Aún no hay temas de fiesta",
      hint:
        "Compra artículos en la tienda. Esta página solo muestra los artículos que posees (UserStoreItem).",
    },

    labels: {
      permanent: "Permanente",
      limited: "Limitado",
      expired: "Caducado",
      oneDayLeft: "Queda 1 día",
      daysLeft: "Quedan {{count}} días",

      owned: "En posesión",
      item: "Artículo",

      equipped: "Equipado",
      tapToUse: "Toca para equipar/desequipar",
    },
  },
   giftGallery: {
    title: "Galería de regalos",
    states: {
      loading: "Cargando…",
    },
    errors: {
      notLoggedIn: "Usuario no encontrado, por favor inicia sesión de nuevo.",
      loadFailed: "No se pudo cargar la galería de regalos.",
      network: "Error de red. Por favor, inténtalo de nuevo.",
    },
    summary: {
      totalValue: "Valor total de regalos",
      totalGifts: "{{count}} regalos",
      uniqueGifts: "{{count}} tipos",
    },
    actions: {
      goToPoints: "Ir a Puntos",
    },
    labels: {
      coins: "monedas",
      qtyLine: "x{{qty}} • {{unit}} monedas cada uno",
    },
    empty: "Aún no has recibido regalos.",
  },

  followUs: {
    title: "Síguenos",

    brandName: "Gold Live",
    tagline: "Comunidad global",

    hero: {
      subtitle:
        "Descubre contenido premium y conéctate con personas de todo el mundo.\nÚnete a las comunidades y empieza tu viaje social.",
    },

    sectionTitle: "Comunidades recomendadas",

    states: {
      loading: "Cargando comunidades…",
    },

    errors: {
      backendMissing:
        "Ruta del backend no encontrada (usando enlaces por defecto). Si quieres control desde backend, agrega GET /api/public/follow-us.",
      linkTitle: "Error de enlace",
      cannotOpen: "No se puede abrir este enlace en este dispositivo.",
      openFailed: "No se pudo abrir el enlace",
    },

    social: {
      facebook: "Facebook",
      youtube: "YouTube",
      instagram: "Instagram",
      tiktok: "TikTok",
      telegram: "Telegram",
      discord: "Discord",
      x: "X",
      community: "Comunidad",
    },
  },

  editProfile: {
    title: "Editar perfil",
    actions: { save: "Guardar", addTag: "Agregar" },
    states: { loadingProfile: "Cargando datos del perfil..." },
    sections: { myProfile: "Mi perfil", interestTags: "Etiquetas de interés" },
    fields: {
      nickname: "Apodo",
      gender: "Género (Masculino/Femenino)",
      dob: "Fecha de nacimiento",
      country: "País",
      selfIntro: "Presentación personal",
    },
    placeholders: {
      enterNickname: "Introduce el apodo",
      selectDate: "Seleccionar fecha",
      writeBio: "Escribe algo sobre ti",
      typeTag: "Escribe una etiqueta",
    },
    helpers: {
      cannotModify: "[No se puede modificar]",
      noTags: "Aún no hay etiquetas. Agrega algunas abajo.",
      longPressRemove: "Mantén pulsada una etiqueta para eliminarla.",
    },
    labels: {
      notSet: "No establecido",
      userFallback: "Usuario",
    },
    gender: { male: "Masculino", female: "Femenino", other: "Otro" },
    alerts: {
      notLoggedInTitle: "No has iniciado sesión",
      loginAgainMsg: "Inicia sesión de nuevo.",
      permissionNeededTitle: "Se necesita permiso",
      permissionNeededMsg: "Permite acceso a fotos para elegir una foto de perfil.",
      duplicateTagTitle: "Etiqueta duplicada",
      duplicateTagMsg: "Ya agregaste esta etiqueta.",
      savedTitle: "Guardado",
      savedMsg: "Perfil actualizado correctamente.",
      loadFailedMsg: "No se pudo cargar el perfil",
      updateFailedMsg: "No se pudo actualizar el perfil",
      networkLoadMsg: "Error de red al cargar el perfil.",
      networkSaveMsg: "Error de red al guardar el perfil.",
      galleryFailedMsg: "No se pudo abrir la galería.",
    },
  },

  explore: {
    tabs: { following: "Siguiendo", explore: "Explorar", new: "Nuevo", near: "Cerca" },
    search: { placeholder: "Buscar", cancel: "Cancelar" },
    chips: { popular: "Popular", more: "Más" },
    actions: { live: "Live" },
    states: {
      loadingCountries: "Cargando países...",
      refreshingList: "Actualizando lista de lives...",
      empty: "No se encontraron hosts en vivo. Prueba a cambiar los filtros.",
    },
    errors: {
      loadCountries: "No se pudieron cargar los países",
      networkCountries: "Error de red al cargar países",
      loadFeed: "No se pudo cargar el feed de explorar",
      networkFeed: "Error de red al cargar el feed",
    },
    alerts: {
      liveEndedTitle: "Live finalizada",
      liveEndedMsg: "Esta transmisión en vivo ha terminado.",
    },
    labels: {
      liveBadge: "LIVE",
      userFallback: "Usuario",
      viewers: "👀 {{count}}",
    },
  },

  guardMe: {
    title: "Protégeme",
    actions: { goBack: "Volver" },
    states: { loading: "Cargando…", empty: "Aún nadie te está protegiendo" },
    labels: {
      currentGuardian: "Tu guardián actual",
      tier: "Tier",
      ends: "Termina",
      started: "Empezó",
    },
    errors: {
      missingUser: "Falta userId. Inicia sesión de nuevo.",
      loadFailed: "No se pudo cargar",
    },
  },

    coins: {
    title: "Monedas",
    pointsTab: "Puntos",
    labels: {
      remainingCoins: "Monedas restantes",
      balanceAfter: "Saldo: {{balance}}",
      pkgCoins: "{{coins}} monedas",
      pkgId: "Paquete: {{id}}",
      coinsUnit: "MONEDAS",
    },
    actions: { topUp: "Recargar", refresh: "Actualizar" },
    filters: { all: "Todo", topups: "Recargas", spent: "Gastado" },
    states: {
      loading: "Cargando…",
      empty: "Sin historial",
      scrollMore: "Desplaza para ver más…",
      end: "Fin",
      loadingPackages: "Cargando paquetes…",
      noPackages: "Sin paquetes",
    },
    types: { topup: "Recarga", giftSent: "Regalo enviado" },
    modal: {
      title: "Recargar",
      note:
        "Nota: Esta recarga es solo en modo de prueba. Los pagos reales se añadirán más adelante.",
    },
    alerts: {
      walletErrorTitle: "Error de billetera",
      historyErrorTitle: "Error de historial",
      topupErrorTitle: "Error de recarga",
      loginRequiredTitle: "Se requiere iniciar sesión",
      topupFailedTitle: "Recarga fallida",
      successTitle: "Éxito",
      addedCoinsMsg: "Se añadieron {{coins}} monedas",
    },
    errors: {
      loadWallet: "No se pudo cargar la billetera",
      loadHistory: "No se pudo cargar el historial",
      loadMore: "No se pudo cargar más",
      loadPackages: "No se pudieron cargar los paquetes",
      topupFailed: "Recarga fallida",
    },
  },


  liveApplication: {
    title: "Solicitud de live",
    states: { loading: "Cargando..." },
    labels: { status: "Estado:" },

    status: {
      none: "Ninguno",
      pending: "Pendiente",
      approved: "Aprobado",
      rejected: "Rechazado",
    },

    defaults: {
      liveTitle: "Mi Live",
      hostName: "Host",
    },

    rows: {
      faceAuthTitle: "Autenticación facial",
      faceAuthNeed: "Completa primero el proceso de autenticación.",
      livePhotoTitle: "Foto de live",
      livePhotoNeed: "Por favor sube la portada de live de nuevo.",
      wealthTitle: "Nivel de riqueza ≥ nivel {{level}}",
      wealthSubtitle: "Tu nivel: {{level}}",
      completed: "Completado",
      uploaded: "Subido",
    },

    actions: { goLive: "Ir en Live", applyOrComplete: "Solicitar / Completar pasos" },

    errors: {
      loginRequired: "Se requiere inicio de sesión",
      loadFailed: "No se pudo cargar el estado de live",
      network: "Error de red",
      notLoaded: "El estado de live aún no se ha cargado.",
      submitFailed: "No se pudo enviar la solicitud",
      submitNetwork: "Error de red al enviar la solicitud",
      startFailed: "No se pudo iniciar el live",
      startNetwork: "Error de red al iniciar el live",
    },

    alerts: {
      wealthRequiredTitle: "Se requiere nivel de riqueza",
      wealthRequiredMsg: "Necesitas nivel {{level}}.",
      underReviewTitle: "En revisión",
      underReviewMsg: "Por favor espera la aprobación del admin.",
      submittedTitle: "Enviado",
      submittedMsg: "Tu solicitud fue enviada. Por favor espera la revisión.",
      infoTitle: "Info",
      wealthInfoMsg: "Aumenta el nivel de riqueza gastando/enviando regalos, etc.",
    },
  },

  // ✅ NEW: Home Feed
  homeFeed: {
    tabs: {
      following: "Siguiendo",
      square: "Plaza",
      video: "Video",
    },

    search: {
      squarePlaceholder: "Buscar publicaciones, temas, usuarios",
      videoPlaceholder: "Buscar vídeos, usuarios",
    },

    time: {
      secondsAgo: "hace {{count}} s",
      minutesAgo: "hace {{count}} min",
      hoursAgo: "hace {{count}} h",
      daysAgo: "hace {{count}} d",
    },

    eventBanner: {
      title: "EVENTO DE TEMA DEL CLUB DE FANS",
      dateRange: "12/11/2025 - 18/11/2025 [UTC+8]",
    },

    alerts: {
      loginRequiredTitle: "Se requiere inicio de sesión",
      loginToLikePosts: "Inicia sesión para dar like a publicaciones.",
      loginToLikeVideos: "Inicia sesión para dar like a vídeos.",
    },

    following: {
      chips: {
        popular: "Popular",
        pakistan: "Pakistán",
        philippines: "Filipinas",
        more: "Más",
      },
      empty: "Aún no hay salas en vivo de personas a las que sigues.",
      errors: {
        loadFailed: "No se pudo cargar el feed de siguiendo",
        network: "Error de red al cargar el feed de siguiendo",
      },
    },

    square: {
      hotTopics: "Temas calientes",
      more: "Más >",
      noTopicsYet: "Aún no hay temas",
      emptySearch: "No se encontraron resultados.",
      emptyFeed: "Aún no hay publicaciones. ¡Sé el primero en compartir algo!",
      hotBadge: "HOT",
      viewAllComments: "Ver los {{count}} comentarios",
      errors: {
        loadFailed: "No se pudo cargar el feed de la plaza",
        network: "Error de red al cargar el feed de la plaza",
      },
    },

    video: {
      states: {
        loadingVideos: "Cargando vídeos...",
        empty: "Aún no hay vídeos.",
      },
      actions: {
        share: "Compartir",
      },
      labels: {
        originalSound: "Sonido original",
      },
      tip: {
        title: "Consejo",
        label: "Consejo",
        msg: "El envío de regalos para vídeo se puede añadir después (necesita un modelo de transacciones en BD).",
      },
      errors: {
        loadFailed: "No se pudo cargar el feed de vídeo",
        network: "Error de red al cargar el feed de vídeo",
        videoFailed: "No se pudo cargar el vídeo",
        debugHint:
          "Si se queda en negro, revisa headers del servidor: Content-Type video/mp4 + Accept-Ranges bytes",
      },
    },
  },

  // ✅ NEW: Honor Wall
  honorWall: {
    title: "Muro de honor",
    tabs: {
      data: "Datos",
      honor: "Muro de honor",
    },
    states: {
      loading: "Cargando muro de honor...",
    },
    cards: {
      tagWall: "Muro de etiquetas",
      medalWall: "Muro de medallas",
      giftCollection: "Colección de regalos",
      vehicleWall: "Muro de vehículos",
      notObtained: "Aún no obtenido",
      countMore: "{{count}} >",
    },
  },

  // ✅ NEW: Host Live Room
  hostLiveRoom: {
    defaults: {
      liveTitle: "Mi Live",
      hostName: "Host",
    },
    states: {
      preparing: "Preparando sala en vivo...",
      stopping: "Deteniendo live...",
    },
    permission: {
      required: "Se requiere permiso de cámara",
      grant: "Conceder permiso",
    },
    labels: {
      liveBadge: "LIVE",
      liveTitle: "Título del live",
    },
    placeholders: {
      liveTitle: "Escribe el título del live...",
      chat: "Di algo...",
    },
    actions: {
      goLive: "Ir en Live",
      stop: "Detener",
    },
    alerts: {
      stopTitle: "¿Detener live?",
      stopMsg: "Esto terminará tu transmisión en vivo.",
    },
    chat: {
      welcome: "Bienvenido a tu sala en vivo 👋",
      guest: "Invitado",
      line: "{{name}}: {{text}}",
      meLine: "Yo: {{text}}",
      system: "ℹ️ {{text}}",
    },
    errors: {
      cameraRequiredToGoLive: "❗ Se requiere permiso de cámara para iniciar el live.",
    },
    messages: {
      liveNow: "🔴 ¡Ahora estás EN VIVO!",
    },
  },

  // ✅ NEW: Hot Topics
  hotTopics: {
    title: "Temas calientes",
    tabs: {
      daily: "Diario",
      official: "Oficial",
      normal: "Normal",
    },
    labels: {
      hotCount: "HOT {{count}}",
    },
    empty: "Aún no hay temas en esta categoría.",
    errors: {
      loadFailed: "No se pudieron cargar los temas",
      network: "Error de red al cargar los temas",
    },
  },

  // ✅ NEW: Live Cover
  liveCover: {
    title: "Portada de live",
    card: {
      title: "Subir foto de portada de live",
      subtitle: "Esta foto se usa como portada de tu live. Usa buena luz y una imagen clara.",
    },
    states: {
      checking: "Comprobando…",
      uploading: "Subiendo tu portada de live…",
      checkingStatus: "Comprobando el estado de tu portada de live…",
      uploaded: "Subido correctamente",
    },
    labels: {
      alreadyUploaded: "Ya subiste una portada de live.",
      preview: "Vista previa",
      selectCover: "Selecciona una imagen de portada",
      cameraSide: "Cámara: {{side}}",
      front: "Frontal",
      back: "Trasera",
    },
    actions: {
      change: "Cambiar",
      upload: "Subir",
      uploadCover: "Subir portada",
      camera: "Cámara",
      gallery: "Galería",
    },
    alerts: {
      permissionNeededTitle: "Se necesita permiso",
      galleryPermissionMsg: "Permite acceso a la galería.",
      cameraPermissionMsg: "Permite acceso a la cámara.",
    },
    errors: {
      loginRequired: "Se requiere inicio de sesión",
      loadFailed: "No se pudo cargar el estado",
      network: "Error de red",
      selectPhotoFirst: "Primero selecciona una foto.",
      imageTooLarge: "Imagen demasiado grande (413). Prueba otra foto.",
      uploadFailed: "Falló la subida ({{code}})",
      uploadFailedGeneric: "Falló la subida",
      noImageReturned: "No se devolvió ninguna imagen.",
      cameraNoImage: "La cámara no devolvió una imagen.",
      cannotReadBase64: "No se pudo leer la imagen como base64. Prueba otra imagen.",
      openGalleryFailed: "No se pudo abrir la galería",
      openCameraFailed: "No se pudo abrir la cámara",
      androidEmulatorHint:
        "Si estás en Android Emulator: la cámara a menudo no funciona. Prueba en un dispositivo real.",
    },
  },

  vipCenter: {
    title: "Centro VIP",
    states: {
      loading: "Cargando VIP...",
    },
    current: {
      none: "Actual: Sin VIP",
      active: "Actual: {{name}} • {{days}} días restantes",
    },
    labels: {
      perMonth: "/M",
      defaultDescription: "Obtén VIP y disfruta privilegios",
      privilegesCount: "Privilegios exclusivos VIP {{count}}/{{total}}",
    },
    actions: {
      open: "Abrir {{name}}",
    },
    alerts: {
      purchaseTitle: "Compra VIP",
      purchaseMsg: "Iniciar flujo de compra para {{tier}}.",
    },
  },

  topicDetail: {
    states: {
      empty: "Aún no hay momentos bajo este tema.",
    },
    errors: {
      loadFailed: "No se pudo cargar el feed del tema",
      network: "Error de red al cargar el feed del tema",
    },
    alerts: {
      loginRequiredTitle: "Se requiere inicio de sesión",
      loginRequiredMsg: "Inicia sesión para dar like a publicaciones.",
      likeFailedTitle: "Error",
      likeFailedMsg: "No se puede dar like a esta publicación ahora mismo.",
    },
  },

  visitProfile: {
    titleFallback: "Perfil",
    states: {
      notFound: "Perfil no encontrado.",
      noMoments: "Aún no hay momentos.",
    },
    labels: {
      id: "ID: {{id}}",
      followers: "Seguidores",
      following: "Siguiendo",
    },
    actions: {
      follow: "Seguir",
      following: "Siguiendo",
    },
  },

  realPersonAuth: {
    title: "Autenticación",
    hero: {
      title: "La verificación de persona real comenzará pronto.",
      subtitle: "Asegúrate de que eres el usuario",
    },
    tips: {
      avoidCover: "Evita cubrir",
      enoughLight: "Mantén suficiente luz",
      minorsProhibited: "Menores prohibidos",
    },
    actions: {
      start: "Iniciar verificación",
    },
  },

  postMoment: {
    title: "Publicar momentos",
    actions: {
      post: "Publicar",
      posting: "Publicando...",
      refresh: "Actualizar",
    },
    labels: {
      postingTo: "Publicando en #{{topic}}",
      recommended: "Temas recomendados",
    },
    placeholders: {
      input: "Di algo para registrar este momento...",
    },
    sheets: {
      title: "Añadir",
      message: "Elige tipo de contenido",
      addPhotos: "Añadir fotos",
      addVideos: "Añadir vídeos",
    },
    permissions: {
      title: "Se necesita permiso",
      libraryMsg: "Permite acceso para poder subir contenido.",
      cameraMsg: "Permite acceso a la cámara.",
    },
    alerts: {
      nothingTitle: "Nada para publicar",
      nothingMsg: "Escribe algo o añade una foto/vídeo.",
      notLoggedInTitle: "No has iniciado sesión",
      notLoggedInMsg: "Inicia sesión de nuevo.",
      errorTitle: "Error",
      postFailed: "No se pudo publicar el momento.",
      postedTitle: "Publicado",
      postedVideo: "Tu vídeo aparecerá en la pestaña Vídeo.",
      postedSquare: "Tu publicación aparecerá en Plaza.",
    },
    errors: {
      notLoggedIn: "No has iniciado sesión",
      uploadFailed: "Falló la subida",
      uploadEmpty: "La subida devolvió una URL vacía",
      networkPost: "Error de red al publicar el momento.",
    },
    recommendedFallback: [
      "#Colección de videos de Rocket Host",
      "#Outfit del día (OOTD)",
      "#Vida cotidiana",
      "#MUÉSTRATE",
      "#Temas que te interesan",
      "#Las fotos de viaje más bonitas",
      "#Recomienda una película",
      "#Mi hobby",
    ],
  },

    points: {
    title: "Puntos",
    coinsTab: "Monedas",
    actions: {
      details: "Detalles",
      withdraw: "Retirar ahora",
      exchange: "Cambiar puntos por monedas",
      exchanging: "Cambiando...",
      refresh: "Actualizar",
    },
    labels: {
      available: "Puntos disponibles",
      total: "Total: {{count}}",
      unconfirmed: "Sin confirmar: {{count}}",
      income: "Ingresos",
      last30: "Últimos 30 días",
    },
    income: {
      livestream: "Transmisión en vivo",
      party: "Fiesta",
      platformRewards: "Recompensas de la plataforma",
    },
    states: {
      loading: "Cargando…",
    },
    hints: {
      exchangeRate:
        "La tasa de cambio se puede modificar más adelante desde el backend (POINTS_PER_COIN).",
    },
    alerts: {
      errorTitle: "Error",
      successTitle: "Éxito",
      loginRequiredTitle: "Se requiere iniciar sesión",
      loginRequiredMsg: "Por favor inicia sesión de nuevo.",
      detailsSoon: "La pantalla de detalles se añadirá pronto.",
      withdrawSoon: "La función de retiro se añadirá pronto.",
      exchangeFailedTitle: "Error al cambiar",
      exchangeSuccessMsg: "Cambiado {{points}} puntos → {{coins}} monedas.",
    },
    errors: {
      loadFailed: "No se pudieron cargar los puntos",
      exchangeFailed: "No se pudieron cambiar los puntos",
    },
    ranges: {
      title: "Seleccionar rango",
      last7: "Últimos 7 días",
      last30: "Últimos 30 días",
      last90: "Últimos 90 días",
    },
    withdraw: {
      title: "Retirar puntos",
      available: "Disponibles: {{points}} puntos",
      fields: {
        points: "Puntos a retirar",
        method: "Método",
        account: "Detalles de la cuenta",
      },
      placeholders: {
        account: "p. ej. 03xx-xxxxxxx / IBAN / Nombre de la cuenta",
      },
      actions: {
        submit: "Enviar solicitud",
        submitting: "Enviando...",
      },
      note:
        "Las solicitudes de retiro se envían al administrador para aprobación. Los puntos pueden quedar retenidos hasta que se procesen.",
      alerts: {
        successTitle: "Enviado",
        successMsg: "Tu solicitud de retiro ha sido enviada.",
        failedTitle: "Error al retirar",
      },
      errors: {
        invalidPoints: "Por favor ingresa una cantidad válida de puntos.",
        accountRequired: "Por favor ingresa los detalles de la cuenta.",
        failed: "No se pudo enviar la solicitud de retiro.",
      },
    },
    details: {
      title: "Detalles de puntos",
      intro: "Así es como funcionan los puntos en la plataforma:",
      lines: {
        available:
          "Los puntos disponibles son los que puedes cambiar o retirar.",
        unconfirmed:
          "Los puntos sin confirmar aún se están verificando y pueden cambiar.",
        total:
          "Los puntos totales incluyen disponibles + sin confirmar.",
        income:
          "Ingresos muestra de dónde provienen tus puntos en el rango de fechas seleccionado.",
        exchange:
          "Cambiar convierte puntos en monedas. La tasa de cambio puede variar según las reglas de la plataforma.",
        withdraw:
          "Las solicitudes de retiro se revisan antes del pago. Asegúrate de que los detalles de tu cuenta sean correctos.",
      },
      footer:
        "Si tienes algún problema, contacta con soporte desde tu pantalla de Perfil.",
    },
  },

  momentComments: {
    title: "Momentos de {{owner}}",
    empty: "Aún no hay comentarios. ¡Sé el primero en responder!",
    placeholder: "Escribe un comentario...",
  },

  myGuardian: {
    title: "Mi guardián",
    empty: "Aún no has protegido a alguien.",
    actions: {
      goBack: "Volver",
    },
    card: {
      meta: "Tier: {{tier}} • Termina: {{ends}}",
    },
    errors: {
      missingUserId: "Falta userId. Inicia sesión de nuevo.",
      loadFailed: "No se pudo cargar",
    },
  },

  myProfile: {
    tabs: {
      posts: "Publicaciones",
    },
    items: {
      giftGallery: "Galería de regalos",
      contribution: "Contribución",
    },
    sections: {
      personalInfo: "Información personal",
    },
    labels: {
      idLine: "ID: {{id}}",
      followingFollowers: "Siguiendo {{following}} · Seguidores {{followers}}",
      fansCount: "{{count}} Fans",
      lit: "Encendido: {{current}}/{{total}}",
      participantsRank: "Participantes en el ranking: {{count}}",
    },
    defaults: {
      bio: "Ella/Él fue perezoso/a y no dejó nada atrás.",
    },
    alerts: {
      waitTitle: "Por favor espera",
      profileLoadingMsg: "El perfil aún se está cargando.",
    },
  },

  notificationsInbox: {
    postOwnerName: "Publicación",
    inboxSearchPlaceholder: "Buscar notificaciones...",
  },

  party: {
    tabs: {
      following: "Siguiendo",
      party: "Party",
    },
    search: {
      placeholder: "Buscar salas party",
    },
    filters: {
      popular: "Popular",
      pakistan: "Pakistán",
      philippines: "Filipinas",
      more: "Más",
    },
    labels: {
      defaultTag: "Party",
    },
    states: {
      empty: "No se encontraron salas. Prueba a cambiar el filtro o la búsqueda.",
    },
    errors: {
      loadFailed: "No se pudieron cargar las salas party",
      network: "Error de red al cargar las salas party",
    },
  },
};
