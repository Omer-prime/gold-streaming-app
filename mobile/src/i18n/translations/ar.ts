// src/i18n/ar.ts
export default {

  common: {
    ok: "حسنًا",
    cancel: "إلغاء",
    loading: "...",
    loadingText: "جارٍ التحميل…",

    error: "خطأ",
    success: "نجاح",
    done: "تم",
    failed: "فشل",

    edit: "تعديل",
    block: "حظر",
    remove: "إزالة",
    you: "أنت",

    sendCode: "إرسال الرمز",
    verifyAndBind: "تحقق وربط",
    bind: "ربط",
    unbind: "إلغاء الربط",
    changePhoneNumber: "تغيير رقم الهاتف",
    userFallback: "مستخدم",

    codeSent: "تم إرسال الرمز",
  },

    errors: {
        userNotFound: "المستخدم غير موجود، يرجى تسجيل الدخول مرة أخرى.",
        updateFailed: "فشل تحديث اللغة.",
    },

    settings: {
        title: "الإعدادات",
        versionText: "1.0.0 (Gold Live)",

        items: {
            accountAndSecurity: "الحساب والأمان",
            securityPassword: "كلمة مرور الأمان",
            languageSetting: "إعدادات اللغة",

            blacklist: "القائمة السوداء",
            privilegeSettings: "إعدادات الامتيازات",
            newMessagesNotification: "إشعارات الرسائل الجديدة",
            privacy: "الخصوصية",

            version: "الإصدار",
            aboutGoldLive: "حول Gold Live",
            clearCache: "مسح ذاكرة التخزين المؤقت",
        },

        security: {
            levelPrefix: "مستوى الأمان:",
            levelLow: "منخفض",
            levelMedium: "متوسط",
            levelHigh: "مرتفع",
        },

        actions: {
            clearCacheTitle: "مسح ذاكرة التخزين المؤقت",
            clearCacheMsg: "تم مسح ذاكرة التطبيق (هذا لا يسجل خروجك).",

            switchAccountTitle: "تبديل الحساب",
            switchAccountMsg: "هل تريد تبديل الحساب؟",
            switch: "تبديل",
            switchAccountBtn: "تبديل الحساب",

            logoutTitle: "تسجيل الخروج",
            logoutMsg: "هل أنت متأكد أنك تريد تسجيل الخروج؟",
            logout: "تسجيل الخروج",
            logoutBtn: "تسجيل الخروج",
        },

        language: {
            title: "إعدادات اللغة",
            followSystem: "اتباع النظام",
            english: "الإنجليزية",
            traditionalChinese: "繁體中文",
            arabic: "العربية",
            urdu: "اردو",
            portuguese: "Português",
            spanish: "Español",
        },
    },

    accountSecurity: {
        title: "الحساب والأمان",
        levelText: "مستوى أمان حسابك هو {{level}}.",
        tip: "ربط رقم هاتف أو بريد إلكتروني يمكن أن يرفع مستوى الأمان.",

        rows: {
            setPassword: "تعيين كلمة المرور",
            phoneNumber: "رقم الهاتف",
            email: "البريد الإلكتروني",
            google: "Google",
            facebook: "Facebook",
            instagram: "Instagram",
            tiktok: "TikTok",
            deviceManagement: "إدارة الأجهزة",
        },

        trailing: {
            modify: "تعديل",
            set: "تعيين",
            bound: "مرتبط",
            bind: "ربط",
        },

        cancel: {
            title: "إلغاء الحساب",
            msg: "سيتم تنفيذ مسار إلغاء الحساب لاحقاً.",
            button: "إلغاء الحساب",
        },
    },

    securityPassword: {
        title: "كلمة مرور الأمان",

        fields: {
            current: "كلمة المرور الحالية",
            new: "كلمة مرور جديدة",
            confirm: "تأكيد كلمة المرور الجديدة",
        },

        actions: {
            save: "حفظ",
            saving: "جارٍ الحفظ...",
        },

        errors: {
            title: "خطأ",
            enterNew: "يرجى إدخال كلمة مرور جديدة.",
            mismatch: "كلمة المرور الجديدة وتأكيدها غير متطابقين.",
            updateFailed: "فشل تحديث كلمة المرور",
            network: "خطأ في الشبكة، يرجى المحاولة مرة أخرى.",
        },

        success: {
            title: "نجاح",
            msg: "تم تحديث كلمة المرور بنجاح.",
        },
    },

    bindPhone: {
        title: "ربط هاتف",
        subtitle:
            "اربط رقم هاتفك لحماية حساب Gold Live وتسهيل تسجيل الدخول.",
        currentBoundLabel: "الهاتف المرتبط حالياً:",

        sections: {
            enterPhone: "أدخل رقم الهاتف",
            enterCode: "أدخل الرمز",
        },

        labels: {
            sentTo: "تم الإرسال إلى: {{phone}}",
        },

        placeholders: {
            phone: "يرجى إدخال رقم هاتفك",
            code: "رمز التحقق",
        },

        alerts: {
            codeSentMsg: "لقد أرسلنا رمزاً إلى {{phone}}.",
            devCode: "DEV CODE: {{code}}",
            successMsg: "تم ربط الهاتف بنجاح.",
        },

        terms: {
            prefix: "لقد قرأت ووافقت على ",
            tos: "شروط خدمة Gold Live",
            and: " و ",
            privacy: "سياسة الخصوصية",
            suffix: ".",
        },
    },

    bindEmail: {
        title: "ربط البريد الإلكتروني",
        currentBoundLabel: "البريد المرتبط حالياً:",
        noBoundYet: "لا يوجد بريد مرتبط بعد.",

        labels: {
            email: "البريد الإلكتروني",
            code: "رمز التحقق",
        },

        placeholders: {
            email: "أدخل بريدك الإلكتروني",
            code: "أدخل الرمز",
        },

        alerts: {
            codeSentMsg: "لقد أرسلنا رمزاً إلى {{email}}.",
            devCode: "DEV CODE: {{code}}",
            successMsg: "تم ربط البريد الإلكتروني بنجاح.",
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
            google: "ربط Google",
            facebook: "ربط Facebook",
            instagram: "ربط Instagram",
            tiktok: "ربط TikTok",
        },

        status: {
            notBound: "غير مرتبط بعد.",
            currentlyBound: "مرتبط حالياً: {{id}}",
        },

        tempBackendHint:
            "ربط مؤقت من جهة الخادم (استبدله بـ OAuth لاحقاً). أدخل مُعرّف {{provider}}:",

        placeholders: {
            google: "googleId (من OAuth لاحقاً)",
            facebook: "facebookId (من OAuth لاحقاً)",
            instagram: "instagramId (من OAuth لاحقاً)",
            tiktok: "tiktokId (من OAuth لاحقاً)",
        },

        alerts: {
            loadFailed: "فشل تحميل حالة الربط",
            boundSuccess: "تم ربط {{provider}} بنجاح.",
            unboundSuccess: "تم إلغاء ربط {{provider}}.",
        },
    },

    deviceManagement: {
        title: "إدارة الأجهزة",

        labels: {
            empty: "لا توجد معلومات عن الأجهزة بعد.",
            unknownDevice: "جهاز غير معروف",
            lastActiveTime: "آخر نشاط: {{time}}",
            friendlyName: "جهاز {{platform}}",
        },

        badges: {
            current: "الجهاز الحالي",
            trusted: "جهاز موثوق",
        },

        errors: {
            notLoggedIn: "غير مسجل الدخول. يرجى تسجيل الدخول مرة أخرى.",
            loadFailed: "فشل تحميل الأجهزة.",
            network: "خطأ في الشبكة أثناء تحميل الأجهزة.",
        },
    },

    blacklist: {
        title: "القائمة السوداء",
        searchPlaceholder: "أدخل مُعرّف المستخدم أو اسم المستخدم",
        empty: "لا يوجد مستخدمون محظورون",

        labels: {
            id: "المعرّف: {{id}}",
        },

        errors: {
            addFailed: "فشل الإضافة إلى القائمة السوداء.",
        },
    },

    privilegeSettings: {
        title: "إعدادات الامتيازات",
        items: {
            invisibleVisitor: {
                label: "زائر مخفي",
                description:
                    "زر الآخرين دون ترك سجل، ولا يمكن للآخرين أيضاً رؤية من زار الصفحة الرئيسية.",
            },
            mysteryLive: {
                label: "شخص غامض في غرفة LIVE",
                description: "فقط مستلم الهدية يمكنه رؤية هويتك في غرف LIVE.",
            },
            mysteryRank: {
                label: "شخص غامض في التصنيف",
                description: "لن تظهر هداياك في ترتيب معجبي المضيف.",
            },
            invisibleOnline: {
                label: "متصل بشكل مخفي",
                description:
                    "ابقَ دائماً بحالة مخفية، وادخل غرف البث المباشر بشكل مخفي.",
            },
            exclusiveEmail: {
                label: "إشعار بريد إلكتروني حصري",
                description:
                    "استلم إشعارات بريد إلكتروني حصرية بعد رد خدمة العملاء.",
            },
            hideLiveLevel: {
                label: "إخفاء مستوى البث المباشر",
                description:
                    "عند تفعيلها، لن يتمكن الآخرون من رؤية مستوى البث المباشر في ملفك الشخصي.",
            },
        },
    },

    newMessageNotification: {
        title: "الإشعارات",
        searchPlaceholder: "ابحث في إعدادات الإشعارات",
        inboxSearchPlaceholder: "ابحث في الإشعارات...",

        sections: {
            notificationsList: "قائمة الإشعارات",
            searchResults: "نتائج البحث",
            notificationSettings: "إعدادات الإشعارات",
        },

        actions: {
            markAllRead: "تحديد الكل كمقروء",
        },

        empty: "لا توجد إشعارات بعد.",

        errors: {
            missingUserId: "userId مفقود في AsyncStorage ({{key}})",
            loadFailed: "فشل تحميل الإشعارات",
            network: "خطأ في الشبكة أثناء تحميل الإشعارات",
        },

        debugLine: "uid: {{uid}} • total: {{total}} • unread: {{unread}}",

        settings: {
            liveAlerts: "تنبيهات فتح غرفة البث",
            messageSwitch: "مفتاح إشعارات الرسائل",
            sound: "الصوت",
            vibrate: "الاهتزاز",
            mutualFollowers: "متابعون مشتركون",
            myFollowing: "من أتابعهم",
            stranger: "غريب",
        },
    },

    privacySettings: {
        title: "الخصوصية",

        sections: {
            livePrivacy: "خصوصية البث",
            permissionPrivacy: "خصوصية الأذونات",
        },

        items: {
            hideMicStatus: "إخفاء حالة الميكروفون",
        },

        trailing: {
            on: "تشغيل",
            goSettings: "الذهاب إلى الإعدادات",
        },

        errors: {
            openSettingsFailed: "تعذر فتح إعدادات النظام على هذا الجهاز.",
        },

        permissions: {
            camera: {
                label: "السماح لـ Gold Live بالوصول إلى الكاميرا",
                subLabel: "لالتقاط الصور وتسجيل الفيديوهات وغيرها.",
            },
            voice: {
                label: "السماح لـ Gold Live بالوصول إلى رسائلك الصوتية",
                subLabel: "لتسجيل الفيديو وإرسال الصوت وغيرها.",
            },
            notifications: {
                label: "السماح للمنصة بالحصول على إذن الإشعارات",
                subLabel: "لتنبيهات الرسائل غير المقروءة وغيرها.",
            },
            bluetooth: {
                label: "السماح للمنصة بالوصول إلى أذونات Bluetooth.",
                subLabel: "للاتصال بسماعات البلوتوث وضمان عملها بشكل صحيح.",
            },
            location: {
                label: "السماح للمنصة بالحصول على إذن الموقع",
                subLabel: "يُستخدم للعثور على المذيعين القريبين.",
            },
        },
    },

    aboutGoldLive: {
        title: "حول Gold Live",
        versionText: "GOLD LIVE 1.0.0",

        items: {
            privacyPolicy: "سياسة الخصوصية",
            termsOfService: "شروط الخدمة",
            liveAgreement: "اتفاقية البث",
            userRechargeAgreement: "اتفاقية شحن المستخدم",
            noChildEndangermentPolicy: "سياسة عدم تعريض الأطفال للخطر",
        },

        alerts: {
            comingSoon: "سيتم إضافة صفحة {{label}} لاحقاً لـ Gold Live.",
        },
    },

    ranking: {
        title: "التصنيف",
        tabs: { host: "المضيف", rich: "الأثرياء", gift: "الهدايا" },
        period: { daily: "يومي", weekly: "أسبوعي", monthly: "شهري" },
        filters: {
            region: "المنطقة",
            periodLabel: "{{period}}: {{range}}",
        },
        datePicker: {
            selectDate: "اختر التاريخ",
            done: "تم",
        },
        states: {
            loading: "جارٍ تحميل التصنيف...",
            retry: "إعادة المحاولة",
        },
        errors: {
            loadFailed: "فشل تحميل التصنيف",
            network: "خطأ في الشبكة أثناء تحميل التصنيف",
        },
        labels: {
            id: "المعرّف: {{id}}",
            userFallback: "مستخدم",
        },
        distance: {
            label: "المسافة عن المرتبة هي: {{distance}}",
            top: "أنت في القمة (أو لا توجد مرتبة أعلى).",
        },
    },

    reward: {
        title: "المكافآت",
        banner: {
            title: "مهام المضيف والمكافآت",
            subtitle: "أكمل المهام اليومية والأسبوعية لكسب المزيد من النقاط.",
        },
        tabs: {
            pkMission: "مهمة PK",
            activity: "النشاط",
            fanClub: "نادي المعجبين",
            invite: "دعوة",
        },
        pk: {
            todayRecord: "سجل PK اليوم",
            recordLink: "سجل PK >>",
            highestStreak: "أعلى سلسلة فوز فعّالة",
            effectiveWins: "الانتصارات الفعّالة",
        },
        states: {
            loading: "جارٍ تحميل المهام...",
            empty: "لا توجد مهام مُعدّة بعد.",
        },
        errors: {
            notLoggedIn: "غير مسجل الدخول.",
            loadFailed: "فشل تحميل مهام المكافآت.",
            network: "خطأ في الشبكة أثناء تحميل مهام المكافآت.",
        },
        actions: {
            go: "اذهب",
            confirm: "تأكيد",
        },
        rule: {
            title: "قواعد المكافأة",
            daily: "المهام اليومية: تتجدد المهام يومياً عند 00:00:00 (UTC+8).",
            weekly: "المهام الأسبوعية: تتجدد المهام كل يوم اثنين عند 00:00:00 (UTC+8).",
        },
    },

    store: {
    title: "المتجر",
    popular: "الأكثر شيوعًا",
    states: {
      loading: "جارٍ تحميل المتجر…",
      empty: "لم يتم العثور على عناصر",
    },
    actions: {
      refresh: "تحديث",
      all: "الكل >",
      recharge: "إعادة الشحن",
    },
    labels: {
      coins: "عملات",
      preview: "معاينة",
      balance: "رصيدك",
      balanceHint: "أعد شحن العملات لشراء عناصر المتجر فورًا.",
      durationDays: "{{days}} يومًا",
      permanent: "دائم",
    },
    errors: {
      missingUser: "معرّف المستخدم مفقود. يرجى تسجيل الدخول مرة أخرى.",
    },
    purchase: {
      confirmTitle: "تأكيد الشراء",
      confirmMsg: 'شراء "{{title}}" مقابل {{price}} عملة؟',
      successTitle: "تم الشراء",
      successMsg: "تمت إضافة العنصر إلى حسابك.",
      failedTitle: "فشل الشراء",
      failedMsg: "يرجى المحاولة مرة أخرى.",
      insufficientTitle: "لا توجد عملات كافية",
      insufficientMsg: "أعد شحن العملات لشراء هذا العنصر.",
      actions: {
        buy: "اشترِ الآن",
        buying: "جارٍ الشراء...",
        recharge: "إعادة الشحن",
      },
    },
  },

    invite: {
        title: "مكافأة الدعوة",
        tabs: {
            myRewards: "مكافآتي",
            incomeRank: "ترتيب الدخل",
        },
        banner: {
            small: "ادعُ شخصاً",
            title: "اكسب مكافآت بدعوة الأصدقاء",
            subtitle: "شارك رابط الدعوة أو الرمز. سنحسب المدعوين تلقائياً.",
        },
        stats: {
            claimed: "المكافآت المُستلمة",
            invitees: "عدد المدعوين",
            availableToday: "المتاح لليوم: {{count}}",
        },
        list: {
            title: "دعوات آخر 7 أيام ({{count}})",
            more: "المزيد >",
            loading: "جارٍ التحميل…",
            empty: "لا توجد دعوات بعد",
            myCode: "رمزي: {{code}}",
            linkPlaceholder: "رابط الدعوة غير جاهز (اضغط تحديث)",
        },
        qr: {
            title: "امسح للانضمام",
        },
        actions: {
            receive: "استلام",
            inviteNow: "ادعُ الآن",
            share: "مشاركة",
            copyLink: "نسخ الرابط",
        },
        alerts: {
            errorTitle: "خطأ في الدعوة",
            loadFailed: "فشل تحميل بيانات الدعوة",
            inviteTitle: "دعوة",
            codeNotReady: "رمز الدعوة غير جاهز. اضغط تحديث.",
            linkNotReady: "رابط الدعوة غير جاهز. اضغط تحديث.",
            clipboardNotReadyTitle: "الحافظة غير جاهزة",
            clipboardNotReadyMsg:
                "وحدة الحافظة غير موجودة في Dev Client لديك. أعد بناء Dev Client لتفعيل النسخ.",
            copiedTitle: "تم النسخ",
            codeCopied: "تم نسخ رمز الدعوة",
            linkCopied: "تم نسخ رابط الدعوة",
            soonTitle: "قريباً",
            receiveSoon: "سيتم تفعيل استلام المكافآت عند إضافة قواعد مكافأة الدعوة.",
            inviteCodeMissing: "رمز الدعوة مفقود من استجابة الخادم",
        },
        badge: {
            registered: "مسجل",
            qualified: "مؤهل",
            rewarded: "مُكافأ",
        },
        labels: {
            userFallback: "مستخدم",
        },
        shareMessage: "انضم إلي على Gold Live 🎥\nاستخدم رمز الدعوة الخاص بي: {{code}}\n{{link}}",
    },

    guardian: {
        defaultTitle: "فتح الحارس",

        metaLine: "الخطط: {{activePlans}}/{{totalPlans}} • الحزم: {{activePackages}}",

        errors: {
            missingUser: "userId مفقود. يرجى تسجيل الدخول مرة أخرى.",
            missingUserShort: "userId مفقود",
            selectUser: "اختر مستخدماً للحراسة أولاً",
            selectDuration: "اختر المدة أولاً",
            activateFailed: "فشل التفعيل",
            apiNonJson: "أعاد API بيانات غير JSON. معاينة: {{preview}}",
            plansExistEmpty: "الخطط موجودة لكنها عادت فارغة. تحقق من الحزم النشطة للخطط النشطة.",
        },

        labels: {
            noUserSelected: "لم يتم اختيار مستخدم",
            tierLine: "{{tier}} حارس",
        },

        sections: {
            guardSomeone: "أريد حراسة شخص",
            coinsNeeded: "العملات المطلوبة: {{coins}}",
            privileges: "امتيازات الحارس",
            noPrivileges: "لا توجد امتيازات مُعدّة.",
        },

        links: {
            myGuardian: "حارسي",
            guardingCount: "أنت تحرس: {{count}}",
            guardMe: "احرسني",
            guardMeNone: "لا أحد يحرسك بعد",
            guardMeWith: "الحارس: {{name}}",
        },

        actions: {
            select: "اختيار",
            activate: "تفعيل حارس {{tier}}",
            activating: "جارٍ التفعيل...",
            refresh: "تحديث",
            search: "بحث",
        },

        picker: {
            title: "اختر مستخدماً",
            placeholder: "ابحث باسم المستخدم أو اللقب...",
            empty: "اكتب حرفين على الأقل ثم ابحث.",
        },

        empty: {
            title: "لم يتم العثور على خطط",
            hint: "هذا يعني أن API أعاد 0 خطط نشطة (isActive=true). تحقق من guardianPlan + الحزم نشطة.",
        },
    },

    fanClub: {
        title: "نادي المعجبين",
        topTabs: { fanClub: "نادي المعجبين", fanGroup: "مجموعة المعجبين" },
        subTabs: { joined: "الأندية المنضم إليها", my: "ناديي" },
        empty: "لا مزيد من البيانات",
        frozenLink: "نادي المعجبين المجمّد >",
    },

    medalWall: {
        title: "جدار الأوسمة",
        obtain: "تم الحصول: {{obtained}}/{{total}}",
        loading: "جارٍ التحميل...",
        level: "المستوى: {{level}}",
        achievementTitle: "وسام الإنجاز",
        unlocked: "مفتوح",
        empty: "لم يتم العثور على أوسمة. أضف أوسمة قاعدة البيانات (HonorItem نوع MEDAL) أو تأكد أن API يعيد الأوسمة المحسوبة.",
        errors: {
            missingUserId: "userId مفقود. مرّر { userId } عند الانتقال إلى MedalWall.",
            loadFailed: "فشل تحميل الأوسمة",
        },
    },

    profile: {
        header: {
            title: "أنا",
        },

        loggedOut: {
            title: "تم تسجيل خروجك",
            subtitle: "يرجى تسجيل الدخول مرة أخرى لعرض ملفك الشخصي.",
        },

        states: {
            loading: "جارٍ تحميل الملف الشخصي...",
            retry: "إعادة المحاولة",
        },

        errors: {
            notLoggedIn: "غير مسجل الدخول.",
            loadFailed: "فشل تحميل الملف الشخصي.",
            network: "خطأ في الشبكة أثناء تحميل الملف الشخصي.",
        },

        labels: {
            guest: "ضيف",
            online: "متصل",

            id: "المعرّف {{id}}",

            vipLevel: "VIP {{level}}",
            levelShort: "LV.{{level}}",

            level: "المستوى: {{level}}",
            coins: "عملات",
            followers: "المتابعون",
            following: "يتابع",
            likes: "الإعجابات",
            visits: "الزيارات",
        },

        completion: {
            text: "اكتمال ملفك الشخصي {{completion}}%. أكمله لتكوين أصدقاء بسهولة في Gold Live.",
        },

        stats: {
            friends: "الأصدقاء",
            following: "يتابع",
            followers: "المتابعون",
            visitors: "الزوار",
        },

        wallet: {
            coins: "عملات",
            points: "نقاط",
        },

        vipCard: {
            cta: "VIP • قم بالترقية إلى VIP واستمتع بمزايا حصرية",
        },

        notice: {
            title: "تنبيه",
            subtitle: "معايير سلوك المستخدم والأنشطة المحظورة في Gold Live.",
        },

        tiles: {
            reward: "المكافآت",
            ranking: "التصنيف",
            store: "المتجر",
            invite: "دعوة",
            guardian: "الحارس",
            fanClub: "نادي المعجبين",
            medalWall: "جدار الأوسمة",
        },

        rows: {
            liveData: "بيانات البث",
            help: "مساعدة",
            myAgency: "وكالتي",
            level: "المستوى",
            auth: "التحقق",
            backpack: "الحقيبة",
            followUs: "تابعنا",
        },

        actions: {
            editProfile: "تعديل الملف الشخصي",
            editAvatar: "تعديل صورة الملف الشخصي",
            copyId: "نسخ المعرّف",
            shareProfile: "مشاركة الملف الشخصي",
            follow: "متابعة",
            following: "يتابع",
            message: "رسالة",

            goToLogin: "الذهاب لتسجيل الدخول",
            view: "عرض >",
        },

        menu: {
            ranking: "التصنيف",
            reward: "المكافآت",
            store: "المتجر",
            invite: "مكافأة الدعوة",
            guardian: "فتح الحارس",
            fanClub: "نادي المعجبين",
            medalWall: "جدار الأوسمة",
            settings: "الإعدادات",
            about: "حول Gold Live",
            logout: "تسجيل الخروج",
        },

        alerts: {
            copiedTitle: "تم النسخ",
            idCopied: "تم نسخ معرّف المستخدم",
            comingSoonTitle: "قريباً",
            comingSoonMsg: "سيتم إضافة هذه الميزة لاحقاً.",

            missingUserTitle: "مستخدم مفقود",
            missingUserMsg: "يرجى تسجيل الدخول مرة أخرى.",
        },
    },

    /* ✅ NEW: Live data screen */
    liveData: {
        tabs: {
            live: "بيانات البث",
            pk: "بيانات PK",
        },

        range: {
            daily: "بيانات يومية",
            weekly: "بيانات أسبوعية",
            monthly: "بيانات شهرية",
        },

        stats: {
            wonPoints: "نقاط الفوز",
            liveDuration: "مدة البث",
            liveEarnings: "أرباح البث",
            partyDuration: "مدة الحفلة",
            partyEarnings: "أرباح الحفلة",
            partyCrownDuration: "مدة تاج الحفلة",
            newFans: "عدد المعجبين الجدد",
            newFanClubMembers: "أعضاء جدد في نادي المعجبين",

            avgOnline: {
                daily: "متوسط عدد المستخدمين المتصلين اليوم",
                weekly: "متوسط عدد المستخدمين المتصلين هذا الأسبوع",
                monthly: "متوسط عدد المستخدمين المتصلين هذا الشهر",
            },
        },

        actions: {
            getMorePoints: "احصل على المزيد من النقاط",
            contribution: "المساهمة",
        },

        help: {
            title: "الوصف",
            line1: "1. دورة التسوية هي 00:00:00–23:59:59 بتوقيت UTC+8.",
            confirm: "تأكيد",
        },

        errors: {
            notLoggedIn: "غير مسجل الدخول.",
            loadFailedLive: "فشل تحميل بيانات البث.",
            loadFailedPk: "فشل تحميل بيانات PK.",
            emptyResponse: "استجابة فارغة من الخادم.",
        },

        pk: {
            tabs: {
                random: "PK عشوائي",
                friend: "PK مع صديق",
                team: "PK فريق",
            },
            range: {
                today: "اليوم",
                recent7: "آخر 7 أيام",
                monthly: "شهري",
            },
            cards: {
                winRate: "نسبة الفوز%",
                pkScore: "نتيجة PK",
                sessions: "الجلسات",
            },
            history: {
                title: "السجل التاريخي",
                loading: "جارٍ تحميل سجل PK...",
                empty: "لا يوجد سجل. ادعُ أصدقاءك إلى PK.",
                unknownOpponent: "غير معروف",
            },
            result: {
                win: "فوز",
                lose: "خسارة",
                draw: "تعادل",
                score: "النتيجة: {{score}}",
            },
        },
    },

    /* ✅ NEW: Fans ranking screen */
    fansRanking: {
        title: "ترتيب المعجبين",

        summary: {
            totalContribution: "إجمالي المساهمة",
            myRank: "ترتيبي: {{rank}}",
            myCoins: "عملاتي: {{coins}}",
        },

        states: {
            loading: "جارٍ تحميل الترتيب...",
        },

        labels: {
            levelShort: "Lv.{{level}}",
            unknownUser: "غير معروف",
        },

        errors: {
            notLoggedIn: "غير مسجل الدخول.",
            loadFailed: "فشل تحميل ترتيب المعجبين.",
            network: "خطأ في الشبكة أثناء تحميل ترتيب المعجبين.",
        },

        empty: "لا توجد مساهمات من المعجبين بعد.",
    },

    /* ✅ NEW: Help screen */
    help: {
        title: "مساعدة",

        fallbackCategories: {
            frequent: "شائع",
            livestream: "البث",
            recharge: "الشحن",
            report: "الإبلاغ",
            account: "الحساب",
        },

        states: {
            loadingFaqs: "جارٍ تحميل الأسئلة الشائعة...",
            noFaqs: "لم يتم العثور على أسئلة شائعة لهذه الفئة.",
        },

        actions: {
            myFeedback: "ملاحظاتي",
            messageFeedback: "مراسلة الدعم",
        },

        compose: {
            title: "إرسال ملاحظة",
            typeLabel: "النوع",
            subjectOptional: "الموضوع (اختياري)",
            subjectPlaceholder: "عنوان قصير",
            messageLabel: "الرسالة",
            messagePlaceholder: "اكتب التفاصيل هنا...",
            send: "إرسال",
        },

        feedback: {
            types: {
                general: "عام",
                bug: "خطأ",
                payment: "الدفع",
                account: "الحساب",
                stream: "البث",
                report: "إبلاغ",
            },
        },

        myFeedback: {
            title: "ملاحظاتي",
            empty: "لم يتم إرسال أي ملاحظات بعد.",
            adminReplyTitle: "رد الإدارة",
            noAdminReply: "لا يوجد رد من الإدارة بعد.",
        },

        alerts: {
            missingMessageTitle: "رسالة مفقودة",
            missingMessageMsg: "يرجى كتابة رسالة الملاحظة.",
            sentTitle: "تم الإرسال",
            sentMsg: "تم إرسال ملاحظتك إلى الإدارة.",
            failedTitle: "فشل",
            failedMsg: "تعذر إرسال الملاحظة. يرجى المحاولة مرة أخرى.",
        },
    },

    /* ✅ NEW: My Agency screen */
    myAgency: {
        title: "وكالتي",

        hero: {
            title: "اختر الطريقة 1 أو الطريقة 2",
            subtitle: "انضم إلى وكالة موجودة أو انتظر دعوة من وكيلك.",
        },

        method1: {
            badge: "الطريقة 1",
            title: "الانضمام إلى وكيل",
            subtitle: "سيتم تزويدك بمعرّف الوكيل من وكيلك.",
            placeholder: "يرجى إدخال معرّف الوكيل",
            button: "الانضمام إلى وكيل",
        },

        method2: {
            badge: "الطريقة 2",
            title: "انتظار دعوة الوكيل",
            subtitle: "شارك معرّفك ورمز المضيف مع وكيلك لتلقي دعوة.",
            userIdLabel: "معرّف المستخدم:",
            hostCodeLabel: "رمز المضيف:",
        },
    },

    /* ✅ NEW: Level screen */
    level: {
        header: {
            wealthTitle: "مستوى الثروة",
            liveTitle: "مستوى البث",
        },

        tabs: {
            wealth: "مستوى الثروة",
            live: "مستوى البث",
        },

        labels: {
            levelShort: "Lv.{{level}}",
        },

        progress: {
            maxLevelReached: "تم الوصول إلى الحد الأقصى للمستوى",
            distanceToUpgrade: "المتبقي للترقية · {{exp}}",
            exp: "EXP: {{exp}}",
        },

        sections: {
            myBenefits: "مزاياي",
            lockedBenefits: "المزايا المقفلة",
        },

        states: {
            loadingBenefits: "جارٍ تحميل المزايا...",
            noBenefits: "لا توجد مزايا مفتوحة بعد.",
            noLocked: "لا توجد مراحل مقفلة.",
        },

        benefits: {
            titleWithLevel: "{{title}} (Lv.{{level}})",
        },

        locked: {
            unlocksAt: "تُفتح عند Lv.{{level}}",
            unlocksAtWithPreview: "تُفتح عند Lv.{{level}} · {{preview}}",
        },
    },
    auth: {
        title: "التحقق",
        card: {
            title: "التحقق الخاص بي",
            subtitle:
                "لضمان أمان حسابك وأصولك، نوصي بإكمال التحقق.",
        },
        rows: {
            faceAuthTitle: "التحقق بالوجه",
            faceAuthDesc: "يرجى إكمال عملية التحقق أولاً.",
            faceAuthBtn: "اذهب",

            bindPhoneTitle: "ربط هاتف",
            bindPhoneDesc: "اربط هاتفك لتأمين حسابك.",
            bindPhoneBtn: "ربط",
        },
    },

    faceScan: {
        titles: {
            submitted: "تم إرسال التحقق",
            verified: "تم التحقق",
            rejected: "مرفوض",
            default: "تحقق الوجه",
        },

        permission: {
            title: "مطلوب إذن الكاميرا",
            text: "نحتاج الوصول إلى الكاميرا لإكمال التحقق من الشخص الحقيقي.",
            button: "منح الإذن",
        },

        hints: {
            placeFace: "ضع وجهك داخل الإطار.",
            keepInside: "أبقِ وجهك داخل الإطار.",
            moveCloser: "اقترب من الكاميرا.",
            moveBack: "ابتعد قليلاً للخلف.",
            centerFace: "وسّط وجهك داخل الإطار.",
            headStraight: "أبقِ رأسك مستقيماً.",
            perfectHold: "ممتاز. اثبت دون حركة…",
            visibleLight: "تأكد أن وجهك واضح في إضاءة جيدة.",
            adjustLighting: "اضبط الإضاءة وأبقِ وجهك في المنتصف.",
            capturing: "جارٍ الالتقاط…",
            uploading: "جارٍ الرفع…",
            bottom:
                "أبقِ كامل وجهك داخل الإطار. يتم الالتقاط تلقائياً عند المحاذاة.",
        },

        states: {
            waitTitle: "انتظر الموافقة",
            waitText:
                "تم رفع مسح الوجه. سيقوم فريقنا بمراجعته والموافقة على طلبك.",
            autoChecking: "جارٍ التحقق التلقائي من الحالة…",

            alreadyVerified: "أنت مُتحقق بالفعل",
            closing: "سيتم الإغلاق تلقائياً…",
            continue: "متابعة",

            notApproved: "غير مُعتمد",
            rejectedText:
                "تم رفض التحقق. حاول مرة أخرى بإضاءة جيدة ووجه واضح.",
            rescan: "إعادة المسح",

            checking: "جارٍ التحقق من حالة التحقق…",
            tryAgain: "حاول مرة أخرى",
        },

        errors: {
            loginFirst: "يرجى تسجيل الدخول أولاً.",
            statusFailed: "فشل التحقق من الحالة",
            captureFailed: "فشل التقاط الصورة. يرجى المحاولة مرة أخرى.",
            network: "خطأ شبكة/غير متوقع أثناء المسح.",
            imageTooLarge:
                "فشل الرفع: الصورة كبيرة جداً (413). خفّض الجودة أو زد حدود الخادم.",
            uploadFailed: "فشل الرفع ({{code}}).",
        },
    },

     outfit: {
    title: "ملابسي",

    tabs: {
      backpack: "هدايا الحقيبة",
      avatar: "إطار الصورة الرمزية",
      party: "سمة الحفلة",
    },

    states: {
      loading: "جارٍ تحميل العناصر الخاصة بك…",
    },

    actions: {
      retry: "إعادة المحاولة",
      equip: "تجهيز",
      unequip: "إزالة التجهيز",
    },

    errors: {
      loginRequired: "مطلوب تسجيل الدخول (gl_user_id غير موجود).",
      loadFailed: "فشل تحميل عناصر الملابس",
    },

    empty: {
      backpack: "لا توجد هدايا في الحقيبة بعد",
      avatar: "لا توجد إطارات للصور الرمزية بعد",
      party: "لا توجد سمات حفلات بعد",
      hint:
        "اشترِ عناصر من المتجر. تعرض هذه الصفحة فقط العناصر التي تملكها (UserStoreItem).",
    },

    labels: {
      permanent: "دائم",
      limited: "محدود",
      expired: "منتهي الصلاحية",
      oneDayLeft: "متبقّي يوم واحد",
      daysLeft: "متبقّي {{count}} يومًا",

      owned: "مملوك",
      item: "عنصر",

      equipped: "مُجهّز",
      tapToUse: "اضغط للتجهيز/إزالة التجهيز",
    },
  },
  giftGallery: {
    title: "معرض الهدايا",
    states: {
      loading: "جارٍ التحميل…",
    },
    errors: {
      notLoggedIn: "لم يتم العثور على المستخدم، يرجى تسجيل الدخول مرة أخرى.",
      loadFailed: "فشل تحميل معرض الهدايا.",
      network: "خطأ في الشبكة. يرجى المحاولة مرة أخرى.",
    },
    summary: {
      totalValue: "إجمالي قيمة الهدايا",
      totalGifts: "{{count}} هدية",
      uniqueGifts: "{{count}} نوعًا",
    },
    actions: {
      goToPoints: "الانتقال إلى النقاط",
    },
    labels: {
      coins: "عملات",
      qtyLine: "x{{qty}} • {{unit}} عملة لكل واحدة",
    },
    empty: "لم يتم استلام أي هدايا بعد.",
  },
    followUs: {
        title: "تابعنا",

        brandName: "Gold Live",
        tagline: "مجتمع عالمي",

        hero: {
            subtitle:
                "اكتشف محتوى مميز وتواصل مع أشخاص من جميع أنحاء العالم.\nانضم إلى المجتمعات أدناه وابدأ رحلتك الاجتماعية.",
        },

        sectionTitle: "مجتمعات موصى بها",

        states: {
            loading: "جارٍ تحميل المجتمعات…",
        },

        errors: {
            backendMissing:
                "مسار الخادم غير موجود (استخدام روابط افتراضية). إذا أردت التحكم من الخادم، أضف GET /api/public/follow-us.",
            linkTitle: "خطأ في الرابط",
            cannotOpen: "لا يمكن فتح هذا الرابط على هذا الجهاز.",
            openFailed: "تعذر فتح الرابط",
        },

        social: {
            facebook: "Facebook",
            youtube: "YouTube",
            instagram: "Instagram",
            tiktok: "TikTok",
            telegram: "Telegram",
            discord: "Discord",
            x: "X",
            community: "المجتمع",
        },
    },
    editProfile: {
        title: "تعديل الملف الشخصي",
        actions: { save: "حفظ", addTag: "إضافة" },
        states: { loadingProfile: "جارٍ تحميل بيانات الملف الشخصي..." },
        sections: { myProfile: "ملفي الشخصي", interestTags: "وسوم الاهتمامات" },
        fields: {
            nickname: "اللقب",
            gender: "الجنس (ذكر/أنثى)",
            dob: "تاريخ الميلاد",
            country: "الدولة",
            selfIntro: "نبذة عنك",
        },
        placeholders: {
            enterNickname: "أدخل اللقب",
            selectDate: "اختر التاريخ",
            writeBio: "اكتب شيئاً عن نفسك",
            typeTag: "اكتب وسمًا",
        },
        helpers: {
            cannotModify: "[لا يمكن تعديله]",
            noTags: "لا توجد وسوم بعد. أضف بعضاً بالأسفل.",
            longPressRemove: "اضغط مطولاً على الوسم لإزالته.",
        },
        labels: {
            notSet: "غير محدد",
            userFallback: "مستخدم",
        },
        gender: { male: "ذكر", female: "أنثى", other: "آخر" },
        alerts: {
            notLoggedInTitle: "غير مسجل الدخول",
            loginAgainMsg: "يرجى تسجيل الدخول مرة أخرى.",
            permissionNeededTitle: "إذن مطلوب",
            permissionNeededMsg: "يرجى السماح بالوصول للصور لاختيار صورة الملف الشخصي.",
            duplicateTagTitle: "وسم مكرر",
            duplicateTagMsg: "لقد أضفت هذا الوسم بالفعل.",
            savedTitle: "تم الحفظ",
            savedMsg: "تم تحديث الملف الشخصي بنجاح.",
            loadFailedMsg: "فشل تحميل الملف الشخصي",
            updateFailedMsg: "فشل تحديث الملف الشخصي",
            networkLoadMsg: "خطأ في الشبكة أثناء تحميل الملف الشخصي.",
            networkSaveMsg: "خطأ في الشبكة أثناء حفظ الملف الشخصي.",
            galleryFailedMsg: "تعذر فتح المعرض.",
        },
    },

    explore: {
        tabs: { following: "يتابع", explore: "استكشاف", new: "جديد", near: "قريب" },
        search: { placeholder: "بحث", cancel: "إلغاء" },
        chips: { popular: "شائع", more: "المزيد" },
        actions: { live: "مباشر" },
        states: {
            loadingCountries: "جارٍ تحميل الدول...",
            refreshingList: "جارٍ تحديث قائمة البث...",
            empty: "لم يتم العثور على مضيفين مباشرين. جرّب تغيير الفلاتر.",
        },
        errors: {
            loadCountries: "فشل تحميل الدول",
            networkCountries: "خطأ في الشبكة أثناء تحميل الدول",
            loadFeed: "فشل تحميل خلاصة الاستكشاف",
            networkFeed: "خطأ في الشبكة أثناء تحميل الخلاصة",
        },
        alerts: {
            liveEndedTitle: "انتهى البث",
            liveEndedMsg: "لقد انتهى هذا البث المباشر.",
        },
        labels: {
            liveBadge: "LIVE",
            userFallback: "مستخدم",
            viewers: "👀 {{count}}",
        },
    },

    guardMe: {
        title: "احرسني",
        actions: { goBack: "العودة" },
        states: { loading: "جارٍ التحميل…", empty: "لا أحد يحرسك بعد" },
        labels: { currentGuardian: "حارسك الحالي", tier: "المستوى", ends: "ينتهي", started: "بدأ" },
        errors: {
            missingUser: "userId مفقود. يرجى تسجيل الدخول مرة أخرى.",
            loadFailed: "فشل التحميل",
        },
    },

     coins: {
    title: "العملات",
    pointsTab: "النقاط",
    labels: {
      remainingCoins: "العملات المتبقية",
      balanceAfter: "الرصيد: {{balance}}",
      pkgCoins: "{{coins}} عملة",
      pkgId: "الباقة: {{id}}",
      coinsUnit: "عملات",
    },
    actions: { topUp: "شحن", refresh: "تحديث" },
    filters: { all: "الكل", topups: "عمليات الشحن", spent: "المصروف" },
    states: {
      loading: "جارٍ التحميل…",
      empty: "لا يوجد سجل",
      scrollMore: "مرّر للمزيد…",
      end: "نهاية",
      loadingPackages: "جارٍ تحميل الباقات…",
      noPackages: "لا توجد باقات",
    },
    types: { topup: "شحن", giftSent: "إرسال هدية" },
    modal: {
      title: "شحن",
      note:
        "ملاحظة: هذا الشحن للاختبار فقط. سيتم إضافة المدفوعات الحقيقية لاحقًا.",
    },
    alerts: {
      walletErrorTitle: "خطأ في المحفظة",
      historyErrorTitle: "خطأ في السجل",
      topupErrorTitle: "خطأ في الشحن",
      loginRequiredTitle: "مطلوب تسجيل الدخول",
      topupFailedTitle: "فشل الشحن",
      successTitle: "نجاح",
      addedCoinsMsg: "تمت إضافة {{coins}} عملة",
    },
    errors: {
      loadWallet: "فشل تحميل المحفظة",
      loadHistory: "فشل تحميل السجل",
      loadMore: "فشل تحميل المزيد",
      loadPackages: "فشل تحميل الباقات",
      topupFailed: "فشل الشحن",
    },
  },

    liveApplication: {
        title: "طلب البث",
        states: { loading: "جارٍ التحميل..." },
        labels: { status: "الحالة:" },

        status: {
            none: "لا شيء",
            pending: "قيد المراجعة",
            approved: "مقبول",
            rejected: "مرفوض",
        },

        defaults: {
            liveTitle: "بثي",
            hostName: "المضيف",
        },

        rows: {
            faceAuthTitle: "التحقق بالوجه",
            faceAuthNeed: "يرجى إكمال عملية التحقق أولاً.",
            livePhotoTitle: "صورة البث",
            livePhotoNeed: "يرجى رفع غلاف البث مرة أخرى.",
            wealthTitle: "مستوى الثروة ≥ المستوى {{level}}",
            wealthSubtitle: "مستواك: {{level}}",
            completed: "مكتمل",
            uploaded: "تم الرفع",
        },

        actions: { goLive: "ابدأ البث", applyOrComplete: "تقديم / إكمال الخطوات" },

        errors: {
            loginRequired: "تسجيل الدخول مطلوب",
            loadFailed: "فشل تحميل حالة البث",
            network: "خطأ في الشبكة",
            notLoaded: "لم يتم تحميل حالة البث بعد.",
            submitFailed: "فشل إرسال الطلب",
            submitNetwork: "خطأ في الشبكة أثناء إرسال الطلب",
            startFailed: "فشل بدء البث",
            startNetwork: "خطأ في الشبكة أثناء بدء البث",
        },

        alerts: {
            wealthRequiredTitle: "مطلوب مستوى ثروة",
            wealthRequiredMsg: "تحتاج المستوى {{level}}.",
            underReviewTitle: "قيد المراجعة",
            underReviewMsg: "يرجى انتظار موافقة الإدارة.",
            submittedTitle: "تم الإرسال",
            submittedMsg: "تم إرسال طلبك. يرجى الانتظار للمراجعة.",
            infoTitle: "معلومة",
            wealthInfoMsg: "ارفع مستوى الثروة عبر الإنفاق/إرسال الهدايا وغيرها.",
        },
    },

    // ✅ NEW: Home Feed
    homeFeed: {
        tabs: {
            following: "يتابع",
            square: "الساحة",
            video: "فيديو",
        },

        search: {
            squarePlaceholder: "ابحث في المنشورات والمواضيع والمستخدمين",
            videoPlaceholder: "ابحث في الفيديوهات والمستخدمين",
        },

        time: {
            secondsAgo: "منذ {{count}}ث",
            minutesAgo: "منذ {{count}} د",
            hoursAgo: "منذ {{count}} س",
            daysAgo: "منذ {{count}} ي",
        },

        eventBanner: {
            title: "فعالية موضوع نادي المعجبين",
            dateRange: "12/11/2025 - 18/11/2025 [UTC+8]",
        },

        alerts: {
            loginRequiredTitle: "تسجيل الدخول مطلوب",
            loginToLikePosts: "يرجى تسجيل الدخول للإعجاب بالمنشورات.",
            loginToLikeVideos: "يرجى تسجيل الدخول للإعجاب بالفيديوهات.",
        },

        following: {
            chips: {
                popular: "شائع",
                pakistan: "باكستان",
                philippines: "الفلبين",
                more: "المزيد",
            },
            empty: "لا توجد غرف بث من أشخاص تتابعهم بعد.",
            errors: {
                loadFailed: "فشل تحميل خلاصة المتابعة",
                network: "خطأ في الشبكة أثناء تحميل خلاصة المتابعة",
            },
        },

        square: {
            hotTopics: "مواضيع ساخنة",
            more: "المزيد >",
            noTopicsYet: "لا توجد مواضيع بعد",
            emptySearch: "لا توجد نتائج.",
            emptyFeed: "لا توجد منشورات بعد. كن أول من يشارك شيئاً!",
            hotBadge: "HOT",
            viewAllComments: "عرض كل {{count}} التعليقات",
            errors: {
                loadFailed: "فشل تحميل خلاصة الساحة",
                network: "خطأ في الشبكة أثناء تحميل خلاصة الساحة",
            },
        },

        video: {
            states: {
                loadingVideos: "جارٍ تحميل الفيديوهات...",
                empty: "لا توجد فيديوهات بعد.",
            },
            actions: {
                share: "مشاركة",
            },
            labels: {
                originalSound: "الصوت الأصلي",
            },
            tip: {
                title: "نصيحة",
                label: "نصيحة",
                msg: "يمكن إضافة إرسال الهدايا للفيديو لاحقاً (يحتاج نموذج معاملات DB).",
            },
            errors: {
                loadFailed: "فشل تحميل خلاصة الفيديو",
                network: "خطأ في الشبكة أثناء تحميل خلاصة الفيديو",
                videoFailed: "فشل تحميل الفيديو",
                debugHint:
                    "إذا بقيت الشاشة سوداء، تحقق من ترويسات الخادم: Content-Type video/mp4 + Accept-Ranges bytes",
            },
        },
    },

    // ✅ NEW: Honor Wall
    honorWall: {
        title: "جدار الشرف",
        tabs: {
            data: "البيانات",
            honor: "جدار الشرف",
        },
        states: {
            loading: "جارٍ تحميل جدار الشرف...",
        },
        cards: {
            tagWall: "جدار الوسوم",
            medalWall: "جدار الأوسمة",
            giftCollection: "مجموعة الهدايا",
            vehicleWall: "جدار المركبات",
            notObtained: "لم يتم الحصول عليه بعد",
            countMore: "{{count}} >",
        },
    },

    // ✅ NEW: Host Live Room
    hostLiveRoom: {
        defaults: {
            liveTitle: "بثي",
            hostName: "المضيف",
        },
        states: {
            preparing: "جارٍ تجهيز غرفة البث...",
            stopping: "جارٍ إيقاف البث...",
        },
        permission: {
            required: "مطلوب إذن الكاميرا",
            grant: "منح الإذن",
        },
        labels: {
            liveBadge: "LIVE",
            liveTitle: "عنوان البث",
        },
        placeholders: {
            liveTitle: "أدخل عنوان البث...",
            chat: "قل شيئاً...",
        },
        actions: {
            goLive: "ابدأ البث",
            stop: "إيقاف",
        },
        alerts: {
            stopTitle: "إيقاف البث؟",
            stopMsg: "سيُنهي هذا البث المباشر.",
        },
        chat: {
            welcome: "مرحباً بك في غرفة بثك 👋",
            guest: "ضيف",
            line: "{{name}}: {{text}}",
            meLine: "أنا: {{text}}",
            system: "ℹ️ {{text}}",
        },
        errors: {
            cameraRequiredToGoLive: "❗ إذن الكاميرا مطلوب لبدء البث.",
        },
        messages: {
            liveNow: "🔴 أنت الآن LIVE!",
        },
    },

    // ✅ NEW: Hot Topics
    hotTopics: {
        title: "المواضيع الساخنة",
        tabs: {
            daily: "يومي",
            official: "رسمي",
            normal: "عادي",
        },
        labels: {
            hotCount: "HOT {{count}}",
        },
        empty: "لا توجد مواضيع بعد في هذه الفئة.",
        errors: {
            loadFailed: "فشل تحميل المواضيع",
            network: "خطأ في الشبكة أثناء تحميل المواضيع",
        },
    },

    // ✅ NEW: Live Cover
    liveCover: {
        title: "غلاف البث",
        card: {
            title: "رفع صورة غلاف البث",
            subtitle: "تُستخدم هذه الصورة كغلاف لبثك. استخدم إضاءة جيدة وصورة واضحة.",
        },
        states: {
            checking: "جارٍ التحقق…",
            uploading: "جارٍ رفع غلاف بثك…",
            checkingStatus: "جارٍ التحقق من حالة غلاف البث…",
            uploaded: "تم الرفع بنجاح",
        },
        labels: {
            alreadyUploaded: "لقد رفعت غلاف بث بالفعل.",
            preview: "معاينة",
            selectCover: "اختر صورة غلاف",
            cameraSide: "الكاميرا: {{side}}",
            front: "أمامية",
            back: "خلفية",
        },
        actions: {
            change: "تغيير",
            upload: "رفع",
            uploadCover: "رفع الغلاف",
            camera: "الكاميرا",
            gallery: "المعرض",
        },
        alerts: {
            permissionNeededTitle: "إذن مطلوب",
            galleryPermissionMsg: "يرجى السماح بالوصول للمعرض.",
            cameraPermissionMsg: "يرجى السماح بالوصول للكاميرا.",
        },
        errors: {
            loginRequired: "تسجيل الدخول مطلوب",
            loadFailed: "فشل تحميل الحالة",
            network: "خطأ في الشبكة",
            selectPhotoFirst: "يرجى اختيار صورة أولاً.",
            imageTooLarge: "الصورة كبيرة جداً (413). جرّب صورة أخرى.",
            uploadFailed: "فشل الرفع ({{code}})",
            uploadFailedGeneric: "فشل الرفع",
            noImageReturned: "لم يتم إرجاع صورة.",
            cameraNoImage: "لم تُعد الكاميرا صورة.",
            cannotReadBase64: "تعذر قراءة الصورة كـ base64. جرّب صورة أخرى.",
            openGalleryFailed: "فشل فتح المعرض",
            openCameraFailed: "فشل فتح الكاميرا",
            androidEmulatorHint: "إذا كنت على محاكي Android: غالباً الكاميرا لا تعمل. جرّب جهازاً حقيقياً.",
        },
    },
    vipCenter: {
        title: "مركز VIP",
        states: {
            loading: "جارٍ تحميل VIP...",
        },
        current: {
            none: "الحالي: لا يوجد VIP",
            active: "الحالي: {{name}} • متبقي {{days}} أيام",
        },
        labels: {
            perMonth: "/M",
            defaultDescription: "احصل على VIP واستمتع بالامتيازات",
            privilegesCount: "امتيازات VIP الحصرية {{count}}/{{total}}",
        },
        actions: {
            open: "فتح {{name}}",
        },
        alerts: {
            purchaseTitle: "شراء VIP",
            purchaseMsg: "بدء مسار الشراء لـ {{tier}}.",
        },
    },

    topicDetail: {
        states: {
            empty: "لا توجد لحظات بعد تحت هذا الموضوع.",
        },
        errors: {
            loadFailed: "فشل تحميل خلاصة الموضوع",
            network: "خطأ في الشبكة أثناء تحميل خلاصة الموضوع",
        },
        alerts: {
            loginRequiredTitle: "تسجيل الدخول مطلوب",
            loginRequiredMsg: "يرجى تسجيل الدخول للإعجاب بالمنشورات.",
            likeFailedTitle: "خطأ",
            likeFailedMsg: "تعذر الإعجاب بهذا المنشور حالياً.",
        },
    },

    visitProfile: {
        titleFallback: "الملف الشخصي",
        states: {
            notFound: "الملف الشخصي غير موجود.",
            noMoments: "لا توجد لحظات بعد.",
        },
        labels: {
            id: "المعرّف: {{id}}",
            followers: "المتابعون",
            following: "يتابع",
        },
        actions: {
            follow: "متابعة",
            following: "يتابع",
        },
    },

    realPersonAuth: {
        title: "التحقق",
        hero: {
            title: "سيبدأ التحقق من الشخص الحقيقي قريباً.",
            subtitle: "يرجى التأكد أنك المستخدم",
        },
        tips: {
            avoidCover: "تجنب التغطية",
            enoughLight: "حافظ على إضاءة كافية",
            minorsProhibited: "يُحظر القُصّر",
        },
        actions: {
            start: "بدء التحقق",
        },
    },

    postMoment: {
        title: "نشر لحظات",
        actions: {
            post: "نشر",
            posting: "جارٍ النشر...",
            refresh: "تحديث",
        },
        labels: {
            postingTo: "النشر إلى #{{topic}}",
            recommended: "مواضيع موصى بها",
        },
        placeholders: {
            input: "قل شيئاً لتسجيل هذه اللحظة...",
        },
        sheets: {
            title: "إضافة",
            message: "اختر نوع الوسائط",
            addPhotos: "إضافة صور",
            addVideos: "إضافة فيديوهات",
        },
        permissions: {
            title: "إذن مطلوب",
            libraryMsg: "يرجى السماح بالوصول لتتمكن من الرفع.",
            cameraMsg: "يرجى السماح بالوصول للكاميرا.",
        },
        alerts: {
            nothingTitle: "لا يوجد شيء للنشر",
            nothingMsg: "يرجى كتابة شيء أو إضافة صورة/فيديو.",
            notLoggedInTitle: "غير مسجل الدخول",
            notLoggedInMsg: "يرجى تسجيل الدخول مرة أخرى.",
            errorTitle: "خطأ",
            postFailed: "فشل نشر اللحظة.",
            postedTitle: "تم النشر",
            postedVideo: "سيظهر فيديوك في تبويب الفيديو.",
            postedSquare: "سيظهر منشورك في الساحة.",
        },
        errors: {
            notLoggedIn: "غير مسجل الدخول",
            uploadFailed: "فشل الرفع",
            uploadEmpty: "عاد الرفع بعنوان URL فارغ",
            networkPost: "خطأ في الشبكة أثناء نشر اللحظة.",
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
    title: "النقاط",
    coinsTab: "العملات",
    actions: {
      details: "التفاصيل",
      withdraw: "اسحب الآن",
      exchange: "استبدال النقاط بالعملات",
      exchanging: "جارٍ الاستبدال...",
      refresh: "تحديث",
    },
    labels: {
      available: "النقاط المتاحة",
      total: "الإجمالي: {{count}}",
      unconfirmed: "غير مؤكدة: {{count}}",
      income: "الدخل",
      last30: "آخر 30 يومًا",
    },
    income: {
      livestream: "بث مباشر",
      party: "حفلة",
      platformRewards: "مكافآت المنصة",
    },
    states: {
      loading: "جارٍ التحميل…",
    },
    hints: {
      exchangeRate:
        "يمكن تغيير سعر الصرف لاحقًا من الخلفية (POINTS_PER_COIN).",
    },
    alerts: {
      errorTitle: "خطأ",
      successTitle: "نجاح",
      loginRequiredTitle: "مطلوب تسجيل الدخول",
      loginRequiredMsg: "يرجى تسجيل الدخول مرة أخرى.",
      detailsSoon: "سيتم إضافة شاشة التفاصيل قريبًا.",
      withdrawSoon: "سيتم إضافة ميزة السحب قريبًا.",
      exchangeFailedTitle: "فشل الاستبدال",
      exchangeSuccessMsg: "تم استبدال {{points}} نقطة → {{coins}} عملة.",
    },
    errors: {
      loadFailed: "فشل تحميل النقاط",
      exchangeFailed: "فشل استبدال النقاط",
    },
    ranges: {
      title: "اختر المدة",
      last7: "آخر 7 أيام",
      last30: "آخر 30 يومًا",
      last90: "آخر 90 يومًا",
    },
    withdraw: {
      title: "سحب النقاط",
      available: "المتاح: {{points}} نقطة",
      fields: {
        points: "النقاط المراد سحبها",
        method: "الطريقة",
        account: "تفاصيل الحساب",
      },
      placeholders: {
        account: "مثال: 03xx-xxxxxxx / IBAN / اسم الحساب",
      },
      actions: {
        submit: "إرسال الطلب",
        submitting: "جارٍ الإرسال...",
      },
      note:
        "تذهب طلبات السحب إلى المشرف للموافقة. قد يتم تعليق النقاط حتى تتم المعالجة.",
      alerts: {
        successTitle: "تم الإرسال",
        successMsg: "تم إرسال طلب السحب الخاص بك.",
        failedTitle: "فشل السحب",
      },
      errors: {
        invalidPoints: "يرجى إدخال مقدار نقاط صالح.",
        accountRequired: "يرجى إدخال تفاصيل الحساب.",
        failed: "تعذّر إرسال طلب السحب.",
      },
    },
    details: {
      title: "تفاصيل النقاط",
      intro: "إليك كيفية عمل النقاط على المنصة:",
      lines: {
        available: "النقاط المتاحة هي النقاط التي يمكنك استبدالها أو سحبها.",
        unconfirmed:
          "النقاط غير المؤكدة لا تزال قيد التحقق وقد تتغير.",
        total: "إجمالي النقاط يشمل المتاحة + غير المؤكدة.",
        income:
          "يعرض الدخل من أين جاءت نقاطك ضمن المدة المحددة.",
        exchange:
          "الاستبدال يحول النقاط إلى عملات. قد يتغير سعر الاستبدال حسب قواعد المنصة.",
        withdraw:
          "تتم مراجعة طلبات السحب قبل الدفع. تأكد من صحة تفاصيل حسابك.",
      },
      footer:
        "إذا واجهت أي مشكلة، يرجى التواصل مع الدعم من شاشة الملف الشخصي.",
    },
  },

momentComments: {
    title: "لحظات {{owner}}",
    empty: "لا توجد تعليقات بعد. كن أول من يرد!",
    placeholder: "اكتب تعليقاً...",
},

myGuardian: {
    title: "حارسي",
    empty: "لم تحرس أحداً بعد.",
    actions: {
        goBack: "العودة",
    },
    card: {
        meta: "المستوى: {{tier}} • ينتهي: {{ends}}",
    },
    errors: {
        missingUserId: "userId مفقود. يرجى تسجيل الدخول مرة أخرى.",
        loadFailed: "فشل التحميل",
    },
},

myProfile: {
    tabs: {
        posts: "المنشورات",
    },
    items: {
        giftGallery: "معرض الهدايا",
        contribution: "المساهمة",
    },
    sections: {
        personalInfo: "معلومات شخصية",
    },
    labels: {
        idLine: "المعرّف: {{id}}",
        followingFollowers: "يتابع {{following}} · المتابعون {{followers}}",
        fansCount: "{{count}} معجب",
        lit: "Lit: {{current}}/{{total}}",
        participantsRank: "المشاركون في الترتيب: {{count}}",
    },
    defaults: {
        bio: "كان/كانت كسولاً ولم يترك شيئاً وراءه.",
    },
    alerts: {
        waitTitle: "يرجى الانتظار",
        profileLoadingMsg: "لا يزال الملف الشخصي قيد التحميل.",
    },
},

notificationsInbox: {
    postOwnerName: "منشور",
    inboxSearchPlaceholder: "ابحث في الإشعارات...",
},

party: {
    tabs: {
        following: "يتابع",
        party: "حفلة",
    },
    search: {
        placeholder: "ابحث في غرف الحفلات",
    },
    filters: {
        popular: "شائع",
        pakistan: "باكستان",
        philippines: "الفلبين",
        more: "المزيد",
    },
    labels: {
        defaultTag: "حفلة",
    },
    states: {
        empty: "لم يتم العثور على غرف. جرّب تغيير الفلتر أو البحث.",
    },
    errors: {
        loadFailed: "فشل تحميل غرف الحفلات",
        network: "خطأ في الشبكة أثناء تحميل غرف الحفلات",
    },
},

};
