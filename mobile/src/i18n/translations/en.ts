// src/i18n/en.ts
export default {
    common: {
        ok: "OK",
        cancel: "Cancel",
        loading: "...",
        loadingText: "Loading…",

        error: "Error",
        success: "Success",
        done: "Done",
        failed: "Failed",

        edit: "Edit",
        block: "Block",
        remove: "Remove",
        you: "You",

        sendCode: "Send Code",
        verifyAndBind: "Verify & Bind",
        bind: "Bind",
        unbind: "Unbind",
        changePhoneNumber: "Change phone number",
        userFallback: "User",

        codeSent: "Code sent",
    },

    errors: {
        userNotFound: "User not found, please login again.",
        updateFailed: "Failed to update language.",
    },

    settings: {
        title: "Settings",
        versionText: "1.0.0 (Gold Live)",

        items: {
            accountAndSecurity: "Account and security",
            securityPassword: "Security Password",
            languageSetting: "Language Setting",

            blacklist: "Blacklist",
            privilegeSettings: "Privilege settings",
            newMessagesNotification: "New messages notification",
            privacy: "Privacy",

            version: "Version",
            aboutGoldLive: "About Gold Live",
            clearCache: "Clear Cache",
        },

        security: {
            levelPrefix: "Security level:",
            levelLow: "Low",
            levelMedium: "Medium",
            levelHigh: "High",
        },

        actions: {
            clearCacheTitle: "Clear cache",
            clearCacheMsg: "App cache cleared (this does not log you out).",

            switchAccountTitle: "Switch account",
            switchAccountMsg: "Do you want to switch account?",
            switch: "Switch",
            switchAccountBtn: "Switch account",

            logoutTitle: "Logout",
            logoutMsg: "Are you sure you want to log out?",
            logout: "Log Out",
            logoutBtn: "Log Out",
        },

        language: {
            title: "Language Setting",
            followSystem: "Follow system",
            english: "English",
            traditionalChinese: "繁體中文",
            vietnamese: "Tiếng Việt",
            arabic: "العربية",
            urdu: "اردو",
            portuguese: "Português",
            spanish: "Español",
        },
    },

    accountSecurity: {
        title: "Account and security",
        levelText: "Your account security level is {{level}}.",
        tip: "Binding a mobile number or email can raise your security level.",

        rows: {
            setPassword: "Set password",
            phoneNumber: "Phone number",
            email: "Email",
            google: "Google",
            facebook: "Facebook",
            instagram: "Instagram",
            tiktok: "TikTok",
            deviceManagement: "Device management",
        },

        trailing: {
            modify: "Modify",
            set: "Set",
            bound: "Bound",
            bind: "Bind",
        },

        cancel: {
            title: "Cancel account",
            msg: "Account cancellation flow will be implemented later.",
            button: "Cancel account",
        },
    },

    securityPassword: {
        title: "Security Password",

        fields: {
            current: "Current password",
            new: "New password",
            confirm: "Confirm new password",
        },

        actions: {
            save: "Save",
            saving: "Saving...",
        },

        errors: {
            title: "Error",
            enterNew: "Please enter new password.",
            mismatch: "New password and confirm password do not match.",
            updateFailed: "Failed to update password",
            network: "Network error, please try again.",
        },

        success: {
            title: "Success",
            msg: "Password updated successfully.",
        },
    },

    bindPhone: {
        title: "Bind a phone",
        subtitle:
            "Bind your mobile number to protect your Gold Live account and make login easier.",
        currentBoundLabel: "Current bound phone:",

        sections: {
            enterPhone: "Enter phone",
            enterCode: "Enter code",
        },

        labels: {
            sentTo: "Sent to: {{phone}}",
        },

        placeholders: {
            phone: "Please enter your phone number",
            code: "Verification code",
        },

        alerts: {
            codeSentMsg: "We sent a code to {{phone}}.",
            devCode: "DEV CODE: {{code}}",
            successMsg: "Phone bound successfully.",
        },

        terms: {
            prefix: "I have read and agreed to the ",
            tos: "Gold Live Terms of Service",
            and: " and ",
            privacy: "Privacy Policy",
            suffix: ".",
        },
    },

    bindEmail: {
        title: "Bind email",
        currentBoundLabel: "Current bound email:",
        noBoundYet: "No email bound yet.",

        labels: {
            email: "Email",
            code: "Verification Code",
        },

        placeholders: {
            email: "Enter your email",
            code: "Enter code",
        },

        alerts: {
            codeSentMsg: "We sent a code to {{email}}.",
            devCode: "DEV CODE: {{code}}",
            successMsg: "Email bound successfully.",
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
            google: "Bind Google",
            facebook: "Bind Facebook",
            instagram: "Bind Instagram",
            tiktok: "Bind TikTok",
        },

        status: {
            notBound: "Not bound yet.",
            currentlyBound: "Currently bound: {{id}}",
        },

        tempBackendHint:
            "Temporary backend binding (replace with OAuth later). Enter {{provider}} id:",

        placeholders: {
            google: "googleId (from OAuth later)",
            facebook: "facebookId (from OAuth later)",
            instagram: "instagramId (from OAuth later)",
            tiktok: "tiktokId (from OAuth later)",
        },

        alerts: {
            loadFailed: "Failed to load bind status",
            boundSuccess: "{{provider}} bound successfully.",
            unboundSuccess: "{{provider}} unbound.",
        },
    },

    deviceManagement: {
        title: "Device management",

        labels: {
            empty: "No device information yet.",
            unknownDevice: "Unknown device",
            lastActiveTime: "Last active time: {{time}}",
            friendlyName: "{{platform}} device",
        },

        badges: {
            current: "Current device",
            trusted: "Trust device",
        },

        errors: {
            notLoggedIn: "Not logged in. Please login again.",
            loadFailed: "Failed to load devices.",
            network: "Network error while loading devices.",
        },
    },

    blacklist: {
        title: "Blacklist",
        searchPlaceholder: "Enter user's ID or username",
        empty: "No blocked users",

        labels: {
            id: "ID: {{id}}",
        },

        errors: {
            addFailed: "Failed to add to blacklist.",
        },
    },

    privilegeSettings: {
        title: "Privilege settings",
        items: {
            invisibleVisitor: {
                label: "Invisible visitor",
                description:
                    "Visit others without leaving a record, and others also can't see who visited the homepage.",
            },
            mysteryLive: {
                label: "Mystery man in LIVE room",
                description: "Only the gift recipient can see your identity in LIVE rooms.",
            },
            mysteryRank: {
                label: "Mystery man on rank",
                description: "Your gifts won't appear on the host's fan ranking.",
            },
            invisibleOnline: {
                label: "Invisible Online",
                description:
                    "Always maintain an invisible status, enter live broadcast rooms invisibly.",
            },
            exclusiveEmail: {
                label: "Exclusive Email Notification",
                description:
                    "Receive exclusive email notifications after customer service replies.",
            },
            hideLiveLevel: {
                label: "Hide livestream level",
                description:
                    "Once turned on, others will not be able to see your livestream level on your profile.",
            },
        },
    },

    newMessageNotification: {
        title: "Notifications",
        searchPlaceholder: "Search notification settings",
        inboxSearchPlaceholder: "Search notifications...",

        sections: {
            notificationsList: "Notifications list",
            searchResults: "Search results",
            notificationSettings: "Notification settings",
        },

        actions: {
            markAllRead: "Mark all as read",
        },

        empty: "No notifications yet.",

        errors: {
            missingUserId: "Missing userId in AsyncStorage ({{key}})",
            loadFailed: "Failed to load notifications",
            network: "Network error while loading notifications",
        },

        debugLine: "uid: {{uid}} • total: {{total}} • unread: {{unread}}",

        settings: {
            liveAlerts: "Live room opening alerts",
            messageSwitch: "Message notification switch",
            sound: "Sound",
            vibrate: "Vibrate",
            mutualFollowers: "Mutual followers",
            myFollowing: "My Following",
            stranger: "Stranger",
        },
    },

    privacySettings: {
        title: "Privacy",

        sections: {
            livePrivacy: "Live privacy",
            permissionPrivacy: "Permission privacy",
        },

        items: {
            hideMicStatus: "Hide the microphone status",
        },

        trailing: {
            on: "On",
            goSettings: "Go settings",
        },

        errors: {
            openSettingsFailed: "Unable to open system settings on this device.",
        },

        permissions: {
            camera: {
                label: "Allow Gold Live to access your camera",
                subLabel: "For taking pictures, recording videos, etc.",
            },
            voice: {
                label: "Allow Gold Live to access your voice messages",
                subLabel: "For video recording and voice sending, etc.",
            },
            notifications: {
                label: "Allow the platform to get your notification permission",
                subLabel: "For unread message alerts, etc.",
            },
            bluetooth: {
                label: "Allow the platform to access your Bluetooth permissions.",
                subLabel: "Connect to Bluetooth headphones and ensure proper functioning.",
            },
            location: {
                label: "Allow the platform to get permission for your location",
                subLabel: "Used to find nearby streamers.",
            },
        },
    },

    aboutGoldLive: {
        title: "About Gold Live",
        versionText: "GOLD LIVE 1.0.0",

        items: {
            privacyPolicy: "Privacy Policy",
            termsOfService: "Terms Of Service",
            liveAgreement: "Live Agreement",
            userRechargeAgreement: "User Recharge Agreement",
            noChildEndangermentPolicy: "No Child Endangerment Policy",
        },

        alerts: {
            comingSoon: "{{label}} page will be added later for Gold Live.",
        },
    },

    ranking: {
        title: "Ranking",
        tabs: { host: "Host", rich: "Rich", gift: "Gift" },
        period: { daily: "Daily", weekly: "Weekly", monthly: "Monthly" },
        filters: {
            region: "Region",
            periodLabel: "{{period}}: {{range}}",
        },
        datePicker: {
            selectDate: "Select date",
            done: "Done",
        },
        states: {
            loading: "Loading ranking...",
            retry: "Retry",
        },
        errors: {
            loadFailed: "Failed to load ranking",
            network: "Network error while loading ranking",
        },
        labels: {
            id: "ID: {{id}}",
            userFallback: "User",
        },
        distance: {
            label: "Distance from rank is: {{distance}}",
            top: "You are at the top (or no higher rank available).",
        },
    },

    reward: {
        title: "Reward",
        banner: {
            title: "Host tasks & rewards",
            subtitle: "Complete daily and weekly tasks to earn more points.",
        },
        tabs: {
            pkMission: "PK Mission",
            activity: "Activity",
            fanClub: "Fan Club",
            invite: "Invite",
        },
        pk: {
            todayRecord: "Today's PK record",
            recordLink: "PK record >>",
            highestStreak: "Highest effective winning streak",
            effectiveWins: "Effective wins",
        },
        states: {
            loading: "Loading tasks...",
            empty: "No tasks configured yet.",
        },
        errors: {
            notLoggedIn: "Not logged in.",
            loadFailed: "Failed to load reward tasks.",
            network: "Network error while loading reward tasks.",
        },
        actions: {
            go: "GO",
            confirm: "Confirm",
        },
        rule: {
            title: "Reward rule",
            daily: "Daily tasks: Tasks refresh daily at 00:00:00 (UTC+8).",
            weekly: "Weekly tasks: Tasks refresh every Monday at 00:00:00 (UTC+8).",
        },
    },

    store: {
        title: "Store",
        popular: "Popular",
        states: {
            loading: "Loading store…",
            empty: "No items found",
        },
        actions: {
            refresh: "Refresh",
            all: "All >",
            recharge: "Recharge",
        },
        labels: {
            coins: "Coins",
            preview: "Preview",
            balance: "Your balance",
            balanceHint: "Recharge coins to buy store items instantly.",
            durationDays: "{{days}} days",
            permanent: "Permanent",
        },
        errors: {
            missingUser: "Missing userId. Please login again.",
        },
        purchase: {
            confirmTitle: "Confirm purchase",
            confirmMsg: "Buy \"{{title}}\" for {{price}} coins?",
            successTitle: "Purchased",
            successMsg: "Item has been added to your account.",
            failedTitle: "Purchase failed",
            failedMsg: "Please try again.",
            insufficientTitle: "Not enough coins",
            insufficientMsg: "Recharge coins to buy this item.",
            actions: {
                buy: "Buy now",
                buying: "Buying...",
                recharge: "Recharge",

            }
        }
    },

    invite: {
        title: "Invitation Bonus",
        tabs: {
            myRewards: "My rewards",
            incomeRank: "Income Rank",
        },
        banner: {
            small: "Invite someone",
            title: "Earn rewards by inviting friends",
            subtitle: "Share your invite link or code. We will count your invitees automatically.",
        },
        stats: {
            claimed: "Claimed Rewards",
            invitees: "Number of invitees",
            availableToday: "Available for today: {{count}}",
        },
        list: {
            title: "Invitations from last 7 days ({{count}})",
            more: "More >",
            loading: "Loading…",
            empty: "No invitations yet",
            myCode: "My code: {{code}}",
            linkPlaceholder: "Invite link not ready (tap refresh)",
        },
        qr: {
            title: "Scan to join",
        },
        actions: {
            receive: "Receive",
            inviteNow: "Invite Now",
            share: "Share",
            copyLink: "Copy link",
        },
        alerts: {
            errorTitle: "Invite error",
            loadFailed: "Failed to load invite data",
            inviteTitle: "Invite",
            codeNotReady: "Invite code not ready. Tap refresh.",
            linkNotReady: "Invite link not ready. Tap refresh.",
            clipboardNotReadyTitle: "Clipboard not ready",
            clipboardNotReadyMsg:
                "Clipboard module is not in your Dev Client build. Rebuild Dev Client to enable copy.",
            copiedTitle: "Copied",
            codeCopied: "Invite code copied",
            linkCopied: "Invite link copied",
            soonTitle: "Soon",
            receiveSoon: "Claim rewards will be enabled when invite reward rules are added.",
            inviteCodeMissing: "Invite code missing from backend response",
        },
        badge: {
            registered: "Registered",
            qualified: "Qualified",
            rewarded: "Rewarded",
        },
        labels: {
            userFallback: "User",
        },
        shareMessage: "Join me on Gold Live 🎥\nUse my invite code: {{code}}\n{{link}}",
    },

    guardian: {
        defaultTitle: "Open Guardian",

        metaLine: "Plans: {{activePlans}}/{{totalPlans}} • Packages: {{activePackages}}",

        errors: {
            missingUser: "Missing userId. Please login again.",
            missingUserShort: "Missing userId",
            selectUser: "Select a user to guard first",
            selectDuration: "Select duration first",
            activateFailed: "Activation failed",
            apiNonJson: "API returned non-JSON. Preview: {{preview}}",
            plansExistEmpty: "Plans exist but returned empty. Check active packages for active plans.",
        },

        labels: {
            noUserSelected: "No user selected",
            tierLine: "{{tier}} Guardian",
        },

        sections: {
            guardSomeone: "I want to guard someone",
            coinsNeeded: "Coins needed: {{coins}}",
            privileges: "Guardian privileges",
            noPrivileges: "No privileges configured.",
        },

        links: {
            myGuardian: "My guardian",
            guardingCount: "You are guarding: {{count}}",
            guardMe: "Guard me",
            guardMeNone: "No one is guarding you yet",
            guardMeWith: "Guardian: {{name}}",
        },

        actions: {
            select: "Select",
            activate: "Activate {{tier}} Guardian",
            activating: "Activating...",
            refresh: "Refresh",
            search: "Search",
        },

        picker: {
            title: "Select user",
            placeholder: "Search username or nickname...",
            empty: "Type at least 2 characters and search.",
        },

        empty: {
            title: "No plans found",
            hint: "This means API returned 0 active plans (isActive=true). Check guardianPlan + packages are active.",
        },
    },

    fanClub: {
        title: "Fan Club",
        topTabs: { fanClub: "Fan Club", fanGroup: "Fan group" },
        subTabs: { joined: "Joined club", my: "My club" },
        empty: "No more data",
        frozenLink: "Frozen Fan Club >",
    },

    medalWall: {
        title: "Medal Wall",
        obtain: "Obtain: {{obtained}}/{{total}}",
        loading: "Loading...",
        level: "Level: {{level}}",
        achievementTitle: "Achievement Medal",
        unlocked: "Unlocked",
        empty: "No medals found. Add DB medals (HonorItem type MEDAL) or ensure API returns computed medals.",
        errors: {
            missingUserId: "Missing userId. Pass { userId } when navigating to MedalWall.",
            loadFailed: "Failed to load medals",
        },
    },

    profile: {
        header: {
            title: "Me",
        },

        loggedOut: {
            title: "You’re logged out",
            subtitle: "Please login again to view your profile.",
        },

        states: {
            loading: "Loading profile...",
            retry: "Retry",
        },

        errors: {
            notLoggedIn: "Not logged in.",
            loadFailed: "Failed to load profile.",
            network: "Network error while loading profile.",
        },

        labels: {
            guest: "Guest",
            online: "Online",

            id: "ID {{id}}",

            vipLevel: "VIP {{level}}",
            levelShort: "LV.{{level}}",

            level: "Level: {{level}}",
            coins: "Coins",
            followers: "Followers",
            following: "Following",
            likes: "Likes",
            visits: "Visits",
        },

        completion: {
            text: "Your profile is {{completion}}% completed. Finish it to make friends easier in Gold Live.",
        },

        stats: {
            friends: "Friends",
            following: "Following",
            followers: "Followers",
            visitors: "Visitors",
        },

        wallet: {
            coins: "Coins",
            points: "Points",
        },

        vipCard: {
            cta: "VIP • Upgrade to VIP and Enjoy Exclusive Benefits",
        },

        notice: {
            title: "NOTICE",
            subtitle: "User conduct standards and prohibited activities in Gold Live.",
        },

        tiles: {
            reward: "Reward",
            ranking: "Ranking",
            store: "Store",
            invite: "Invite",
            guardian: "Guardian",
            fanClub: "Fan club",
            medalWall: "Medal Wall",
        },

        rows: {
            liveData: "Live data",
            help: "Help",
            myAgency: "My Agency",
            level: "Level",
            auth: "Auth",
            backpack: "Backpack",
            followUs: "Follow Us",
        },

        actions: {
            editProfile: "Edit profile",
            editAvatar: "Edit profile photo",
            copyId: "Copy ID",
            shareProfile: "Share profile",
            follow: "Follow",
            following: "Following",
            message: "Message",

            goToLogin: "Go to Login",
            view: "View >",
        },

        menu: {
            ranking: "Ranking",
            reward: "Reward",
            store: "Store",
            invite: "Invitation Bonus",
            guardian: "Open Guardian",
            fanClub: "Fan Club",
            medalWall: "Medal Wall",
            settings: "Settings",
            about: "About Gold Live",
            logout: "Log Out",
        },

        alerts: {
            copiedTitle: "Copied",
            idCopied: "User ID copied",
            comingSoonTitle: "Soon",
            comingSoonMsg: "This feature will be added later.",

            missingUserTitle: "Missing user",
            missingUserMsg: "Please login again.",
        },
    },

    /* ✅ NEW: Live data screen */
    liveData: {
        tabs: {
            live: "Live data",
            pk: "PK data",
        },

        range: {
            daily: "Daily data",
            weekly: "Weekly data",
            monthly: "Monthly data",
        },

        stats: {
            wonPoints: "Won points",
            liveDuration: "Live duration",
            liveEarnings: "Live earnings",
            partyDuration: "Party duration",
            partyEarnings: "Party earnings",
            partyCrownDuration: "Party crown duration",
            newFans: "The number of new fans",
            newFanClubMembers: "New members of fans club",

            avgOnline: {
                daily: "Average number of online users today",
                weekly: "Average number of online users this week",
                monthly: "Average number of online users this month",
            },
        },

        actions: {
            getMorePoints: "Get more points",
            contribution: "Contribution",
        },

        help: {
            title: "Description",
            line1: "1. The settlement cycle is 00:00:00–23:59:59 in UTC+8.",
            confirm: "Confirm",
        },

        errors: {
            notLoggedIn: "Not logged in.",
            loadFailedLive: "Failed to load live data.",
            loadFailedPk: "Failed to load PK data.",
            emptyResponse: "Empty response from server.",
        },

        pk: {
            tabs: {
                random: "Random PK",
                friend: "Friend PK",
                team: "Team PK",
            },
            range: {
                today: "Today",
                recent7: "Recent 7 days",
                monthly: "Monthly",
            },
            cards: {
                winRate: "Win%",
                pkScore: "PK Score",
                sessions: "Sessions",
            },
            history: {
                title: "Historical record",
                loading: "Loading PK history...",
                empty: "No record. Invite friends to PK.",
                unknownOpponent: "Unknown",
            },
            result: {
                win: "Win",
                lose: "Lose",
                draw: "Draw",
                score: "Score: {{score}}",
            },
        },
    },

    /* ✅ NEW: Fans ranking screen */
    fansRanking: {
        title: "Fans ranking",

        summary: {
            totalContribution: "Total contribution",
            myRank: "My rank: {{rank}}",
            myCoins: "My coins: {{coins}}",
        },

        states: {
            loading: "Loading ranking...",
        },

        labels: {
            levelShort: "Lv.{{level}}",
            unknownUser: "Unknown",
        },

        errors: {
            notLoggedIn: "Not logged in.",
            loadFailed: "Failed to load fans ranking.",
            network: "Network error while loading fans ranking.",
        },

        empty: "No fan contributions yet.",
    },

    /* ✅ NEW: Help screen */
    help: {
        title: "Help",

        fallbackCategories: {
            frequent: "Frequent",
            livestream: "Livestream",
            recharge: "Recharge",
            report: "Report",
            account: "Account",
        },

        states: {
            loadingFaqs: "Loading FAQs...",
            noFaqs: "No FAQs found for this category.",
        },

        actions: {
            myFeedback: "My feedback",
            messageFeedback: "Message feedback",
        },

        compose: {
            title: "Send feedback",
            typeLabel: "Type",
            subjectOptional: "Subject (optional)",
            subjectPlaceholder: "Short title",
            messageLabel: "Message",
            messagePlaceholder: "Write details here...",
            send: "Send",
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
            title: "My feedback",
            empty: "No feedback submitted yet.",
            adminReplyTitle: "Admin reply",
            noAdminReply: "No admin reply yet.",
        },

        alerts: {
            missingMessageTitle: "Missing message",
            missingMessageMsg: "Please write your feedback message.",
            sentTitle: "Sent",
            sentMsg: "Your feedback has been sent to admin.",
            failedTitle: "Failed",
            failedMsg: "Could not send feedback. Please try again.",
        },
    },

    /* ✅ NEW: My Agency screen */
    myAgency: {
        title: "My Agency",

        hero: {
            title: "Choose Method 1 or Method 2",
            subtitle: "Join an existing agency or wait for an invitation from your agent.",
        },

        method1: {
            badge: "Method 1",
            title: "Join agent",
            subtitle: "Agent ID will be provided by your agent.",
            placeholder: "Please enter agent's ID",
            button: "Join agent",
        },

        method2: {
            badge: "Method 2",
            title: "Waiting for agent invitation",
            subtitle: "Share your ID and host code with your agent to receive an invitation.",
            userIdLabel: "User ID:",
            hostCodeLabel: "Host Code:",
        },
    },

    /* ✅ NEW: Level screen */
    level: {
        header: {
            wealthTitle: "Wealth level",
            liveTitle: "Livestream level",
        },

        tabs: {
            wealth: "Wealth level",
            live: "Livestream level",
        },

        labels: {
            levelShort: "Lv.{{level}}",
        },

        progress: {
            maxLevelReached: "Max level reached",
            distanceToUpgrade: "The distance to upgrade · {{exp}}",
            exp: "EXP: {{exp}}",
        },

        sections: {
            myBenefits: "My Benefits",
            lockedBenefits: "Locked Benefits",
        },

        states: {
            loadingBenefits: "Loading benefits...",
            noBenefits: "No benefits unlocked yet.",
            noLocked: "No locked milestones.",
        },

        benefits: {
            titleWithLevel: "{{title}} (Lv.{{level}})",
        },

        locked: {
            unlocksAt: "Unlocks at Lv.{{level}}",
            unlocksAtWithPreview: "Unlocks at Lv.{{level}} · {{preview}}",
        },
    },
    auth: {
        title: "Auth",
        card: {
            title: "My authentication",
            subtitle:
                "In order to ensure the safety of your account and assets, we recommend you to authenticate.",
        },
        rows: {
            faceAuthTitle: "Face Authentication",
            faceAuthDesc: "Please complete authentication process first.",
            faceAuthBtn: "Go",

            bindPhoneTitle: "Bind a phone",
            bindPhoneDesc: "Bind your phone to secure your account.",
            bindPhoneBtn: "Bind",
        },
    },

    faceScan: {
        titles: {
            submitted: "Verification Submitted",
            verified: "Verified",
            rejected: "Rejected",
            default: "Face Verification",
        },

        permission: {
            title: "Camera permission needed",
            text: "We need access to your camera to complete real-person verification.",
            button: "Grant permission",
        },

        hints: {
            placeFace: "Place your face inside the frame.",
            keepInside: "Keep your face inside the frame.",
            moveCloser: "Move closer to the camera.",
            moveBack: "Move slightly back.",
            centerFace: "Center your face inside the frame.",
            headStraight: "Keep your head straight.",
            perfectHold: "Perfect. Hold still…",
            visibleLight: "Make sure your face is visible in good light.",
            adjustLighting: "Adjust lighting and keep your face centered.",
            capturing: "Capturing…",
            uploading: "Uploading…",
            bottom:
                "Keep your full face inside the frame. Capture happens automatically when aligned.",
        },

        states: {
            waitTitle: "Wait for approval",
            waitText:
                "Your face scan has been uploaded. Our team will review it and approve your request.",
            autoChecking: "Auto-checking status…",

            alreadyVerified: "You are already verified",
            closing: "Closing automatically…",
            continue: "Continue",

            notApproved: "Not approved",
            rejectedText:
                "Your verification was rejected. Try again with good lighting and a clear face.",
            rescan: "Rescan",

            checking: "Checking your verification status…",
            tryAgain: "Try again",
        },

        errors: {
            loginFirst: "Please log in first.",
            statusFailed: "Failed to check status",
            captureFailed: "Failed to capture image. Please try again.",
            network: "Network/Unexpected error while scanning.",
            imageTooLarge:
                "Upload failed: image too large (413). Reduce quality or increase server limits.",
            uploadFailed: "Upload failed ({{code}}).",
        },
    },

    outfit: {
        title: "My Outfit",

        tabs: {
            backpack: "Backpack Gifts",
            avatar: "Avatar Frame",
            party: "Party Theme",
        },

        states: {
            loading: "Loading your items…",
        },

        actions: {
            retry: "Retry",
            equip: "Equip",
            unequip: "Unequip",
        },

        errors: {
            loginRequired: "Login required (gl_user_id not found).",
            loadFailed: "Failed to load outfit items",
        },

        empty: {
            backpack: "No backpack gifts yet",
            avatar: "No avatar frames yet",
            party: "No party themes yet",
            hint: "Buy items from the store. This page shows only items you own (UserStoreItem).",
        },

        labels: {
            permanent: "Permanent",
            limited: "Limited",
            expired: "Expired",
            oneDayLeft: "1 day left",
            daysLeft: "{{count}} days left",

            owned: "Owned",
            item: "Item",

            equipped: "Equipped",
            tapToUse: "Tap to equip/unequip",
        },
    },

    giftGallery: {
        title: "Gift Gallery",
        states: {
            loading: "Loading…",
        },
        errors: {
            notLoggedIn: "User not found, please login again.",
            loadFailed: "Failed to load gift gallery.",
            network: "Network error. Please try again.",
        },
        summary: {
            totalValue: "Total gift value",
            totalGifts: "{{count}} gifts",
            uniqueGifts: "{{count}} types",
        },
        actions: {
            goToPoints: "Go to Points",
        },
        labels: {
            coins: "coins",
            qtyLine: "x{{qty}} • {{unit}} coins each",
        },
        empty: "No gifts received yet.",
    },
    followUs: {
        title: "Follow Us",

        brandName: "Gold Live",
        tagline: "Global Community",

        hero: {
            subtitle:
                "Discover premium content and connect with people from all over the world.\nJoin the communities below and start your social journey.",
        },

        sectionTitle: "Recommended Communities",

        states: {
            loading: "Loading communities…",
        },

        errors: {
            backendMissing:
                "Backend route not found (using default links). If you want backend control, add GET /api/public/follow-us.",
            linkTitle: "Link error",
            cannotOpen: "Cannot open this link on this device.",
            openFailed: "Unable to open link",
        },

        social: {
            facebook: "Facebook",
            youtube: "YouTube",
            instagram: "Instagram",
            tiktok: "TikTok",
            telegram: "Telegram",
            discord: "Discord",
            x: "X",
            community: "Community",
        },
    },
    editProfile: {
        title: "Edit profile",
        actions: { save: "Save", addTag: "Add" },
        states: { loadingProfile: "Loading profile data..." },
        sections: { myProfile: "My Profile", interestTags: "Interest tags" },
        fields: {
            nickname: "Nickname",
            gender: "Gender (Male/Female)",
            dob: "Date of Birth",
            country: "Country",
            selfIntro: "Self-introduction",
        },
        placeholders: {
            enterNickname: "Enter nickname",
            selectDate: "Select date",
            writeBio: "Write something about yourself",
            typeTag: "Type a tag",
        },
        helpers: {
            cannotModify: "[Cannot be modified]",
            noTags: "No tags yet. Add a few below.",
            longPressRemove: "Long press a tag to remove it.",
        },
        labels: {
            notSet: "Not set",
            userFallback: "User",
        },
        gender: { male: "Male", female: "Female", other: "Other" },
        alerts: {
            notLoggedInTitle: "Not logged in",
            loginAgainMsg: "Please login again.",
            permissionNeededTitle: "Permission needed",
            permissionNeededMsg: "Please allow photo access so you can choose a profile picture.",
            duplicateTagTitle: "Duplicate tag",
            duplicateTagMsg: "You already added this tag.",
            savedTitle: "Saved",
            savedMsg: "Profile updated successfully.",
            loadFailedMsg: "Failed to load profile",
            updateFailedMsg: "Failed to update profile",
            networkLoadMsg: "Network error while loading profile.",
            networkSaveMsg: "Network error while saving profile.",
            galleryFailedMsg: "Could not open gallery.",
        },
    },

    explore: {
        tabs: { following: "Following", explore: "Explore", new: "New", near: "Near" },
        search: { placeholder: "Search", cancel: "Cancel" },
        chips: { popular: "Popular", more: "More" },
        actions: { live: "Live" },
        states: {
            loadingCountries: "Loading countries...",
            refreshingList: "Refreshing live list...",
            empty: "No live hosts found. Try changing filters.",
        },
        errors: {
            loadCountries: "Failed to load countries",
            networkCountries: "Network error while loading countries",
            loadFeed: "Failed to load explore feed",
            networkFeed: "Network error while loading feed",
        },
        alerts: {
            liveEndedTitle: "Live ended",
            liveEndedMsg: "This live stream has ended.",
        },
        labels: {
            liveBadge: "LIVE",
            userFallback: "User",
            viewers: "👀 {{count}}",
        },
    },

    guardMe: {
        title: "Guard me",
        actions: { goBack: "Go back" },
        states: { loading: "Loading…", empty: "No one is guarding you yet" },
        labels: { currentGuardian: "Your current guardian", tier: "Tier", ends: "Ends", started: "Started" },
        errors: {
            missingUser: "Missing userId. Please login again.",
            loadFailed: "Failed to load",
        },
    },

    coins: {
        title: "Coins",
        pointsTab: "Points",
        labels: {
            remainingCoins: "Remaining coins",
            balanceAfter: "Balance: {{balance}}",
            pkgCoins: "{{coins}} coins",
            pkgId: "Package: {{id}}",
            coinsUnit: "COINS",
        },
        actions: { topUp: "Top Up", refresh: "Refresh" },
        filters: { all: "All", topups: "Top ups", spent: "Spent" },
        states: {
            loading: "Loading…",
            empty: "No history",
            scrollMore: "Scroll for more…",
            end: "End",
            loadingPackages: "Loading packages…",
            noPackages: "No packages",
        },
        types: { topup: "Top up", giftSent: "Gift sent" },
        modal: {
            title: "Top Up",
            note: "Note: This top-up is test-mode only. Real payments will be added later.",
        },
        alerts: {
            walletErrorTitle: "Wallet error",
            historyErrorTitle: "History error",
            topupErrorTitle: "Top up error",
            loginRequiredTitle: "Login required",
            topupFailedTitle: "Top up failed",
            successTitle: "Success",
            addedCoinsMsg: "Added {{coins}} coins",
        },
        errors: {
            loadWallet: "Failed to load wallet",
            loadHistory: "Failed to load history",
            loadMore: "Failed to load more",
            loadPackages: "Failed to load packages",
            topupFailed: "Top up failed",
        },
    },

    liveApplication: {
        title: "Live application",
        states: { loading: "Loading..." },
        labels: { status: "Status:" },

        status: {
            none: "None",
            pending: "Pending",
            approved: "Approved",
            rejected: "Rejected",
        },

        defaults: {
            liveTitle: "My Live",
            hostName: "Host",
        },

        rows: {
            faceAuthTitle: "Face Authentication",
            faceAuthNeed: "Please complete authentication process first.",
            livePhotoTitle: "Live photo",
            livePhotoNeed: "Please upload the live cover again.",
            wealthTitle: "Wealth level ≥ level {{level}}",
            wealthSubtitle: "Your level: {{level}}",
            completed: "Completed",
            uploaded: "Uploaded",
        },

        actions: { goLive: "Go Live", applyOrComplete: "Apply / Complete Steps" },

        errors: {
            loginRequired: "Login required",
            loadFailed: "Failed to load live status",
            network: "Network error",
            notLoaded: "Live status not loaded yet.",
            submitFailed: "Failed to submit application",
            submitNetwork: "Network error while submitting application",
            startFailed: "Failed to start live",
            startNetwork: "Network error while starting live",
        },

        alerts: {
            wealthRequiredTitle: "Wealth level required",
            wealthRequiredMsg: "You need level {{level}}.",
            underReviewTitle: "Under review",
            underReviewMsg: "Please wait for admin approval.",
            submittedTitle: "Submitted",
            submittedMsg: "Your request is submitted. Please wait for review.",
            infoTitle: "Info",
            wealthInfoMsg: "Increase wealth level by spending/sending gifts etc.",
        },
    },

    // ✅ NEW: Home Feed
    homeFeed: {
        tabs: {
            following: "Following",
            square: "Square",
            video: "Video",
        },

        search: {
            squarePlaceholder: "Search posts, topics, users",
            videoPlaceholder: "Search videos, users",
        },

        time: {
            secondsAgo: "{{count}}s ago",
            minutesAgo: "{{count}} min ago",
            hoursAgo: "{{count}} h ago",
            daysAgo: "{{count}} d ago",
        },

        eventBanner: {
            title: "FAN CLUB TOPIC EVENT",
            dateRange: "12/11/2025 - 18/11/2025 [UTC+8]",
        },

        alerts: {
            loginRequiredTitle: "Login required",
            loginToLikePosts: "Please login to like posts.",
            loginToLikeVideos: "Please login to like videos.",
        },

        following: {
            chips: {
                popular: "Popular",
                pakistan: "Pakistan",
                philippines: "Philippines",
                more: "More",
            },
            empty: "No live rooms from people you follow yet.",
            errors: {
                loadFailed: "Failed to load following feed",
                network: "Network error while loading following feed",
            },
        },

        square: {
            hotTopics: "Hot topics",
            more: "More >",
            noTopicsYet: "No topics yet",
            emptySearch: "No results found.",
            emptyFeed: "No posts yet. Be the first to share something!",
            hotBadge: "HOT",
            viewAllComments: "View all {{count}} comments",
            errors: {
                loadFailed: "Failed to load square feed",
                network: "Network error while loading square feed",
            },
        },

        video: {
            states: {
                loadingVideos: "Loading videos...",
                empty: "No videos yet.",
            },
            actions: {
                share: "Share",
            },
            labels: {
                originalSound: "Original sound",
            },
            tip: {
                title: "Tip",
                label: "Tip",
                msg: "Gift sending for video can be added next (needs a DB transaction model).",
            },
            errors: {
                loadFailed: "Failed to load video feed",
                network: "Network error while loading video feed",
                videoFailed: "Video failed to load",
                debugHint:
                    "If this stays black, check server headers: Content-Type video/mp4 + Accept-Ranges bytes",
            },
        },
    },

    // ✅ NEW: Honor Wall
    honorWall: {
        title: "Honor Wall",
        tabs: {
            data: "Data",
            honor: "Honor Wall",
        },
        states: {
            loading: "Loading honor wall...",
        },
        cards: {
            tagWall: "Tag Wall",
            medalWall: "Medal Wall",
            giftCollection: "Gift Collection",
            vehicleWall: "Vehicle Wall",
            notObtained: "Not yet obtained",
            countMore: "{{count}} >",
        },
    },

    // ✅ NEW: Host Live Room
    hostLiveRoom: {
        defaults: {
            liveTitle: "My Live",
            hostName: "Host",
        },
        states: {
            preparing: "Preparing live room...",
            stopping: "Stopping live...",
        },
        permission: {
            required: "Camera permission required",
            grant: "Grant permission",
        },
        labels: {
            liveBadge: "LIVE",
            liveTitle: "Live title",
        },
        placeholders: {
            liveTitle: "Enter live title...",
            chat: "Say something...",
        },
        actions: {
            goLive: "Go Live",
            stop: "Stop",
        },
        alerts: {
            stopTitle: "Stop live?",
            stopMsg: "This will end your live streaming.",
        },
        chat: {
            welcome: "Welcome to your live room 👋",
            guest: "Guest",
            line: "{{name}}: {{text}}",
            meLine: "Me: {{text}}",
            system: "ℹ️ {{text}}",
        },
        errors: {
            cameraRequiredToGoLive: "❗ Camera permission is required to go live.",
        },
        messages: {
            liveNow: "🔴 You are LIVE now!",
        },
    },

    // ✅ NEW: Hot Topics
    hotTopics: {
        title: "Hot topics",
        tabs: {
            daily: "Daily",
            official: "Official",
            normal: "Normal",
        },
        labels: {
            hotCount: "HOT {{count}}",
        },
        empty: "No topics yet in this category.",
        errors: {
            loadFailed: "Failed to load topics",
            network: "Network error while loading topics",
        },
    },

    // ✅ NEW: Live Cover
    liveCover: {
        title: "Live Cover",
        card: {
            title: "Upload Live Cover Photo",
            subtitle: "This photo is used as your live cover. Use good lighting and a clear image.",
        },
        states: {
            checking: "Checking…",
            uploading: "Uploading your live cover…",
            checkingStatus: "Checking your live cover status…",
            uploaded: "Uploaded successfully",
        },
        labels: {
            alreadyUploaded: "You already uploaded a live cover.",
            preview: "Preview",
            selectCover: "Select a cover image",
            cameraSide: "Camera: {{side}}",
            front: "Front",
            back: "Back",
        },
        actions: {
            change: "Change",
            upload: "Upload",
            uploadCover: "Upload Cover",
            camera: "Camera",
            gallery: "Gallery",
        },
        alerts: {
            permissionNeededTitle: "Permission needed",
            galleryPermissionMsg: "Please allow gallery access.",
            cameraPermissionMsg: "Please allow camera access.",
        },
        errors: {
            loginRequired: "Login required",
            loadFailed: "Failed to load status",
            network: "Network error",
            selectPhotoFirst: "Please select a photo first.",
            imageTooLarge: "Image too large (413). Please try another photo.",
            uploadFailed: "Upload failed ({{code}})",
            uploadFailedGeneric: "Upload failed",
            noImageReturned: "No image returned.",
            cameraNoImage: "Camera did not return an image.",
            cannotReadBase64: "Could not read image as base64. Try another image.",
            openGalleryFailed: "Failed to open gallery",
            openCameraFailed: "Failed to open camera",
            androidEmulatorHint: "If you are on Android Emulator: camera often doesn't work. Try a real device.",
        },
    },
    vipCenter: {
        title: "VIP Center",
        states: {
            loading: "Loading VIP...",
        },
        current: {
            none: "Current: No VIP",
            active: "Current: {{name}} • {{days}} days left",
        },
        labels: {
            perMonth: "/M",
            defaultDescription: "Get VIP & Enjoy Privileges",
            privilegesCount: "VIP exclusive privileges {{count}}/{{total}}",
        },
        actions: {
            open: "Open {{name}}",
        },
        alerts: {
            purchaseTitle: "VIP Purchase",
            purchaseMsg: "Start purchase flow for {{tier}}.",
        },
    },

    topicDetail: {
        states: {
            empty: "No moments yet under this topic.",
        },
        errors: {
            loadFailed: "Failed to load topic feed",
            network: "Network error while loading topic feed",
        },
        alerts: {
            loginRequiredTitle: "Login required",
            loginRequiredMsg: "Please login to like posts.",
            likeFailedTitle: "Error",
            likeFailedMsg: "Unable to like this post right now.",
        },
    },

    visitProfile: {
        titleFallback: "Profile",
        labels: {
            id: "ID: {{id}}",
            followers: "Followers",
            following: "Following",
        },
        actions: {
            follow: "Follow",
            following: "Following",
            pleaseWait: "Please wait...",
            unblock: "Unblock",
        },
        states: {
            notFound: "User not found.",
            noMoments: "No moments yet.",
            blockedChip: "You blocked this user",
            blockedBody: "You blocked this user. Unblock to view their moments.",
        },
        menu: {
            title: "Options",
            blockTitle: "Block user",
            blockMsg: "You won’t see their content anymore and they may not be able to interact with you.",
            block: "Block",
            unblock: "Unblock",
            chat: "Send message",
            restrict: "Restrict",
            unrestrict: "Unrestrict",
            restrictedChatMsg: "You restricted this chat.",
        },
        chatList: {
  title: "Message",
  unclaimed: "Unclaimed...",
  loggedOut: {
    title: "You’re logged out",
    subtitle: "Please log in again to view your messages.",
  },
  search: {
    placeholder: "Search chats...",
    cancel: "Cancel",
  },
  notifications: {
    title: "Notifications",
    unread: "{{count}} unread",
    none: "No new notifications",
  },
  sections: {
    requests: "Message requests ({{count}})",
    chats: "Chats",
    restricted: "Restricted",
  },
  badges: {
    request: "REQUEST",
    restricted: "RESTRICTED",
  },
  states: {
    loading: "Loading conversations...",
    noMessages: "No messages yet",
    noSearch: "No chats matched your search.",
    empty: "No chats yet. Start messaging your friends from their profile.",
  },
},

chatRoom: {
  loggedOut: {
    title: "You’re logged out",
    subtitle: "Please login again to use chat.",
  },
  labels: {
    online: "Online",
  },
  states: {
    loading: "Loading messages...",
    empty: "Say hi to {{name}} 👋",
  },
  input: {
    placeholder: "Type a message...",
  },
  request: {
    incomingTitle: "Message request",
    incomingBody: "{{name}} wants to message you.",
    accept: "Accept",
    decline: "Decline",
    sentTitle: "Request sent",
    sentBody: "Waiting for {{name}} to accept your request.",
  },
  restricted: {
    title: "Restricted",
    body: "You restricted this chat.",
    unrestrict: "Unrestrict",
  },
  errors: {
    loadFailed: "Failed to load messages",
    sendFailed: "Send failed",
  },
},

        alerts: {
            loginRequired: "Login required.",
            loginToBlock: "Login required to block users.",
            blockedTitle: "Blocked",
            blockedFollowMsg: "Unblock this user first to follow.",
            navigationErrorTitle: "Navigation error",
            profileTabMissing: "Profile tab not found. Make sure your bottom tabs have 'Profile'.",
            errorTitle: "Error",
        },
        errors: {
            blockFailed: "Failed to block user",
            unblockFailed: "Failed to unblock user",
        },

    },
chatList: {
  title: "Message",
  unclaimed: "Unclaimed...",
  loggedOut: {
    title: "You’re logged out",
    subtitle: "Please log in again to view your messages.",
  },
  search: {
    placeholder: "Search chats...",
    cancel: "Cancel",
  },
  notifications: {
    title: "Notifications",
    unread: "{{count}} unread",
    none: "No new notifications",
  },
  sections: {
    requests: "Message requests ({{count}})",
    chats: "Chats",
    restricted: "Restricted",
  },
  badges: {
    request: "REQUEST",
    restricted: "RESTRICTED",
  },
  states: {
    loading: "Loading conversations...",
    noMessages: "No messages yet",
    noSearch: "No chats matched your search.",
    empty: "No chats yet. Start messaging your friends from their profile.",
  },
},

chatRoom: {
  loggedOut: {
    title: "You’re logged out",
    subtitle: "Please login again to use chat.",
  },
  labels: {
    online: "Online",
  },
  states: {
    loading: "Loading messages...",
    empty: "Say hi to {{name}} 👋",
  },
  input: {
    placeholder: "Type a message...",
  },
  request: {
    incomingTitle: "Message request",
    incomingBody: "{{name}} wants to message you.",
    accept: "Accept",
    decline: "Decline",
    sentTitle: "Request sent",
    sentBody: "Waiting for {{name}} to accept your request.",
  },
  restricted: {
    title: "Restricted",
    body: "You restricted this chat.",
    unrestrict: "Unrestrict",
  },
  errors: {
    loadFailed: "Failed to load messages",
    sendFailed: "Send failed",
  },
},

    realPersonAuth: {
        title: "Auth",
        hero: {
            title: "Real-person verification will begin soon.",
            subtitle: "Please ensure you are the user",
        },
        tips: {
            avoidCover: "Avoid cover",
            enoughLight: "Keep enough light",
            minorsProhibited: "Minors are prohibited",
        },
        actions: {
            start: "Start verification",
        },
    },

    postMoment: {
        title: "Post moments",
        actions: {
            post: "Post",
            posting: "Posting...",
            refresh: "Refresh",
        },
        labels: {
            postingTo: "Posting to #{{topic}}",
            recommended: "Recommended topics",
        },
        placeholders: {
            input: "Say something to record this moment...",
        },
        sheets: {
            title: "Add",
            message: "Choose media type",
            addPhotos: "Add photos",
            addVideos: "Add videos",
        },
        permissions: {
            title: "Permission needed",
            libraryMsg: "Please allow access so you can upload.",
            cameraMsg: "Please allow camera access.",
        },
        alerts: {
            nothingTitle: "Nothing to post",
            nothingMsg: "Please write something or add a photo/video.",
            notLoggedInTitle: "Not logged in",
            notLoggedInMsg: "Please login again.",
            errorTitle: "Error",
            postFailed: "Failed to post moment.",
            postedTitle: "Posted",
            postedVideo: "Your video will appear in the Video tab.",
            postedSquare: "Your post will appear in Square.",
        },
        errors: {
            notLoggedIn: "Not logged in",
            uploadFailed: "Upload failed",
            uploadEmpty: "Upload returned empty URL",
            networkPost: "Network error while posting moment.",
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
        title: "Points",
        coinsTab: "Coins",
        actions: {
            details: "Details",
            withdraw: "Withdraw now",
            exchange: "Exchange Points for Coins",
            exchanging: "Exchanging...",
            refresh: "Refresh",
        },
        labels: {
            available: "Available points",
            total: "Total: {{count}}",
            unconfirmed: "Unconfirmed: {{count}}",
            income: "Income",
            last30: "Last 30 days",
        },
        income: {
            livestream: "Livestream",
            party: "Party",
            platformRewards: "Platform Rewards",
        },
        states: {
            loading: "Loading…",
        },
        hints: {
            exchangeRate: "Exchange rate can be changed later from backend (POINTS_PER_COIN).",
        },
        alerts: {
            errorTitle: "Error",
            successTitle: "Success",
            loginRequiredTitle: "Login required",
            loginRequiredMsg: "Please login again.",
            detailsSoon: "Details screen will be added soon.",
            withdrawSoon: "Withdraw feature will be added soon.",
            exchangeFailedTitle: "Exchange failed",
            exchangeSuccessMsg: "Exchanged {{points}} points → {{coins}} coins.",
        },
        errors: {
            loadFailed: "Failed to load points",
            exchangeFailed: "Failed to exchange points",
        },
        ranges: {
            title: "Select range",
            last7: "Last 7 days",
            last30: "Last 30 days",
            last90: "Last 90 days",
        },
        withdraw: {
            title: "Withdraw Points",
            available: "Available: {{points}} points",
            fields: {
                points: "Points to withdraw",
                method: "Method",
                account: "Account details",
            },
            placeholders: {
                account: "e.g. 03xx-xxxxxxx / IBAN / Account name",
            },
            actions: {
                submit: "Submit request",
                submitting: "Submitting...",
            },
            note: "Withdrawal requests go to admin for approval. Points may be held until processed.",
            alerts: {
                successTitle: "Submitted",
                successMsg: "Your withdrawal request has been submitted.",
                failedTitle: "Withdraw failed",
            },
            errors: {
                invalidPoints: "Please enter a valid points amount.",
                accountRequired: "Please enter account details.",
                failed: "Could not submit withdrawal request.",
            },
        },
        details: {
            title: "Points details",
            intro: "Here is how points work on the platform:",
            lines: {
                available: "Available points are the points you can exchange or withdraw.",
                unconfirmed: "Unconfirmed points are still being verified and may change.",
                total: "Total points include available + unconfirmed points.",
                income: "Income shows where your points came from in the selected date range.",
                exchange: "Exchange converts points to coins. The exchange rate may change based on platform rules.",
                withdraw: "Withdraw requests are reviewed before payout. Make sure your account details are correct.",
            },
            footer: "If you face any issue, please contact support from your Profile screen.",
        }

    },


    momentComments: {
        title: "{{owner}}'s moments",
        empty: "No comments yet. Be the first to reply!",
        placeholder: "Write a comment...",
    },

    myGuardian: {
        title: "My guardian",
        empty: "You haven't guarded someone yet.",
        actions: {
            goBack: "Go back",
        },
        card: {
            meta: "Tier: {{tier}} • Ends: {{ends}}",
        },
        errors: {
            missingUserId: "Missing userId. Please login again.",
            loadFailed: "Failed to load",
        },
    },

    myProfile: {
        tabs: {
            posts: "Posts",
        },
        items: {
            giftGallery: "Gift Gallery",
            contribution: "Contribution",
        },
        sections: {
            personalInfo: "Personal information",
        },
        labels: {
            idLine: "ID: {{id}}",
            followingFollowers: "Following {{following}} · Followers {{followers}}",
            fansCount: "{{count}} Fans",
            lit: "Lit: {{current}}/{{total}}",
            participantsRank: "Participants on rank: {{count}}",
        },
        defaults: {
            bio: "She/He was lazy and left nothing behind.",
        },
        alerts: {
            waitTitle: "Please wait",
            profileLoadingMsg: "Profile is still loading.",
        },
    },

    notificationsInbox: {
        postOwnerName: "Post",
        inboxSearchPlaceholder: "Search notifications...",
    },

    party: {
        tabs: {
            following: "Following",
            party: "Party",
        },
        search: {
            placeholder: "Search party rooms",
        },
        filters: {
            popular: "Popular",
            pakistan: "Pakistan",
            philippines: "Philippines",
            more: "More",
        },
        labels: {
            defaultTag: "Party",
        },
        states: {
            empty: "No rooms found. Try changing the filter or search.",
        },
        errors: {
            loadFailed: "Failed to load party rooms",
            network: "Network error while loading party rooms",
        },
    },



};
