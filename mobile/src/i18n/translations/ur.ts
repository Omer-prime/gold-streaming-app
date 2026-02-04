// src/i18n/ur.ts
export default {
    common: {
    ok: "ٹھیک ہے",
    cancel: "منسوخ",
    loading: "...",
    loadingText: "لوڈ ہو رہا ہے…",

    error: "ایرر",
    success: "کامیابی",
    done: "ہو گیا",
    failed: "ناکام",

    edit: "ایڈٹ",
    block: "بلاک",
    remove: "ہٹائیں",
    you: "آپ",

    sendCode: "کوڈ بھیجیں",
    verifyAndBind: "ویریفائی اور بائنڈ کریں",
    bind: "بائنڈ",
    unbind: "اَن بائنڈ",
    changePhoneNumber: "فون نمبر تبدیل کریں",
    userFallback: "یوزر",

    codeSent: "کوڈ بھیج دیا گیا",
  },

    errors: {
        userNotFound: "یوزر نہیں ملا، براہِ کرم دوبارہ لاگ اِن کریں۔",
        updateFailed: "زبان اپڈیٹ نہیں ہو سکی۔",
    },

    settings: {
        title: "سیٹنگز",
        versionText: "1.0.0 (Gold Live)",

        items: {
            accountAndSecurity: "اکاؤنٹ اور سیکیورٹی",
            securityPassword: "سیکیورٹی پاس ورڈ",
            languageSetting: "زبان کی سیٹنگ",

            blacklist: "بلیک لسٹ",
            privilegeSettings: "پرِولیج سیٹنگز",
            newMessagesNotification: "نئے پیغامات کی نوٹیفکیشن",
            privacy: "پرائیویسی",

            version: "ورژن",
            aboutGoldLive: "Gold Live کے بارے میں",
            clearCache: "کیچ صاف کریں",
        },

        security: {
            levelPrefix: "سیکیورٹی لیول:",
            levelLow: "کم",
            levelMedium: "درمیانہ",
            levelHigh: "زیادہ",
        },

        actions: {
            clearCacheTitle: "کیچ صاف کریں",
            clearCacheMsg: "ایپ کیچ صاف کر دیا گیا (اس سے آپ لاگ آؤٹ نہیں ہوں گے)۔",

            switchAccountTitle: "اکاؤنٹ تبدیل کریں",
            switchAccountMsg: "کیا آپ اکاؤنٹ تبدیل کرنا چاہتے ہیں؟",
            switch: "تبدیل کریں",
            switchAccountBtn: "اکاؤنٹ تبدیل کریں",

            logoutTitle: "لاگ آؤٹ",
            logoutMsg: "کیا آپ واقعی لاگ آؤٹ کرنا چاہتے ہیں؟",
            logout: "لاگ آؤٹ",
            logoutBtn: "لاگ آؤٹ",
        },

        language: {
            title: "زبان کی سیٹنگ",
            followSystem: "سسٹم کے مطابق",
            english: "انگریزی",
            traditionalChinese: "繁體中文",
            arabic: "العربية",
            urdu: "اردو",
            portuguese: "Português",
            spanish: "Español",
        },
    },

    accountSecurity: {
        title: "اکاؤنٹ اور سیکیورٹی",
        levelText: "آپ کے اکاؤنٹ کی سیکیورٹی سطح {{level}} ہے۔",
        tip: "موبائل نمبر یا ای میل بائنڈ کرنے سے آپ کی سیکیورٹی سطح بڑھ سکتی ہے۔",

        rows: {
            setPassword: "پاس ورڈ سیٹ کریں",
            phoneNumber: "فون نمبر",
            email: "ای میل",
            google: "Google",
            facebook: "Facebook",
            instagram: "Instagram",
            tiktok: "TikTok",
            deviceManagement: "ڈیوائس مینجمنٹ",
        },

        trailing: {
            modify: "تبدیل کریں",
            set: "سیٹ کریں",
            bound: "باؤنڈ",
            bind: "بائنڈ",
        },

        cancel: {
            title: "اکاؤنٹ منسوخ کریں",
            msg: "اکاؤنٹ کینسلیشن فلو بعد میں بنایا جائے گا۔",
            button: "اکاؤنٹ منسوخ کریں",
        },
    },

    securityPassword: {
        title: "سیکیورٹی پاس ورڈ",

        fields: {
            current: "موجودہ پاس ورڈ",
            new: "نیا پاس ورڈ",
            confirm: "نیا پاس ورڈ کنفرم کریں",
        },

        actions: {
            save: "محفوظ کریں",
            saving: "محفوظ ہو رہا ہے...",
        },

        errors: {
            title: "خرابی",
            enterNew: "براہِ کرم نیا پاس ورڈ درج کریں۔",
            mismatch: "نیا پاس ورڈ اور کنفرم پاس ورڈ ایک جیسے نہیں ہیں۔",
            updateFailed: "پاس ورڈ اپڈیٹ نہیں ہو سکا",
            network: "نیٹ ورک خرابی، براہِ کرم دوبارہ کوشش کریں۔",
        },

        success: {
            title: "کامیاب",
            msg: "پاس ورڈ کامیابی سے اپڈیٹ ہو گیا۔",
        },
    },

    bindPhone: {
        title: "فون بائنڈ کریں",
        subtitle:
            "اپنا موبائل نمبر بائنڈ کریں تاکہ آپ کا Gold Live اکاؤنٹ محفوظ رہے اور لاگ اِن آسان ہو جائے۔",
        currentBoundLabel: "موجودہ باؤنڈ فون:",

        sections: {
            enterPhone: "فون درج کریں",
            enterCode: "کوڈ درج کریں",
        },

        labels: {
            sentTo: "یہاں بھیجا گیا: {{phone}}",
        },

        placeholders: {
            phone: "براہِ کرم اپنا فون نمبر درج کریں",
            code: "تصدیقی کوڈ",
        },

        alerts: {
            codeSentMsg: "ہم نے {{phone}} پر ایک کوڈ بھیجا ہے۔",
            devCode: "DEV CODE: {{code}}",
            successMsg: "فون کامیابی سے بائنڈ ہو گیا۔",
        },

        terms: {
            prefix: "میں نے پڑھ لیا ہے اور میں نے قبول کیا ہے ",
            tos: "Gold Live سروس کی شرائط",
            and: " اور ",
            privacy: "پرائیویسی پالیسی",
            suffix: "۔",
        },
    },

    bindEmail: {
        title: "ای میل بائنڈ کریں",
        currentBoundLabel: "موجودہ باؤنڈ ای میل:",
        noBoundYet: "ابھی تک کوئی ای میل بائنڈ نہیں ہے۔",

        labels: {
            email: "ای میل",
            code: "تصدیقی کوڈ",
        },

        placeholders: {
            email: "اپنی ای میل درج کریں",
            code: "کوڈ درج کریں",
        },

        alerts: {
            codeSentMsg: "ہم نے {{email}} پر ایک کوڈ بھیجا ہے۔",
            devCode: "DEV CODE: {{code}}",
            successMsg: "ای میل کامیابی سے بائنڈ ہو گئی۔",
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
            google: "Google بائنڈ کریں",
            facebook: "Facebook بائنڈ کریں",
            instagram: "Instagram بائنڈ کریں",
            tiktok: "TikTok بائنڈ کریں",
        },

        status: {
            notBound: "ابھی بائنڈ نہیں ہے۔",
            currentlyBound: "اس وقت بائنڈ ہے: {{id}}",
        },

        tempBackendHint:
            "عارضی بیک اینڈ بائنڈنگ (بعد میں OAuth سے بدلیں)۔ {{provider}} کی id درج کریں:",

        placeholders: {
            google: "googleId (بعد میں OAuth سے)",
            facebook: "facebookId (بعد میں OAuth سے)",
            instagram: "instagramId (بعد میں OAuth سے)",
            tiktok: "tiktokId (بعد میں OAuth سے)",
        },

        alerts: {
            loadFailed: "بائنڈ اسٹیٹس لوڈ نہیں ہو سکا",
            boundSuccess: "{{provider}} کامیابی سے بائنڈ ہو گیا۔",
            unboundSuccess: "{{provider}} اَن بائنڈ ہو گیا۔",
        },
    },

    deviceManagement: {
        title: "ڈیوائس مینجمنٹ",

        labels: {
            empty: "ابھی تک کوئی ڈیوائس معلومات نہیں۔",
            unknownDevice: "نامعلوم ڈیوائس",
            lastActiveTime: "آخری بار فعال وقت: {{time}}",
            friendlyName: "{{platform}} ڈیوائس",
        },

        badges: {
            current: "موجودہ ڈیوائس",
            trusted: "ڈیوائس پر اعتماد کریں",
        },

        errors: {
            notLoggedIn: "لاگ اِن نہیں ہیں۔ براہِ کرم دوبارہ لاگ اِن کریں۔",
            loadFailed: "ڈیوائسز لوڈ نہیں ہو سکیں۔",
            network: "ڈیوائسز لوڈ کرتے وقت نیٹ ورک خرابی۔",
        },
    },

    blacklist: {
        title: "بلیک لسٹ",
        searchPlaceholder: "یوزر کی ID یا یوزرنیم درج کریں",
        empty: "کوئی بلاک شدہ یوزر نہیں",

        labels: {
            id: "ID: {{id}}",
        },

        errors: {
            addFailed: "بلیک لسٹ میں شامل نہیں ہو سکا۔",
        },
    },

    privilegeSettings: {
        title: "پرِولیج سیٹنگز",
        items: {
            invisibleVisitor: {
                label: "اِنویزیبل وزیٹر",
                description:
                    "بغیر ریکارڈ چھوڑے دوسروں کو وزٹ کریں، اور دوسرے بھی یہ نہیں دیکھ سکیں گے کہ ہوم پیج کس نے وزٹ کیا۔",
            },
            mysteryLive: {
                label: "LIVE روم میں مسٹری مین",
                description: "LIVE رومز میں صرف گفٹ وصول کرنے والا آپ کی شناخت دیکھ سکتا ہے۔",
            },
            mysteryRank: {
                label: "رینک پر مسٹری مین",
                description: "آپ کے گفٹس ہوسٹ کی فین رینکنگ میں نظر نہیں آئیں گے۔",
            },
            invisibleOnline: {
                label: "اِنویزیبل آن لائن",
                description:
                    "ہمیشہ اِنویزیبل اسٹیٹس رکھیں، اور لائیو براڈکاسٹ رومز میں اِنویزیبلی داخل ہوں۔",
            },
            exclusiveEmail: {
                label: "ایکسکلوسِو ای میل نوٹیفکیشن",
                description:
                    "کسٹمر سروس کے جواب کے بعد ایکسکلوسِو ای میل نوٹیفکیشنز وصول کریں۔",
            },
            hideLiveLevel: {
                label: "لائیو اسٹریم لیول چھپائیں",
                description:
                    "آن کرنے کے بعد، دوسرے آپ کے پروفائل پر آپ کا لائیو اسٹریم لیول نہیں دیکھ سکیں گے۔",
            },
        },
    },

    newMessageNotification: {
        title: "نوٹیفکیشنز",
        searchPlaceholder: "نوٹیفکیشن سیٹنگز تلاش کریں",
        inboxSearchPlaceholder: "نوٹیفکیشنز تلاش کریں...",

        sections: {
            notificationsList: "نوٹیفکیشنز کی فہرست",
            searchResults: "تلاش کے نتائج",
            notificationSettings: "نوٹیفکیشن سیٹنگز",
        },

        actions: {
            markAllRead: "سب کو پڑھا ہوا کریں",
        },

        empty: "ابھی تک کوئی نوٹیفکیشن نہیں۔",

        errors: {
            missingUserId: "AsyncStorage میں userId موجود نہیں ({{key}})",
            loadFailed: "نوٹیفکیشنز لوڈ نہیں ہو سکیں",
            network: "نوٹیفکیشنز لوڈ کرتے وقت نیٹ ورک خرابی",
        },

        debugLine: "uid: {{uid}} • total: {{total}} • unread: {{unread}}",

        settings: {
            liveAlerts: "لائیو روم کھلنے کی الرٹس",
            messageSwitch: "میسج نوٹیفکیشن سوئچ",
            sound: "آواز",
            vibrate: "وائبریٹ",
            mutualFollowers: "متبادل فالورز",
            myFollowing: "جنہیں میں فالو کرتا ہوں",
            stranger: "اجنبی",
        },
    },

    privacySettings: {
        title: "پرائیویسی",

        sections: {
            livePrivacy: "لائیو پرائیویسی",
            permissionPrivacy: "پرمییشن پرائیویسی",
        },

        items: {
            hideMicStatus: "مائیکروفون کا اسٹیٹس چھپائیں",
        },

        trailing: {
            on: "آن",
            goSettings: "سیٹنگز پر جائیں",
        },

        errors: {
            openSettingsFailed: "اس ڈیوائس پر سسٹم سیٹنگز نہیں کھل رہیں۔",
        },

        permissions: {
            camera: {
                label: "Gold Live کو کیمرہ تک رسائی کی اجازت دیں",
                subLabel: "تصاویر لینے، ویڈیوز ریکارڈ کرنے وغیرہ کے لیے۔",
            },
            voice: {
                label: "Gold Live کو وائس میسجز تک رسائی کی اجازت دیں",
                subLabel: "ویڈیو ریکارڈنگ اور وائس بھیجنے وغیرہ کے لیے۔",
            },
            notifications: {
                label: "پلیٹ فارم کو نوٹیفکیشن پرمیشن دینے کی اجازت دیں",
                subLabel: "ان ریڈ میسج الرٹس وغیرہ کے لیے۔",
            },
            bluetooth: {
                label: "پلیٹ فارم کو Bluetooth پرمیشنز تک رسائی کی اجازت دیں۔",
                subLabel: "Bluetooth ہیڈفونز کنیکٹ کریں اور درست فنکشننگ یقینی بنائیں۔",
            },
            location: {
                label: "پلیٹ فارم کو لوکیشن پرمیشن دینے کی اجازت دیں",
                subLabel: "قریب کے اسٹریمرز تلاش کرنے کے لیے استعمال ہوتا ہے۔",
            },
        },
    },

    aboutGoldLive: {
        title: "Gold Live کے بارے میں",
        versionText: "GOLD LIVE 1.0.0",

        items: {
            privacyPolicy: "پرائیویسی پالیسی",
            termsOfService: "سروس کی شرائط",
            liveAgreement: "لائیو معاہدہ",
            userRechargeAgreement: "یوزر ریچارج معاہدہ",
            noChildEndangermentPolicy: "بچوں کو نقصان سے بچانے کی پالیسی",
        },

        alerts: {
            comingSoon: "{{label}} پیج بعد میں Gold Live کے لیے شامل کیا جائے گا۔",
        },
    },

    ranking: {
        title: "رینکنگ",
        tabs: { host: "ہوسٹ", rich: "رِچ", gift: "گفٹ" },
        period: { daily: "روزانہ", weekly: "ہفتہ وار", monthly: "ماہانہ" },
        filters: {
            region: "ریجن",
            periodLabel: "{{period}}: {{range}}",
        },
        datePicker: {
            selectDate: "تاریخ منتخب کریں",
            done: "ہو گیا",
        },
        states: {
            loading: "رینکنگ لوڈ ہو رہی ہے...",
            retry: "دوبارہ کوشش کریں",
        },
        errors: {
            loadFailed: "رینکنگ لوڈ نہیں ہو سکی",
            network: "رینکنگ لوڈ کرتے وقت نیٹ ورک خرابی",
        },
        labels: {
            id: "ID: {{id}}",
            userFallback: "صارف",
        },
        distance: {
            label: "رینک سے فاصلہ ہے: {{distance}}",
            top: "آپ ٹاپ پر ہیں (یا اس سے اوپر کوئی رینک دستیاب نہیں)۔",
        },
    },

    reward: {
        title: "ریوارڈ",
        banner: {
            title: "ہوسٹ ٹاسکس اور ریوارڈز",
            subtitle: "زیادہ پوائنٹس کے لیے روزانہ اور ہفتہ وار ٹاسکس مکمل کریں۔",
        },
        tabs: {
            pkMission: "PK مشن",
            activity: "ایکٹیویٹی",
            fanClub: "فین کلب",
            invite: "انویٹ",
        },
        pk: {
            todayRecord: "آج کا PK ریکارڈ",
            recordLink: "PK ریکارڈ >>",
            highestStreak: "سب سے زیادہ مؤثر وننگ اسٹریک",
            effectiveWins: "مؤثر جیت",
        },
        states: {
            loading: "ٹاسکس لوڈ ہو رہے ہیں...",
            empty: "ابھی تک کوئی ٹاسک کنفیگر نہیں ہوا۔",
        },
        errors: {
            notLoggedIn: "لاگ اِن نہیں ہیں۔",
            loadFailed: "ریوارڈ ٹاسکس لوڈ نہیں ہو سکے۔",
            network: "ریوارڈ ٹاسکس لوڈ کرتے وقت نیٹ ورک خرابی۔",
        },
        actions: {
            go: "GO",
            confirm: "کنفرم",
        },
        rule: {
            title: "ریوارڈ رول",
            daily: "روزانہ ٹاسکس: ٹاسکس روزانہ 00:00:00 (UTC+8) پر ریفریش ہوتے ہیں۔",
            weekly:
                "ہفتہ وار ٹاسکس: ٹاسکس ہر پیر 00:00:00 (UTC+8) پر ریفریش ہوتے ہیں۔",
        },
    },

    store: {
    title: "اسٹور",
    popular: "مقبول",
    states: {
      loading: "اسٹور لوڈ ہو رہا ہے…",
      empty: "کوئی آئٹم نہیں ملا",
    },
    actions: {
      refresh: "ریفریش",
      all: "سب >",
      recharge: "ری چارج",
    },
    labels: {
      coins: "کوائنز",
      preview: "پری ویو",
      balance: "آپ کا بیلنس",
      balanceHint: "اسٹور آئٹمز فوراً خریدنے کے لیے کوائنز ری چارج کریں۔",
      durationDays: "{{days}} دن",
      permanent: "مستقل",
    },
    errors: {
      missingUser: "userId موجود نہیں۔ براہِ کرم دوبارہ لاگ اِن کریں۔",
    },
    purchase: {
      confirmTitle: "خرید کی تصدیق",
      confirmMsg: '"{{title}}" کو {{price}} کوائنز میں خریدیں؟',
      successTitle: "خرید لیا گیا",
      successMsg: "آئٹم آپ کے اکاؤنٹ میں شامل کر دیا گیا ہے۔",
      failedTitle: "خرید ناکام",
      failedMsg: "براہِ کرم دوبارہ کوشش کریں۔",
      insufficientTitle: "کوائنز ناکافی ہیں",
      insufficientMsg: "یہ آئٹم خریدنے کے لیے کوائنز ری چارج کریں۔",
      actions: {
        buy: "ابھی خریدیں",
        buying: "خرید ہو رہی ہے...",
        recharge: "ری چارج",
      },
    },
  },

    invite: {
        title: "انویٹیشن بونس",
        tabs: {
            myRewards: "میرے ریوارڈز",
            incomeRank: "انکم رینک",
        },
        banner: {
            small: "کسی کو انویٹ کریں",
            title: "دوستوں کو انویٹ کر کے ریوارڈز کمائیں",
            subtitle: "اپنا انویٹ لنک یا کوڈ شیئر کریں۔ ہم آپ کے انویٹیز خودکار طور پر گنیں گے۔",
        },
        stats: {
            claimed: "کلیم کیے گئے ریوارڈز",
            invitees: "انویٹیز کی تعداد",
            availableToday: "آج کے لیے دستیاب: {{count}}",
        },
        list: {
            title: "گزشتہ 7 دن کی انویٹیشنز ({{count}})",
            more: "مزید >",
            loading: "لوڈ ہو رہا ہے…",
            empty: "ابھی تک کوئی انویٹیشن نہیں",
            myCode: "میرا کوڈ: {{code}}",
            linkPlaceholder: "انویٹ لنک تیار نہیں (ریفریش پر ٹیپ کریں)",
        },
        qr: {
            title: "جوائن کرنے کے لیے اسکین کریں",
        },
        actions: {
            receive: "وصول کریں",
            inviteNow: "ابھی انویٹ کریں",
            share: "شیئر",
            copyLink: "لنک کاپی کریں",
        },
        alerts: {
            errorTitle: "انویٹ ایرر",
            loadFailed: "انویٹ ڈیٹا لوڈ نہیں ہو سکا",
            inviteTitle: "انویٹ",
            codeNotReady: "انویٹ کوڈ تیار نہیں۔ ریفریش پر ٹیپ کریں۔",
            linkNotReady: "انویٹ لنک تیار نہیں۔ ریفریش پر ٹیپ کریں۔",
            clipboardNotReadyTitle: "کلپ بورڈ تیار نہیں",
            clipboardNotReadyMsg:
                "Clipboard ماڈیول آپ کے Dev Client build میں موجود نہیں۔ کاپی کو فعال کرنے کے لیے Dev Client دوبارہ build کریں۔",
            copiedTitle: "کاپی ہو گیا",
            codeCopied: "انویٹ کوڈ کاپی ہو گیا",
            linkCopied: "انویٹ لنک کاپی ہو گیا",
            soonTitle: "جلد",
            receiveSoon: "جب انویٹ ریوارڈ رولز شامل ہوں گے تو کلیم ریوارڈز فعال کیے جائیں گے۔",
            inviteCodeMissing: "بیک اینڈ ریسپانس میں انویٹ کوڈ موجود نہیں",
        },
        badge: {
            registered: "رجسٹرڈ",
            qualified: "کوالیفائیڈ",
            rewarded: "ریوارڈڈ",
        },
        labels: {
            userFallback: "صارف",
        },
        shareMessage: "Gold Live پر میرے ساتھ جوائن کریں 🎥\nمیرا انویٹ کوڈ استعمال کریں: {{code}}\n{{link}}",
    },

    guardian: {
        defaultTitle: "گارڈین کھولیں",

        metaLine: "پلانز: {{activePlans}}/{{totalPlans}} • پیکجز: {{activePackages}}",

        errors: {
            missingUser: "userId موجود نہیں۔ براہِ کرم دوبارہ لاگ اِن کریں۔",
            missingUserShort: "userId موجود نہیں",
            selectUser: "پہلے کسی یوزر کو گارڈ کرنے کے لیے منتخب کریں",
            selectDuration: "پہلے دورانیہ منتخب کریں",
            activateFailed: "ایکٹیویشن ناکام",
            apiNonJson: "API نے non-JSON واپس کیا۔ پری ویو: {{preview}}",
            plansExistEmpty:
                "پلانز موجود ہیں لیکن خالی واپس آئے۔ ایکٹو پلانز کے لیے ایکٹو پیکجز چیک کریں۔",
        },

        labels: {
            noUserSelected: "کوئی یوزر منتخب نہیں",
            tierLine: "{{tier}} گارڈین",
        },

        sections: {
            guardSomeone: "میں کسی کو گارڈ کرنا چاہتا ہوں",
            coinsNeeded: "درکار کوائنز: {{coins}}",
            privileges: "گارڈین پرِولیجز",
            noPrivileges: "کوئی پرِولیج کنفیگر نہیں۔",
        },

        links: {
            myGuardian: "میرا گارڈین",
            guardingCount: "آپ گارڈ کر رہے ہیں: {{count}}",
            guardMe: "مجھے گارڈ کریں",
            guardMeNone: "ابھی تک کوئی آپ کو گارڈ نہیں کر رہا",
            guardMeWith: "گارڈین: {{name}}",
        },

        actions: {
            select: "منتخب کریں",
            activate: "{{tier}} گارڈین فعال کریں",
            activating: "فعال ہو رہا ہے...",
            refresh: "ریفریش",
            search: "تلاش",
        },

        picker: {
            title: "یوزر منتخب کریں",
            placeholder: "یوزرنیم یا نِک نیم تلاش کریں...",
            empty: "کم از کم 2 حروف لکھ کر تلاش کریں۔",
        },

        empty: {
            title: "کوئی پلان نہیں ملا",
            hint: "اس کا مطلب ہے API نے 0 ایکٹو پلانز (isActive=true) واپس کیے۔ guardianPlan + پیکجز ایکٹو ہیں یا نہیں چیک کریں۔",
        },
    },

    fanClub: {
        title: "فین کلب",
        topTabs: { fanClub: "فین کلب", fanGroup: "فین گروپ" },
        subTabs: { joined: "جوائن کیے گئے کلب", my: "میرا کلب" },
        empty: "مزید ڈیٹا نہیں",
        frozenLink: "فروزن فین کلب >",
    },

    medalWall: {
        title: "میڈل وال",
        obtain: "حاصل: {{obtained}}/{{total}}",
        loading: "لوڈ ہو رہا ہے...",
        level: "لیول: {{level}}",
        achievementTitle: "اچیومنٹ میڈل",
        unlocked: "اَن لاکڈ",
        empty:
            "کوئی میڈلز نہیں ملے۔ DB میں میڈلز شامل کریں (HonorItem ٹائپ MEDAL) یا یقینی بنائیں کہ API کمپیوٹڈ میڈلز واپس کرے۔",
        errors: {
            missingUserId: "userId موجود نہیں۔ MedalWall پر جاتے وقت { userId } پاس کریں۔",
            loadFailed: "میڈلز لوڈ نہیں ہو سکے",
        },
    },

    profile: {
        header: {
            title: "میں",
        },

        loggedOut: {
            title: "آپ لاگ آؤٹ ہیں",
            subtitle: "اپنا پروفائل دیکھنے کے لیے دوبارہ لاگ اِن کریں۔",
        },

        states: {
            loading: "پروفائل لوڈ ہو رہا ہے...",
            retry: "دوبارہ کوشش کریں",
        },

        errors: {
            notLoggedIn: "لاگ اِن نہیں ہیں۔",
            loadFailed: "پروفائل لوڈ نہیں ہو سکا۔",
            network: "پروفائل لوڈ کرتے وقت نیٹ ورک خرابی۔",
        },

        labels: {
            guest: "گیسٹ",
            online: "آن لائن",

            id: "ID {{id}}",

            vipLevel: "VIP {{level}}",
            levelShort: "LV.{{level}}",

            level: "لیول: {{level}}",
            coins: "کوائنز",
            followers: "فالورز",
            following: "فالوئنگ",
            likes: "لائکس",
            visits: "وزٹس",
        },

        completion: {
            text: "آپ کا پروفائل {{completion}}% مکمل ہے۔ اسے مکمل کریں تاکہ Gold Live میں دوست بنانا آسان ہو جائے۔",
        },

        stats: {
            friends: "دوست",
            following: "فالوئنگ",
            followers: "فالورز",
            visitors: "وزیٹرز",
        },

        wallet: {
            coins: "کوائنز",
            points: "پوائنٹس",
        },

        vipCard: {
            cta: "VIP • VIP پر اپگریڈ کریں اور ایکسکلوسِو فوائد حاصل کریں",
        },

        notice: {
            title: "نوٹس",
            subtitle: "Gold Live میں یوزر کنڈکٹ اسٹینڈرڈز اور ممنوعہ سرگرمیاں۔",
        },

        tiles: {
            reward: "ریوارڈ",
            ranking: "رینکنگ",
            store: "اسٹور",
            invite: "انویٹ",
            guardian: "گارڈین",
            fanClub: "فین کلب",
            medalWall: "میڈل وال",
        },

        rows: {
            liveData: "لائیو ڈیٹا",
            help: "ہیلپ",
            myAgency: "میری ایجنسی",
            level: "لیول",
            auth: "آتھ",
            backpack: "بیک پیک",
            followUs: "ہمیں فالو کریں",
        },

        actions: {
            editProfile: "پروفائل ایڈٹ کریں",
            editAvatar: "پروفائل فوٹو ایڈٹ کریں",
            copyId: "ID کاپی کریں",
            shareProfile: "پروفائل شیئر کریں",
            follow: "فالو کریں",
            following: "فالوئنگ",
            message: "میسج",

            goToLogin: "لاگ اِن پر جائیں",
            view: "دیکھیں >",
        },

        menu: {
            ranking: "رینکنگ",
            reward: "ریوارڈ",
            store: "اسٹور",
            invite: "انویٹیشن بونس",
            guardian: "گارڈین کھولیں",
            fanClub: "فین کلب",
            medalWall: "میڈل وال",
            settings: "سیٹنگز",
            about: "Gold Live کے بارے میں",
            logout: "لاگ آؤٹ",
        },

        alerts: {
            copiedTitle: "کاپی ہو گیا",
            idCopied: "یوزر ID کاپی ہو گئی",
            comingSoonTitle: "جلد",
            comingSoonMsg: "یہ فیچر بعد میں شامل کیا جائے گا۔",

            missingUserTitle: "یوزر موجود نہیں",
            missingUserMsg: "براہِ کرم دوبارہ لاگ اِن کریں۔",
        },
    },

    /* ✅ NEW: Live data screen */
    liveData: {
        tabs: {
            live: "لائیو ڈیٹا",
            pk: "PK ڈیٹا",
        },

        range: {
            daily: "روزانہ ڈیٹا",
            weekly: "ہفتہ وار ڈیٹا",
            monthly: "ماہانہ ڈیٹا",
        },

        stats: {
            wonPoints: "جیتے ہوئے پوائنٹس",
            liveDuration: "لائیو دورانیہ",
            liveEarnings: "لائیو کمائی",
            partyDuration: "پارٹی دورانیہ",
            partyEarnings: "پارٹی کمائی",
            partyCrownDuration: "پارٹی کراؤن دورانیہ",
            newFans: "نئے فینز کی تعداد",
            newFanClubMembers: "فین کلب کے نئے ممبرز",

            avgOnline: {
                daily: "آج اوسط آن لائن یوزرز کی تعداد",
                weekly: "اس ہفتے اوسط آن لائن یوزرز کی تعداد",
                monthly: "اس مہینے اوسط آن لائن یوزرز کی تعداد",
            },
        },

        actions: {
            getMorePoints: "مزید پوائنٹس حاصل کریں",
            contribution: "کنٹریبیوشن",
        },

        help: {
            title: "تفصیل",
            line1: "1. سیٹلمنٹ سائیکل 00:00:00–23:59:59 (UTC+8) ہے۔",
            confirm: "کنفرم",
        },

        errors: {
            notLoggedIn: "لاگ اِن نہیں ہیں۔",
            loadFailedLive: "لائیو ڈیٹا لوڈ نہیں ہو سکا۔",
            loadFailedPk: "PK ڈیٹا لوڈ نہیں ہو سکا۔",
            emptyResponse: "سرور سے خالی ریسپانس۔",
        },

        pk: {
            tabs: {
                random: "رینڈم PK",
                friend: "فرینڈ PK",
                team: "ٹیم PK",
            },
            range: {
                today: "آج",
                recent7: "گزشتہ 7 دن",
                monthly: "ماہانہ",
            },
            cards: {
                winRate: "Win%",
                pkScore: "PK اسکور",
                sessions: "سیشنز",
            },
            history: {
                title: "ہسٹری ریکارڈ",
                loading: "PK ہسٹری لوڈ ہو رہی ہے...",
                empty: "کوئی ریکارڈ نہیں۔ دوستوں کو PK کے لیے انویٹ کریں۔",
                unknownOpponent: "نامعلوم",
            },
            result: {
                win: "جیت",
                lose: "ہار",
                draw: "ڈرا",
                score: "اسکور: {{score}}",
            },
        },
    },

    /* ✅ NEW: Fans ranking screen */
    fansRanking: {
        title: "فینز رینکنگ",

        summary: {
            totalContribution: "کل کنٹریبیوشن",
            myRank: "میرا رینک: {{rank}}",
            myCoins: "میرے کوائنز: {{coins}}",
        },

        states: {
            loading: "رینکنگ لوڈ ہو رہی ہے...",
        },

        labels: {
            levelShort: "Lv.{{level}}",
            unknownUser: "نامعلوم",
        },

        errors: {
            notLoggedIn: "لاگ اِن نہیں ہیں۔",
            loadFailed: "فینز رینکنگ لوڈ نہیں ہو سکی۔",
            network: "فینز رینکنگ لوڈ کرتے وقت نیٹ ورک خرابی۔",
        },

        empty: "ابھی تک کوئی فین کنٹریبیوشن نہیں۔",
    },

    /* ✅ NEW: Help screen */
    help: {
        title: "ہیلپ",

        fallbackCategories: {
            frequent: "اکثر پوچھے گئے",
            livestream: "لائیو اسٹریم",
            recharge: "ریچارج",
            report: "رپورٹ",
            account: "اکاؤنٹ",
        },

        states: {
            loadingFaqs: "FAQs لوڈ ہو رہی ہیں...",
            noFaqs: "اس کیٹیگری کے لیے کوئی FAQs نہیں ملیں۔",
        },

        actions: {
            myFeedback: "میرا فیڈبیک",
            messageFeedback: "میسج فیڈبیک",
        },

        compose: {
            title: "فیڈبیک بھیجیں",
            typeLabel: "ٹائپ",
            subjectOptional: "سبجیکٹ (اختیاری)",
            subjectPlaceholder: "مختصر عنوان",
            messageLabel: "میسج",
            messagePlaceholder: "تفصیل یہاں لکھیں...",
            send: "بھیجیں",
        },

        feedback: {
            types: {
                general: "GENERAL",
                bug: "BUG",
                payment: "PAYMENT",
                account: "ACCOUNT",
                stream: "STREAM",
                report: "REPORT",
            },
        },

        myFeedback: {
            title: "میرا فیڈبیک",
            empty: "ابھی تک کوئی فیڈبیک جمع نہیں ہوا۔",
            adminReplyTitle: "ایڈمن کا جواب",
            noAdminReply: "ابھی تک ایڈمن کا کوئی جواب نہیں۔",
        },

        alerts: {
            missingMessageTitle: "میسج موجود نہیں",
            missingMessageMsg: "براہِ کرم اپنا فیڈبیک میسج لکھیں۔",
            sentTitle: "بھیج دیا گیا",
            sentMsg: "آپ کا فیڈبیک ایڈمن کو بھیج دیا گیا ہے۔",
            failedTitle: "ناکام",
            failedMsg: "فیڈبیک نہیں بھیجا جا سکا۔ براہِ کرم دوبارہ کوشش کریں۔",
        },
    },

    /* ✅ NEW: My Agency screen */
    myAgency: {
        title: "میری ایجنسی",

        hero: {
            title: "میتھڈ 1 یا میتھڈ 2 منتخب کریں",
            subtitle: "کسی موجودہ ایجنسی میں شامل ہوں یا اپنے ایجنٹ کی انویٹیشن کا انتظار کریں۔",
        },

        method1: {
            badge: "میتھڈ 1",
            title: "ایجنٹ جوائن کریں",
            subtitle: "ایجنٹ ID آپ کے ایجنٹ کی طرف سے دی جائے گی۔",
            placeholder: "براہِ کرم ایجنٹ کی ID درج کریں",
            button: "ایجنٹ جوائن کریں",
        },

        method2: {
            badge: "میتھڈ 2",
            title: "ایجنٹ کی انویٹیشن کا انتظار",
            subtitle: "انویٹیشن حاصل کرنے کے لیے اپنا ID اور ہوسٹ کوڈ اپنے ایجنٹ کے ساتھ شیئر کریں۔",
            userIdLabel: "یوزر ID:",
            hostCodeLabel: "ہوسٹ کوڈ:",
        },
    },

    /* ✅ NEW: Level screen */
    level: {
        header: {
            wealthTitle: "ویلتھ لیول",
            liveTitle: "لائیو اسٹریم لیول",
        },

        tabs: {
            wealth: "ویلتھ لیول",
            live: "لائیو اسٹریم لیول",
        },

        labels: {
            levelShort: "Lv.{{level}}",
        },

        progress: {
            maxLevelReached: "زیادہ سے زیادہ لیول حاصل ہو گیا",
            distanceToUpgrade: "اپگریڈ تک فاصلہ · {{exp}}",
            exp: "EXP: {{exp}}",
        },

        sections: {
            myBenefits: "میرے فوائد",
            lockedBenefits: "لاکڈ فوائد",
        },

        states: {
            loadingBenefits: "فوائد لوڈ ہو رہے ہیں...",
            noBenefits: "ابھی تک کوئی فائدہ اَن لاک نہیں ہوا۔",
            noLocked: "کوئی لاکڈ مائل اسٹون نہیں۔",
        },

        benefits: {
            titleWithLevel: "{{title}} (Lv.{{level}})",
        },

        locked: {
            unlocksAt: "Lv.{{level}} پر اَن لاک ہوگا",
            unlocksAtWithPreview: "Lv.{{level}} پر اَن لاک ہوگا · {{preview}}",
        },
    },

    auth: {
        title: "آتھ",
        card: {
            title: "میری آتھنٹیکیشن",
            subtitle:
                "اپنے اکاؤنٹ اور اثاثوں کی حفاظت کے لیے ہم آپ کو آتھنٹیکیٹ کرنے کی تجویز دیتے ہیں۔",
        },
        rows: {
            faceAuthTitle: "فیس آتھنٹیکیشن",
            faceAuthDesc: "براہِ کرم پہلے آتھنٹیکیشن پراسیس مکمل کریں۔",
            faceAuthBtn: "جائیں",

            bindPhoneTitle: "فون بائنڈ کریں",
            bindPhoneDesc: "اپنا فون بائنڈ کریں تاکہ آپ کا اکاؤنٹ محفوظ رہے۔",
            bindPhoneBtn: "بائنڈ",
        },
    },

    faceScan: {
        titles: {
            submitted: "ویریفکیشن جمع ہو گئی",
            verified: "ویریفائیڈ",
            rejected: "ریجیکٹڈ",
            default: "فیس ویریفکیشن",
        },

        permission: {
            title: "کیمرہ پرمیشن درکار ہے",
            text: "ریئل پرسن ویریفکیشن مکمل کرنے کے لیے ہمیں کیمرہ تک رسائی چاہیے۔",
            button: "پرمیشن دیں",
        },

        hints: {
            placeFace: "اپنا چہرہ فریم کے اندر رکھیں۔",
            keepInside: "اپنا چہرہ فریم کے اندر رکھیں۔",
            moveCloser: "کیمرہ کے قریب آئیں۔",
            moveBack: "تھوڑا پیچھے جائیں۔",
            centerFace: "چہرہ فریم کے وسط میں رکھیں۔",
            headStraight: "سر سیدھا رکھیں۔",
            perfectHold: "بہترین۔ ساکن رہیں…",
            visibleLight: "یقینی بنائیں کہ اچھی روشنی میں چہرہ واضح ہو۔",
            adjustLighting: "روشنی درست کریں اور چہرہ مرکز میں رکھیں۔",
            capturing: "کیپچر ہو رہا ہے…",
            uploading: "اپ لوڈ ہو رہا ہے…",
            bottom:
                "اپنا پورا چہرہ فریم کے اندر رکھیں۔ الائن ہونے پر کیپچر خودکار طور پر ہو جائے گا۔",
        },

        states: {
            waitTitle: "منظوری کا انتظار کریں",
            waitText:
                "آپ کا فیس اسکین اپ لوڈ ہو گیا ہے۔ ہماری ٹیم اسے ریویو کر کے آپ کی درخواست منظور کرے گی۔",
            autoChecking: "اسٹیٹس خودکار طور پر چیک ہو رہا ہے…",

            alreadyVerified: "آپ پہلے ہی ویریفائیڈ ہیں",
            closing: "خودکار طور پر بند ہو رہا ہے…",
            continue: "جاری رکھیں",

            notApproved: "منظور نہیں ہوا",
            rejectedText:
                "آپ کی ویریفکیشن ریجیکٹ ہو گئی۔ اچھی روشنی اور واضح چہرے کے ساتھ دوبارہ کوشش کریں۔",
            rescan: "دوبارہ اسکین",

            checking: "آپ کی ویریفکیشن اسٹیٹس چیک ہو رہی ہے…",
            tryAgain: "دوبارہ کوشش کریں",
        },

        errors: {
            loginFirst: "براہِ کرم پہلے لاگ اِن کریں۔",
            statusFailed: "اسٹیٹس چیک نہیں ہو سکا",
            captureFailed: "تصویر کیپچر نہیں ہو سکی۔ براہِ کرم دوبارہ کوشش کریں۔",
            network: "اسکین کے دوران نیٹ ورک/غیر متوقع خرابی۔",
            imageTooLarge:
                "اپ لوڈ ناکام: تصویر بہت بڑی ہے (413)۔ کوالٹی کم کریں یا سرور لِمٹس بڑھائیں۔",
            uploadFailed: "اپ لوڈ ناکام ({{code}})۔",
        },
    },

    outfit: {
    title: "میرا آؤٹ فِٹ",

    tabs: {
      backpack: "بیگ پیک گفٹس",
      avatar: "اوتار فریم",
      party: "پارٹی تھیم",
    },

    states: {
      loading: "آپ کی آئٹمز لوڈ ہو رہی ہیں…",
    },

    actions: {
      retry: "دوبارہ کوشش کریں",
      equip: "پہنیں",
      unequip: "اتاریں",
    },

    errors: {
      loginRequired: "لاگ اِن ضروری ہے (gl_user_id نہیں ملا).",
      loadFailed: "آؤٹ فِٹ آئٹمز لوڈ نہیں ہو سکیں",
    },

    empty: {
      backpack: "ابھی تک کوئی بیگ پیک گفٹس نہیں",
      avatar: "ابھی تک کوئی اوتار فریم نہیں",
      party: "ابھی تک کوئی پارٹی تھیم نہیں",
      hint:
        "اسٹور سے آئٹمز خریدیں۔ یہ صفحہ صرف وہی آئٹمز دکھاتا ہے جو آپ کے پاس ہیں (UserStoreItem).",
    },

    labels: {
      permanent: "مستقل",
      limited: "محدود",
      expired: "میعاد ختم",
      oneDayLeft: "1 دن باقی",
      daysLeft: "{{count}} دن باقی",

      owned: "ملکیت",
      item: "آئٹم",

      equipped: "پہنا ہوا",
      tapToUse: "پہنانے/اتارنے کے لیے ٹَیپ کریں",
    },
  },
   giftGallery: {
    title: "گفٹ گیلری",
    states: {
      loading: "لوڈ ہو رہا ہے…",
    },
    errors: {
      notLoggedIn: "یوزر نہیں ملا، براہِ کرم دوبارہ لاگ اِن کریں۔",
      loadFailed: "گفٹ گیلری لوڈ نہیں ہو سکی۔",
      network: "نیٹ ورک ایرر۔ براہِ کرم دوبارہ کوشش کریں۔",
    },
    summary: {
      totalValue: "گفٹس کی کل ویلیو",
      totalGifts: "{{count}} گفٹس",
      uniqueGifts: "{{count}} اقسام",
    },
    actions: {
      goToPoints: "پوائنٹس پر جائیں",
    },
    labels: {
      coins: "کوائنز",
      qtyLine: "x{{qty}} • ہر ایک {{unit}} کوائنز",
    },
    empty: "ابھی تک کوئی گفٹس موصول نہیں ہوئے۔",
  },

    followUs: {
        title: "ہمیں فالو کریں",

        brandName: "Gold Live",
        tagline: "گلوبل کمیونٹی",

        hero: {
            subtitle:
                "پریمیم کنٹینٹ دریافت کریں اور دنیا بھر کے لوگوں سے جڑیں۔\nنیچے دی گئی کمیونٹیز جوائن کریں اور اپنا سوشل سفر شروع کریں۔",
        },

        sectionTitle: "ریکمنڈڈ کمیونٹیز",

        states: {
            loading: "کمیونٹیز لوڈ ہو رہی ہیں…",
        },

        errors: {
            backendMissing:
                "بیک اینڈ روٹ نہیں ملا (ڈیفالٹ لنکس استعمال ہو رہے ہیں)۔ اگر بیک اینڈ کنٹرول چاہیے تو GET /api/public/follow-us شامل کریں۔",
            linkTitle: "لنک ایرر",
            cannotOpen: "اس ڈیوائس پر یہ لنک نہیں کھل سکتا۔",
            openFailed: "لنک نہیں کھل سکا",
        },

        social: {
            facebook: "Facebook",
            youtube: "YouTube",
            instagram: "Instagram",
            tiktok: "TikTok",
            telegram: "Telegram",
            discord: "Discord",
            x: "X",
            community: "کمیونٹی",
        },
    },

    editProfile: {
        title: "پروفائل ایڈٹ کریں",
        actions: { save: "محفوظ کریں", addTag: "شامل کریں" },
        states: { loadingProfile: "پروفائل ڈیٹا لوڈ ہو رہا ہے..." },
        sections: { myProfile: "میرا پروفائل", interestTags: "انٹرسٹ ٹیگز" },
        fields: {
            nickname: "نِک نیم",
            gender: "جینڈر (Male/Female)",
            dob: "تاریخِ پیدائش",
            country: "ملک",
            selfIntro: "اپنا تعارف",
        },
        placeholders: {
            enterNickname: "نِک نیم درج کریں",
            selectDate: "تاریخ منتخب کریں",
            writeBio: "اپنے بارے میں کچھ لکھیں",
            typeTag: "ٹیگ لکھیں",
        },
        helpers: {
            cannotModify: "[تبدیل نہیں کیا جا سکتا]",
            noTags: "ابھی تک کوئی ٹیگز نہیں۔ نیچے کچھ شامل کریں۔",
            longPressRemove: "ٹیگ ہٹانے کے لیے لانگ پریس کریں۔",
        },
        labels: {
            notSet: "سیٹ نہیں",
            userFallback: "صارف",
        },
        gender: { male: "مرد", female: "عورت", other: "دیگر" },
        alerts: {
            notLoggedInTitle: "لاگ اِن نہیں ہیں",
            loginAgainMsg: "براہِ کرم دوبارہ لاگ اِن کریں۔",
            permissionNeededTitle: "پرمیشن درکار ہے",
            permissionNeededMsg: "براہِ کرم فوٹو ایکسس کی اجازت دیں تاکہ آپ پروفائل تصویر منتخب کر سکیں۔",
            duplicateTagTitle: "ڈپلیکیٹ ٹیگ",
            duplicateTagMsg: "آپ یہ ٹیگ پہلے ہی شامل کر چکے ہیں۔",
            savedTitle: "محفوظ ہو گیا",
            savedMsg: "پروفائل کامیابی سے اپڈیٹ ہو گیا۔",
            loadFailedMsg: "پروفائل لوڈ نہیں ہو سکا",
            updateFailedMsg: "پروفائل اپڈیٹ نہیں ہو سکا",
            networkLoadMsg: "پروفائل لوڈ کرتے وقت نیٹ ورک خرابی۔",
            networkSaveMsg: "پروفائل محفوظ کرتے وقت نیٹ ورک خرابی۔",
            galleryFailedMsg: "گیلری نہیں کھل سکی۔",
        },
    },

    explore: {
        tabs: { following: "فالوئنگ", explore: "ایکسپلور", new: "نیا", near: "قریب" },
        search: { placeholder: "تلاش", cancel: "منسوخ" },
        chips: { popular: "پاپولر", more: "مزید" },
        actions: { live: "Live" },
        states: {
            loadingCountries: "ملک لوڈ ہو رہے ہیں...",
            refreshingList: "لائیو لسٹ ریفریش ہو رہی ہے...",
            empty: "کوئی لائیو ہوسٹ نہیں ملا۔ فلٹرز تبدیل کر کے دیکھیں۔",
        },
        errors: {
            loadCountries: "ملک لوڈ نہیں ہو سکے",
            networkCountries: "ملک لوڈ کرتے وقت نیٹ ورک خرابی",
            loadFeed: "ایکسپلور فیڈ لوڈ نہیں ہو سکی",
            networkFeed: "فیڈ لوڈ کرتے وقت نیٹ ورک خرابی",
        },
        alerts: {
            liveEndedTitle: "لائیو ختم ہو گئی",
            liveEndedMsg: "یہ لائیو اسٹریم ختم ہو چکی ہے۔",
        },
        labels: {
            liveBadge: "LIVE",
            userFallback: "صارف",
            viewers: "👀 {{count}}",
        },
    },

    guardMe: {
        title: "مجھے گارڈ کریں",
        actions: { goBack: "واپس جائیں" },
        states: { loading: "لوڈ ہو رہا ہے…", empty: "ابھی تک کوئی آپ کو گارڈ نہیں کر رہا" },
        labels: { currentGuardian: "آپ کا موجودہ گارڈین", tier: "Tier", ends: "ختم", started: "شروع" },
        errors: {
            missingUser: "userId موجود نہیں۔ براہِ کرم دوبارہ لاگ اِن کریں۔",
            loadFailed: "لوڈ نہیں ہو سکا",
        },
    },

    coins: {
    title: "کوائنز",
    pointsTab: "پوائنٹس",
    labels: {
      remainingCoins: "باقی کوائنز",
      balanceAfter: "بیلنس: {{balance}}",
      pkgCoins: "{{coins}} کوائنز",
      pkgId: "پیکیج: {{id}}",
      coinsUnit: "COINS",
    },
    actions: { topUp: "ٹاپ اَپ", refresh: "ریفریش" },
    filters: { all: "سب", topups: "ٹاپ اَپس", spent: "خرچ شدہ" },
    states: {
      loading: "لوڈ ہو رہا ہے…",
      empty: "کوئی ہسٹری نہیں",
      scrollMore: "مزید کے لیے اسکرول کریں…",
      end: "اختتام",
      loadingPackages: "پیکیجز لوڈ ہو رہے ہیں…",
      noPackages: "کوئی پیکیج نہیں",
    },
    types: { topup: "ٹاپ اَپ", giftSent: "گفٹ بھیجا گیا" },
    modal: {
      title: "ٹاپ اَپ",
      note:
        "نوٹ: یہ ٹاپ اَپ صرف ٹیسٹ موڈ کے لیے ہے۔ اصلی ادائیگیاں بعد میں شامل کی جائیں گی۔",
    },
    alerts: {
      walletErrorTitle: "والٹ ایرر",
      historyErrorTitle: "ہسٹری ایرر",
      topupErrorTitle: "ٹاپ اَپ ایرر",
      loginRequiredTitle: "لاگ اِن ضروری ہے",
      topupFailedTitle: "ٹاپ اَپ ناکام",
      successTitle: "کامیابی",
      addedCoinsMsg: "{{coins}} کوائنز شامل کر دیے گئے",
    },
    errors: {
      loadWallet: "والٹ لوڈ نہیں ہو سکا",
      loadHistory: "ہسٹری لوڈ نہیں ہو سکی",
      loadMore: "مزید لوڈ نہیں ہو سکا",
      loadPackages: "پیکیجز لوڈ نہیں ہو سکے",
      topupFailed: "ٹاپ اَپ ناکام",
    },
  },

    liveApplication: {
        title: "لائیو اپلیکیشن",
        states: { loading: "لوڈ ہو رہا ہے..." },
        labels: { status: "اسٹیٹس:" },

        status: {
            none: "کوئی نہیں",
            pending: "پینڈنگ",
            approved: "منظور",
            rejected: "ریجیکٹ",
        },

        defaults: {
            liveTitle: "میری لائیو",
            hostName: "ہوسٹ",
        },

        rows: {
            faceAuthTitle: "فیس آتھنٹیکیشن",
            faceAuthNeed: "براہِ کرم پہلے آتھنٹیکیشن پراسیس مکمل کریں۔",
            livePhotoTitle: "لائیو فوٹو",
            livePhotoNeed: "براہِ کرم لائیو کور دوبارہ اپ لوڈ کریں۔",
            wealthTitle: "ویلتھ لیول ≥ لیول {{level}}",
            wealthSubtitle: "آپ کا لیول: {{level}}",
            completed: "مکمل",
            uploaded: "اپ لوڈ ہو گیا",
        },

        actions: { goLive: "گو لائیو", applyOrComplete: "اپلائی / اسٹپس مکمل کریں" },

        errors: {
            loginRequired: "لاگ اِن ضروری ہے",
            loadFailed: "لائیو اسٹیٹس لوڈ نہیں ہو سکا",
            network: "نیٹ ورک خرابی",
            notLoaded: "لائیو اسٹیٹس ابھی لوڈ نہیں ہوا۔",
            submitFailed: "اپلیکیشن جمع نہیں ہو سکی",
            submitNetwork: "جمع کرتے وقت نیٹ ورک خرابی",
            startFailed: "لائیو شروع نہیں ہو سکی",
            startNetwork: "لائیو شروع کرتے وقت نیٹ ورک خرابی",
        },

        alerts: {
            wealthRequiredTitle: "ویلتھ لیول درکار ہے",
            wealthRequiredMsg: "آپ کو لیول {{level}} چاہیے۔",
            underReviewTitle: "ریویو میں ہے",
            underReviewMsg: "براہِ کرم ایڈمن کی منظوری کا انتظار کریں۔",
            submittedTitle: "جمع ہو گیا",
            submittedMsg: "آپ کی درخواست جمع ہو گئی ہے۔ براہِ کرم ریویو کا انتظار کریں۔",
            infoTitle: "معلومات",
            wealthInfoMsg: "گفٹس خرچ/بھیج کر وغیرہ ویلتھ لیول بڑھائیں۔",
        },
    },

    // ✅ NEW: Home Feed
    homeFeed: {
        tabs: {
            following: "فالوئنگ",
            square: "اسکوائر",
            video: "ویڈیو",
        },

        search: {
            squarePlaceholder: "پوسٹس، ٹاپکس، یوزرز تلاش کریں",
            videoPlaceholder: "ویڈیوز، یوزرز تلاش کریں",
        },

        time: {
            secondsAgo: "{{count}}s پہلے",
            minutesAgo: "{{count}} منٹ پہلے",
            hoursAgo: "{{count}} گھنٹے پہلے",
            daysAgo: "{{count}} دن پہلے",
        },

        eventBanner: {
            title: "فین کلب ٹاپک ایونٹ",
            dateRange: "12/11/2025 - 18/11/2025 [UTC+8]",
        },

        alerts: {
            loginRequiredTitle: "لاگ اِن ضروری ہے",
            loginToLikePosts: "پوسٹس لائک کرنے کے لیے براہِ کرم لاگ اِن کریں۔",
            loginToLikeVideos: "ویڈیوز لائک کرنے کے لیے براہِ کرم لاگ اِن کریں۔",
        },

        following: {
            chips: {
                popular: "پاپولر",
                pakistan: "Pakistan",
                philippines: "Philippines",
                more: "مزید",
            },
            empty: "آپ جنہیں فالو کرتے ہیں ان کی کوئی لائیو رومز ابھی تک نہیں۔",
            errors: {
                loadFailed: "فالوئنگ فیڈ لوڈ نہیں ہو سکی",
                network: "فالوئنگ فیڈ لوڈ کرتے وقت نیٹ ورک خرابی",
            },
        },

        square: {
            hotTopics: "ہاٹ ٹاپکس",
            more: "مزید >",
            noTopicsYet: "ابھی تک کوئی ٹاپک نہیں",
            emptySearch: "کوئی نتیجہ نہیں ملا۔",
            emptyFeed: "ابھی تک کوئی پوسٹ نہیں۔ سب سے پہلے آپ کچھ شیئر کریں!",
            hotBadge: "HOT",
            viewAllComments: "تمام {{count}} کمنٹس دیکھیں",
            errors: {
                loadFailed: "اسکوائر فیڈ لوڈ نہیں ہو سکی",
                network: "اسکوائر فیڈ لوڈ کرتے وقت نیٹ ورک خرابی",
            },
        },

        video: {
            states: {
                loadingVideos: "ویڈیوز لوڈ ہو رہی ہیں...",
                empty: "ابھی تک کوئی ویڈیو نہیں۔",
            },
            actions: {
                share: "شیئر",
            },
            labels: {
                originalSound: "اورجِنل ساؤنڈ",
            },
            tip: {
                title: "ٹِپ",
                label: "ٹِپ",
                msg: "ویڈیو کے لیے گفٹ سینڈنگ بعد میں شامل کی جا سکتی ہے (DB ٹرانزیکشن ماڈل چاہیے)۔",
            },
            errors: {
                loadFailed: "ویڈیو فیڈ لوڈ نہیں ہو سکی",
                network: "ویڈیو فیڈ لوڈ کرتے وقت نیٹ ورک خرابی",
                videoFailed: "ویڈیو لوڈ نہیں ہو سکی",
                debugHint:
                    "اگر یہ بلیک ہی رہے تو سرور ہیڈرز چیک کریں: Content-Type video/mp4 + Accept-Ranges bytes",
            },
        },
    },

    // ✅ NEW: Honor Wall
    honorWall: {
        title: "آنر وال",
        tabs: {
            data: "ڈیٹا",
            honor: "آنر وال",
        },
        states: {
            loading: "آنر وال لوڈ ہو رہی ہے...",
        },
        cards: {
            tagWall: "ٹیگ وال",
            medalWall: "میڈل وال",
            giftCollection: "گفٹ کلیکشن",
            vehicleWall: "وہیکل وال",
            notObtained: "ابھی حاصل نہیں ہوا",
            countMore: "{{count}} >",
        },
    },

    // ✅ NEW: Host Live Room
    hostLiveRoom: {
        defaults: {
            liveTitle: "میری لائیو",
            hostName: "ہوسٹ",
        },
        states: {
            preparing: "لائیو روم تیار ہو رہی ہے...",
            stopping: "لائیو بند ہو رہی ہے...",
        },
        permission: {
            required: "کیمرہ پرمیشن درکار ہے",
            grant: "پرمیشن دیں",
        },
        labels: {
            liveBadge: "LIVE",
            liveTitle: "لائیو عنوان",
        },
        placeholders: {
            liveTitle: "لائیو عنوان درج کریں...",
            chat: "کچھ کہیں...",
        },
        actions: {
            goLive: "گو لائیو",
            stop: "روکیں",
        },
        alerts: {
            stopTitle: "لائیو روکیں؟",
            stopMsg: "اس سے آپ کی لائیو اسٹریم ختم ہو جائے گی۔",
        },
        chat: {
            welcome: "اپنی لائیو روم میں خوش آمدید 👋",
            guest: "گیسٹ",
            line: "{{name}}: {{text}}",
            meLine: "میں: {{text}}",
            system: "ℹ️ {{text}}",
        },
        errors: {
            cameraRequiredToGoLive: "❗ لائیو جانے کے لیے کیمرہ پرمیشن ضروری ہے۔",
        },
        messages: {
            liveNow: "🔴 آپ اب LIVE ہیں!",
        },
    },

    // ✅ NEW: Hot Topics
    hotTopics: {
        title: "ہاٹ ٹاپکس",
        tabs: {
            daily: "روزانہ",
            official: "آفیشل",
            normal: "نارمل",
        },
        labels: {
            hotCount: "HOT {{count}}",
        },
        empty: "اس کیٹیگری میں ابھی کوئی ٹاپک نہیں۔",
        errors: {
            loadFailed: "ٹاپکس لوڈ نہیں ہو سکے",
            network: "ٹاپکس لوڈ کرتے وقت نیٹ ورک خرابی",
        },
    },

    // ✅ NEW: Live Cover
    liveCover: {
        title: "لائیو کور",
        card: {
            title: "لائیو کور فوٹو اپ لوڈ کریں",
            subtitle: "یہ فوٹو آپ کے لائیو کور کے طور پر استعمال ہوگی۔ اچھی روشنی اور واضح تصویر استعمال کریں۔",
        },
        states: {
            checking: "چیک ہو رہا ہے…",
            uploading: "آپ کا لائیو کور اپ لوڈ ہو رہا ہے…",
            checkingStatus: "آپ کے لائیو کور کا اسٹیٹس چیک ہو رہا ہے…",
            uploaded: "کامیابی سے اپ لوڈ ہو گیا",
        },
        labels: {
            alreadyUploaded: "آپ پہلے ہی لائیو کور اپ لوڈ کر چکے ہیں۔",
            preview: "پری ویو",
            selectCover: "کور تصویر منتخب کریں",
            cameraSide: "کیمرہ: {{side}}",
            front: "فرنٹ",
            back: "بیک",
        },
        actions: {
            change: "تبدیل کریں",
            upload: "اپ لوڈ",
            uploadCover: "کور اپ لوڈ کریں",
            camera: "کیمرہ",
            gallery: "گیلری",
        },
        alerts: {
            permissionNeededTitle: "پرمیشن درکار ہے",
            galleryPermissionMsg: "براہِ کرم گیلری ایکسس کی اجازت دیں۔",
            cameraPermissionMsg: "براہِ کرم کیمرہ ایکسس کی اجازت دیں۔",
        },
        errors: {
            loginRequired: "لاگ اِن ضروری ہے",
            loadFailed: "اسٹیٹس لوڈ نہیں ہو سکا",
            network: "نیٹ ورک خرابی",
            selectPhotoFirst: "براہِ کرم پہلے ایک تصویر منتخب کریں۔",
            imageTooLarge: "تصویر بہت بڑی ہے (413)۔ براہِ کرم کوئی اور تصویر آزمائیں۔",
            uploadFailed: "اپ لوڈ ناکام ({{code}})",
            uploadFailedGeneric: "اپ لوڈ ناکام",
            noImageReturned: "کوئی تصویر واپس نہیں آئی۔",
            cameraNoImage: "کیمرہ نے کوئی تصویر واپس نہیں کی۔",
            cannotReadBase64: "تصویر کو base64 میں نہیں پڑھا جا سکا۔ کوئی اور تصویر آزمائیں۔",
            openGalleryFailed: "گیلری نہیں کھل سکی",
            openCameraFailed: "کیمرہ نہیں کھل سکا",
            androidEmulatorHint: "اگر آپ Android Emulator پر ہیں: کیمرہ اکثر کام نہیں کرتا۔ حقیقی ڈیوائس آزمائیں۔",
        },
    },

    vipCenter: {
        title: "VIP سینٹر",
        states: {
            loading: "VIP لوڈ ہو رہا ہے...",
        },
        current: {
            none: "موجودہ: کوئی VIP نہیں",
            active: "موجودہ: {{name}} • {{days}} دن باقی",
        },
        labels: {
            perMonth: "/M",
            defaultDescription: "VIP حاصل کریں اور پرِولیجز انجوائے کریں",
            privilegesCount: "VIP ایکسکلوسِو پرِولیجز {{count}}/{{total}}",
        },
        actions: {
            open: "{{name}} اوپن کریں",
        },
        alerts: {
            purchaseTitle: "VIP خریداری",
            purchaseMsg: "{{tier}} کے لیے خریداری فلو شروع کریں۔",
        },
    },

    topicDetail: {
        states: {
            empty: "اس ٹاپک کے تحت ابھی تک کوئی مومنٹس نہیں۔",
        },
        errors: {
            loadFailed: "ٹاپک فیڈ لوڈ نہیں ہو سکی",
            network: "ٹاپک فیڈ لوڈ کرتے وقت نیٹ ورک خرابی",
        },
        alerts: {
            loginRequiredTitle: "لاگ اِن ضروری ہے",
            loginRequiredMsg: "پوسٹس لائک کرنے کے لیے براہِ کرم لاگ اِن کریں۔",
            likeFailedTitle: "خرابی",
            likeFailedMsg: "ابھی اس پوسٹ کو لائک نہیں کیا جا سکتا۔",
        },
    },

    visitProfile: {
        titleFallback: "پروفائل",
        states: {
            notFound: "پروفائل نہیں ملا۔",
            noMoments: "ابھی تک کوئی مومنٹس نہیں۔",
        },
        labels: {
            id: "ID: {{id}}",
            followers: "فالورز",
            following: "فالوئنگ",
        },
        actions: {
            follow: "فالو کریں",
            following: "فالوئنگ",
        },
    },

    realPersonAuth: {
        title: "آتھ",
        hero: {
            title: "ریئل پرسن ویریفکیشن جلد شروع ہوگی۔",
            subtitle: "براہِ کرم یقینی بنائیں کہ آپ ہی یوزر ہیں",
        },
        tips: {
            avoidCover: "چہرہ نہ ڈھانپیں",
            enoughLight: "کافی روشنی رکھیں",
            minorsProhibited: "کم عمر افراد ممنوع ہیں",
        },
        actions: {
            start: "ویریفکیشن شروع کریں",
        },
    },

    postMoment: {
        title: "مومنٹس پوسٹ کریں",
        actions: {
            post: "پوسٹ",
            posting: "پوسٹ ہو رہا ہے...",
            refresh: "ریفریش",
        },
        labels: {
            postingTo: "#{{topic}} پر پوسٹ ہو رہا ہے",
            recommended: "ریکمنڈڈ ٹاپکس",
        },
        placeholders: {
            input: "اس لمحے کو ریکارڈ کرنے کے لیے کچھ لکھیں...",
        },
        sheets: {
            title: "شامل کریں",
            message: "میڈیا ٹائپ منتخب کریں",
            addPhotos: "تصاویر شامل کریں",
            addVideos: "ویڈیوز شامل کریں",
        },
        permissions: {
            title: "پرمیشن درکار ہے",
            libraryMsg: "اپ لوڈ کرنے کے لیے براہِ کرم ایکسس کی اجازت دیں۔",
            cameraMsg: "براہِ کرم کیمرہ ایکسس کی اجازت دیں۔",
        },
        alerts: {
            nothingTitle: "کچھ بھی پوسٹ نہیں",
            nothingMsg: "براہِ کرم کچھ لکھیں یا تصویر/ویڈیو شامل کریں۔",
            notLoggedInTitle: "لاگ اِن نہیں ہیں",
            notLoggedInMsg: "براہِ کرم دوبارہ لاگ اِن کریں۔",
            errorTitle: "خرابی",
            postFailed: "مومنٹ پوسٹ نہیں ہو سکا۔",
            postedTitle: "پوسٹ ہو گیا",
            postedVideo: "آپ کی ویڈیو ویڈیو ٹیب میں نظر آئے گی۔",
            postedSquare: "آپ کی پوسٹ اسکوائر میں نظر آئے گی۔",
        },
        errors: {
            notLoggedIn: "لاگ اِن نہیں ہیں",
            uploadFailed: "اپ لوڈ ناکام",
            uploadEmpty: "اپ لوڈ نے خالی URL واپس کیا",
            networkPost: "مومنٹ پوسٹ کرتے وقت نیٹ ورک خرابی۔",
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
    title: "پوائنٹس",
    coinsTab: "کوائنز",
    actions: {
      details: "تفصیل",
      withdraw: "ابھی وِڈرا کریں",
      exchange: "پوائنٹس کو کوائنز میں تبدیل کریں",
      exchanging: "تبدیل ہو رہا ہے...",
      refresh: "ریفریش",
    },
    labels: {
      available: "دستیاب پوائنٹس",
      total: "کل: {{count}}",
      unconfirmed: "غیر تصدیق شدہ: {{count}}",
      income: "آمدنی",
      last30: "گزشتہ 30 دن",
    },
    income: {
      livestream: "لائیو اسٹریم",
      party: "پارٹی",
      platformRewards: "پلیٹ فارم ریوارڈز",
    },
    states: {
      loading: "لوڈ ہو رہا ہے…",
    },
    hints: {
      exchangeRate:
        "ایکسچینج ریٹ بعد میں بیک اینڈ سے تبدیل کیا جا سکتا ہے (POINTS_PER_COIN).",
    },
    alerts: {
      errorTitle: "ایرر",
      successTitle: "کامیابی",
      loginRequiredTitle: "لاگ اِن ضروری ہے",
      loginRequiredMsg: "براہِ کرم دوبارہ لاگ اِن کریں۔",
      detailsSoon: "تفصیل والی اسکرین جلد شامل کر دی جائے گی۔",
      withdrawSoon: "وِڈرا فیچر جلد شامل کر دیا جائے گا۔",
      exchangeFailedTitle: "تبدیلی ناکام",
      exchangeSuccessMsg: "{{points}} پوائنٹس → {{coins}} کوائنز میں تبدیل ہو گئے۔",
    },
    errors: {
      loadFailed: "پوائنٹس لوڈ نہیں ہو سکے",
      exchangeFailed: "پوائنٹس تبدیل نہیں ہو سکے",
    },
    ranges: {
      title: "رینج منتخب کریں",
      last7: "گزشتہ 7 دن",
      last30: "گزشتہ 30 دن",
      last90: "گزشتہ 90 دن",
    },
    withdraw: {
      title: "پوائنٹس وِڈرا کریں",
      available: "دستیاب: {{points}} پوائنٹس",
      fields: {
        points: "وِڈرا کے لیے پوائنٹس",
        method: "طریقہ",
        account: "اکاؤنٹ کی تفصیل",
      },
      placeholders: {
        account: "مثال: 03xx-xxxxxxx / IBAN / اکاؤنٹ نام",
      },
      actions: {
        submit: "درخواست جمع کریں",
        submitting: "جمع ہو رہا ہے...",
      },
      note:
        "وِڈرا کی درخواستیں منظوری کے لیے ایڈمن کے پاس جاتی ہیں۔ پروسیس ہونے تک پوائنٹس روکے جا سکتے ہیں۔",
      alerts: {
        successTitle: "جمع ہو گئی",
        successMsg: "آپ کی وِڈرا درخواست جمع ہو گئی ہے۔",
        failedTitle: "وِڈرا ناکام",
      },
      errors: {
        invalidPoints: "براہِ کرم پوائنٹس کی درست مقدار درج کریں۔",
        accountRequired: "براہِ کرم اکاؤنٹ کی تفصیل درج کریں۔",
        failed: "وِڈرا درخواست جمع نہیں ہو سکی۔",
      },
    },
    details: {
      title: "پوائنٹس کی تفصیل",
      intro: "پلیٹ فارم پر پوائنٹس ایسے کام کرتے ہیں:",
      lines: {
        available: "دستیاب پوائنٹس وہ ہیں جنہیں آپ تبدیل یا وِڈرا کر سکتے ہیں۔",
        unconfirmed:
          "غیر تصدیق شدہ پوائنٹس ابھی ویریفائی ہو رہے ہیں اور بدل سکتے ہیں۔",
        total: "کل پوائنٹس میں دستیاب + غیر تصدیق شدہ شامل ہوتے ہیں۔",
        income:
          "آمدنی میں منتخب رینج کے دوران پوائنٹس کہاں سے آئے، یہ دکھایا جاتا ہے۔",
        exchange:
          "ایکسچینج پوائنٹس کو کوائنز میں بدلتا ہے۔ پلیٹ فارم رولز کے مطابق ریٹ تبدیل ہو سکتا ہے۔",
        withdraw:
          "وِڈرا درخواستیں ادائیگی سے پہلے ریویو ہوتی ہیں۔ اکاؤنٹ کی تفصیل درست رکھیں۔",
      },
      footer:
        "اگر کوئی مسئلہ ہو تو اپنی پروفائل اسکرین سے سپورٹ سے رابطہ کریں۔",
    },
  },

    momentComments: {
        title: "{{owner}} کے مومنٹس",
        empty: "ابھی تک کوئی کمنٹ نہیں۔ سب سے پہلے آپ جواب دیں!",
        placeholder: "کمنٹ لکھیں...",
    },

    myGuardian: {
        title: "میرا گارڈین",
        empty: "آپ نے ابھی تک کسی کو گارڈ نہیں کیا۔",
        actions: {
            goBack: "واپس جائیں",
        },
        card: {
            meta: "Tier: {{tier}} • ختم: {{ends}}",
        },
        errors: {
            missingUserId: "userId موجود نہیں۔ براہِ کرم دوبارہ لاگ اِن کریں۔",
            loadFailed: "لوڈ نہیں ہو سکا",
        },
    },

    myProfile: {
        tabs: {
            posts: "پوسٹس",
        },
        items: {
            giftGallery: "گفٹ گیلری",
            contribution: "کنٹریبیوشن",
        },
        sections: {
            personalInfo: "ذاتی معلومات",
        },
        labels: {
            idLine: "ID: {{id}}",
            followingFollowers: "فالوئنگ {{following}} · فالورز {{followers}}",
            fansCount: "{{count}} فینز",
            lit: "Lit: {{current}}/{{total}}",
            participantsRank: "رینک میں شرکاء: {{count}}",
        },
        defaults: {
            bio: "وہ/وہ بہت سست تھا/تھی اور کچھ بھی پیچھے نہیں چھوڑا۔",
        },
        alerts: {
            waitTitle: "براہِ کرم انتظار کریں",
            profileLoadingMsg: "پروفائل ابھی لوڈ ہو رہا ہے۔",
        },
    },

    notificationsInbox: {
        postOwnerName: "پوسٹ",
        inboxSearchPlaceholder: "نوٹیفکیشنز تلاش کریں...",
    },

    party: {
        tabs: {
            following: "فالوئنگ",
            party: "پارٹی",
        },
        search: {
            placeholder: "پارٹی رومز تلاش کریں",
        },
        filters: {
            popular: "پاپولر",
            pakistan: "Pakistan",
            philippines: "Philippines",
            more: "مزید",
        },
        labels: {
            defaultTag: "پارٹی",
        },
        states: {
            empty: "کوئی روم نہیں ملا۔ فلٹر یا سرچ تبدیل کر کے دیکھیں۔",
        },
        errors: {
            loadFailed: "پارٹی رومز لوڈ نہیں ہو سکے",
            network: "پارٹی رومز لوڈ کرتے وقت نیٹ ورک خرابی",
        },
    },
};
