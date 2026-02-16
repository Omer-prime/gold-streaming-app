// src/i18n/zh-Hant.ts
export default {
    common: {
        ok: "確定",
        cancel: "取消",
        loading: "...",
        loadingText: "載入中…",

        error: "錯誤",
        success: "成功",
        done: "完成",
        failed: "失敗",

        edit: "編輯",
        block: "封鎖",
        remove: "移除",
        you: "你",

        sendCode: "傳送驗證碼",
        verifyAndBind: "驗證並綁定",
        bind: "綁定",
        unbind: "解除綁定",
        changePhoneNumber: "更改電話號碼",
        userFallback: "使用者",

        codeSent: "已傳送驗證碼",
    },

    errors: {
        userNotFound: "找不到用戶，請重新登入。",
        updateFailed: "更新語言失敗。",
    },

    settings: {
        title: "設定",
        versionText: "1.0.0（Gold Live）",

        items: {
            accountAndSecurity: "帳號與安全",
            securityPassword: "安全密碼",
            languageSetting: "語言設定",

            blacklist: "黑名單",
            privilegeSettings: "特權設定",
            newMessagesNotification: "新訊息通知",
            privacy: "隱私",

            version: "版本",
            aboutGoldLive: "關於 Gold Live",
            clearCache: "清除快取",
        },

        security: {
            levelPrefix: "安全等級：",
            levelLow: "低",
            levelMedium: "中",
            levelHigh: "高",
        },

        actions: {
            clearCacheTitle: "清除快取",
            clearCacheMsg: "已清除 App 快取（不會登出）。",

            switchAccountTitle: "切換帳號",
            switchAccountMsg: "是否要切換帳號？",
            switch: "切換",
            switchAccountBtn: "切換帳號",

            logoutTitle: "登出",
            logoutMsg: "你確定要登出嗎？",
            logout: "登出",
            logoutBtn: "登出",
        },

        language: {
            title: "語言設定",
            followSystem: "跟隨系統",
            english: "English",
            traditionalChinese: "繁體中文",
            arabic: "العربية",
            urdu: "اردو",
            portuguese: "Português",
            spanish: "Español",
        },
    },

    accountSecurity: {
        title: "帳號與安全",
        levelText: "你的帳號安全等級是 {{level}}。",
        tip: "綁定手機號碼或電子郵件可提升你的安全等級。",

        rows: {
            setPassword: "設定密碼",
            phoneNumber: "手機號碼",
            email: "電子郵件",
            google: "Google",
            facebook: "Facebook",
            instagram: "Instagram",
            tiktok: "TikTok",
            deviceManagement: "裝置管理",
        },

        trailing: {
            modify: "修改",
            set: "設定",
            bound: "已綁定",
            bind: "綁定",
        },

        cancel: {
            title: "註銷帳號",
            msg: "帳號註銷流程將於之後實作。",
            button: "註銷帳號",
        },
    },

    securityPassword: {
        title: "安全密碼",

        fields: {
            current: "目前密碼",
            new: "新密碼",
            confirm: "確認新密碼",
        },

        actions: {
            save: "儲存",
            saving: "儲存中...",
        },

        errors: {
            title: "錯誤",
            enterNew: "請輸入新密碼。",
            mismatch: "新密碼與確認密碼不一致。",
            updateFailed: "更新密碼失敗",
            network: "網路錯誤，請再試一次。",
        },

        success: {
            title: "成功",
            msg: "密碼更新成功。",
        },
    },

    bindPhone: {
        title: "綁定手機",
        subtitle:
            "綁定你的手機號碼以保護你的 Gold Live 帳號，並讓登入更方便。",
        currentBoundLabel: "目前已綁定手機：",

        sections: {
            enterPhone: "輸入手機號碼",
            enterCode: "輸入驗證碼",
        },

        labels: {
            sentTo: "已發送至：{{phone}}",
        },

        placeholders: {
            phone: "請輸入你的手機號碼",
            code: "驗證碼",
        },

        alerts: {
            codeSentMsg: "我們已將驗證碼發送到 {{phone}}。",
            devCode: "DEV CODE：{{code}}",
            successMsg: "手機綁定成功。",
        },

        terms: {
            prefix: "我已閱讀並同意 ",
            tos: "Gold Live 服務條款",
            and: " 與 ",
            privacy: "隱私政策",
            suffix: "。",
        },
    },

    bindEmail: {
        title: "綁定電子郵件",
        currentBoundLabel: "目前已綁定電子郵件：",
        noBoundYet: "尚未綁定電子郵件。",

        labels: {
            email: "電子郵件",
            code: "驗證碼",
        },

        placeholders: {
            email: "輸入你的電子郵件",
            code: "輸入驗證碼",
        },

        alerts: {
            codeSentMsg: "我們已將驗證碼發送到 {{email}}。",
            devCode: "DEV CODE：{{code}}",
            successMsg: "電子郵件綁定成功。",
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
            google: "綁定 Google",
            facebook: "綁定 Facebook",
            instagram: "綁定 Instagram",
            tiktok: "綁定 TikTok",
        },

        status: {
            notBound: "尚未綁定。",
            currentlyBound: "目前已綁定：{{id}}",
        },

        tempBackendHint:
            "暫時的後端綁定（之後以 OAuth 取代）。請輸入 {{provider}} id：",

        placeholders: {
            google: "googleId（之後由 OAuth 提供）",
            facebook: "facebookId（之後由 OAuth 提供）",
            instagram: "instagramId（之後由 OAuth 提供）",
            tiktok: "tiktokId（之後由 OAuth 提供）",
        },

        alerts: {
            loadFailed: "載入綁定狀態失敗",
            boundSuccess: "{{provider}} 綁定成功。",
            unboundSuccess: "{{provider}} 已解除綁定。",
        },
    },

    deviceManagement: {
        title: "裝置管理",

        labels: {
            empty: "目前沒有裝置資訊。",
            unknownDevice: "未知裝置",
            lastActiveTime: "最後活動時間：{{time}}",
            friendlyName: "{{platform}} 裝置",
        },

        badges: {
            current: "目前裝置",
            trusted: "信任此裝置",
        },

        errors: {
            notLoggedIn: "尚未登入。請重新登入。",
            loadFailed: "載入裝置失敗。",
            network: "載入裝置時發生網路錯誤。",
        },
    },

    blacklist: {
        title: "黑名單",
        searchPlaceholder: "輸入用戶 ID 或用戶名",
        empty: "沒有已封鎖的用戶",

        labels: {
            id: "ID：{{id}}",
        },

        errors: {
            addFailed: "加入黑名單失敗。",
        },
    },

    privilegeSettings: {
        title: "特權設定",
        items: {
            invisibleVisitor: {
                label: "隱身訪客",
                description:
                    "造訪他人不留下紀錄，他人也無法看到誰造訪了首頁。",
            },
            mysteryLive: {
                label: "直播間神秘人",
                description: "只有禮物接收者能在直播間看到你的身分。",
            },
            mysteryRank: {
                label: "排行榜神秘人",
                description: "你送出的禮物不會出現在主播的粉絲排行中。",
            },
            invisibleOnline: {
                label: "隱身上線",
                description:
                    "始終保持隱身狀態，隱身進入直播間。",
            },
            exclusiveEmail: {
                label: "專屬電子郵件通知",
                description:
                    "客服回覆後接收專屬電子郵件通知。",
            },
            hideLiveLevel: {
                label: "隱藏直播等級",
                description:
                    "開啟後，其他人將無法在你的個人檔案中看到你的直播等級。",
            },
        },
    },

    newMessageNotification: {
        title: "通知",
        searchPlaceholder: "搜尋通知設定",
        inboxSearchPlaceholder: "搜尋通知...",

        sections: {
            notificationsList: "通知列表",
            searchResults: "搜尋結果",
            notificationSettings: "通知設定",
        },

        actions: {
            markAllRead: "全部標為已讀",
        },

        empty: "目前沒有通知。",

        errors: {
            missingUserId: "AsyncStorage 缺少 userId（{{key}}）",
            loadFailed: "載入通知失敗",
            network: "載入通知時發生網路錯誤",
        },

        debugLine: "uid：{{uid}} • 總數：{{total}} • 未讀：{{unread}}",

        settings: {
            liveAlerts: "直播間開播提醒",
            messageSwitch: "訊息通知開關",
            sound: "音效",
            vibrate: "震動",
            mutualFollowers: "互相關注",
            myFollowing: "我關注的",
            stranger: "陌生人",
        },
    },

    privacySettings: {
        title: "隱私",

        sections: {
            livePrivacy: "直播隱私",
            permissionPrivacy: "權限隱私",
        },

        items: {
            hideMicStatus: "隱藏麥克風狀態",
        },

        trailing: {
            on: "開啟",
            goSettings: "前往設定",
        },

        errors: {
            openSettingsFailed: "無法在此裝置上開啟系統設定。",
        },

        permissions: {
            camera: {
                label: "允許 Gold Live 存取你的相機",
                subLabel: "用於拍照、錄影等。",
            },
            voice: {
                label: "允許 Gold Live 存取你的語音訊息",
                subLabel: "用於錄影與傳送語音等。",
            },
            notifications: {
                label: "允許平台取得你的通知權限",
                subLabel: "用於未讀訊息提醒等。",
            },
            bluetooth: {
                label: "允許平台存取你的藍牙權限。",
                subLabel: "連接藍牙耳機並確保正常運作。",
            },
            location: {
                label: "允許平台取得你的定位權限",
                subLabel: "用於尋找附近的主播。",
            },
        },
    },

    aboutGoldLive: {
        title: "關於 Gold Live",
        versionText: "GOLD LIVE 1.0.0",

        items: {
            privacyPolicy: "隱私政策",
            termsOfService: "服務條款",
            liveAgreement: "直播協議",
            userRechargeAgreement: "用戶儲值協議",
            noChildEndangermentPolicy: "禁止危害兒童政策",
        },

        alerts: {
            comingSoon: "{{label}} 頁面將於之後加入 Gold Live。",
        },
    },
    legalDocs: {
        common: {
            lastUpdated: "最後更新：2026 年 2 月 16 日",
        },

        privacy: {
            title: "隱私權政策",
            intro:
                "Gold Live 只會在運行平台所需時收集與使用資料。我們不會販售你的個人資料。",

            sections: {
                transparency: {
                    title: "1) 我們收集哪些資料",
                    p1:
                        "我們可能會收集帳戶資訊（使用者名稱、電子郵件、頭像照片）以及你提交的內容（聊天、留言、直播）。",
                    p2:
                        "我們可能會收集技術資料（IP 位址、裝置、作業系統、日誌）以維持 App 的穩定與安全。",
                    p3:
                        "我們可能會收集交易資料（金幣、鑽石與虛擬禮物的購買紀錄）。我們不會收集敏感資料，例如生物特徵、醫療資訊或精準的即時位置。",
                },

                usage: {
                    title: "2) 我們如何使用資料",
                    p1:
                        "我們使用資料來運作與維護直播功能、啟用使用者互動、處理 App 內購買，並防止詐騙、濫用與非法活動。",
                    p2:
                        "我們不會為了販售或不當分享而使用你的資料。",
                },

                sharing: {
                    title: "3) 與第三方的分享",
                    p1:
                        "在法律要求時，我們可能會與核准的付款處理商（Google Play Billing / Apple In-App Purchase）、託管與安全服務供應商，以及法律機關分享有限資料。",
                    p2:
                        "所有第三方都必須遵守嚴格的資料保護規範。",
                },

                iap: {
                    title: "4) App 內購買",
                    p1:
                        "Gold Live 使用官方系統：Google Play Billing 與 Apple In-App Purchases。",
                    p2:
                        "我們不會在伺服器上儲存完整的付款卡資訊。",
                },

                analytics: {
                    title: "5) 廣告與分析",
                    p1:
                        "Gold Live 可能會使用分析工具來改善使用者體驗與 App 效能。",
                    p2:
                        "這些工具不會販售個人資料，且設計上不會用於單獨識別使用者。",
                },

                ugc: {
                    title: "6) 使用者產生內容",
                    p1:
                        "使用者需對其發布的內容負責。Gold Live 提供檢舉工具，並可能移除非法、辱罵或不當內容。",
                    p2:
                        "違反服務條款的帳戶可能會被暫停或終止。",
                },

                children: {
                    title: "7) 兒童隱私（僅限 18+）",
                    p1:
                        "Gold Live 不適用於 18 歲以下的任何人。",
                    p2:
                        "我們不會刻意收集兒童資料。若判定帳戶屬於未成年人，可能會被移除。",
                    p3:
                        "我們遵守兒童隱私保護（包括適用時的 COPPA）。",
                },

                rights: {
                    title: "8) 你的權利",
                    p1:
                        "你可以要求存取你的資料、修正/更新資訊、申請刪除帳戶，或在適用情況下撤回同意。",
                    p2:
                        "你可透過官方支援電子郵件提出申請。",
                },

                retention: {
                    title: "9) 資料保留與刪除",
                    p1:
                        "我們只會在平台運作與法律要求所需的期間保留資料。",
                    p2:
                        "刪除帳戶後，資料會在可行的情況下被刪除或匿名化處理。",
                },

                changes: {
                    title: "10) 本政策的變更",
                    p1:
                        "我們可能隨時更新本隱私權政策。變更在發布後即生效。",
                },

                contact: {
                    title: "11) 聯絡方式",
                    p1:
                        "支援電話：+33-6498415115",
                    p2:
                        "goldlive@gmail.com",
                },
            },
        },

        terms: {
            title: "服務條款",
            intro:
                "本條款說明如何使用 Gold Live。使用本 App 即表示你同意遵守這些規則。",

            sections: {
                eligibility: {
                    title: "1) 資格",
                    p1:
                        "Gold Live 僅供 18 歲（含）以上使用者使用。若你未滿 18 歲，請勿使用本 App。",
                },

                account: {
                    title: "2) 你的帳戶",
                    p1:
                        "你需對帳戶活動負責，並妥善保管登入資訊。",
                    p2:
                        "你必須提供正確資訊，且不得冒充他人。",
                },

                userContent: {
                    title: "3) 內容與行為",
                    p1:
                        "你需對你發布、直播或分享的任何內容負責（包含聊天與留言）。",
                    p2:
                        "禁止非法、辱罵或不當內容。我們可能移除內容，並對違規帳戶採取處置。",
                },

                purchases: {
                    title: "4) 金幣、禮物與購買",
                    p1:
                        "購買會透過 Google Play Billing 或 Apple In-App Purchase 處理。",
                    p2:
                        "Gold Live 不會在伺服器上儲存完整的付款卡資訊。",
                },

                enforcement: {
                    title: "5) 執行",
                    p1:
                        "若帳戶違反本條款或對使用者/平台造成風險，我們可能暫停或終止該帳戶。",
                    p2:
                        "在法律要求時，我們可能配合相關法律機關。",
                },

                changes: {
                    title: "6) 更新",
                    p1:
                        "我們可能更新本條款。變更在 App 或官方頁面發布後即生效。",
                },

                contact: {
                    title: "7) 聯絡",
                    p1:
                        "如有問題，請使用隱私權政策頁面中的聯絡方式與支援團隊聯繫。",
                },
            },
        },

        liveAgreement: {
            title: "直播協議",
            intro:
                "當你在 Gold Live 主播或參與直播時，本協議適用。",

            sections: {
                content: {
                    title: "1) 直播內容規則",
                    p1:
                        "你不得直播非法、辱罵或不當內容，並必須尊重其他使用者。",
                    p2:
                        "你需對直播期間所展示或所說的一切負責。",
                },
                reporting: {
                    title: "2) 檢舉與審核",
                    p1:
                        "Gold Live 提供檢舉工具。我們可能審查檢舉並移除違規內容。",
                },
                actions: {
                    title: "3) 帳戶處置",
                    p1:
                        "若你違反規則，你的直播可能被限制、內容被移除，或帳戶被暫停/終止。",
                    p2:
                        "我們可能採取行動以防止詐騙、濫用或非法活動。",
                },
                age: {
                    title: "4) 僅限 18+",
                    p1:
                        "未滿 18 歲者無法使用直播功能。若判定帳戶屬於未成年人，可能會被移除。",
                },
            },
        },

        recharge: {
            title: "使用者儲值協議",
            intro:
                "本協議說明 Gold Live 中金幣/鑽石購買與虛擬禮物的運作方式。",

            sections: {
                providers: {
                    title: "1) 官方付款系統",
                    p1:
                        "購買透過 Google Play Billing 與 Apple In-App Purchases 處理。",
                },
                storage: {
                    title: "2) 付款資料",
                    p1:
                        "Gold Live 不會在伺服器上儲存完整的付款卡資訊。",
                },
                delivery: {
                    title: "3) 購買紀錄",
                    p1:
                        "我們會保留購買紀錄（金幣、鑽石、禮物）以用於帳戶與交易追蹤。",
                },
                support: {
                    title: "4) 支援",
                    p1:
                        "若遇到購買問題，請聯繫支援。退款處理依各 App 商店規則而定。",
                },
            },
        },

        childPolicy: {
            title: "禁止危害兒童政策",
            intro:
                "Gold Live 致力於保護兒童。本平台不適用於 18 歲以下使用者。",

            sections: {
                age: {
                    title: "1) 僅限 18+",
                    p1:
                        "Gold Live 不適用於未成年人。若我們識別到未成年人帳戶，可能會將其移除。",
                },
                noCollection: {
                    title: "2) 不會刻意收集",
                    p1:
                        "我們不會刻意收集兒童的個人資料。",
                },
                enforcement: {
                    title: "3) 執行",
                    p1:
                        "對於涉及危害兒童或剝削的行為，我們可能移除內容、暫停直播並終止相關帳戶。",
                },
                reporting: {
                    title: "4) 檢舉",
                    p1:
                        "請使用 App 內檢舉工具回報有害內容。",
                    p2:
                        "你也可以使用隱私權政策頁面中的官方聯絡方式聯繫支援。",
                },
            },
        },
    },

    ranking: {
        title: "排行榜",
        tabs: { host: "主播", rich: "富豪", gift: "禮物" },
        period: { daily: "每日", weekly: "每週", monthly: "每月" },
        filters: {
            region: "地區",
            periodLabel: "{{period}}：{{range}}",
        },
        datePicker: {
            selectDate: "選擇日期",
            done: "完成",
        },
        states: {
            loading: "載入排行榜中...",
            retry: "重試",
        },
        errors: {
            loadFailed: "載入排行榜失敗",
            network: "載入排行榜時發生網路錯誤",
        },
        labels: {
            id: "ID：{{id}}",
            userFallback: "用戶",
        },
        distance: {
            label: "與排行差距：{{distance}}",
            top: "你已在最上方（或沒有更高名次）。",
        },
    },

    reward: {
        title: "獎勵",
        banner: {
            title: "主播任務與獎勵",
            subtitle: "完成每日與每週任務以獲得更多點數。",
        },
        tabs: {
            pkMission: "PK 任務",
            activity: "活動",
            fanClub: "粉絲團",
            invite: "邀請",
        },
        pk: {
            todayRecord: "今日 PK 紀錄",
            recordLink: "PK 紀錄 >>",
            highestStreak: "最高有效連勝",
            effectiveWins: "有效勝場",
        },
        states: {
            loading: "載入任務中...",
            empty: "尚未設定任務。",
        },
        errors: {
            notLoggedIn: "尚未登入。",
            loadFailed: "載入獎勵任務失敗。",
            network: "載入獎勵任務時發生網路錯誤。",
        },
        actions: {
            go: "前往",
            confirm: "確認",
        },
        rule: {
            title: "獎勵規則",
            daily: "每日任務：任務每天 00:00:00（UTC+8）刷新。",
            weekly: "每週任務：任務每週一 00:00:00（UTC+8）刷新。",
        },
    },

    store: {
        title: "商店",
        popular: "熱門",
        states: {
            loading: "正在載入商店…",
            empty: "找不到任何物品",
        },
        actions: {
            refresh: "重新整理",
            all: "全部 >",
            recharge: "儲值",
        },
        labels: {
            coins: "硬幣",
            preview: "預覽",
            balance: "你的餘額",
            balanceHint: "先儲值硬幣即可立即購買商店物品。",
            durationDays: "{{days}} 天",
            permanent: "永久",
        },
        errors: {
            missingUser: "缺少 userId。請重新登入。",
        },
        purchase: {
            confirmTitle: "確認購買",
            confirmMsg: "以 {{price}} 硬幣購買「{{title}}」？",
            successTitle: "已購買",
            successMsg: "物品已加入你的帳戶。",
            failedTitle: "購買失敗",
            failedMsg: "請再試一次。",
            insufficientTitle: "硬幣不足",
            insufficientMsg: "請先儲值硬幣再購買此物品。",
            actions: {
                buy: "立即購買",
                buying: "購買中...",
                recharge: "儲值",
            },
        },
    },

    invite: {
        title: "邀請獎勵",
        tabs: {
            myRewards: "我的獎勵",
            incomeRank: "收益排行榜",
        },
        banner: {
            small: "邀請好友",
            title: "邀請朋友賺取獎勵",
            subtitle: "分享你的邀請連結或代碼。我們會自動統計你的邀請人數。",
        },
        stats: {
            claimed: "已領取獎勵",
            invitees: "邀請人數",
            availableToday: "今日可領取：{{count}}",
        },
        list: {
            title: "最近 7 天的邀請（{{count}}）",
            more: "更多 >",
            loading: "載入中…",
            empty: "尚無邀請",
            myCode: "我的邀請碼：{{code}}",
            linkPlaceholder: "邀請連結尚未準備好（點擊重新整理）",
        },
        qr: {
            title: "掃描加入",
        },
        actions: {
            receive: "領取",
            inviteNow: "立即邀請",
            share: "分享",
            copyLink: "複製連結",
        },
        alerts: {
            errorTitle: "邀請錯誤",
            loadFailed: "載入邀請資料失敗",
            inviteTitle: "邀請",
            codeNotReady: "邀請碼尚未準備好。點擊重新整理。",
            linkNotReady: "邀請連結尚未準備好。點擊重新整理。",
            clipboardNotReadyTitle: "剪貼簿尚未就緒",
            clipboardNotReadyMsg:
                "你的 Dev Client 版本未包含剪貼簿模組。請重新建置 Dev Client 以啟用複製功能。",
            copiedTitle: "已複製",
            codeCopied: "邀請碼已複製",
            linkCopied: "邀請連結已複製",
            soonTitle: "即將推出",
            receiveSoon: "當加入邀請獎勵規則後，將開放領取獎勵。",
            inviteCodeMissing: "後端回應缺少邀請碼",
        },
        badge: {
            registered: "已註冊",
            qualified: "已符合資格",
            rewarded: "已獲獎勵",
        },
        labels: {
            userFallback: "用戶",
        },
        shareMessage: "加入 Gold Live 🎥\n使用我的邀請碼：{{code}}\n{{link}}",
    },

    guardian: {
        defaultTitle: "開啟守護",

        metaLine: "方案：{{activePlans}}/{{totalPlans}} • 套餐：{{activePackages}}",

        errors: {
            missingUser: "缺少 userId。請重新登入。",
            missingUserShort: "缺少 userId",
            selectUser: "請先選擇要守護的用戶",
            selectDuration: "請先選擇時長",
            activateFailed: "啟用失敗",
            apiNonJson: "API 回傳非 JSON。預覽：{{preview}}",
            plansExistEmpty: "方案存在但回傳為空。請檢查是否有啟用的套餐包含啟用方案。",
        },

        labels: {
            noUserSelected: "未選擇用戶",
            tierLine: "{{tier}} 守護",
        },

        sections: {
            guardSomeone: "我要守護某人",
            coinsNeeded: "所需金幣：{{coins}}",
            privileges: "守護特權",
            noPrivileges: "尚未設定任何特權。",
        },

        links: {
            myGuardian: "我的守護",
            guardingCount: "你正在守護：{{count}}",
            guardMe: "守護我",
            guardMeNone: "目前還沒有人守護你",
            guardMeWith: "守護者：{{name}}",
        },

        actions: {
            select: "選擇",
            activate: "啟用 {{tier}} 守護",
            activating: "啟用中...",
            refresh: "重新整理",
            search: "搜尋",
        },

        picker: {
            title: "選擇用戶",
            placeholder: "搜尋用戶名或暱稱...",
            empty: "至少輸入 2 個字元後再搜尋。",
        },

        empty: {
            title: "找不到任何方案",
            hint: "表示 API 回傳 0 個啟用方案（isActive=true）。請檢查 guardianPlan + packages 是否啟用。",
        },
    },

    fanClub: {
        title: "粉絲團",
        topTabs: { fanClub: "粉絲團", fanGroup: "粉絲群" },
        subTabs: { joined: "已加入的團", my: "我的團" },
        empty: "沒有更多資料",
        frozenLink: "凍結粉絲團 >",
    },

    medalWall: {
        title: "勳章牆",
        obtain: "獲得：{{obtained}}/{{total}}",
        loading: "載入中...",
        level: "等級：{{level}}",
        achievementTitle: "成就勽章",
        unlocked: "已解鎖",
        empty: "找不到勳章。請新增 DB 勳章（HonorItem 類型 MEDAL）或確保 API 回傳計算後的勳章。",
        errors: {
            missingUserId: "缺少 userId。導向到 MedalWall 時請傳入 { userId }。",
            loadFailed: "載入勳章失敗",
        },
    },

    profile: {
        header: {
            title: "我",
        },

        loggedOut: {
            title: "你已登出",
            subtitle: "請重新登入以查看你的個人檔案。",
        },

        states: {
            loading: "載入個人檔案中...",
            retry: "重試",
        },

        errors: {
            notLoggedIn: "尚未登入。",
            loadFailed: "載入個人檔案失敗。",
            network: "載入個人檔案時發生網路錯誤。",
        },

        labels: {
            guest: "訪客",
            online: "線上",

            id: "ID {{id}}",

            vipLevel: "VIP {{level}}",
            levelShort: "LV.{{level}}",

            level: "等級：{{level}}",
            coins: "金幣",
            followers: "粉絲",
            following: "關注",
            likes: "喜歡",
            visits: "訪問",
        },

        completion: {
            text: "你的個人檔案已完成 {{completion}}%。完成它能讓你在 Gold Live 更容易交朋友。",
        },

        stats: {
            friends: "好友",
            following: "關注",
            followers: "粉絲",
            visitors: "訪客",
        },

        wallet: {
            coins: "金幣",
            points: "點數",
        },

        vipCard: {
            cta: "VIP • 升級 VIP 並享受專屬特權",
        },

        notice: {
            title: "公告",
            subtitle: "Gold Live 的用戶行為規範與禁止事項。",
        },

        tiles: {
            reward: "獎勵",
            ranking: "排行榜",
            store: "商店",
            invite: "邀請",
            guardian: "守護",
            fanClub: "粉絲團",
            medalWall: "勳章牆",
        },

        rows: {
            liveData: "直播數據",
            help: "幫助",
            myAgency: "我的公會",
            level: "等級",
            auth: "認證",
            backpack: "背包",
            followUs: "關注我們",
        },

        actions: {
            editProfile: "編輯個人檔案",
            editAvatar: "編輯個人照片",
            copyId: "複製 ID",
            shareProfile: "分享個人檔案",
            follow: "關注",
            following: "已關注",
            message: "訊息",

            goToLogin: "前往登入",
            view: "查看 >",
        },

        menu: {
            ranking: "排行榜",
            reward: "獎勵",
            store: "商店",
            invite: "邀請獎勵",
            guardian: "開啟守護",
            fanClub: "粉絲團",
            medalWall: "勳章牆",
            settings: "設定",
            about: "關於 Gold Live",
            logout: "登出",
        },

        alerts: {
            copiedTitle: "已複製",
            idCopied: "用戶 ID 已複製",
            comingSoonTitle: "即將推出",
            comingSoonMsg: "此功能將於之後加入。",

            missingUserTitle: "缺少用戶",
            missingUserMsg: "請重新登入。",
        },
    },

    /* ✅ NEW: Live data screen */
    liveData: {
        tabs: {
            live: "直播數據",
            pk: "PK 數據",
        },

        range: {
            daily: "每日數據",
            weekly: "每週數據",
            monthly: "每月數據",
        },

        stats: {
            wonPoints: "贏得點數",
            liveDuration: "直播時長",
            liveEarnings: "直播收益",
            partyDuration: "派對時長",
            partyEarnings: "派對收益",
            partyCrownDuration: "派對皇冠時長",
            newFans: "新增粉絲數",
            newFanClubMembers: "新增粉絲團成員數",

            avgOnline: {
                daily: "今日平均線上人數",
                weekly: "本週平均線上人數",
                monthly: "本月平均線上人數",
            },
        },

        actions: {
            getMorePoints: "獲得更多點數",
            contribution: "貢獻",
        },

        help: {
            title: "說明",
            line1: "1. 結算週期為 UTC+8 的 00:00:00–23:59:59。",
            confirm: "確認",
        },

        errors: {
            notLoggedIn: "尚未登入。",
            loadFailedLive: "載入直播數據失敗。",
            loadFailedPk: "載入 PK 數據失敗。",
            emptyResponse: "伺服器回傳空內容。",
        },

        pk: {
            tabs: {
                random: "隨機 PK",
                friend: "好友 PK",
                team: "團隊 PK",
            },
            range: {
                today: "今日",
                recent7: "最近 7 天",
                monthly: "每月",
            },
            cards: {
                winRate: "勝率%",
                pkScore: "PK 分數",
                sessions: "場次",
            },
            history: {
                title: "歷史紀錄",
                loading: "載入 PK 歷史中...",
                empty: "沒有紀錄。邀請好友一起 PK。",
                unknownOpponent: "未知",
            },
            result: {
                win: "勝",
                lose: "負",
                draw: "平",
                score: "分數：{{score}}",
            },
        },
    },

    /* ✅ NEW: Fans ranking screen */
    fansRanking: {
        title: "粉絲排行",

        summary: {
            totalContribution: "總貢獻",
            myRank: "我的名次：{{rank}}",
            myCoins: "我的金幣：{{coins}}",
        },

        states: {
            loading: "載入排行中...",
        },

        labels: {
            levelShort: "Lv.{{level}}",
            unknownUser: "未知用戶",
        },

        errors: {
            notLoggedIn: "尚未登入。",
            loadFailed: "載入粉絲排行失敗。",
            network: "載入粉絲排行時發生網路錯誤。",
        },

        empty: "尚無粉絲貢獻。",
    },

    /* ✅ NEW: Help screen */
    help: {
        title: "幫助",

        fallbackCategories: {
            frequent: "常見",
            livestream: "直播",
            recharge: "儲值",
            report: "舉報",
            account: "帳號",
        },

        states: {
            loadingFaqs: "載入常見問題中...",
            noFaqs: "此分類找不到常見問題。",
        },

        actions: {
            myFeedback: "我的回饋",
            messageFeedback: "訊息回饋",
        },

        compose: {
            title: "送出回饋",
            typeLabel: "類型",
            subjectOptional: "主旨（選填）",
            subjectPlaceholder: "簡短標題",
            messageLabel: "內容",
            messagePlaceholder: "在此輸入詳細內容...",
            send: "送出",
        },

        feedback: {
            types: {
                general: "一般",
                bug: "錯誤",
                payment: "付款",
                account: "帳號",
                stream: "直播",
                report: "舉報",
            },
        },

        myFeedback: {
            title: "我的回饋",
            empty: "尚未提交任何回饋。",
            adminReplyTitle: "管理員回覆",
            noAdminReply: "尚無管理員回覆。",
        },

        alerts: {
            missingMessageTitle: "缺少內容",
            missingMessageMsg: "請輸入你的回饋內容。",
            sentTitle: "已送出",
            sentMsg: "你的回饋已送至管理員。",
            failedTitle: "失敗",
            failedMsg: "無法送出回饋，請再試一次。",
        },
    },

    /* ✅ NEW: My Agency screen */
    myAgency: {
        title: "我的公會",

        hero: {
            title: "選擇方式 1 或方式 2",
            subtitle: "加入既有公會或等待你的經紀人邀請。",
        },

        method1: {
            badge: "方式 1",
            title: "加入經紀人",
            subtitle: "經紀人 ID 會由你的經紀人提供。",
            placeholder: "請輸入經紀人 ID",
            button: "加入經紀人",
        },

        method2: {
            badge: "方式 2",
            title: "等待經紀人邀請",
            subtitle: "把你的 ID 與主播碼分享給經紀人以接收邀請。",
            userIdLabel: "用戶 ID：",
            hostCodeLabel: "主播碼：",
        },
    },

    /* ✅ NEW: Level screen */
    level: {
        header: {
            wealthTitle: "財富等級",
            liveTitle: "直播等級",
        },

        tabs: {
            wealth: "財富等級",
            live: "直播等級",
        },

        labels: {
            levelShort: "Lv.{{level}}",
        },

        progress: {
            maxLevelReached: "已達最高等級",
            distanceToUpgrade: "距離升級 · {{exp}}",
            exp: "EXP：{{exp}}",
        },

        sections: {
            myBenefits: "我的福利",
            lockedBenefits: "未解鎖福利",
        },

        states: {
            loadingBenefits: "載入福利中...",
            noBenefits: "尚未解鎖任何福利。",
            noLocked: "沒有鎖定里程碑。",
        },

        benefits: {
            titleWithLevel: "{{title}}（Lv.{{level}}）",
        },

        locked: {
            unlocksAt: "於 Lv.{{level}} 解鎖",
            unlocksAtWithPreview: "於 Lv.{{level}} 解鎖 · {{preview}}",
        },
    },

    auth: {
        title: "認證",
        card: {
            title: "我的認證",
            subtitle:
                "為了確保你的帳號與資產安全，我們建議你完成認證。",
        },
        rows: {
            faceAuthTitle: "人臉認證",
            faceAuthDesc: "請先完成認證流程。",
            faceAuthBtn: "前往",

            bindPhoneTitle: "綁定手機",
            bindPhoneDesc: "綁定手機以保障你的帳號安全。",
            bindPhoneBtn: "綁定",
        },
    },

    faceScan: {
        titles: {
            submitted: "已提交驗證",
            verified: "已驗證",
            rejected: "已拒絕",
            default: "人臉驗證",
        },

        permission: {
            title: "需要相機權限",
            text: "我們需要存取你的相機以完成真人驗證。",
            button: "授予權限",
        },

        hints: {
            placeFace: "請將臉放入框內。",
            keepInside: "請保持臉部在框內。",
            moveCloser: "請靠近相機。",
            moveBack: "請稍微後退。",
            centerFace: "請將臉置中於框內。",
            headStraight: "請保持頭部端正。",
            perfectHold: "很好。請保持不動…",
            visibleLight: "請確保在良好光線下可清楚看見臉部。",
            adjustLighting: "調整光線並保持臉部置中。",
            capturing: "擷取中…",
            uploading: "上傳中…",
            bottom:
                "請將整張臉完整置於框內。對齊後會自動擷取。",
        },

        states: {
            waitTitle: "等待審核",
            waitText:
                "你的人臉掃描已上傳。我們的團隊將審核並核准你的申請。",
            autoChecking: "自動檢查狀態中…",

            alreadyVerified: "你已完成驗證",
            closing: "將自動關閉…",
            continue: "繼續",

            notApproved: "未核准",
            rejectedText:
                "你的驗證已被拒絕。請在良好光線下重新嘗試並確保臉部清晰。",
            rescan: "重新掃描",

            checking: "正在檢查你的驗證狀態…",
            tryAgain: "再試一次",
        },

        errors: {
            loginFirst: "請先登入。",
            statusFailed: "檢查狀態失敗",
            captureFailed: "擷取圖片失敗。請再試一次。",
            network: "掃描時發生網路/未知錯誤。",
            imageTooLarge:
                "上傳失敗：圖片過大（413）。請降低品質或提高伺服器限制。",
            uploadFailed: "上傳失敗（{{code}}）。",
        },
    },

    outfit: {
        title: "我的裝扮",

        tabs: {
            backpack: "背包禮物",
            avatar: "頭像框",
            party: "派對主題",
        },

        states: {
            loading: "正在載入你的物品…",
        },

        actions: {
            retry: "重試",
            equip: "裝備",
            unequip: "卸下",
        },

        errors: {
            loginRequired: "需要登入（找不到 gl_user_id）。",
            loadFailed: "載入裝扮物品失敗",
        },

        empty: {
            backpack: "目前沒有背包禮物",
            avatar: "目前沒有頭像框",
            party: "目前沒有派對主題",
            hint: "到商店購買物品。此頁只顯示你擁有的物品（UserStoreItem）。",
        },

        labels: {
            permanent: "永久",
            limited: "限時",
            expired: "已過期",
            oneDayLeft: "剩 1 天",
            daysLeft: "剩 {{count}} 天",

            owned: "已擁有",
            item: "物品",

            equipped: "已裝備",
            tapToUse: "點擊以裝備/卸下",
        },
    },
    giftGallery: {
        title: "禮物圖鑑",
        states: {
            loading: "載入中…",
        },
        errors: {
            notLoggedIn: "找不到使用者，請重新登入。",
            loadFailed: "載入禮物圖鑑失敗。",
            network: "網路錯誤。請再試一次。",
        },
        summary: {
            totalValue: "禮物總價值",
            totalGifts: "{{count}} 個禮物",
            uniqueGifts: "{{count}} 種類型",
        },
        actions: {
            goToPoints: "前往點數",
        },
        labels: {
            coins: "硬幣",
            qtyLine: "x{{qty}} • 每個 {{unit}} 硬幣",
        },
        empty: "目前尚未收到任何禮物。",
    },

    followUs: {
        title: "關注我們",

        brandName: "Gold Live",
        tagline: "全球社群",

        hero: {
            subtitle:
                "探索優質內容並與世界各地的人連結。\n加入下方社群，開始你的社交旅程。",
        },

        sectionTitle: "推薦社群",

        states: {
            loading: "載入社群中…",
        },

        errors: {
            backendMissing:
                "找不到後端路由（使用預設連結）。若要由後端控制，請新增 GET /api/public/follow-us。",
            linkTitle: "連結錯誤",
            cannotOpen: "此裝置無法開啟此連結。",
            openFailed: "無法開啟連結",
        },

        social: {
            facebook: "Facebook",
            youtube: "YouTube",
            instagram: "Instagram",
            tiktok: "TikTok",
            telegram: "Telegram",
            discord: "Discord",
            x: "X",
            community: "社群",
        },
    },

    editProfile: {
        title: "編輯個人檔案",
        actions: { save: "儲存", addTag: "新增" },
        states: { loadingProfile: "載入個人資料中..." },
        sections: { myProfile: "我的個人資料", interestTags: "興趣標籤" },
        fields: {
            nickname: "暱稱",
            gender: "性別（男/女）",
            dob: "出生日期",
            country: "國家",
            selfIntro: "自我介紹",
        },
        placeholders: {
            enterNickname: "輸入暱稱",
            selectDate: "選擇日期",
            writeBio: "寫點關於你自己的介紹",
            typeTag: "輸入標籤",
        },
        helpers: {
            cannotModify: "【不可修改】",
            noTags: "目前沒有標籤。請在下方新增幾個。",
            longPressRemove: "長按標籤可移除。",
        },
        labels: {
            notSet: "未設定",
            userFallback: "用戶",
        },
        gender: { male: "男", female: "女", other: "其他" },
        alerts: {
            notLoggedInTitle: "尚未登入",
            loginAgainMsg: "請重新登入。",
            permissionNeededTitle: "需要權限",
            permissionNeededMsg: "請允許相片存取，以便選擇個人圖片。",
            duplicateTagTitle: "重複標籤",
            duplicateTagMsg: "你已新增此標籤。",
            savedTitle: "已儲存",
            savedMsg: "個人檔案更新成功。",
            loadFailedMsg: "載入個人檔案失敗",
            updateFailedMsg: "更新個人檔案失敗",
            networkLoadMsg: "載入時發生網路錯誤。",
            networkSaveMsg: "儲存時發生網路錯誤。",
            galleryFailedMsg: "無法開啟相簿。",
        },
    },

    explore: {
        tabs: { following: "關注", explore: "探索", new: "最新", near: "附近" },
        search: { placeholder: "搜尋", cancel: "取消" },
        chips: { popular: "熱門", more: "更多" },
        actions: { live: "直播" },
        states: {
            loadingCountries: "載入國家中...",
            refreshingList: "重新整理直播列表中...",
            empty: "找不到任何直播主播。請嘗試更改篩選條件。",
        },
        errors: {
            loadCountries: "載入國家失敗",
            networkCountries: "載入國家時發生網路錯誤",
            loadFeed: "載入探索動態失敗",
            networkFeed: "載入動態時發生網路錯誤",
        },
        alerts: {
            liveEndedTitle: "直播已結束",
            liveEndedMsg: "此直播已結束。",
        },
        labels: {
            liveBadge: "直播",
            userFallback: "用戶",
            viewers: "👀 {{count}}",
        },
    },

    guardMe: {
        title: "守護我",
        actions: { goBack: "返回" },
        states: { loading: "載入中…", empty: "目前還沒有人守護你" },
        labels: { currentGuardian: "你目前的守護者", tier: "等級", ends: "結束", started: "開始" },
        errors: {
            missingUser: "缺少 userId。請重新登入。",
            loadFailed: "載入失敗",
        },
    },

    coins: {
        title: "硬幣",
        pointsTab: "點數",
        labels: {
            remainingCoins: "剩餘硬幣",
            balanceAfter: "餘額：{{balance}}",
            pkgCoins: "{{coins}} 硬幣",
            pkgId: "方案：{{id}}",
            coinsUnit: "COINS",
        },
        actions: { topUp: "儲值", refresh: "重新整理" },
        filters: { all: "全部", topups: "儲值", spent: "已花費" },
        states: {
            loading: "載入中…",
            empty: "沒有紀錄",
            scrollMore: "向下滑動查看更多…",
            end: "結束",
            loadingPackages: "正在載入方案…",
            noPackages: "沒有方案",
        },
        types: { topup: "儲值", giftSent: "已送出禮物" },
        modal: {
            title: "儲值",
            note: "注意：此儲值僅為測試模式。之後會加入真實付款。",
        },
        alerts: {
            walletErrorTitle: "錢包錯誤",
            historyErrorTitle: "紀錄錯誤",
            topupErrorTitle: "儲值錯誤",
            loginRequiredTitle: "需要登入",
            topupFailedTitle: "儲值失敗",
            successTitle: "成功",
            addedCoinsMsg: "已新增 {{coins}} 硬幣",
        },
        errors: {
            loadWallet: "載入錢包失敗",
            loadHistory: "載入紀錄失敗",
            loadMore: "載入更多失敗",
            loadPackages: "載入方案失敗",
            topupFailed: "儲值失敗",
        },
    },

    liveApplication: {
        title: "直播申請",
        states: { loading: "載入中..." },
        labels: { status: "狀態：" },

        status: {
            none: "無",
            pending: "審核中",
            approved: "已通過",
            rejected: "已拒絕",
        },

        defaults: {
            liveTitle: "我的直播",
            hostName: "主播",
        },

        rows: {
            faceAuthTitle: "人臉認證",
            faceAuthNeed: "請先完成認證流程。",
            livePhotoTitle: "直播照片",
            livePhotoNeed: "請重新上傳直播封面。",
            wealthTitle: "財富等級 ≥ {{level}}",
            wealthSubtitle: "你的等級：{{level}}",
            completed: "已完成",
            uploaded: "已上傳",
        },

        actions: { goLive: "開始直播", applyOrComplete: "申請 / 完成步驟" },

        errors: {
            loginRequired: "需要登入",
            loadFailed: "載入直播狀態失敗",
            network: "網路錯誤",
            notLoaded: "直播狀態尚未載入。",
            submitFailed: "提交申請失敗",
            submitNetwork: "提交申請時發生網路錯誤",
            startFailed: "開始直播失敗",
            startNetwork: "開始直播時發生網路錯誤",
        },

        alerts: {
            wealthRequiredTitle: "需要財富等級",
            wealthRequiredMsg: "你需要等級 {{level}}。",
            underReviewTitle: "審核中",
            underReviewMsg: "請等待管理員審核。",
            submittedTitle: "已提交",
            submittedMsg: "你的申請已提交。請等待審核。",
            infoTitle: "資訊",
            wealthInfoMsg: "透過消費/送禮等提升財富等級。",
        },
    },

    // ✅ NEW: Home Feed
    homeFeed: {
        tabs: {
            following: "關注",
            square: "廣場",
            video: "影片",
        },

        search: {
            squarePlaceholder: "搜尋貼文、話題、用戶",
            videoPlaceholder: "搜尋影片、用戶",
        },

        time: {
            secondsAgo: "{{count}} 秒前",
            minutesAgo: "{{count}} 分鐘前",
            hoursAgo: "{{count}} 小時前",
            daysAgo: "{{count}} 天前",
        },

        eventBanner: {
            title: "粉絲團話題活動",
            dateRange: "12/11/2025 - 18/11/2025【UTC+8】",
        },

        alerts: {
            loginRequiredTitle: "需要登入",
            loginToLikePosts: "請登入後再按讚貼文。",
            loginToLikeVideos: "請登入後再按讚影片。",
        },

        following: {
            chips: {
                popular: "熱門",
                pakistan: "巴基斯坦",
                philippines: "菲律賓",
                more: "更多",
            },
            empty: "你關注的人目前沒有直播間。",
            errors: {
                loadFailed: "載入關注動態失敗",
                network: "載入關注動態時發生網路錯誤",
            },
        },

        square: {
            hotTopics: "熱門話題",
            more: "更多 >",
            noTopicsYet: "尚無話題",
            emptySearch: "找不到結果。",
            emptyFeed: "還沒有貼文。快來成為第一個分享的人！",
            hotBadge: "熱門",
            viewAllComments: "查看全部 {{count}} 則留言",
            errors: {
                loadFailed: "載入廣場動態失敗",
                network: "載入廣場動態時發生網路錯誤",
            },
        },

        video: {
            states: {
                loadingVideos: "載入影片中...",
                empty: "還沒有影片。",
            },
            actions: {
                share: "分享",
            },
            labels: {
                originalSound: "原聲",
            },
            tip: {
                title: "提示",
                label: "提示",
                msg: "影片送禮可在下一步加入（需要 DB 交易模型）。",
            },
            errors: {
                loadFailed: "載入影片動態失敗",
                network: "載入影片動態時發生網路錯誤",
                videoFailed: "影片載入失敗",
                debugHint:
                    "若一直黑畫面，請檢查伺服器標頭：Content-Type video/mp4 + Accept-Ranges bytes",
            },
        },
    },

    // ✅ NEW: Honor Wall
    honorWall: {
        title: "榮耀牆",
        tabs: {
            data: "數據",
            honor: "榮耀牆",
        },
        states: {
            loading: "載入榮耀牆中...",
        },
        cards: {
            tagWall: "標籤牆",
            medalWall: "勳章牆",
            giftCollection: "禮物收藏",
            vehicleWall: "座駕牆",
            notObtained: "尚未獲得",
            countMore: "{{count}} >",
        },
    },

    // ✅ NEW: Host Live Room
    hostLiveRoom: {
        defaults: {
            liveTitle: "我的直播",
            hostName: "主播",
        },
        states: {
            preparing: "準備直播間中...",
            stopping: "結束直播中...",
        },
        permission: {
            required: "需要相機權限",
            grant: "授予權限",
        },
        labels: {
            liveBadge: "直播",
            liveTitle: "直播標題",
        },
        placeholders: {
            liveTitle: "輸入直播標題...",
            chat: "說點什麼...",
        },
        actions: {
            goLive: "開始直播",
            stop: "結束",
        },
        alerts: {
            stopTitle: "要結束直播嗎？",
            stopMsg: "這將結束你的直播。",
        },
        chat: {
            welcome: "歡迎來到你的直播間 👋",
            guest: "訪客",
            line: "{{name}}：{{text}}",
            meLine: "我：{{text}}",
            system: "ℹ️ {{text}}",
        },
        errors: {
            cameraRequiredToGoLive: "❗ 需要相機權限才能開始直播。",
        },
        messages: {
            liveNow: "🔴 你正在直播！",
        },
    },

    // ✅ NEW: Hot Topics
    hotTopics: {
        title: "熱門話題",
        tabs: {
            daily: "每日",
            official: "官方",
            normal: "一般",
        },
        labels: {
            hotCount: "熱門 {{count}}",
        },
        empty: "此分類尚無話題。",
        errors: {
            loadFailed: "載入話題失敗",
            network: "載入話題時發生網路錯誤",
        },
    },

    // ✅ NEW: Live Cover
    liveCover: {
        title: "直播封面",
        card: {
            title: "上傳直播封面照片",
            subtitle: "此照片將作為你的直播封面。請使用良好光線與清晰影像。",
        },
        states: {
            checking: "檢查中…",
            uploading: "上傳直播封面中…",
            checkingStatus: "檢查直播封面狀態中…",
            uploaded: "上傳成功",
        },
        labels: {
            alreadyUploaded: "你已上傳過直播封面。",
            preview: "預覽",
            selectCover: "選擇封面圖片",
            cameraSide: "相機：{{side}}",
            front: "前置",
            back: "後置",
        },
        actions: {
            change: "更換",
            upload: "上傳",
            uploadCover: "上傳封面",
            camera: "相機",
            gallery: "相簿",
        },
        alerts: {
            permissionNeededTitle: "需要權限",
            galleryPermissionMsg: "請允許相簿存取。",
            cameraPermissionMsg: "請允許相機存取。",
        },
        errors: {
            loginRequired: "需要登入",
            loadFailed: "載入狀態失敗",
            network: "網路錯誤",
            selectPhotoFirst: "請先選擇照片。",
            imageTooLarge: "圖片過大（413）。請嘗試其他照片。",
            uploadFailed: "上傳失敗（{{code}}）",
            uploadFailedGeneric: "上傳失敗",
            noImageReturned: "沒有回傳圖片。",
            cameraNoImage: "相機未回傳圖片。",
            cannotReadBase64: "無法以 base64 讀取圖片。請嘗試其他圖片。",
            openGalleryFailed: "開啟相簿失敗",
            openCameraFailed: "開啟相機失敗",
            androidEmulatorHint: "若你在 Android 模擬器：相機通常無法使用。請改用真機。",
        },
    },

    vipCenter: {
        title: "VIP 中心",
        states: {
            loading: "載入 VIP 中...",
        },
        current: {
            none: "目前：無 VIP",
            active: "目前：{{name}} • 剩 {{days}} 天",
        },
        labels: {
            perMonth: "/月",
            defaultDescription: "開通 VIP 並享受特權",
            privilegesCount: "VIP 專屬特權 {{count}}/{{total}}",
        },
        actions: {
            open: "開通 {{name}}",
        },
        alerts: {
            purchaseTitle: "VIP 購買",
            purchaseMsg: "開始 {{tier}} 的購買流程。",
        },
    },

    topicDetail: {
        states: {
            empty: "此話題下還沒有動態。",
        },
        errors: {
            loadFailed: "載入話題動態失敗",
            network: "載入話題動態時發生網路錯誤",
        },
        alerts: {
            loginRequiredTitle: "需要登入",
            loginRequiredMsg: "請登入後再按讚貼文。",
            likeFailedTitle: "錯誤",
            likeFailedMsg: "目前無法對此貼文按讚。",
        },
    },

    visitProfile: {
        titleFallback: "個人檔案",
        labels: {
            id: "ID：{{id}}",
            followers: "粉絲",
            following: "追蹤中",
        },
        actions: {
            follow: "追蹤",
            following: "追蹤中",
            pleaseWait: "請稍候...",
            unblock: "解除封鎖",
        },
        states: {
            notFound: "找不到使用者。",
            noMoments: "尚無動態。",
            blockedChip: "你已封鎖此使用者",
            blockedBody: "你已封鎖此使用者。解除封鎖後即可查看他的動態。",
        },
        menu: {
            title: "選項",
            blockTitle: "封鎖使用者",
            blockMsg: "你將不再看到他的內容，且他可能無法與你互動。",
            block: "封鎖",
            unblock: "解除封鎖",
        },
        alerts: {
            loginRequired: "需要登入。",
            loginToBlock: "需要登入才能封鎖使用者。",
            blockedTitle: "已封鎖",
            blockedFollowMsg: "請先解除封鎖此使用者才能追蹤。",
            navigationErrorTitle: "導覽錯誤",
            profileTabMissing: "找不到個人檔案分頁。請確認底部分頁中包含 'Profile'。",
            errorTitle: "錯誤",
        },
        errors: {
            blockFailed: "封鎖使用者失敗",
            unblockFailed: "解除封鎖使用者失敗",
        },
    },
    realPersonAuth: {
        title: "認證",
        hero: {
            title: "真人驗證即將開始。",
            subtitle: "請確保你是用戶本人",
        },
        tips: {
            avoidCover: "避免遮擋",
            enoughLight: "保持足夠光線",
            minorsProhibited: "禁止未成年人",
        },
        actions: {
            start: "開始驗證",
        },
    },

    postMoment: {
        title: "發佈動態",
        actions: {
            post: "發佈",
            posting: "發佈中...",
            refresh: "重新整理",
        },
        labels: {
            postingTo: "發佈到 #{{topic}}",
            recommended: "推薦話題",
        },
        placeholders: {
            input: "說點什麼來記錄此刻...",
        },
        sheets: {
            title: "新增",
            message: "選擇媒體類型",
            addPhotos: "新增照片",
            addVideos: "新增影片",
        },
        permissions: {
            title: "需要權限",
            libraryMsg: "請允許存取以便上傳。",
            cameraMsg: "請允許相機存取。",
        },
        alerts: {
            nothingTitle: "沒有內容可發佈",
            nothingMsg: "請輸入內容或新增照片/影片。",
            notLoggedInTitle: "尚未登入",
            notLoggedInMsg: "請重新登入。",
            errorTitle: "錯誤",
            postFailed: "發佈動態失敗。",
            postedTitle: "已發佈",
            postedVideo: "你的影片將出現在「影片」分頁。",
            postedSquare: "你的貼文將出現在「廣場」。",
        },
        errors: {
            notLoggedIn: "尚未登入",
            uploadFailed: "上傳失敗",
            uploadEmpty: "上傳回傳空的 URL",
            networkPost: "發佈動態時發生網路錯誤。",
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
        title: "點數",
        coinsTab: "硬幣",
        actions: {
            details: "詳情",
            withdraw: "立即提領",
            exchange: "以點數兌換硬幣",
            exchanging: "兌換中...",
            refresh: "重新整理",
        },
        labels: {
            available: "可用點數",
            total: "總計：{{count}}",
            unconfirmed: "未確認：{{count}}",
            income: "收入",
            last30: "最近 30 天",
        },
        income: {
            livestream: "直播",
            party: "派對",
            platformRewards: "平台獎勵",
        },
        states: {
            loading: "載入中…",
        },
        hints: {
            exchangeRate: "兌換比例之後可在後端調整（POINTS_PER_COIN）。",
        },
        alerts: {
            errorTitle: "錯誤",
            successTitle: "成功",
            loginRequiredTitle: "需要登入",
            loginRequiredMsg: "請重新登入。",
            detailsSoon: "詳情頁將於稍後加入。",
            withdrawSoon: "提領功能將於稍後加入。",
            exchangeFailedTitle: "兌換失敗",
            exchangeSuccessMsg: "已兌換 {{points}} 點 → {{coins}} 硬幣。",
        },
        errors: {
            loadFailed: "載入點數失敗",
            exchangeFailed: "兌換點數失敗",
        },
        ranges: {
            title: "選擇區間",
            last7: "最近 7 天",
            last30: "最近 30 天",
            last90: "最近 90 天",
        },
        withdraw: {
            title: "提領點數",
            available: "可用：{{points}} 點",
            fields: {
                points: "要提領的點數",
                method: "方式",
                account: "帳戶資料",
            },
            placeholders: {
                account: "例如：03xx-xxxxxxx / IBAN / 帳戶名稱",
            },
            actions: {
                submit: "送出申請",
                submitting: "送出中...",
            },
            note: "提領申請會送交管理員審核。點數可能會先被保留直到處理完成。",
            alerts: {
                successTitle: "已送出",
                successMsg: "你的提領申請已送出。",
                failedTitle: "提領失敗",
            },
            errors: {
                invalidPoints: "請輸入有效的點數數量。",
                accountRequired: "請輸入帳戶資料。",
                failed: "無法送出提領申請。",
            },
        },
        details: {
            title: "點數詳情",
            intro: "以下為平台點數的運作方式：",
            lines: {
                available: "可用點數是你可以兌換或提領的點數。",
                unconfirmed: "未確認點數仍在驗證中，可能會變動。",
                total: "總點數包含可用 + 未確認點數。",
                income: "收入會顯示在所選日期範圍內點數的來源。",
                exchange: "兌換會把點數轉成硬幣。兌換比例可能依平台規則調整。",
                withdraw: "提領申請會在付款前審核。請確保帳戶資料正確。",
            },
            footer: "若遇到任何問題，請在個人頁面聯絡客服。",
        },
    },

    momentComments: {
        title: "{{owner}} 的動態",
        empty: "還沒有留言。快來成為第一個回覆的人！",
        placeholder: "寫一則留言...",
    },

    myGuardian: {
        title: "我的守護",
        empty: "你還沒有守護任何人。",
        actions: {
            goBack: "返回",
        },
        card: {
            meta: "等級：{{tier}} • 結束：{{ends}}",
        },
        errors: {
            missingUserId: "缺少 userId。請重新登入。",
            loadFailed: "載入失敗",
        },
    },

    myProfile: {
        tabs: {
            posts: "貼文",
        },
        items: {
            giftGallery: "禮物相簿",
            contribution: "貢獻",
        },
        sections: {
            personalInfo: "個人資訊",
        },
        labels: {
            idLine: "ID：{{id}}",
            followingFollowers: "關注 {{following}} · 粉絲 {{followers}}",
            fansCount: "{{count}} 粉絲",
            lit: "點亮：{{current}}/{{total}}",
            participantsRank: "排行榜參與者：{{count}}",
        },
        defaults: {
            bio: "她/他很懶，什麼都沒留下。",
        },
        alerts: {
            waitTitle: "請稍候",
            profileLoadingMsg: "個人檔案仍在載入中。",
        },
    },

    notificationsInbox: {
        postOwnerName: "貼文",
        inboxSearchPlaceholder: "搜尋通知...",
    },

    party: {
        tabs: {
            following: "關注",
            party: "派對",
        },
        search: {
            placeholder: "搜尋派對房間",
        },
        filters: {
            popular: "熱門",
            pakistan: "巴基斯坦",
            philippines: "菲律賓",
            more: "更多",
        },
        labels: {
            defaultTag: "派對",
        },
        states: {
            empty: "找不到房間。請更改篩選條件或搜尋。",
        },
        errors: {
            loadFailed: "載入派對房間失敗",
            network: "載入派對房間時發生網路錯誤",
        },
    },
};
