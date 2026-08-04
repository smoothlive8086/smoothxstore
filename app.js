/* ==========================================================================
   SMOOTH X STORE - Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- KeyAuth Integration for Admin Panel ---
    class KeyAuth {
        constructor({ name, ownerid, secret, version }) {
            this.name = name;
            this.ownerid = ownerid;
            this.secret = secret;
            this.version = version;
            this.sessionid = "";
        }

        getHWID() {
            let hwid = localStorage.getItem('smooth_keyauth_hwid');
            if (!hwid) {
                const navStr = (navigator.userAgent || '') + (navigator.language || '') + (screen.width + 'x' + screen.height) + (screen.colorDepth || '24');
                let hash = 0;
                for (let i = 0; i < navStr.length; i++) {
                    hash = ((hash << 5) - hash) + navStr.charCodeAt(i);
                    hash |= 0;
                }
                const randPart = Math.random().toString(36).substring(2, 10);
                hwid = 'WEB-' + Math.abs(hash).toString(16) + '-' + randPart;
                localStorage.setItem('smooth_keyauth_hwid', hwid);
            }
            return hwid;
        }

        async postKeyAuth(postDataObj) {
            // 1. Try serverless proxy (/api/db) first to avoid CORS limits
            try {
                const apiRes = await fetch('/api/db', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'keyauth', data: postDataObj })
                });
                if (apiRes.ok) {
                    const apiJson = await apiRes.json();
                    if (apiJson && (apiJson.success !== undefined || apiJson.message !== undefined)) {
                        return apiJson;
                    }
                }
            } catch (proxyErr) {
                // Fallback to direct fetch
            }

            // 2. Direct browser fetch fallback
            const postParams = new URLSearchParams(postDataObj);
            try {
                const res = await fetch('https://keyauth.win/api/1.2/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: postParams.toString()
                });
                return await res.json();
            } catch (directErr) {
                // 3. CORS Proxy Fallback
                try {
                    const corsRes = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://keyauth.win/api/1.2/'), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: postParams.toString()
                    });
                    return await corsRes.json();
                } catch (corsErr) {
                    return { success: false, message: "Network connection error" };
                }
            }
        }

        async init() {
            const data = await this.postKeyAuth({
                type: 'init',
                name: this.name,
                ownerid: this.ownerid,
                secret: this.secret,
                init_iv: 'iv',
                version: this.version
            });

            if (data.success) {
                this.sessionid = data.sessionid;
                return { success: true, message: data.message };
            }
            return { success: false, message: data.message || "Initialization failed" };
        }

        async login(username, password) {
            if (!this.sessionid) {
                const initRes = await this.init();
                if (!initRes.success && !initRes.message?.toLowerCase().includes('already')) {
                    // Continue to login attempt
                }
            }

            const data = await this.postKeyAuth({
                type: 'login',
                username: username,
                pass: password,
                sessionid: this.sessionid || '',
                name: this.name,
                ownerid: this.ownerid,
                hwid: this.getHWID()
            });

            if (data.success) {
                return { success: true, message: data.message || "Logged in successfully!", info: data.info };
            } else {
                if (data.message && data.message.toLowerCase().includes('session')) {
                    this.sessionid = "";
                    const retryInit = await this.init();
                    if (retryInit.success) {
                        return this.login(username, password);
                    }
                }
                return { success: false, message: data.message || "Invalid KeyAuth Username or Password!" };
            }
        }
    }

    const keyAuthApp = new KeyAuth({
        name: "Smoothlive8086's Application",
        ownerid: "kxhJUGG37M",
        secret: "6132d16a79c00aedb747efb145ffcbf2f729adbb4dbb0c33088cce80ee89a3e0",
        version: "1.0"
    });
    const KeyAuthApp = keyAuthApp;

    // Settings Defaults Schema for OPTIMIZATION & SENSI
    const DEFAULT_SETTINGS = {
        brandName: 'SMOOTH <span class="accent-text">X</span> STORE',
        discordLink: 'https://discord.gg/gu5cy4Hg94',
        upiId: 'rithwik0000@fam',
        qrCode: 'qr.jpg',
        primaryColor: '#00f2fe',
        secondaryColor: '#e100ff',
        optimization: {
            hero: {
                badge: 'Next-Gen Windows Tweaks & Gaming Performance',
                title: 'DOMINATE YOUR GAMES WITH <br><span class="gradient-text">ZERO INPUT LAG & MAXIMUM FPS</span>',
                subtitle: 'Professional deep-system PC optimization custom tailored for esports players, streamers, and competitive gamers.',
                stat1Num: '+120%',
                stat1Label: 'Average FPS Boost',
                stat2Num: '< 1ms',
                stat2Label: 'System Latency',
                stat3Num: '100%',
                stat3Label: 'Safe & Verified Tweaks'
            },
            plans: [
                {
                    id: 'basic',
                    badge: 'STARTER',
                    title: 'Basic Boost',
                    tagline: 'Essential tuning for smooth daily gaming',
                    price: '399',
                    features: [
                        'Standard Windows Junk & Cache Cleanup',
                        'Basic FPS & Latency Tweaks',
                        'Startup Program Optimization',
                        'Basic Telemetry & Bloatware Removal',
                        'Basic GPU Settings Config'
                    ]
                },
                {
                    id: 'pro',
                    badge: 'MOST POPULAR',
                    title: 'Pro Performance',
                    tagline: 'Deep tuning for high competitive gaming',
                    price: '699',
                    features: [
                        'Everything in Basic Boost',
                        'Deep Registry & Network Latency Tuning',
                        'Custom GPU Driver Optimization',
                        'Ping & Packet Loss Reduction',
                        'Advanced Windows Power Plan Tuning',
                        'RAM & Process Priority Optimization'
                    ]
                },
                {
                    id: 'ultimate',
                    badge: 'ULTIMATE VIP',
                    title: 'VIP Extreme',
                    tagline: 'Maximum system unlock & zero input delay',
                    price: '1299',
                    features: [
                        'Everything in Pro Tier',
                        'Custom High Performance Power Plan',
                        'CPU Undervolting & Thermal Optimization',
                        'Full Mouse & Keyboard Input Delay Removal',
                        'BIOS Settings Optimization Advice',
                        'Priority 1-on-1 Discord Session'
                    ]
                }
            ]
        },
        sensi: {
            pc: {
                hero: {
                    badge: 'PRO PC SENSITIVITY & MOUSE RESPONSE',
                    title: 'PERFECT AIM & <span class="gradient-text">ZERO MOUSE LATENCY</span>',
                    subtitle: 'Custom PC sensitivity profiles, DPI calibration, and raw input acceleration removal for PC gamers.',
                    stat1Num: '0.1ms',
                    stat1Label: 'Mouse Latency',
                    stat2Num: '100%',
                    stat2Label: 'Pixel Precision',
                    stat3Num: '240Hz+',
                    stat3Label: 'Tracking Smoothness'
                },
                plans: [
                    {
                        id: 'pc_basic',
                        badge: 'ENTRY LEVEL',
                        title: 'PC Sensi Starter',
                        tagline: 'Basic mouse dpi & sensitivity tuning',
                        price: '299',
                        features: [
                            'Standard DPI & In-Game Sensi Calibration',
                            'Windows Pointer Precision Fix',
                            'Basic Mouse Acceleration Removal',
                            'Scope & Hipfire Sensi Ratio Tuning'
                        ]
                    },
                    {
                        id: 'pc_pro',
                        badge: 'MOST POPULAR',
                        title: 'PC Sensi Pro',
                        tagline: 'Advanced aim calibration for ranked gaming',
                        price: '499',
                        features: [
                            'Everything in PC Sensi Starter',
                            'Custom Raw Input Latency Removal',
                            'Polling Rate & USB Driver Optimization',
                            'Game-Specific Sensitivity Matrix',
                            'Recoil Control Sensi Presets'
                        ]
                    },
                    {
                        id: 'pc_vip',
                        badge: 'VIP AIM GOD',
                        title: 'PC Sensi VIP Extreme',
                        tagline: 'Esports level 1-on-1 aim & sensitivity tuning',
                        price: '899',
                        features: [
                            'Everything in PC Sensi Pro',
                            'Custom Monitor Resolution DPI Sync',
                            '1-on-1 Live Discord Aim Calibration',
                            'Zero Input Delay Mouse Driver Tweaks',
                            'VIP Aim Assist & Tracking Configuration'
                        ]
                    }
                ]
            },
            ios: {
                hero: {
                    badge: 'IOS TOUCH RESPONSE & AIM SENSI',
                    title: 'ULTIMATE IPHONE & IPAD <span class="gradient-text">HEADSHOT SENSI</span>',
                    subtitle: 'Eliminate touch screen delay, optimize 3D touch/Haptic response, and unlock precision sensitivity for iOS devices.',
                    stat1Num: '120FPS',
                    stat1Label: 'Touch Sampling',
                    stat2Num: '< 2ms',
                    stat2Label: 'Touch Latency',
                    stat3Num: '100%',
                    stat3Label: 'Headshot Rate Boost'
                },
                plans: [
                    {
                        id: 'ios_basic',
                        badge: 'STARTER',
                        title: 'iOS Sensi Basic',
                        tagline: 'Essential iOS touch & sensitivity tweaks',
                        price: '249',
                        features: [
                            'iOS Touch Accommodation Setup',
                            'Standard In-Game Camera & Scope Sensi',
                            'Basic Screen Drag Delay Fix',
                            'Device Specific Touch Presets'
                        ]
                    },
                    {
                        id: 'ios_pro',
                        badge: 'POPULAR',
                        title: 'iOS Sensi Pro',
                        tagline: 'Pro competitive iOS sensitivity settings',
                        price: '449',
                        features: [
                            'Everything in iOS Sensi Basic',
                            'Custom Gyroscope Sensitivity Matrix',
                            '3D Touch / Haptic Response Tuning',
                            'High FPS Touch Sampling Optimization',
                            'Fast Scope & Drag Headshot Presets'
                        ]
                    },
                    {
                        id: 'ios_vip',
                        badge: 'VIP PRO',
                        title: 'iOS Sensi VIP Master',
                        tagline: 'Maximum iOS sensitivity unlock & zero lag',
                        price: '799',
                        features: [
                            'Everything in iOS Sensi Pro',
                            'Device Hardware Specific Aim Calibration',
                            'Custom Control Layout & Sensi Sync',
                            'Zero Lag Touch Driver Profile',
                            '1-on-1 Setup Support on Discord'
                        ]
                    }
                ]
            },
            android: {
                hero: {
                    badge: 'ANDROID ULTRA SENSITIVITY & TOUCH BOOST',
                    title: 'DOMINATE MOBILE WITH <span class="gradient-text">INSTANT TOUCH SENSI</span>',
                    subtitle: 'Deep Android touch speed optimization, DPI tweaks, pointer speed calibration, and zero-lag sensitivity profiles.',
                    stat1Num: '240Hz',
                    stat1Label: 'Touch Response Rate',
                    stat2Num: '0 Lag',
                    stat2Label: 'Screen Input Delay',
                    stat3Num: '+95%',
                    stat3Label: 'Headshot Accuracy'
                },
                plans: [
                    {
                        id: 'android_basic',
                        badge: 'STARTER',
                        title: 'Android Sensi Basic',
                        tagline: 'Essential Android touch speed tuning',
                        price: '199',
                        features: [
                            'Android Pointer Speed & Touch Delay Tweaks',
                            'Standard DPI Calibration Settings',
                            'In-Game Camera & Red Dot Sensitivity',
                            'Basic Touch Lag Reduction'
                        ]
                    },
                    {
                        id: 'android_pro',
                        badge: 'MOST POPULAR',
                        title: 'Android Sensi Pro',
                        tagline: 'Pro gaming touch & gyro sensitivity',
                        price: '399',
                        features: [
                            'Everything in Android Sensi Basic',
                            'Custom Developer Options DPI Optimization',
                            'Full Gyroscope & Drag Sensi Matrix',
                            'Touch Sampling Rate Unlocker Profile',
                            'Recoil & Target Tracking Tuning'
                        ]
                    },
                    {
                        id: 'android_vip',
                        badge: 'VIP GOD TIER',
                        title: 'Android Sensi VIP Ultimate',
                        tagline: 'Peak Android gaming sensitivity & zero delay',
                        price: '699',
                        features: [
                            'Everything in Android Sensi Pro',
                            'Device Processor & Screen Specific Sensi',
                            'Touch Driver Buffer Size Optimization',
                            'Custom Game Turbo Sensi Settings',
                            'Priority 1-on-1 Discord Config Session'
                        ]
                    }
                ]
            }
        },
        other_purchases: {
            discord: {
                hero: {
                    badge: 'DISCORD NITRO PROMO CODES',
                    title: 'DISCORD NITRO <span class="gradient-text">PROMO CODES</span>',
                    subtitle: 'Instant Discord Nitro promo codes for 1 Month and 3 Months with full perks & server boosts.',
                    image: 'https://cdn.phototourl.com/free/2026-08-03-c93464d2-e7df-4297-af27-e6b6f9efa1b6.jpg',
                    stat1Num: 'Instant',
                    stat1Label: 'Code Delivery',
                    stat2Num: '100%',
                    stat2Label: 'Working Codes',
                    stat3Num: '2 Boosts',
                    stat3Label: 'Per Code Included'
                },
                plans: [
                    {
                        id: 'discord_nitro_1m_promo',
                        badge: '1 MONTH PROMO',
                        title: '1 MONTH PROMO CODE',
                        tagline: 'Discord Nitro 1 Month activation promo code',
                        price: '100',
                        features: [
                            '1 Month Discord Nitro Activation Code',
                            'HD Video Streaming & Custom Emotes',
                            '2 Free Server Boosts Included',
                            'Instant Delivery & Activation Guide'
                        ]
                    },
                    {
                        id: 'discord_nitro_3m_promo',
                        badge: 'BEST VALUE - 3 MONTHS',
                        title: '3 MONTH PROMO CODE',
                        tagline: 'Discord Nitro 3 Months activation promo code',
                        price: '200',
                        features: [
                            '3 Months Discord Nitro Activation Code',
                            'HD Video Streaming & Custom Emotes',
                            '2 Free Server Boosts Included',
                            'Instant Delivery & Activation Guide'
                        ]
                    }
                ]
            },
            spotify: {
                hero: {
                    badge: 'SPOTIFY PREMIUM 1 YEAR FULL ACCESS',
                    title: 'UNLIMITED AD-FREE MUSIC WITH <span class="gradient-text">SPOTIFY PREMIUM 1 YEAR</span>',
                    subtitle: 'Full access fresh Spotify Premium 1 Year account with email and password change access.',
                    image: 'https://cdn.phototourl.com/free/2026-08-03-db26e183-3f7a-4404-9e40-ec68e604c886.jpg',
                    stat1Num: '1 Year',
                    stat1Label: 'Validity',
                    stat2Num: 'Full Access',
                    stat2Label: 'Email & Pass Change',
                    stat3Num: 'Fresh',
                    stat3Label: 'Checked Account'
                },
                plans: [
                    {
                        id: 'spotify_1year_full_access',
                        badge: 'BEST VALUE - 1 YEAR',
                        title: 'SPOTIFY PREMIUM 1 YEAR',
                        tagline: 'Full access fresh account with email & password change',
                        price: '250',
                        features: [
                            'Full access accounts',
                            'Full checked accounts',
                            'You can change both your password and email',
                            'All accounts are easy to resell',
                            'All accounts are fresh accounts',
                            'Change country = lose premium (No Refund/Replace)'
                        ]
                    }
                ]
            },
            netflix: {
                hero: {
                    badge: 'NETFLIX PREMIUM 4K ULTRA HD SUBSCRIPTIONS',
                    title: 'WATCH YOUR FAVORITE SHOWS IN <span class="gradient-text">4K ULTRA HD</span>',
                    subtitle: 'Private & personal Netflix Premium 4K UHD profiles with HDR, multi-device support, and instant replacement warranty.',
                    image: 'https://cdn.phototourl.com/free/2026-08-03-de8938b0-dd80-4766-b995-232137ed3da2.jpg',
                    stat1Num: '4K UHD',
                    stat1Label: 'Stream Quality',
                    stat2Num: 'Private',
                    stat2Label: 'Personal Profile',
                    stat3Num: 'Instant',
                    stat3Label: 'Instant Delivery'
                },
                plans: [
                    {
                        id: 'netflix_hd_1m',
                        badge: '1 MONTH HD',
                        title: 'HD 1 MONTH',
                        tagline: 'Netflix 1 Month 1080p Full HD Pass',
                        price: '250',
                        features: [
                            '1 Month Full HD (1080p) Streaming',
                            'All Smart TVs, Laptops & Mobile Supported',
                            'Private Screen Profile with Personal PIN Lock',
                            'Ad-Free Unlimited Movies & Series',
                            'Instant Delivery & 30-Day Replacement Guarantee'
                        ]
                    },
                    {
                        id: 'netflix_hd_3m',
                        badge: 'MOST POPULAR',
                        title: 'HD 3 MONTH',
                        tagline: 'Netflix 3 Months 1080p Full HD Pass',
                        price: '400',
                        features: [
                            '3 Months Full HD (1080p) High Quality Stream',
                            'All Devices (TV, PC, Mobile & Tablet)',
                            'Private Screen Profile with Personal PIN',
                            'Ad-Free Unlimited Movies & Web Series',
                            'Full 90-Day Warranty & Priority Support'
                        ]
                    },
                    {
                        id: 'netflix_4k_1m',
                        badge: '1 MONTH 4K',
                        title: '4K 1 MONTH',
                        tagline: 'Netflix 1 Month 4K Ultra HD + HDR Pass',
                        price: '300',
                        features: [
                            '1 Month 4K Ultra HD + HDR Cinema Quality',
                            'All Smart TVs, PCs, Laptops & Mobile Supported',
                            'Private PIN Protected VIP Profile',
                            'High Bitrate Audio & Premium Downloads',
                            'Instant Delivery & 30-Day Warranty'
                        ]
                    },
                    {
                        id: 'netflix_4k_3m',
                        badge: 'VIP ULTRA 4K',
                        title: '4K 3 MONTH',
                        tagline: 'Netflix 3 Months 4K Ultra HD + HDR Pass',
                        price: '500',
                        features: [
                            '3 Months 4K Ultra HD + HDR Cinema Quality',
                            'All Smart TVs, PCs, Laptops & Mobile Supported',
                            'Private PIN Protected VIP Profile',
                            'High Bitrate Audio & Premium Downloads',
                            'Full 90-Day Warranty & 24/7 Priority Support'
                        ]
                    }
                ]
            }
        }
    };

    // Firebase Configuration
    const firebaseConfig = {
        apiKey: "AIzaSyAyZefO43WgE5oQI6NoezZov-qKRYoG6Wg",
        authDomain: "smooth8086.firebaseapp.com",
        databaseURL: "https://smooth8086-default-rtdb.firebaseio.com",
        projectId: "smooth8086",
        storageBucket: "smooth8086.firebasestorage.app",
        messagingSenderId: "38940682656",
        appId: "1:38940682656:web:fb895c1c956e407d059cc5",
        measurementId: "G-L5YDVCVE6R"
    };

    let db = null;
    let rtdb = null;
    let storage = null;
    let isFirebaseConfigured = false;

    try {
        if (typeof firebase !== 'undefined' && firebaseConfig.projectId !== "YOUR_PROJECT_ID") {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            if (typeof firebase.database === 'function') {
                rtdb = firebase.database();
            }
            if (typeof firebase.firestore === 'function') {
                db = firebase.firestore();
            }
            if (typeof firebase.storage === 'function') {
                storage = firebase.storage();
            }
            isFirebaseConfigured = true;
        }
    } catch (e) {
        console.warn("Firebase failed to initialize.", e);
    }

    // Local Storage Helpers
    const getStoredUsers = () => JSON.parse(localStorage.getItem('smooth_users') || '[]');
    const setStoredUsers = (users) => localStorage.setItem('smooth_users', JSON.stringify(users));

    const getCurrentUser = () => JSON.parse(localStorage.getItem('smooth_current_user') || 'null');
    const setCurrentUser = (user) => localStorage.setItem('smooth_current_user', JSON.stringify(user));

    const getStoredOrders = () => JSON.parse(localStorage.getItem('smooth_orders') || '[]');
    const setStoredOrders = (orders) => localStorage.setItem('smooth_orders', JSON.stringify(orders));

    const getPendingOrderForUser = (userEmail) => {
        if (!userEmail) return null;
        const email = String(userEmail).toLowerCase().trim();
        const orders = getStoredOrders();
        return orders.find(o => {
            if (!o.userEmail || String(o.userEmail).toLowerCase().trim() !== email) return false;
            const status = String(o.status || 'pending').toLowerCase().trim();
            return status === 'pending' || (status !== 'approved' && status !== 'rejected');
        }) || null;
    };

    const getStoredLoginHistory = () => JSON.parse(localStorage.getItem('smooth_login_history') || '[]');
    const setStoredLoginHistory = (history) => localStorage.setItem('smooth_login_history', JSON.stringify(history));

    const getStoredVerificationHistory = () => JSON.parse(localStorage.getItem('smooth_verification_history') || '[]');
    const setStoredVerificationHistory = (history) => localStorage.setItem('smooth_verification_history', JSON.stringify(history));

    const getStoredSettings = () => {
        const stored = localStorage.getItem('smooth_settings');
        if (!stored) {
            localStorage.setItem('smooth_settings', JSON.stringify(DEFAULT_SETTINGS));
            return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        }
        try {
            const parsed = JSON.parse(stored);

            let optObj = parsed.optimization || {
                hero: parsed.hero || DEFAULT_SETTINGS.optimization.hero,
                plans: parsed.plans || DEFAULT_SETTINGS.optimization.plans
            };

            let sensiObj = parsed.sensi || DEFAULT_SETTINGS.sensi;
            if (!sensiObj.pc) sensiObj.pc = DEFAULT_SETTINGS.sensi.pc;
            if (!sensiObj.ios) sensiObj.ios = DEFAULT_SETTINGS.sensi.ios;
            if (!sensiObj.android) sensiObj.android = DEFAULT_SETTINGS.sensi.android;

            let otherObj = parsed.other_purchases || DEFAULT_SETTINGS.other_purchases;
            if (!otherObj.discord) otherObj.discord = DEFAULT_SETTINGS.other_purchases.discord;
            if (!otherObj.spotify) otherObj.spotify = DEFAULT_SETTINGS.other_purchases.spotify;
            if (!otherObj.netflix) otherObj.netflix = DEFAULT_SETTINGS.other_purchases.netflix;

            let brandName = parsed.brandName;
            if (!brandName || brandName.includes('OPTIMIZATION')) {
                brandName = DEFAULT_SETTINGS.brandName;
            }

            return {
                ...DEFAULT_SETTINGS,
                ...parsed,
                brandName: brandName,
                optimization: {
                    ...DEFAULT_SETTINGS.optimization,
                    ...optObj,
                    hero: { ...DEFAULT_SETTINGS.optimization.hero, ...(optObj.hero || {}) },
                    plans: Array.isArray(optObj.plans) && optObj.plans.length > 0 ? optObj.plans : DEFAULT_SETTINGS.optimization.plans
                },
                sensi: {
                    pc: {
                        ...DEFAULT_SETTINGS.sensi.pc,
                        ...(sensiObj.pc || {}),
                        hero: { ...DEFAULT_SETTINGS.sensi.pc.hero, ...((sensiObj.pc && sensiObj.pc.hero) || {}) },
                        plans: (sensiObj.pc && Array.isArray(sensiObj.pc.plans)) ? sensiObj.pc.plans : DEFAULT_SETTINGS.sensi.pc.plans
                    },
                    ios: {
                        ...DEFAULT_SETTINGS.sensi.ios,
                        ...(sensiObj.ios || {}),
                        hero: { ...DEFAULT_SETTINGS.sensi.ios.hero, ...((sensiObj.ios && sensiObj.ios.hero) || {}) },
                        plans: (sensiObj.ios && Array.isArray(sensiObj.ios.plans)) ? sensiObj.ios.plans : DEFAULT_SETTINGS.sensi.ios.plans
                    },
                    android: {
                        ...DEFAULT_SETTINGS.sensi.android,
                        ...(sensiObj.android || {}),
                        hero: { ...DEFAULT_SETTINGS.sensi.android.hero, ...((sensiObj.android && sensiObj.android.hero) || {}) },
                        plans: (sensiObj.android && Array.isArray(sensiObj.android.plans)) ? sensiObj.android.plans : DEFAULT_SETTINGS.sensi.android.plans
                    }
                },
                other_purchases: {
                    discord: {
                        ...DEFAULT_SETTINGS.other_purchases.discord,
                        ...(otherObj.discord || {}),
                        hero: { ...DEFAULT_SETTINGS.other_purchases.discord.hero, ...((otherObj.discord && otherObj.discord.hero) || {}) },
                        plans: (otherObj.discord && Array.isArray(otherObj.discord.plans) && otherObj.discord.plans.some(p => p.id && p.id.includes('discord_nitro_'))) ? otherObj.discord.plans : DEFAULT_SETTINGS.other_purchases.discord.plans
                    },
                    spotify: {
                        ...DEFAULT_SETTINGS.other_purchases.spotify,
                        ...(otherObj.spotify || {}),
                        hero: { ...DEFAULT_SETTINGS.other_purchases.spotify.hero, ...((otherObj.spotify && otherObj.spotify.hero) || {}) },
                        plans: (otherObj.spotify && Array.isArray(otherObj.spotify.plans) && otherObj.spotify.plans.some(p => p.id === 'spotify_1year_full_access')) ? otherObj.spotify.plans : DEFAULT_SETTINGS.other_purchases.spotify.plans
                    },
                    netflix: {
                        ...DEFAULT_SETTINGS.other_purchases.netflix,
                        ...(otherObj.netflix || {}),
                        hero: { ...DEFAULT_SETTINGS.other_purchases.netflix.hero, ...((otherObj.netflix && otherObj.netflix.hero) || {}) },
                        plans: (otherObj.netflix && Array.isArray(otherObj.netflix.plans) && otherObj.netflix.plans.some(p => p.id && p.id.includes('netflix_hd_'))) ? otherObj.netflix.plans : DEFAULT_SETTINGS.other_purchases.netflix.plans
                    }
                }
            };
        } catch (e) {
            return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        }
    };
    const setStoredSettings = (settings) => localStorage.setItem('smooth_settings', JSON.stringify(settings));

    const getDiscordLink = () => getStoredSettings().discordLink || 'https://discord.gg/gu5cy4Hg94';

    // --- MongoDB Atlas Cloud Synchronization ---
    function updateSyncIndicator(status) {
        const badge = document.getElementById('cloud-sync-status');
        if (!badge) return;

        if (status === 'syncing') {
            badge.className = 'sync-badge badge-syncing';
            badge.innerHTML = `<i class="fa-solid fa-cloud-arrow-up fa-spin"></i> <span>Syncing MongoDB...</span>`;
        } else if (status === 'synced') {
            badge.className = 'sync-badge badge-synced';
            badge.innerHTML = `<i class="fa-solid fa-database text-success"></i> <span>MongoDB Live</span>`;
        } else if (status === 'error') {
            badge.className = 'sync-badge badge-error';
            badge.innerHTML = `<i class="fa-solid fa-cloud"></i> <span>Local Saved</span>`;
        }
    }

    let isDbModifying = false;

    async function sendMongoAction(action, data = {}) {
        try {
            const res = await fetch('/api/db', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, data, ...data })
            });
            return res;
        } catch (err) {
            console.warn(`MongoDB action ${action} failed:`, err);
            return null;
        }
    }

    function recordLoginEvent(email, role, status) {
        const history = getStoredLoginHistory();
        const newLog = {
            id: 'LOG-' + Date.now().toString().slice(-6),
            email: email,
            role: role,
            status: status,
            timestamp: new Date().toLocaleString(),
            createdAt: Date.now(),
            userAgent: (navigator.userAgent || 'Unknown Device').slice(0, 50)
        };
        history.unshift(newLog);
        setStoredLoginHistory(history.slice(0, 200));
        sendMongoAction('recordLogin', newLog);

        if (isAdminLoggedIn) {
            renderAdminLoginHistoryTable();
        }
    }

    function recordVerificationEvent(orderId, customerEmail, planName, amount, utr, action, actionBy = 'KeyAuth Admin') {
        const history = getStoredVerificationHistory();
        const newLog = {
            id: 'VER-' + Date.now().toString().slice(-6),
            orderId: orderId,
            customerEmail: customerEmail,
            planName: planName,
            amount: amount,
            utr: utr,
            action: action,
            actionBy: actionBy,
            timestamp: new Date().toLocaleString(),
            createdAt: Date.now()
        };
        history.unshift(newLog);
        setStoredVerificationHistory(history.slice(0, 300));
        sendMongoAction('recordVerification', newLog);

        if (isAdminLoggedIn) {
            renderAdminVerificationHistoryTable();
        }
    }

    async function fetchCloudData(silent = false) {
        if (isDbModifying) return;
        try {
            if (!silent) updateSyncIndicator('syncing');
            const res = await fetch('/api/db', { method: 'GET', headers: { 'Accept': 'application/json' } });
            if (res.ok) {
                const data = await res.json();

                if (data && data.settings && typeof data.settings === 'object') {
                    const localSettings = getStoredSettings();
                    const cloudTime = Number(data.settings.updatedAt) || 0;
                    const localTime = Number(localSettings.updatedAt) || 0;

                    // Only overwrite local settings if cloud settings are strictly newer
                    if (cloudTime > localTime) {
                        setStoredSettings(data.settings);
                        applySettings(data.settings);
                    }
                }

                if (data && Array.isArray(data.orders)) {
                    setStoredOrders(data.orders);
                }

                if (data && Array.isArray(data.users)) {
                    setStoredUsers(data.users);
                }

                if (data && Array.isArray(data.login_history)) {
                    setStoredLoginHistory(data.login_history);
                }

                if (data && Array.isArray(data.verification_history)) {
                    setStoredVerificationHistory(data.verification_history);
                }

                updateSyncIndicator('synced');

                if (isAdminLoggedIn) {
                    renderAdminDashboardPage();
                } else {
                    renderUserOrders();
                }
            } else {
                updateSyncIndicator('error');
            }
        } catch (err) {
            updateSyncIndicator('error');
        }
    }

    async function pushCloudData(silent = false) {
        try {
            if (!silent) updateSyncIndicator('syncing');
            const orders = getStoredOrders();
            const users = getStoredUsers();
            const settings = getStoredSettings();

            await fetch('/api/db', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orders, users, settings })
            });

            updateSyncIndicator('synced');
        } catch (err) {
            console.warn('MongoDB push error:', err);
            updateSyncIndicator('error');
        }
    }


    let selectedPlan = null;
    let currentScreenshotBase64 = null;
    let isAdminLoggedIn = false;
    let currentCustomerView = 'top_options'; // 'top_options' | 'categories' | 'sensi_select' | 'other_purchases_select' | 'optimization' | 'pc_sensi' | 'ios_sensi' | 'android_sensi' | 'discord' | 'ott'
    let activeAdminCategoryTab = 'optimization'; // 'optimization' | 'sensi'
    let activeAdminSensiSubTab = 'pc'; // 'pc' | 'ios' | 'android'

    // --- DOM Elements ---
    const toastContainer = document.getElementById('toast-container');

    // Category Selection & SENSI Elements
    const topOptionsScreen = document.getElementById('top-options-screen');
    const categorySelectionScreen = document.getElementById('category-selection-screen');
    const sensiSelectionScreen = document.getElementById('sensi-selection-screen');
    const otherPurchasesSelectionScreen = document.getElementById('other-purchases-selection-screen');
    const navTopOptionsBtn = document.getElementById('nav-top-options-btn');
    const navCategoriesBtn = document.getElementById('nav-categories-btn');
    const navSensiOptionsBtn = document.getElementById('nav-sensi-options-btn');
    const navOtherPurchasesBtn = document.getElementById('nav-other-purchases-btn');
    const categoryBackToTopBtn = document.getElementById('category-back-to-top-btn');
    const sensiBackToCatBtn = document.getElementById('sensi-back-to-cat-btn');
    const otherBackToTopBtn = document.getElementById('other-back-to-top-btn');

    // Auth Elements
    const openAuthBtn = document.getElementById('open-auth-btn');
    const heroAuthTrigger = document.getElementById('hero-auth-trigger');
    const authModal = document.getElementById('auth-modal');
    const closeAuthModal = document.getElementById('close-auth-modal');
    const tabSigninBtn = document.getElementById('tab-signin-btn');
    const tabSignupBtn = document.getElementById('tab-signup-btn');
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    const userProfileBadge = document.getElementById('user-profile-badge');
    const userBadgeEmail = document.getElementById('user-badge-email');
    const logoutBtn = document.getElementById('logout-btn');

    // Payment Elements
    const paymentModal = document.getElementById('payment-modal');
    const closePaymentModal = document.getElementById('close-payment-modal');
    const checkoutPlanText = document.getElementById('checkout-selected-plan-text');
    const copyUpiBtn = document.getElementById('copy-upi-btn');
    const upiIdText = document.getElementById('upi-id-text');
    const screenshotFileInput = document.getElementById('screenshot-file');
    const dropzonePrompt = document.getElementById('dropzone-prompt');
    const previewContainer = document.getElementById('preview-container');
    const filePreviewImg = document.getElementById('file-preview-img');
    const removeFileBtn = document.getElementById('remove-file-btn');
    const paymentUploadForm = document.getElementById('payment-upload-form');
    const utrNumberInput = document.getElementById('utr-number');

    // User Orders Section
    const userOrdersSection = document.getElementById('user-orders-section');
    const userOrdersList = document.getElementById('user-orders-list');
    const userOrderCountBadge = document.getElementById('user-order-count-badge');

    // Admin Elements
    const navAdminDashboardBtn = document.getElementById('nav-admin-dashboard-btn');

    // Image Viewer Modal Elements
    const imageViewerModal = document.getElementById('image-viewer-modal');
    const closeImageViewer = document.getElementById('close-image-viewer');
    const fullScreenshotImg = document.getElementById('full-screenshot-img');

    // Order Completion Modal Elements
    const orderCompletionModal = document.getElementById('order-completion-modal');
    const closeCompletionModal = document.getElementById('close-completion-modal');
    const compOrderId = document.getElementById('comp-order-id');
    const compUserEmail = document.getElementById('comp-user-email');
    const compPlanName = document.getElementById('comp-plan-name');
    const compAmount = document.getElementById('comp-amount');
    const compUtr = document.getElementById('comp-utr');
    const compTimestamp = document.getElementById('comp-timestamp');
    const compStatusBadge = document.getElementById('comp-status-badge');
    const compScreenshotImg = document.getElementById('comp-screenshot-img');
    const compCompletePurgeBtn = document.getElementById('comp-complete-purge-btn');
    const compDeleteOrderBtn = document.getElementById('comp-delete-order-btn');

    // --- Toast Notification Helper ---
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        let iconClass = 'fa-circle-info';
        if (type === 'success') iconClass = 'fa-circle-check';
        if (type === 'error') iconClass = 'fa-triangle-exclamation';

        toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // Welcome Landing Auth Gate Elements
    const welcomeAuthScreen = document.getElementById('welcome-auth-screen');
    const floatingSocialContainer = document.getElementById('floating-social-container') || document.querySelector('.floating-social-container');
    const floatingInstagramBtn = document.querySelector('.floating-instagram-btn');
    const floatingDiscordBtn = document.querySelector('.floating-discord-btn');
    const gateTabSigninBtn = document.getElementById('gate-tab-signin-btn');
    const gateTabSignupBtn = document.getElementById('gate-tab-signup-btn');
    const gateTabKeyauthBtn = document.getElementById('gate-tab-keyauth-btn');
    const gateSigninForm = document.getElementById('gate-signin-form');
    const gateSignupForm = document.getElementById('gate-signup-form');
    const gateKeyauthForm = document.getElementById('gate-keyauth-form');
    const tabKeyauthBtn = document.getElementById('tab-keyauth-btn');
    const keyauthForm = document.getElementById('keyauth-form');

    // Dedicated Admin Page Elements
    const adminDashboardPage = document.getElementById('admin-dashboard-page');
    const heroSection = document.getElementById('hero');
    const plansSection = document.getElementById('plans');
    const pageAdminSubmissionsTbody = document.getElementById('page-admin-submissions-tbody');
    const adminSearchInput = document.getElementById('admin-search-input');
    const adminRefreshBtn = document.getElementById('admin-refresh-btn');

    let currentAdminFilter = 'all';

    // --- UI Update & Session Refresh ---
    function updateAuthUI() {
        const currentUser = getCurrentUser();
        if (currentUser) {
            userBadgeEmail.textContent = currentUser.email;
            userProfileBadge.classList.remove('hidden');
            openAuthBtn.classList.add('hidden');

            const mainNavLinks = document.getElementById('main-nav-links');
            if (mainNavLinks) mainNavLinks.classList.remove('hidden');

            if (welcomeAuthScreen) welcomeAuthScreen.classList.add('hidden');
            if (floatingSocialContainer) floatingSocialContainer.classList.remove('hidden');
            if (floatingInstagramBtn) floatingInstagramBtn.classList.remove('hidden');
            if (floatingDiscordBtn) floatingDiscordBtn.classList.remove('hidden');

            if (currentUser.isAdmin === true) {
                isAdminLoggedIn = true;
                document.body.classList.add('admin-mode');
                navAdminDashboardBtn.classList.remove('hidden');
                userOrdersSection.classList.add('hidden');

                if (heroSection) heroSection.classList.add('hidden');
                if (plansSection) plansSection.classList.add('hidden');
                if (topOptionsScreen) topOptionsScreen.classList.add('hidden');
                if (categorySelectionScreen) categorySelectionScreen.classList.add('hidden');
                if (sensiSelectionScreen) sensiSelectionScreen.classList.add('hidden');
                if (otherPurchasesSelectionScreen) otherPurchasesSelectionScreen.classList.add('hidden');
                if (adminDashboardPage) adminDashboardPage.classList.remove('hidden');

                if (mainNavLinks) mainNavLinks.classList.add('hidden');
                renderAdminDashboardPage();
            } else {
                isAdminLoggedIn = false;
                document.body.classList.remove('admin-mode');
                navAdminDashboardBtn.classList.add('hidden');
                if (adminDashboardPage) adminDashboardPage.classList.add('hidden');

                // Hide all customer sub-views first
                if (topOptionsScreen) topOptionsScreen.classList.add('hidden');
                if (categorySelectionScreen) categorySelectionScreen.classList.add('hidden');
                if (sensiSelectionScreen) sensiSelectionScreen.classList.add('hidden');
                if (otherPurchasesSelectionScreen) otherPurchasesSelectionScreen.classList.add('hidden');
                if (heroSection) heroSection.classList.add('hidden');
                if (plansSection) plansSection.classList.add('hidden');
                if (userOrdersSection) userOrdersSection.classList.add('hidden');

                if (currentCustomerView === 'top_options') {
                    if (topOptionsScreen) topOptionsScreen.classList.remove('hidden');

                    if (navTopOptionsBtn) navTopOptionsBtn.classList.remove('hidden');
                    if (navCategoriesBtn) navCategoriesBtn.classList.add('hidden');
                    if (navSensiOptionsBtn) navSensiOptionsBtn.classList.add('hidden');
                    if (navOtherPurchasesBtn) navOtherPurchasesBtn.classList.add('hidden');
                } else if (currentCustomerView === 'categories') {
                    if (categorySelectionScreen) categorySelectionScreen.classList.remove('hidden');

                    if (navTopOptionsBtn) navTopOptionsBtn.classList.remove('hidden');
                    if (navCategoriesBtn) navCategoriesBtn.classList.remove('hidden');
                    if (navSensiOptionsBtn) navSensiOptionsBtn.classList.add('hidden');
                    if (navOtherPurchasesBtn) navOtherPurchasesBtn.classList.add('hidden');
                } else if (currentCustomerView === 'sensi_select') {
                    if (sensiSelectionScreen) sensiSelectionScreen.classList.remove('hidden');

                    if (navTopOptionsBtn) navTopOptionsBtn.classList.remove('hidden');
                    if (navCategoriesBtn) navCategoriesBtn.classList.remove('hidden');
                    if (navSensiOptionsBtn) navSensiOptionsBtn.classList.remove('hidden');
                    if (navOtherPurchasesBtn) navOtherPurchasesBtn.classList.add('hidden');
                } else if (currentCustomerView === 'other_purchases_select') {
                    if (otherPurchasesSelectionScreen) otherPurchasesSelectionScreen.classList.remove('hidden');

                    if (navTopOptionsBtn) navTopOptionsBtn.classList.remove('hidden');
                    if (navCategoriesBtn) navCategoriesBtn.classList.add('hidden');
                    if (navSensiOptionsBtn) navSensiOptionsBtn.classList.add('hidden');
                    if (navOtherPurchasesBtn) navOtherPurchasesBtn.classList.remove('hidden');
                } else {
                    if (heroSection) heroSection.classList.remove('hidden');
                    if (plansSection) plansSection.classList.remove('hidden');
                    if (userOrdersSection) userOrdersSection.classList.remove('hidden');

                    if (navTopOptionsBtn) navTopOptionsBtn.classList.remove('hidden');
                    if (currentCustomerView.includes('sensi')) {
                        if (navCategoriesBtn) navCategoriesBtn.classList.remove('hidden');
                        if (navSensiOptionsBtn) navSensiOptionsBtn.classList.remove('hidden');
                        if (navOtherPurchasesBtn) navOtherPurchasesBtn.classList.add('hidden');
                    } else if (currentCustomerView === 'discord' || currentCustomerView === 'spotify' || currentCustomerView === 'netflix') {
                        if (navCategoriesBtn) navCategoriesBtn.classList.add('hidden');
                        if (navSensiOptionsBtn) navSensiOptionsBtn.classList.add('hidden');
                        if (navOtherPurchasesBtn) navOtherPurchasesBtn.classList.remove('hidden');
                    } else {
                        if (navCategoriesBtn) navCategoriesBtn.classList.remove('hidden');
                        if (navSensiOptionsBtn) navSensiOptionsBtn.classList.add('hidden');
                        if (navOtherPurchasesBtn) navOtherPurchasesBtn.classList.add('hidden');
                    }

                    renderDynamicWebsite(currentCustomerView);
                    renderUserOrders();
                }
            }
        } else {
            isAdminLoggedIn = false;
            document.body.classList.remove('admin-mode');
            userProfileBadge.classList.add('hidden');
            openAuthBtn.classList.add('hidden');
            navAdminDashboardBtn.classList.add('hidden');
            userOrdersSection.classList.add('hidden');

            const mainNavLinks = document.getElementById('main-nav-links');
            if (mainNavLinks) mainNavLinks.classList.add('hidden');

            if (welcomeAuthScreen) welcomeAuthScreen.classList.remove('hidden');
            if (topOptionsScreen) topOptionsScreen.classList.add('hidden');
            if (categorySelectionScreen) categorySelectionScreen.classList.add('hidden');
            if (sensiSelectionScreen) sensiSelectionScreen.classList.add('hidden');
            if (otherPurchasesSelectionScreen) otherPurchasesSelectionScreen.classList.add('hidden');
            if (heroSection) heroSection.classList.add('hidden');
            if (plansSection) plansSection.classList.add('hidden');
            if (adminDashboardPage) adminDashboardPage.classList.add('hidden');
            if (floatingSocialContainer) floatingSocialContainer.classList.add('hidden');
            if (floatingInstagramBtn) floatingInstagramBtn.classList.add('hidden');
            if (floatingDiscordBtn) floatingDiscordBtn.classList.add('hidden');
        }
    }

    // --- Welcome Gate Tab Switching ---
    if (gateTabSigninBtn && gateTabSignupBtn) {
        gateTabSigninBtn.addEventListener('click', () => {
            gateTabSigninBtn.classList.add('active');
            gateTabSignupBtn.classList.remove('active');
            if (gateTabKeyauthBtn) gateTabKeyauthBtn.classList.remove('active');
            gateSigninForm.classList.remove('hidden');
            gateSignupForm.classList.add('hidden');
            if (gateKeyauthForm) gateKeyauthForm.classList.add('hidden');
        });

        gateTabSignupBtn.addEventListener('click', () => {
            gateTabSignupBtn.classList.add('active');
            gateTabSigninBtn.classList.remove('active');
            if (gateTabKeyauthBtn) gateTabKeyauthBtn.classList.remove('active');
            gateSignupForm.classList.remove('hidden');
            gateSigninForm.classList.add('hidden');
            if (gateKeyauthForm) gateKeyauthForm.classList.add('hidden');
        });

        if (gateTabKeyauthBtn) {
            gateTabKeyauthBtn.addEventListener('click', () => {
                gateTabKeyauthBtn.classList.add('active');
                gateTabSigninBtn.classList.remove('active');
                gateTabSignupBtn.classList.remove('active');
                if (gateKeyauthForm) gateKeyauthForm.classList.remove('hidden');
                gateSigninForm.classList.add('hidden');
                gateSignupForm.classList.add('hidden');
            });
        }
    }

    // --- Welcome Gate Form Handlers ---
    if (gateSigninForm) {
        gateSigninForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('gate-signin-email').value.trim();
            const password = document.getElementById('gate-signin-password').value;
            handleUserSignin(email, password, gateSigninForm);
        });
    }

    if (gateSignupForm) {
        gateSignupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('gate-signup-email').value.trim();
            const password = document.getElementById('gate-signup-password').value;
            const confirmPassword = document.getElementById('gate-signup-confirm-password').value;
            handleUserSignupRegistration(email, password, confirmPassword, gateSignupForm);
        });
    }

    if (gateKeyauthForm) {
        gateKeyauthForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('gate-keyauth-username').value;
            const password = document.getElementById('gate-keyauth-password').value;
            handleKeyAuthAdminLogin(username, password, gateKeyauthForm);
        });
    }

    // --- Auth Tab Switching ---
    if (tabSigninBtn && tabSignupBtn) {
        tabSigninBtn.addEventListener('click', () => {
            tabSigninBtn.classList.add('active');
            tabSignupBtn.classList.remove('active');
            if (tabKeyauthBtn) tabKeyauthBtn.classList.remove('active');
            signinForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
            if (keyauthForm) keyauthForm.classList.add('hidden');
        });

        tabSignupBtn.addEventListener('click', () => {
            tabSignupBtn.classList.add('active');
            tabSigninBtn.classList.remove('active');
            if (tabKeyauthBtn) tabKeyauthBtn.classList.remove('active');
            signupForm.classList.remove('hidden');
            signinForm.classList.add('hidden');
            if (keyauthForm) keyauthForm.classList.add('hidden');
        });

        if (tabKeyauthBtn) {
            tabKeyauthBtn.addEventListener('click', () => {
                tabKeyauthBtn.classList.add('active');
                tabSigninBtn.classList.remove('active');
                tabSignupBtn.classList.remove('active');
                if (keyauthForm) keyauthForm.classList.remove('hidden');
                signinForm.classList.add('hidden');
                signupForm.classList.add('hidden');
            });
        }
    }

    if (keyauthForm) {
        keyauthForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('keyauth-username').value;
            const password = document.getElementById('keyauth-password').value;
            handleKeyAuthAdminLogin(username, password, keyauthForm);
        });
    }

    // --- Shared KeyAuth Admin Login Handler ---
    async function handleKeyAuthAdminLogin(username, password, formElement) {
        const u = (username || '').trim();
        const p = (password || '').trim();
        if (!u || !p) {
            showToast('Please enter both KeyAuth username and password.', 'error');
            return;
        }

        // Master Admin Credentials Check Fallback
        if ((u.toLowerCase() === 'admin' || u.toLowerCase() === 'smooth') && (p === 'smooth8086' || p === 'admin8086')) {
            const adminUser = {
                email: `KeyAuth: ${u}`,
                isAdmin: true,
                keyAuthUser: u,
                authenticatedAt: new Date().toISOString()
            };
            setCurrentUser(adminUser);
            isAdminLoggedIn = true;
            recordLoginEvent(`KeyAuth: ${u}`, 'Admin (Master Access)', 'Success');
            if (formElement) formElement.reset();
            closeModal(authModal);
            updateAuthUI();
            showToast(`Admin '${u}' Authenticated! Admin Panel Unlocked.`, 'success');
            return;
        }

        showToast('Verifying KeyAuth User Credentials...', 'info');

        const result = await keyAuthApp.login(u, p);
        if (result.success) {
            const adminUser = {
                email: `KeyAuth: ${u}`,
                isAdmin: true,
                keyAuthUser: u,
                authenticatedAt: new Date().toISOString()
            };
            setCurrentUser(adminUser);
            isAdminLoggedIn = true;
            recordLoginEvent(`KeyAuth: ${u}`, 'Admin (KeyAuth)', 'Success');
            if (formElement) formElement.reset();
            closeModal(authModal);
            updateAuthUI();
            showToast(`KeyAuth User '${u}' Verified! Executive Admin Panel Unlocked.`, 'success');
        } else {
            if (result.message && (result.message.toLowerCase().includes('network') || result.message.toLowerCase().includes('fetch'))) {
                const adminUser = {
                    email: `KeyAuth: ${u}`,
                    isAdmin: true,
                    keyAuthUser: u,
                    authenticatedAt: new Date().toISOString()
                };
                setCurrentUser(adminUser);
                isAdminLoggedIn = true;
                recordLoginEvent(`KeyAuth: ${u}`, 'Admin (Offline Fallback)', 'Success');
                if (formElement) formElement.reset();
                closeModal(authModal);
                updateAuthUI();
                showToast(`Admin User '${u}' Verified! Admin Panel Unlocked.`, 'success');
                return;
            }

            recordLoginEvent(u || 'Unknown Admin', 'Admin (KeyAuth)', 'Failed');
            let errMsg = result.message || 'KeyAuth Verification Failed!';
            if (errMsg.toLowerCase().includes('force hwid')) {
                errMsg += " | Tip: Turn off 'Force HWID' in KeyAuth Dashboard (keyauth.cc -> App Settings -> Security) or Reset HWID for your admin account.";
            }
            showToast(errMsg, 'error');
        }
    }

    // --- Modal Control Helpers ---
    function openModal(modal) { if (modal) modal.classList.remove('hidden'); }
    function closeModal(modal) { if (modal) modal.classList.add('hidden'); }

    if (openAuthBtn) openAuthBtn.addEventListener('click', () => openModal(authModal));
    if (heroAuthTrigger) {
        heroAuthTrigger.addEventListener('click', () => {
            const currentUser = getCurrentUser();
            if (currentUser) {
                document.getElementById('plans').scrollIntoView({ behavior: 'smooth' });
            } else {
                openModal(authModal);
            }
        });
    }
    if (closeAuthModal) closeAuthModal.addEventListener('click', () => closeModal(authModal));
    if (closePaymentModal) closePaymentModal.addEventListener('click', () => closeModal(paymentModal));
    if (closeImageViewer) closeImageViewer.addEventListener('click', () => closeModal(imageViewerModal));
    if (closeCompletionModal) closeCompletionModal.addEventListener('click', () => closeModal(orderCompletionModal));

    function handleUserSignin(email, password, formElement) {
        const em = (email || '').trim().toLowerCase();
        const pw = (password || '').trim();

        if (!em || !pw) {
            showToast('Please enter your email/username and password.', 'error');
            return;
        }

        // Direct Admin Login Verification
        if ((em === 'admin' || em === 'smooth' || em.startsWith('admin@') || em === 'keyauth') && (pw === 'smooth8086' || pw === 'admin8086' || pw === 'admin' || pw === '1')) {
            const adminUser = {
                email: em.includes('@') ? em : `admin@smoothstore.com`,
                isAdmin: true,
                keyAuthUser: em,
                authenticatedAt: new Date().toISOString()
            };
            setCurrentUser(adminUser);
            isAdminLoggedIn = true;
            recordLoginEvent(adminUser.email, 'Super Admin', 'Success');
            if (formElement) formElement.reset();
            closeModal(authModal);
            updateAuthUI();
            showToast(`Admin Authenticated! Executive Admin Panel Unlocked.`, 'success');
            return;
        }

        const users = getStoredUsers();
        const foundUser = users.find(u => u.email.toLowerCase() === em && u.password === pw);

        if (foundUser) {
            const isUserAdmin = foundUser.isAdmin === true;
            const userObj = { email: foundUser.email, isAdmin: isUserAdmin };
            setCurrentUser(userObj);
            recordLoginEvent(foundUser.email, isUserAdmin ? 'Super Admin' : 'Customer', 'Success');
            if (formElement) formElement.reset();
            closeModal(authModal);
            updateAuthUI();
            showToast(`Welcome back, ${foundUser.email}! Access unlocked.`, 'success');
        } else {
            recordLoginEvent(email, 'Customer', 'Failed');
            showToast('Invalid Gmail ID/Username or Password. Please check your credentials.', 'error');
        }
    }

    function handleUserSignupRegistration(email, password, confirmPassword, formElement) {
        if (password !== confirmPassword) {
            showToast('Passwords do not match!', 'error');
            return;
        }

        const users = getStoredUsers();
        const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (existingUser) {
            showToast('Account already exists with this Gmail ID! Please Sign In.', 'error');
            if (gateTabSigninBtn) gateTabSigninBtn.click();
            if (tabSigninBtn) tabSigninBtn.click();
            document.getElementById('gate-signin-email').value = email;
            document.getElementById('signin-email').value = email;
            return;
        }

        const newUser = { email, password, registeredAt: new Date().toISOString() };
        users.push(newUser);
        setStoredUsers(users);
        sendMongoAction('saveUser', newUser);

        setCurrentUser({ email });
        recordLoginEvent(email, 'Customer', 'Success');
        if (formElement) formElement.reset();
        closeModal(authModal);
        updateAuthUI();
        showToast(`Registration successful! Welcome, ${email}`, 'success');
    }

    // --- Registration Logic ---
    if (signupForm) signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        handleUserSignupRegistration(email, password, confirmPassword, signupForm);
    });

    // --- Sign In Logic ---
    if (signinForm) signinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signin-email').value.trim();
        const password = document.getElementById('signin-password').value;
        handleUserSignin(email, password, signinForm);
    });

    // --- Logout Logic (Navbar) ---
    if (logoutBtn) logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('smooth_current_user');
        isAdminLoggedIn = false;
        updateAuthUI();
        showToast('Signed out successfully.', 'info');
    });

    // --- Copy UPI ID ---
    if (copyUpiBtn) copyUpiBtn.addEventListener('click', () => {
        const upiVal = document.getElementById('upi-id-text')?.textContent || getStoredSettings().upiId || 'rithwik0000@fam';
        navigator.clipboard.writeText(upiVal).then(() => {
            showToast(`UPI ID (${upiVal}) copied to clipboard!`, 'success');
        }).catch(() => {
            showToast('Failed to copy. Please manually copy the UPI ID.', 'error');
        });
    });

    // --- File Upload & Preview Handler ---
    if (screenshotFileInput) screenshotFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast('File size must be under 5MB', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                currentScreenshotBase64 = event.target.result;
                filePreviewImg.src = currentScreenshotBase64;
                dropzonePrompt.classList.add('hidden');
                previewContainer.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    if (removeFileBtn) removeFileBtn.addEventListener('click', () => {
        screenshotFileInput.value = '';
        currentScreenshotBase64 = null;
        filePreviewImg.src = '';
        dropzonePrompt.classList.remove('hidden');
        previewContainer.classList.add('hidden');
    });

    // --- Payment Submission Handler ---
    if (paymentUploadForm) paymentUploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentUser = getCurrentUser();
        const utr = utrNumberInput.value.trim();

        if (!currentUser) {
            showToast('User session expired. Please sign in again.', 'error');
            return;
        }

        const pendingOrder = getPendingOrderForUser(currentUser.email);
        if (pendingOrder) {
            showToast(`Order Limit Reached! You currently have a pending order (#${pendingOrder.id}) under verification. You can place a new order only after your previous order is approved or rejected by the admin.`, 'error');
            closeModal(paymentModal);
            if (userOrdersSection) {
                userOrdersSection.scrollIntoView({ behavior: 'smooth' });
            }
            return;
        }

        if (!utr || utr.length < 4) {
            showToast('Please enter a valid Transaction UTR / Ref Number (at least 4 characters).', 'error');
            return;
        }

        if (!currentScreenshotBase64) {
            showToast('Please upload a screenshot of your payment!', 'error');
            return;
        }

        const orderId = 'ORD-' + Date.now().toString().slice(-6);

        // Upload screenshot image to Firebase Storage (if available) or fallback to base64
        let screenshotUrl = currentScreenshotBase64;
        const fileObj = screenshotFileInput.files[0];

        const newOrder = {
            id: orderId,
            userEmail: currentUser.email,
            planName: selectedPlan.name,
            amount: selectedPlan.price,
            category: selectedPlan?.category || 'optimization',
            subCategory: selectedPlan?.subCategory || 'optimization',
            categoryLabel: selectedPlan?.categoryLabel || 'OPTIMIZATION',
            utr: utr,
            screenshot: screenshotUrl,
            status: 'pending', // 'pending', 'approved', 'rejected'
            timestamp: new Date().toLocaleString()
        };

        const orders = getStoredOrders();
        orders.unshift(newOrder);
        setStoredOrders(orders);

        // Reset Payment Form State & Close Modal Instantly (Non-blocking)
        paymentUploadForm.reset();
        removeFileBtn.click();
        closeModal(paymentModal);

        showToast('Payment screenshot submitted! Pending verification from Admin.', 'success');
        updateAuthUI();

        // Save order to MongoDB Atlas in background
        sendMongoAction('saveOrder', newOrder);

        // Record Verification Audit Event
        recordVerificationEvent(newOrder.id, newOrder.userEmail, newOrder.planName, newOrder.amount, newOrder.utr, 'Order Submitted', 'Customer');

        // Scroll to orders list
        userOrdersSection.scrollIntoView({ behavior: 'smooth' });
    });

    function getCategoryBadgeClass(category, subCategory) {
        if (category === 'sensi') return 'badge-cat-sensi';
        if (category === 'other_purchases') {
            if (subCategory === 'discord') return 'badge-cat-discord';
            if (subCategory === 'spotify') return 'badge-cat-spotify';
            if (subCategory === 'netflix') return 'badge-cat-netflix';
            return 'badge-cat-discord';
        }
        return 'badge-cat-opt';
    }

    // --- Render User Orders & Post-Verification Discord UI ---
    function renderUserOrders() {
        const currentUser = getCurrentUser();
        if (!currentUser) return;

        const orders = getStoredOrders().filter(o => o.userEmail.toLowerCase() === currentUser.email.toLowerCase());
        userOrderCountBadge.textContent = `${orders.length} Order${orders.length !== 1 ? 's' : ''}`;

        if (orders.length === 0) {
            userOrdersList.innerHTML = `
                <div style="text-align: center; padding: 30px; color: var(--text-muted);">
                    <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 12px; opacity: 0.5;"></i>
                    <p>No optimization orders found yet. Select a plan above to get started!</p>
                </div>
            `;
            return;
        }

        const pendingOrder = getPendingOrderForUser(currentUser.email);
        let pendingNoticeHtml = '';
        if (pendingOrder) {
            pendingNoticeHtml = `
                <div class="pending-order-notice" style="margin-bottom: 20px; padding: 16px 20px; background: rgba(234, 179, 8, 0.12); border: 1px solid rgba(234, 179, 8, 0.35); border-radius: 12px; display: flex; align-items: center; gap: 14px;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 1.5rem; color: #eab308;"></i>
                    <div>
                        <strong style="color: #fef08a; display: block; font-size: 0.95rem; margin-bottom: 2px;">1 Order Limit Active</strong>
                        <span style="color: rgba(255, 255, 255, 0.85); font-size: 0.86rem;">You currently have a pending order (<strong>${pendingOrder.id}</strong>) waiting for admin verification. You can place your next order once the admin approves or rejects this order.</span>
                    </div>
                </div>
            `;
        }

        userOrdersList.innerHTML = pendingNoticeHtml + orders.map(order => {
            let statusBadge = `<span class="badge badge-pending"><i class="fa-solid fa-clock"></i> Pending Verification</span>`;
            let discordSectionHtml = '';

            if (order.status === 'approved') {
                statusBadge = `<span class="badge badge-approved"><i class="fa-solid fa-circle-check"></i> Approved & Verified</span>`;
                discordSectionHtml = `
                    <div class="discord-vip-banner">
                        <div class="discord-header-box">
                            <a href="https://discord.gg/gu5cy4Hg94" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none; display: flex; align-items: center; gap: 12px;">
                                <i class="fa-brands fa-discord discord-logo-icon" title="Join Discord Server"></i>
                                <h3 class="discord-action-title">OPEN DISCORD AND CREATE TICKET</h3>
                            </a>
                        </div>
                        <p class="discord-instructions">
                            Your payment has been verified by the Admin! Click the button below to automatically join our official Discord server and open a ticket. Our team will start your service immediately!
                        </p>
                        <a href="https://discord.gg/gu5cy4Hg94" target="_blank" rel="noopener noreferrer" class="btn btn-discord btn-lg pulse-glow" style="display: inline-flex; align-items: center; justify-content: center; gap: 10px; width: 100%; margin-top: 10px;">
                            <i class="fa-brands fa-discord"></i> Open Discord & Create Ticket
                        </a>
                    </div>
                `;
            } else if (order.status === 'rejected') {
                statusBadge = `<span class="badge badge-rejected"><i class="fa-solid fa-circle-xmark"></i> Payment Rejected</span>`;
                discordSectionHtml = `
                    <div style="padding: 16px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; color: var(--danger); font-size: 0.9rem;">
                        <i class="fa-solid fa-triangle-exclamation"></i> Payment verification failed. Please ensure the payment screenshot and UTR number are clear and valid, or contact admin support.
                    </div>
                `;
            } else {
                discordSectionHtml = `
                    <div class="processing-banner">
                        <div class="processing-icon-ring">
                            <i class="fa-solid fa-hourglass-half processing-icon"></i>
                        </div>
                        <div class="processing-content">
                            <h4 class="processing-title">⏳ PAYMENT UNDER REVIEW</h4>
                            <p class="processing-subtitle">Your payment screenshot and UTR have been submitted successfully. Our admin team is currently verifying your transaction.</p>
                            <div class="processing-steps">
                                <div class="step step-done">
                                    <i class="fa-solid fa-circle-check"></i>
                                    <span>Payment Submitted</span>
                                </div>
                                <div class="step-connector"></div>
                                <div class="step step-active">
                                    <i class="fa-solid fa-spinner fa-spin"></i>
                                    <span>Admin Verifying</span>
                                </div>
                                <div class="step-connector"></div>
                                <div class="step step-pending">
                                    <i class="fa-solid fa-lock"></i>
                                    <span>Discord Access</span>
                                </div>
                            </div>
                            <p class="processing-note"><i class="fa-solid fa-bell"></i> Once approved, your Discord VIP ticket link will unlock automatically here!</p>
                        </div>
                    </div>
                `;
            }

            const screenshotBtnHtml = order.screenshot ? `
                <button class="btn btn-sm btn-secondary" onclick="window.viewAdminScreenshot('${order.id}')" title="View uploaded payment screenshot">
                    <i class="fa-solid fa-image"></i> View Screenshot
                </button>
            ` : '';

            return `
                <div class="order-card">
                    <div class="order-header-row">
                        <div class="order-title-group">
                            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                <h4>${order.planName} (₹${order.amount}) ${order.categoryLabel ? `<span class="badge-category ${order.category === 'sensi' ? 'badge-cat-sensi' : 'badge-cat-opt'}">${order.categoryLabel}</span>` : ''}</h4>
                                <span class="badge badge-accent clickable-chip" onclick="window.copyToClipboard('${order.id}', 'Order ID')" title="Click to copy Order ID">
                                    <i class="fa-solid fa-hashtag"></i> ${order.id}
                                </span>
                            </div>
                            <span class="order-date">
                                <i class="fa-regular fa-calendar"></i> ${order.timestamp} | 
                                <span class="clickable-chip" onclick="window.copyToClipboard('${order.utr}', 'UTR Number')" title="Click to copy UTR">
                                    Ref: <code>${order.utr}</code> <i class="fa-regular fa-copy"></i>
                                </span>
                            </span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                            ${screenshotBtnHtml}
                            ${statusBadge}
                        </div>
                    </div>
                    ${discordSectionHtml}
                </div>
            `;
        }).join('');
    }

    // --- Admin Portal Logic ---
    if (navAdminDashboardBtn) {
        navAdminDashboardBtn.addEventListener('click', () => {
            const page = document.getElementById('admin-dashboard-page');
            if (page) page.scrollIntoView({ behavior: 'smooth' });
        });
    }

    function renderAdminDashboard() {
        renderAdminDashboardPage();
    }

    // --- Admin Sidebar Tab Switching ---
    function initAdminTabSwitching() {
        const tabButtons = document.querySelectorAll('.admin-tab-btn[data-tab]');
        const tabViews = document.querySelectorAll('.admin-tab-view');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');

                // Update active button
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Show matching tab view
                tabViews.forEach(view => {
                    const viewId = view.id; // e.g. "admin-tab-overview"
                    if (viewId === `admin-tab-${targetTab}`) {
                        view.classList.remove('hidden');
                    } else {
                        view.classList.add('hidden');
                    }
                });

                // Close sidebar on mobile after navigation
                const sidebar = document.getElementById('admin-sidebar');
                if (sidebar && window.innerWidth <= 900) {
                    sidebar.classList.remove('active');
                }
            });
        });
    }
    initAdminTabSwitching();

    function renderAdminDashboardPage() {
        const orders = getStoredOrders();
        const users = getStoredUsers();
        const loginHistory = getStoredLoginHistory();
        const verificationHistory = getStoredVerificationHistory();

        // Render Metric Stats
        const totalCount = orders.length;
        const pendingCount = orders.filter(o => o.status === 'pending').length;
        const approvedCount = orders.filter(o => o.status === 'approved').length;
        const totalRevenue = orders.filter(o => o.status === 'approved').reduce((sum, o) => sum + (parseInt(o.amount, 10) || 0), 0);
        const approvalRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 100;
        const avgOrderVal = approvedCount > 0 ? Math.round(totalRevenue / approvedCount) : 0;

        // Update Overview KPI Cards
        const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };

        setTxt('overview-stat-total-orders', totalCount);
        setTxt('overview-stat-pending-orders', pendingCount);
        setTxt('overview-stat-approved-orders', approvedCount);
        setTxt('overview-stat-total-revenue', `₹${totalRevenue}`);
        setTxt('overview-approval-rate', `${approvalRate}% Approval Rate`);
        setTxt('overview-avg-order', `₹${avgOrderVal}`);
        setTxt('overview-total-users', `${users.length} Account${users.length !== 1 ? 's' : ''}`);
        setTxt('overview-total-logins', `${loginHistory.length} Log${loginHistory.length !== 1 ? 's' : ''}`);
        setTxt('overview-total-audit', `${verificationHistory.length} Event${verificationHistory.length !== 1 ? 's' : ''}`);

        setTxt('sidebar-pending-badge', pendingCount);
        setTxt('sidebar-users-badge', users.length);

        // Optimization Plan Tier Breakdown
        const basicOrders = orders.filter(o => o.status === 'approved' && o.planName.toLowerCase().includes('basic'));
        const proOrders = orders.filter(o => o.status === 'approved' && o.planName.toLowerCase().includes('pro'));
        const vipOrders = orders.filter(o => o.status === 'approved' && (o.planName.toLowerCase().includes('vip') || o.planName.toLowerCase().includes('ultimate')));

        const basicRev = basicOrders.reduce((sum, o) => sum + (parseInt(o.amount, 10) || 0), 0);
        const proRev = proOrders.reduce((sum, o) => sum + (parseInt(o.amount, 10) || 0), 0);
        const vipRev = vipOrders.reduce((sum, o) => sum + (parseInt(o.amount, 10) || 0), 0);

        const maxRev = Math.max(totalRevenue, 1);
        const basicPct = Math.round((basicRev / maxRev) * 100);
        const proPct = Math.round((proRev / maxRev) * 100);
        const vipPct = Math.round((vipRev / maxRev) * 100);

        setTxt('tier-basic-count', `${basicOrders.length} orders (₹${basicRev})`);
        setTxt('tier-pro-count', `${proOrders.length} orders (₹${proRev})`);
        setTxt('tier-vip-count', `${vipOrders.length} orders (₹${vipRev})`);

        const setBarWidth = (id, pct) => { const el = document.getElementById(id); if (el) el.style.width = `${pct}%`; };
        setBarWidth('tier-basic-bar', basicPct);
        setBarWidth('tier-pro-bar', proPct);
        setBarWidth('tier-vip-bar', vipPct);

        // Apply Search & Status Filters
        const query = (adminSearchInput ? adminSearchInput.value : '').toLowerCase().trim();
        const filteredOrders = orders.filter(order => {
            const matchesFilter = (currentAdminFilter === 'all') || (order.status === currentAdminFilter);
            const matchesQuery = !query ||
                (order.id && order.id.toLowerCase().includes(query)) ||
                (order.userEmail && order.userEmail.toLowerCase().includes(query)) ||
                (order.utr && order.utr.toLowerCase().includes(query)) ||
                (order.planName && order.planName.toLowerCase().includes(query));
            return matchesFilter && matchesQuery;
        });

        if (pageAdminSubmissionsTbody) {
            pageAdminSubmissionsTbody.innerHTML = renderTableRowsHtml(filteredOrders);
        }

        renderAdminUsersTable();
        renderAdminLoginHistoryTable();
        renderAdminVerificationHistoryTable();
        updateBatchActionBar();
        renderActivityChart();
    }

    let selectedOrderIds = new Set();

    function updateBatchActionBar() {
        const batchBar = document.getElementById('batch-action-bar');
        const countTxt = document.getElementById('selected-orders-count');
        if (!batchBar || !countTxt) return;

        if (selectedOrderIds.size > 0) {
            batchBar.classList.remove('hidden');
            countTxt.textContent = `${selectedOrderIds.size} order${selectedOrderIds.size !== 1 ? 's' : ''} selected`;
        } else {
            batchBar.classList.add('hidden');
        }
    }

    function renderTableRowsHtml(ordersList) {
        if (ordersList.length === 0) {
            return `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 28px; color: var(--text-muted);">
                        No payment submissions match current filter/search.
                    </td>
                </tr>
            `;
        }

        return ordersList.map(order => {
            let statusBadge = `<span class="badge badge-pending">Pending</span>`;
            if (order.status === 'approved') statusBadge = `<span class="badge badge-approved">Approved</span>`;
            if (order.status === 'rejected') statusBadge = `<span class="badge badge-rejected">Rejected</span>`;

            const isChecked = selectedOrderIds.has(order.id) ? 'checked' : '';

            return `
                <tr>
                    <td style="text-align: center;">
                        <input type="checkbox" class="order-select-checkbox" data-id="${order.id}" ${isChecked} onchange="window.handleOrderSelect(event, '${order.id}')">
                    </td>
                    <td><small style="color: var(--text-muted);">${order.timestamp}</small></td>
                    <td><strong>${order.userEmail}</strong></td>
                    <td>${order.planName} ${order.categoryLabel ? `<span class="badge-category ${getCategoryBadgeClass(order.category, order.subCategory)}">${order.categoryLabel}</span>` : ''}</td>
                    <td><span class="text-accent" style="font-weight: 700;">₹${order.amount}</span></td>
                    <td><code>${order.utr}</code></td>
                    <td>
                        <img src="${order.screenshot}" class="screenshot-thumb" alt="Payment Proof" onclick="window.viewAdminScreenshot('${order.id}')">
                    </td>
                    <td>${statusBadge}</td>
                    <td>
                        <div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;">
                            <button class="btn btn-sm btn-outline" onclick="window.openCompletionPage('${order.id}')" title="View Order Completion Page">
                                <i class="fa-solid fa-flag-checkered"></i> Complete Page
                            </button>
                            ${order.status !== 'approved' ? `
                                <button class="btn btn-sm btn-primary" onclick="window.updateOrderStatus('${order.id}', 'approved')" title="Approve Order">
                                    <i class="fa-solid fa-check"></i> Approve
                                </button>
                            ` : ''}
                            ${order.status !== 'rejected' ? `
                                <button class="btn btn-sm btn-secondary" onclick="window.updateOrderStatus('${order.id}', 'rejected')" title="Reject Order">
                                    <i class="fa-solid fa-xmark"></i> Reject
                                </button>
                            ` : ''}
                            <button class="btn btn-sm btn-danger" onclick="window.removeOrder('${order.id}')" title="Remove Order">
                                <i class="fa-solid fa-trash"></i> Remove
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    window.handleOrderSelect = function (e, id) {
        if (e.target.checked) {
            selectedOrderIds.add(id);
        } else {
            selectedOrderIds.delete(id);
        }
        updateBatchActionBar();
    };

    const selectAllCheckbox = document.getElementById('select-all-orders-checkbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            const orders = getStoredOrders();
            if (e.target.checked) {
                orders.forEach(o => selectedOrderIds.add(o.id));
            } else {
                selectedOrderIds.clear();
            }
            renderAdminDashboardPage();
        });
    }

    const bulkApproveBtn = document.getElementById('bulk-approve-btn');
    if (bulkApproveBtn) {
        bulkApproveBtn.addEventListener('click', () => {
            if (selectedOrderIds.size === 0) return;
            const orders = getStoredOrders();
            let updatedCount = 0;
            selectedOrderIds.forEach(id => {
                const order = orders.find(o => o.id === id);
                if (order && order.status !== 'approved') {
                    order.status = 'approved';
                    recordVerificationEvent(order.id, order.userEmail, order.planName, order.amount, order.utr, 'Bulk Approved Payment');
                    updatedCount++;
                }
            });

            if (updatedCount > 0) {
                setStoredOrders(orders);
                pushCloudData();
                showToast(`Bulk approved ${updatedCount} selected orders!`, 'success');
            }
            selectedOrderIds.clear();
            if (selectAllCheckbox) selectAllCheckbox.checked = false;
            renderAdminDashboardPage();
            updateAuthUI();
        });
    }

    const bulkRejectBtn = document.getElementById('bulk-reject-btn');
    if (bulkRejectBtn) {
        bulkRejectBtn.addEventListener('click', () => {
            if (selectedOrderIds.size === 0) return;
            const orders = getStoredOrders();
            let updatedCount = 0;
            selectedOrderIds.forEach(id => {
                const order = orders.find(o => o.id === id);
                if (order && order.status !== 'rejected') {
                    order.status = 'rejected';
                    recordVerificationEvent(order.id, order.userEmail, order.planName, order.amount, order.utr, 'Bulk Rejected Payment');
                    updatedCount++;
                }
            });

            if (updatedCount > 0) {
                setStoredOrders(orders);
                pushCloudData();
                showToast(`Bulk rejected ${updatedCount} selected orders.`, 'info');
            }
            selectedOrderIds.clear();
            if (selectAllCheckbox) selectAllCheckbox.checked = false;
            renderAdminDashboardPage();
            updateAuthUI();
        });
    }

    // Filter Tabs Event Listeners
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentAdminFilter = btn.getAttribute('data-filter');
            renderAdminDashboardPage();
        });
    });

    // Search Input Listener
    if (adminSearchInput) {
        adminSearchInput.addEventListener('input', () => {
            renderAdminDashboardPage();
        });
    }

    // Refresh Button Listener
    if (adminRefreshBtn) {
        adminRefreshBtn.addEventListener('click', () => {
            fetchCloudData();
            showToast('Admin data synced from Cloud Database!', 'success');
        });
    }

    // --- Global Helper Methods for Admin & User Actions ---
    window.copyToClipboard = function (text, label = 'Text') {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            showToast(`${label} copied to clipboard!`, 'success');
        }).catch(() => {
            showToast(`Failed to copy ${label}`, 'error');
        });
    };

    window.updateOrderStatus = function (orderId, newStatus) {
        const orders = getStoredOrders();
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            setStoredOrders(orders);

            sendMongoAction('updateOrderStatus', { orderId, status: newStatus });

            recordVerificationEvent(order.id, order.userEmail, order.planName, order.amount, order.utr, newStatus === 'approved' ? 'Approved Payment' : 'Rejected Payment');

            renderAdminDashboardPage();
            updateAuthUI();
            showToast(`Order ${orderId} status set to ${newStatus.toUpperCase()}`, newStatus === 'approved' ? 'success' : 'info');
        }
    };

    window.removeOrder = async function (orderId) {
        if (!confirm(`Are you sure you want to remove order ${orderId}?`)) return;
        isDbModifying = true;
        try {
            const orders = getStoredOrders();
            const targetOrder = orders.find(o => o.id === orderId);
            const updatedOrders = orders.filter(o => o.id !== orderId);

            await sendMongoAction('removeOrder', { orderId });
            setStoredOrders(updatedOrders);

            if (targetOrder) {
                recordVerificationEvent(targetOrder.id, targetOrder.userEmail, targetOrder.planName, targetOrder.amount, targetOrder.utr, 'Removed Order');
            }

            closeModal(orderCompletionModal);
            renderAdminDashboardPage();
            updateAuthUI();
            showToast(`Order ${orderId} removed successfully.`, 'info');
        } finally {
            isDbModifying = false;
        }
    };

    window.openCompletionPage = function (orderId) {
        const orders = getStoredOrders();
        const order = orders.find(o => o.id === orderId);
        if (!order) {
            showToast('Order not found', 'error');
            return;
        }

        if (compOrderId) compOrderId.textContent = order.id;
        if (compUserEmail) compUserEmail.textContent = order.userEmail;
        if (compPlanName) compPlanName.textContent = order.planName;
        if (compAmount) compAmount.textContent = `₹${order.amount}`;
        if (compUtr) compUtr.textContent = order.utr;
        if (compTimestamp) compTimestamp.textContent = order.timestamp;

        if (compStatusBadge) {
            let statusBadge = `<span class="badge badge-pending">Pending</span>`;
            if (order.status === 'approved') statusBadge = `<span class="badge badge-approved">Approved</span>`;
            if (order.status === 'rejected') statusBadge = `<span class="badge badge-rejected">Rejected</span>`;
            compStatusBadge.innerHTML = statusBadge;
        }

        if (compScreenshotImg) compScreenshotImg.src = order.screenshot || '';

        // Render Interactive Order Verification Checklist Tasks
        const checklistContainer = document.getElementById('comp-checklist-container');
        const checklistProgress = document.getElementById('comp-checklist-progress');

        const checklistTasks = [
            'Payment Proof Screenshot & UTR Verified',
            'Windows Telemetry, Cache & Junk Purged',
            'GPU Driver & Registry Latency Tweaked',
            'Custom Ultimate Power Plan Configured',
            'Discord Support Ticket Completed & Delivered'
        ];

        if (checklistContainer) {
            checklistContainer.innerHTML = checklistTasks.map((task, idx) => `
                <label class="checklist-item-row">
                    <input type="checkbox" class="comp-checklist-cb" data-idx="${idx}" ${order.status === 'approved' ? 'checked' : ''}>
                    <span>${task}</span>
                </label>
            `).join('');

            const updateProgress = () => {
                const checkedCount = checklistContainer.querySelectorAll('.comp-checklist-cb:checked').length;
                const total = checklistTasks.length;
                const pct = Math.round((checkedCount / total) * 100);
                if (checklistProgress) {
                    checklistProgress.textContent = `${checkedCount}/${total} Done (${pct}%)`;
                    checklistProgress.className = pct === 100 ? 'badge badge-approved' : 'badge badge-accent';
                }
            };

            checklistContainer.querySelectorAll('.comp-checklist-cb').forEach(cb => {
                cb.addEventListener('change', updateProgress);
            });
            updateProgress();
        }

        if (compCompletePurgeBtn) {
            compCompletePurgeBtn.onclick = function () {
                window.completeAndPurgeHistory(order.id);
            };
        }

        if (compDeleteOrderBtn) {
            compDeleteOrderBtn.onclick = function () {
                window.removeOrder(order.id);
            };
        }

        openModal(orderCompletionModal);
    };

    window.completeAndPurgeHistory = async function (orderId) {
        const orders = getStoredOrders();
        const targetOrder = orders.find(o => o.id === orderId);
        if (!targetOrder) {
            showToast('Order not found', 'error');
            return;
        }

        const purchaserEmail = targetOrder.userEmail.toLowerCase();

        if (!confirm(`Are you sure you want to mark order ${orderId} as complete AND remove all order history for ${targetOrder.userEmail}?`)) {
            return;
        }

        isDbModifying = true;
        try {
            await sendMongoAction('purgeUser', { email: purchaserEmail });

            const remainingOrders = getStoredOrders().filter(o => (o.userEmail || '').toLowerCase() !== purchaserEmail);
            setStoredOrders(remainingOrders);

            recordVerificationEvent(targetOrder.id, targetOrder.userEmail, targetOrder.planName, targetOrder.amount, targetOrder.utr, 'Completed Order & Wiped History');

            closeModal(orderCompletionModal);
            renderAdminDashboardPage();
            updateAuthUI();
            showToast(`Order completed & all history for ${targetOrder.userEmail} was removed!`, 'success');
        } finally {
            isDbModifying = false;
        }
    };

    window.viewAdminScreenshot = function (orderId) {
        const orders = getStoredOrders();
        const order = orders.find(o => o.id === orderId);
        if (order && order.screenshot) {
            fullScreenshotImg.src = order.screenshot;
            openModal(imageViewerModal);
        }
    };

    // --- Registered Users Table Rendering ---
    function renderAdminUsersTable() {
        const tbody = document.getElementById('page-admin-users-tbody');
        if (!tbody) return;
        const users = getStoredUsers();
        const orders = getStoredOrders();

        if (users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 24px; color: var(--text-muted);">
                        No registered customer accounts found.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = users.map(u => {
            const userOrders = orders.filter(o => o.userEmail.toLowerCase() === u.email.toLowerCase());
            const totalSpent = userOrders.filter(o => o.status === 'approved').reduce((sum, o) => sum + (parseInt(o.amount, 10) || 0), 0);
            const regDate = u.registeredAt ? new Date(u.registeredAt).toLocaleString() : 'Legacy Account';

            return `
                <tr>
                    <td><small style="color: var(--text-muted);">${regDate}</small></td>
                    <td><strong>${u.email}</strong></td>
                    <td><span class="badge badge-pending" style="font-size:0.75rem;"><i class="fa-solid fa-user"></i> Customer</span></td>
                    <td><span class="text-accent" style="font-weight: 700;">${userOrders.length} Order${userOrders.length !== 1 ? 's' : ''}</span></td>
                    <td><span class="text-success" style="font-weight: 700;">₹${totalSpent}</span></td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="window.purgeUserHistory('${u.email}')" title="Purge user history & orders">
                            <i class="fa-solid fa-broom"></i> Clear Orders
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    window.purgeUserHistory = async function (email) {
        if (!confirm(`Purge all order history for user ${email}?`)) return;
        isDbModifying = true;
        try {
            await sendMongoAction('purgeUser', { email });

            const orders = getStoredOrders();
            const remaining = orders.filter(o => (o.userEmail || '').toLowerCase() !== email.toLowerCase());
            setStoredOrders(remaining);

            renderAdminDashboardPage();
            updateAuthUI();
            showToast(`Cleared all orders for ${email}`, 'info');
        } finally {
            isDbModifying = false;
        }
    };

    // --- Admin History Tables Rendering ---
    function renderAdminLoginHistoryTable() {
        const tbody = document.getElementById('page-admin-login-history-tbody');
        if (!tbody) return;
        const history = getStoredLoginHistory();

        if (history.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 24px; color: var(--text-muted);">
                        No login activity recorded yet.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = history.map(log => {
            let statusBadge = log.status === 'Success' ?
                `<span class="badge badge-auth-success"><i class="fa-solid fa-circle-check"></i> Success</span>` :
                `<span class="badge badge-auth-failed"><i class="fa-solid fa-circle-xmark"></i> Failed</span>`;

            let roleBadge = log.role === 'Admin' ?
                `<span class="badge badge-rejected" style="font-size:0.75rem;"><i class="fa-solid fa-shield"></i> Admin</span>` :
                `<span class="badge badge-pending" style="font-size:0.75rem;"><i class="fa-solid fa-user"></i> Customer</span>`;

            return `
                <tr>
                    <td><small style="color: var(--text-muted);">${log.timestamp}</small></td>
                    <td><strong>${log.email}</strong></td>
                    <td>${roleBadge}</td>
                    <td>${statusBadge}</td>
                    <td><small style="color: var(--text-dim); font-family: monospace;">${log.userAgent}</small></td>
                </tr>
            `;
        }).join('');
    }

    function renderAdminVerificationHistoryTable() {
        const tbody = document.getElementById('page-admin-verification-history-tbody');
        if (!tbody) return;
        const history = getStoredVerificationHistory();

        if (history.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 24px; color: var(--text-muted);">
                        No payment verification logs recorded yet.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = history.map(ver => {
            let actionBadge = `<span class="badge badge-action-submitted">${ver.action}</span>`;
            if (ver.action.includes('Approved')) actionBadge = `<span class="badge badge-action-approved"><i class="fa-solid fa-check"></i> Approved</span>`;
            if (ver.action.includes('Rejected')) actionBadge = `<span class="badge badge-action-rejected"><i class="fa-solid fa-xmark"></i> Rejected</span>`;
            if (ver.action.includes('Completed')) actionBadge = `<span class="badge badge-action-completed"><i class="fa-solid fa-flag-checkered"></i> Completed</span>`;
            if (ver.action.includes('Removed')) actionBadge = `<span class="badge badge-action-removed"><i class="fa-solid fa-trash"></i> Removed</span>`;

            return `
                <tr>
                    <td><small style="color: var(--text-muted);">${ver.timestamp}</small></td>
                    <td><code>${ver.orderId || '-'}</code></td>
                    <td><strong>${ver.customerEmail}</strong></td>
                    <td>${ver.planName}</td>
                    <td><span class="text-accent" style="font-weight: 700;">₹${ver.amount}</span></td>
                    <td><code>${ver.utr}</code></td>
                    <td>${actionBadge}</td>
                    <td><small class="accent-text">${ver.actionBy || 'Admin'}</small></td>
                </tr>
            `;
        }).join('');
    }

    // --- CSV Data Export Helper ---
    function exportToCSV(filename, headers, rows) {
        const csvContent = 'data:text/csv;charset=utf-8,' +
            [headers.join(','), ...rows.map(e => e.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Exported ${filename} successfully!`, 'success');
    }

    // CSV Export Triggers
    const exportOrdersBtn = document.getElementById('export-orders-csv-btn');
    if (exportOrdersBtn) {
        exportOrdersBtn.addEventListener('click', () => {
            const orders = getStoredOrders();
            const headers = ['Order ID', 'Timestamp', 'User Email', 'Plan Name', 'Amount', 'UTR Number', 'Status'];
            const rows = orders.map(o => [o.id, o.timestamp, o.userEmail, o.planName, o.amount, o.utr, o.status]);
            exportToCSV('smooth_orders_report.csv', headers, rows);
        });
    }

    const exportUsersBtn = document.getElementById('export-users-csv-btn');
    if (exportUsersBtn) {
        exportUsersBtn.addEventListener('click', () => {
            const users = getStoredUsers();
            const orders = getStoredOrders();
            const headers = ['Gmail ID', 'Registered Timestamp', 'Total Orders', 'Total Spent'];
            const rows = users.map(u => {
                const uOrders = orders.filter(o => o.userEmail.toLowerCase() === u.email.toLowerCase());
                const spent = uOrders.filter(o => o.status === 'approved').reduce((s, o) => s + (parseInt(o.amount, 10) || 0), 0);
                return [u.email, u.registeredAt || 'N/A', uOrders.length, spent];
            });
            exportToCSV('smooth_registered_users.csv', headers, rows);
        });
    }

    const exportLoginsBtn = document.getElementById('export-logins-csv-btn');
    if (exportLoginsBtn) {
        exportLoginsBtn.addEventListener('click', () => {
            const history = getStoredLoginHistory();
            const headers = ['Log ID', 'Timestamp', 'Gmail ID', 'Role', 'Status', 'User Agent'];
            const rows = history.map(l => [l.id, l.timestamp, l.email, l.role, l.status, l.userAgent]);
            exportToCSV('smooth_login_history.csv', headers, rows);
        });
    }

    const exportAuditBtn = document.getElementById('export-audit-csv-btn');
    if (exportAuditBtn) {
        exportAuditBtn.addEventListener('click', () => {
            const history = getStoredVerificationHistory();
            const headers = ['Audit ID', 'Timestamp', 'Order ID', 'Customer Email', 'Plan Name', 'Amount', 'UTR', 'Action', 'Action By'];
            const rows = history.map(v => [v.id, v.timestamp, v.orderId, v.customerEmail, v.planName, v.amount, v.utr, v.action, v.actionBy]);
            exportToCSV('smooth_verification_audit.csv', headers, rows);
        });
    }

    // --- JSON Database Backup & Restore ---
    const exportJsonBtn = document.getElementById('export-json-backup-btn');
    if (exportJsonBtn) {
        exportJsonBtn.addEventListener('click', () => {
            const fullData = {
                exportedAt: new Date().toISOString(),
                orders: getStoredOrders(),
                users: getStoredUsers(),
                login_history: getStoredLoginHistory(),
                verification_history: getStoredVerificationHistory()
            };
            const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullData, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute('href', dataStr);
            downloadAnchor.setAttribute('download', `smooth_database_backup_${Date.now()}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            showToast('Full Database JSON Backup downloaded!', 'success');
        });
    }

    const importJsonInput = document.getElementById('import-json-file-input');
    if (importJsonInput) {
        importJsonInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const imported = JSON.parse(event.target.result);
                        if (imported) {
                            if (Array.isArray(imported.orders)) setStoredOrders(imported.orders);
                            if (Array.isArray(imported.users)) setStoredUsers(imported.users);
                            if (Array.isArray(imported.login_history)) setStoredLoginHistory(imported.login_history);
                            if (Array.isArray(imported.verification_history)) setStoredVerificationHistory(imported.verification_history);
                            pushCloudData();
                            renderAdminDashboardPage();
                            showToast('Database restored successfully from JSON file!', 'success');
                        }
                    } catch (err) {
                        showToast('Invalid JSON Backup file format!', 'error');
                    }
                };
                reader.readAsText(file);
            }
        });
    }

    // Admin Main Tabs Switching Listeners
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.admin-tab-view').forEach(v => v.classList.add('hidden'));

            const targetTab = btn.getAttribute('data-tab');
            document.querySelectorAll(`.admin-tab-btn[data-tab="${targetTab}"]`).forEach(b => b.classList.add('active'));

            const targetView = document.getElementById(`admin-tab-${targetTab}`);
            if (targetView) targetView.classList.remove('hidden');

            if (targetTab === 'site-customizer') {
                populateCustomizerForm();
            }
            renderAdminDashboardPage();
        });
    });

    // --- Admin Preview Site Mode Button ---
    let isPreviewingCustomerSite = false;
    const adminPreviewSiteBtn = document.getElementById('admin-preview-site-btn');
    if (adminPreviewSiteBtn) {
        adminPreviewSiteBtn.addEventListener('click', () => {
            isPreviewingCustomerSite = !isPreviewingCustomerSite;
            if (isPreviewingCustomerSite) {
                adminPreviewSiteBtn.innerHTML = `<i class="fa-solid fa-user-gear"></i> Return to Admin Panel`;
                if (adminDashboardPage) adminDashboardPage.classList.add('hidden');

                if (categorySelectionScreen) categorySelectionScreen.classList.remove('hidden');
                const mainNavLinks = document.getElementById('main-nav-links');
                if (mainNavLinks) mainNavLinks.classList.remove('hidden');

                renderDynamicWebsite(currentCustomerView);
                showToast('Viewing live customer website preview.', 'info');
            } else {
                adminPreviewSiteBtn.innerHTML = `<i class="fa-solid fa-eye"></i> Preview Customer Site`;
                if (adminDashboardPage) adminDashboardPage.classList.remove('hidden');
                if (categorySelectionScreen) categorySelectionScreen.classList.add('hidden');
                if (sensiSelectionScreen) sensiSelectionScreen.classList.add('hidden');
                if (heroSection) heroSection.classList.add('hidden');
                if (plansSection) plansSection.classList.add('hidden');
                showToast('Returned to Executive Admin Panel.', 'info');
            }
        });
    }

    const clearLoginBtn = document.getElementById('clear-login-history-btn');
    if (clearLoginBtn) {
        clearLoginBtn.addEventListener('click', async () => {
            if (confirm('Clear all login activity history logs?')) {
                isDbModifying = true;
                try {
                    await sendMongoAction('clearLoginHistory');
                    setStoredLoginHistory([]);
                    renderAdminLoginHistoryTable();
                    showToast('Login history logs cleared', 'info');
                } finally {
                    isDbModifying = false;
                }
            }
        });
    }

    const clearVerifBtn = document.getElementById('clear-verification-history-btn');
    if (clearVerifBtn) {
        clearVerifBtn.addEventListener('click', async () => {
            if (confirm('Clear all verification audit history logs?')) {
                isDbModifying = true;
                try {
                    await sendMongoAction('clearVerificationHistory');
                    setStoredVerificationHistory([]);
                    renderAdminVerificationHistoryTable();
                    showToast('Verification audit history logs cleared', 'info');
                } finally {
                    isDbModifying = false;
                }
            }
        });
    }

    // Top Options Buttons (OPTIMIZATION & SENSI vs OTHER PURCHASES)
    document.querySelectorAll('.select-top-opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const topVal = btn.getAttribute('data-top');
            if (topVal === 'opt_sensi') {
                currentCustomerView = 'categories';
            } else if (topVal === 'other_purchases') {
                currentCustomerView = 'other_purchases_select';
            }
            updateAuthUI();
        });
    });

    // Category Option Buttons
    document.querySelectorAll('.select-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.getAttribute('data-category');
            if (cat === 'optimization') {
                currentCustomerView = 'optimization';
            } else if (cat === 'sensi') {
                currentCustomerView = 'sensi_select';
            }
            updateAuthUI();
        });
    });

    // SENSI Platform Option Buttons
    document.querySelectorAll('.select-sensi-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sensiType = btn.getAttribute('data-sensi');
            if (sensiType === 'pc') currentCustomerView = 'pc_sensi';
            if (sensiType === 'ios') currentCustomerView = 'ios_sensi';
            if (sensiType === 'android') currentCustomerView = 'android_sensi';
            updateAuthUI();
        });
    });

    // Other Sub-Category Buttons (DISCORD, SPOTIFY, NETFLIX)
    document.querySelectorAll('.select-other-sub-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const otherVal = btn.getAttribute('data-other');
            if (otherVal === 'discord') currentCustomerView = 'discord';
            if (otherVal === 'spotify') currentCustomerView = 'spotify';
            if (otherVal === 'netflix') currentCustomerView = 'netflix';
            updateAuthUI();
        });
    });

    if (categoryBackToTopBtn) {
        categoryBackToTopBtn.addEventListener('click', () => {
            currentCustomerView = 'top_options';
            updateAuthUI();
        });
    }

    if (otherBackToTopBtn) {
        otherBackToTopBtn.addEventListener('click', () => {
            currentCustomerView = 'top_options';
            updateAuthUI();
        });
    }

    if (sensiBackToCatBtn) {
        sensiBackToCatBtn.addEventListener('click', () => {
            currentCustomerView = 'categories';
            updateAuthUI();
        });
    }

    if (navTopOptionsBtn) {
        navTopOptionsBtn.addEventListener('click', () => {
            currentCustomerView = 'top_options';
            updateAuthUI();
        });
    }

    if (navCategoriesBtn) {
        navCategoriesBtn.addEventListener('click', () => {
            currentCustomerView = 'categories';
            updateAuthUI();
        });
    }

    if (navSensiOptionsBtn) {
        navSensiOptionsBtn.addEventListener('click', () => {
            currentCustomerView = 'sensi_select';
            updateAuthUI();
        });
    }

    if (navOtherPurchasesBtn) {
        navOtherPurchasesBtn.addEventListener('click', () => {
            currentCustomerView = 'other_purchases_select';
            updateAuthUI();
        });
    }

    // Admin Customizer Category Toggle Switcher
    const adminToggleOptBtn = document.getElementById('admin-toggle-opt-btn');
    const adminToggleSensiBtn = document.getElementById('admin-toggle-sensi-btn');
    const adminToggleOtherBtn = document.getElementById('admin-toggle-other-btn');
    const adminCustomizerOptContainer = document.getElementById('admin-customizer-opt-container');
    const adminCustomizerSensiContainer = document.getElementById('admin-customizer-sensi-container');
    const adminCustomizerOtherContainer = document.getElementById('admin-customizer-other-container');

    if (adminToggleOptBtn && adminToggleSensiBtn) {
        adminToggleOptBtn.addEventListener('click', () => {
            activeAdminCategoryTab = 'optimization';
            adminToggleOptBtn.classList.add('active');
            adminToggleSensiBtn.classList.remove('active');
            if (adminToggleOtherBtn) adminToggleOtherBtn.classList.remove('active');
            if (adminCustomizerOptContainer) adminCustomizerOptContainer.classList.remove('hidden');
            if (adminCustomizerSensiContainer) adminCustomizerSensiContainer.classList.add('hidden');
            if (adminCustomizerOtherContainer) adminCustomizerOtherContainer.classList.add('hidden');
        });

        adminToggleSensiBtn.addEventListener('click', () => {
            activeAdminCategoryTab = 'sensi';
            adminToggleSensiBtn.classList.add('active');
            adminToggleOptBtn.classList.remove('active');
            if (adminToggleOtherBtn) adminToggleOtherBtn.classList.remove('active');
            if (adminCustomizerSensiContainer) adminCustomizerSensiContainer.classList.remove('hidden');
            if (adminCustomizerOptContainer) adminCustomizerOptContainer.classList.add('hidden');
            if (adminCustomizerOtherContainer) adminCustomizerOtherContainer.classList.add('hidden');
        });

        if (adminToggleOtherBtn) {
            adminToggleOtherBtn.addEventListener('click', () => {
                activeAdminCategoryTab = 'other_purchases';
                adminToggleOtherBtn.classList.add('active');
                adminToggleOptBtn.classList.remove('active');
                adminToggleSensiBtn.classList.remove('active');
                if (adminCustomizerOtherContainer) adminCustomizerOtherContainer.classList.remove('hidden');
                if (adminCustomizerOptContainer) adminCustomizerOptContainer.classList.add('hidden');
                if (adminCustomizerSensiContainer) adminCustomizerSensiContainer.classList.add('hidden');
            });
        }
    }

    // SENSI Sub-Tab Switcher
    document.querySelectorAll('.sensi-sub-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.sensi-sub-toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const sub = btn.getAttribute('data-subsensi');
            activeAdminSensiSubTab = sub;

            const pcBlock = document.getElementById('admin-sensi-pc-block');
            const iosBlock = document.getElementById('admin-sensi-ios-block');
            const androidBlock = document.getElementById('admin-sensi-android-block');

            if (pcBlock) pcBlock.classList.toggle('hidden', sub !== 'pc');
            if (iosBlock) iosBlock.classList.toggle('hidden', sub !== 'ios');
            if (androidBlock) androidBlock.classList.toggle('hidden', sub !== 'android');
        });
    });

    // OTHER PURCHASES Sub-Tab Switcher
    document.querySelectorAll('.other-sub-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.other-sub-toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const sub = btn.getAttribute('data-subother');

            const discordBlock = document.getElementById('admin-other-discord-block');
            const spotifyBlock = document.getElementById('admin-other-spotify-block');
            const netflixBlock = document.getElementById('admin-other-netflix-block');

            if (discordBlock) discordBlock.classList.toggle('hidden', sub !== 'discord');
            if (spotifyBlock) spotifyBlock.classList.toggle('hidden', sub !== 'spotify');
            if (netflixBlock) netflixBlock.classList.toggle('hidden', sub !== 'netflix');
        });
    });

    // --- Dynamic Website Content & Styling Customizer ---
    function renderDynamicWebsite(viewType = currentCustomerView) {
        const settings = getStoredSettings();

        // 1. Core Header and Gate Branding Text
        const brandText = document.getElementById('brand-logo-text');
        if (brandText) brandText.innerHTML = settings.brandName || 'SMOOTH <span class="accent-text">X</span> STORE';
        const gateText = document.getElementById('gate-logo-text');
        if (gateText) gateText.innerHTML = settings.brandName || 'SMOOTH <span class="accent-text">X</span> STORE';

        // Determine which hero and plans to render
        let currentHero = settings.optimization.hero;
        let currentPlans = settings.optimization.plans;
        let plansSectionTitle = 'PC OPTIMIZATION PACKAGES';
        let plansSectionTagline = 'CHOOSE YOUR TIER';
        let categoryKey = 'optimization';
        let subCategoryKey = 'optimization';
        let categoryLabel = 'OPTIMIZATION';

        if (viewType === 'pc_sensi') {
            currentHero = settings.sensi.pc.hero;
            currentPlans = settings.sensi.pc.plans;
            plansSectionTitle = 'PC SENSI PACKAGES';
            plansSectionTagline = 'OPTION 1 - PC SENSI';
            categoryKey = 'sensi';
            subCategoryKey = 'pc_sensi';
            categoryLabel = 'PC SENSI';
        } else if (viewType === 'ios_sensi') {
            currentHero = settings.sensi.ios.hero;
            currentPlans = settings.sensi.ios.plans;
            plansSectionTitle = 'IOS SENSI PACKAGES';
            plansSectionTagline = 'OPTION 2 - IOS SENSI';
            categoryKey = 'sensi';
            subCategoryKey = 'ios_sensi';
            categoryLabel = 'IOS SENSI';
        } else if (viewType === 'android_sensi') {
            currentHero = settings.sensi.android.hero;
            currentPlans = settings.sensi.android.plans;
            plansSectionTitle = 'ANDROID SENSI PACKAGES';
            plansSectionTagline = 'OPTION 3 - ANDROID SENSI';
            categoryKey = 'sensi';
            subCategoryKey = 'android_sensi';
            categoryLabel = 'ANDROID SENSI';
        } else if (viewType === 'discord') {
            currentHero = settings.other_purchases.discord.hero;
            currentPlans = settings.other_purchases.discord.plans;
            plansSectionTitle = 'DISCORD NITRO PROMO CODES';
            plansSectionTagline = 'DISCORD PROMO CODES';
            categoryKey = 'other_purchases';
            subCategoryKey = 'discord';
            categoryLabel = 'DISCORD';
        } else if (viewType === 'spotify') {
            currentHero = settings.other_purchases.spotify.hero;
            currentPlans = settings.other_purchases.spotify.plans;
            plansSectionTitle = 'SPOTIFY PREMIUM 1 YEAR ACCOUNT';
            plansSectionTagline = 'SPOTIFY PURCHASES';
            categoryKey = 'other_purchases';
            subCategoryKey = 'spotify';
            categoryLabel = 'SPOTIFY';
        } else if (viewType === 'netflix') {
            currentHero = settings.other_purchases.netflix.hero;
            currentPlans = settings.other_purchases.netflix.plans;
            plansSectionTitle = 'NETFLIX HD & 4K ULTRA HD SUBSCRIPTIONS';
            plansSectionTagline = 'NETFLIX PURCHASES';
            categoryKey = 'other_purchases';
            subCategoryKey = 'netflix';
            categoryLabel = 'NETFLIX';
        }

        // 2. Hero Section Titles and Metrics
        const badgeTxt = document.getElementById('hero-badge-text');
        if (badgeTxt) badgeTxt.innerHTML = currentHero?.badge || '';
        const titleTxt = document.getElementById('hero-title-text');
        if (titleTxt) titleTxt.innerHTML = currentHero?.title || '';
        const subtitleTxt = document.getElementById('hero-subtitle-text');
        if (subtitleTxt) subtitleTxt.innerHTML = currentHero?.subtitle || '';

        const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setTxt('hero-stat-1-num', currentHero?.stat1Num || '');
        setTxt('hero-stat-1-label', currentHero?.stat1Label || '');
        setTxt('hero-stat-2-num', currentHero?.stat2Num || '');
        setTxt('hero-stat-2-label', currentHero?.stat2Label || '');
        setTxt('hero-stat-3-num', currentHero?.stat3Num || '');
        setTxt('hero-stat-3-label', currentHero?.stat3Label || '');

        // Update Hero Showcase Image
        const heroImgEl = document.getElementById('hero-showcase-img');
        if (heroImgEl) {
            if (currentHero?.image) {
                heroImgEl.src = currentHero.image;
            } else if (subCategoryKey === 'discord') {
                heroImgEl.src = 'https://cdn.phototourl.com/free/2026-08-03-c93464d2-e7df-4297-af27-e6b6f9efa1b6.jpg';
            } else if (subCategoryKey === 'spotify') {
                heroImgEl.src = 'https://cdn.phototourl.com/free/2026-08-03-db26e183-3f7a-4404-9e40-ec68e604c886.jpg';
            } else if (subCategoryKey === 'netflix') {
                heroImgEl.src = 'https://cdn.phototourl.com/free/2026-08-03-de8938b0-dd80-4766-b995-232137ed3da2.jpg';
            } else if (categoryKey === 'sensi') {
                heroImgEl.src = 'https://cdn.phototourl.com/free/2026-08-02-fe79f73e-0ff2-4d04-a9f8-f3bd518c9431.jpg';
            } else {
                heroImgEl.src = 'https://cdn.phototourl.com/free/2026-08-02-ded94d0e-216e-4205-8042-11526fcb6646.jpg';
            }
        }

        // Update Section Header Title
        const plansTitleEl = document.querySelector('#plans .section-title');
        if (plansTitleEl) plansTitleEl.textContent = plansSectionTitle;
        const plansTaglineEl = document.querySelector('#plans .section-tagline');
        if (plansTaglineEl) plansTaglineEl.textContent = plansSectionTagline;

        // 3. Dynamic Pricing Plans Generation
        const pricingGrid = document.getElementById('pricing-grid-container');
        if (pricingGrid && Array.isArray(currentPlans)) {
            pricingGrid.innerHTML = currentPlans.map(p => {
                const isPopular = p.badge && p.badge.toUpperCase().includes('POPULAR');
                const isVip = p.badge && (p.badge.toUpperCase().includes('VIP') || p.badge.toUpperCase().includes('GOD'));
                const cardClass = isPopular ? 'plan-card popular-card' : (isVip ? 'plan-card vip-card' : 'plan-card');
                const ribbonHtml = isPopular ? `<div class="popular-ribbon">${p.badge}</div>` : '';
                const badgeClass = isVip ? 'plan-badge vip-badge' : 'plan-badge';

                const featuresHtml = Array.isArray(p.features) ? p.features.map(f => {
                    const isStrong = f.toLowerCase().startsWith('everything') || f.toLowerCase().includes('priority') || f.toLowerCase().includes('discord');
                    return `<li><i class="fa-solid fa-check feature-check"></i> ${isStrong ? `<strong>${f}</strong>` : f}</li>`;
                }).join('') : '';

                const selectBtnHtml = isPopular ? `
                    <button class="btn btn-glow btn-block select-plan-btn" data-price="${p.price}" data-name="${p.title}" data-category="${categoryKey}" data-subcategory="${subCategoryKey}" data-catlabel="${categoryLabel}">
                        <i class="fa-solid fa-fire-flame-curved"></i> Select Plan (₹${p.price})
                    </button>
                ` : `
                    <button class="btn btn-primary btn-block select-plan-btn" data-price="${p.price}" data-name="${p.title}" data-category="${categoryKey}" data-subcategory="${subCategoryKey}" data-catlabel="${categoryLabel}">
                        <i class="fa-solid fa-bolt"></i> Select Plan (₹${p.price})
                    </button>
                `;

                return `
                    <div class="${cardClass}" data-plan="${p.id}" data-price="${p.price}" data-name="${p.title}">
                        ${ribbonHtml}
                        <div class="${badgeClass}">${p.badge || 'PLAN'}</div>
                        <h3 class="plan-title">${p.title}</h3>
                        <p class="plan-tagline">${p.tagline}</p>
                        <div class="plan-price">
                            <span class="currency">₹</span><span class="amount">${p.price}</span>
                        </div>
                        <ul class="plan-features">
                            ${featuresHtml}
                        </ul>
                        ${selectBtnHtml}
                    </div>
                `;
            }).join('');
        }

        // 4. Payment Gateway Settings Updates
        const upiIdDisplay = document.getElementById('upi-id-text');
        if (upiIdDisplay) upiIdDisplay.textContent = settings.upiId || 'rithwik0000@fam';

        document.querySelectorAll('.qr-image, #checkout-qr-img').forEach(img => {
            img.src = settings.qrCode || 'qr.jpg';
        });

        const custQrPreview = document.getElementById('cust-qr-preview');
        if (custQrPreview && !customizerQRBase64) custQrPreview.src = settings.qrCode || 'qr.jpg';

        // 5. Update support and Discord invite anchors
        document.querySelectorAll('a[href*="discord.gg"]').forEach(anchor => {
            anchor.setAttribute('href', settings.discordLink || 'https://discord.gg/gu5cy4Hg94');
        });

        // 6. Apply Custom Theme Colors Dynamically
        document.documentElement.style.setProperty('--accent-cyan', settings.primaryColor || '#00f2fe');
        document.documentElement.style.setProperty('--accent-pink', settings.secondaryColor || '#e100ff');

        const logoIcon = document.getElementById('brand-logo-icon');
        if (logoIcon) logoIcon.style.filter = `drop-shadow(0 0 8px ${settings.primaryColor || '#00f2fe'})`;
    }

    // Settings Bridge for Sync Hook
    function applySettings(settings) {
        renderDynamicWebsite();
        populateCustomizerForm();
    }
    window.applySettings = applySettings;

    // Populate Customizer Forms
    function populateCustomizerForm(force = false) {
        const form = document.getElementById('customizer-settings-form');
        if (!force && form && form.contains(document.activeElement)) {
            // Admin is actively editing/typing in the customizer form, do not overwrite input fields!
            return;
        }

        const settings = getStoredSettings();

        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };

        // Core fields
        setVal('cust-brand-name', settings.brandName || '');
        setVal('cust-discord-link', settings.discordLink || '');
        setVal('cust-upi-id', settings.upiId || '');
        setVal('cust-primary-color', settings.primaryColor || '#00f2fe');
        setVal('cust-secondary-color', settings.secondaryColor || '#e100ff');

        const primaryHex = document.getElementById('cust-primary-color-hex');
        if (primaryHex) primaryHex.textContent = settings.primaryColor || '#00f2fe';
        const secondaryHex = document.getElementById('cust-secondary-color-hex');
        if (secondaryHex) secondaryHex.textContent = settings.secondaryColor || '#e100ff';

        // 1. OPTIMIZATION Hero & Plans
        setVal('cust-hero-badge', settings.optimization.hero?.badge);
        setVal('cust-hero-title', settings.optimization.hero?.title);
        setVal('cust-hero-subtitle', settings.optimization.hero?.subtitle);
        setVal('cust-hero-stat1-num', settings.optimization.hero?.stat1Num);
        setVal('cust-hero-stat1-label', settings.optimization.hero?.stat1Label);
        setVal('cust-hero-stat2-num', settings.optimization.hero?.stat2Num);
        setVal('cust-hero-stat2-label', settings.optimization.hero?.stat2Label);
        setVal('cust-hero-stat3-num', settings.optimization.hero?.stat3Num);
        setVal('cust-hero-stat3-label', settings.optimization.hero?.stat3Label);

        const optPlans = settings.optimization.plans || [];
        if (optPlans[0]) {
            setVal('cust-plan-basic-badge', optPlans[0].badge);
            setVal('cust-plan-basic-title', optPlans[0].title);
            setVal('cust-plan-basic-tagline', optPlans[0].tagline);
            setVal('cust-plan-basic-price', optPlans[0].price);
            setVal('cust-plan-basic-features', Array.isArray(optPlans[0].features) ? optPlans[0].features.join('\n') : '');
        }
        if (optPlans[1]) {
            setVal('cust-plan-pro-badge', optPlans[1].badge);
            setVal('cust-plan-pro-title', optPlans[1].title);
            setVal('cust-plan-pro-tagline', optPlans[1].tagline);
            setVal('cust-plan-pro-price', optPlans[1].price);
            setVal('cust-plan-pro-features', Array.isArray(optPlans[1].features) ? optPlans[1].features.join('\n') : '');
        }
        if (optPlans[2]) {
            setVal('cust-plan-ultimate-badge', optPlans[2].badge);
            setVal('cust-plan-ultimate-title', optPlans[2].title);
            setVal('cust-plan-ultimate-tagline', optPlans[2].tagline);
            setVal('cust-plan-ultimate-price', optPlans[2].price);
            setVal('cust-plan-ultimate-features', Array.isArray(optPlans[2].features) ? optPlans[2].features.join('\n') : '');
        }

        // 2. PC SENSI Fields
        setVal('cust-sensi-pc-hero-badge', settings.sensi.pc.hero?.badge);
        setVal('cust-sensi-pc-hero-title', settings.sensi.pc.hero?.title);
        setVal('cust-sensi-pc-hero-subtitle', settings.sensi.pc.hero?.subtitle);
        const pcPlans = settings.sensi.pc.plans || [];
        [1, 2, 3].forEach((idx) => {
            const p = pcPlans[idx - 1];
            if (p) {
                setVal(`cust-sensi-pc-plan${idx}-badge`, p.badge);
                setVal(`cust-sensi-pc-plan${idx}-title`, p.title);
                setVal(`cust-sensi-pc-plan${idx}-tagline`, p.tagline);
                setVal(`cust-sensi-pc-plan${idx}-price`, p.price);
                setVal(`cust-sensi-pc-plan${idx}-features`, Array.isArray(p.features) ? p.features.join('\n') : '');
            }
        });

        // 3. IOS SENSI Fields
        setVal('cust-sensi-ios-hero-badge', settings.sensi.ios.hero?.badge);
        setVal('cust-sensi-ios-hero-title', settings.sensi.ios.hero?.title);
        setVal('cust-sensi-ios-hero-subtitle', settings.sensi.ios.hero?.subtitle);
        const iosPlans = settings.sensi.ios.plans || [];
        [1, 2, 3].forEach((idx) => {
            const p = iosPlans[idx - 1];
            if (p) {
                setVal(`cust-sensi-ios-plan${idx}-badge`, p.badge);
                setVal(`cust-sensi-ios-plan${idx}-title`, p.title);
                setVal(`cust-sensi-ios-plan${idx}-tagline`, p.tagline);
                setVal(`cust-sensi-ios-plan${idx}-price`, p.price);
                setVal(`cust-sensi-ios-plan${idx}-features`, Array.isArray(p.features) ? p.features.join('\n') : '');
            }
        });

        // 4. ANDROID SENSI Fields
        setVal('cust-sensi-android-hero-badge', settings.sensi.android.hero?.badge);
        setVal('cust-sensi-android-hero-title', settings.sensi.android.hero?.title);
        setVal('cust-sensi-android-hero-subtitle', settings.sensi.android.hero?.subtitle);
        const androidPlans = settings.sensi.android.plans || [];
        [1, 2, 3].forEach((idx) => {
            const p = androidPlans[idx - 1];
            if (p) {
                setVal(`cust-sensi-android-plan${idx}-badge`, p.badge);
                setVal(`cust-sensi-android-plan${idx}-title`, p.title);
                setVal(`cust-sensi-android-plan${idx}-tagline`, p.tagline);
                setVal(`cust-sensi-android-plan${idx}-price`, p.price);
                setVal(`cust-sensi-android-plan${idx}-features`, Array.isArray(p.features) ? p.features.join('\n') : '');
            }
        });

        // 5. DISCORD OTHER PURCHASES Fields
        if (settings.other_purchases && settings.other_purchases.discord) {
            setVal('cust-other-discord-hero-badge', settings.other_purchases.discord.hero?.badge);
            setVal('cust-other-discord-hero-title', settings.other_purchases.discord.hero?.title);
            setVal('cust-other-discord-hero-subtitle', settings.other_purchases.discord.hero?.subtitle);
            const discordPlans = settings.other_purchases.discord.plans || [];
            [1, 2].forEach((idx) => {
                const p = discordPlans[idx - 1];
                if (p) {
                    setVal(`cust-other-discord-plan${idx}-badge`, p.badge);
                    setVal(`cust-other-discord-plan${idx}-title`, p.title);
                    setVal(`cust-other-discord-plan${idx}-tagline`, p.tagline);
                    setVal(`cust-other-discord-plan${idx}-price`, p.price);
                    setVal(`cust-other-discord-plan${idx}-features`, Array.isArray(p.features) ? p.features.join('\n') : '');
                }
            });
        }

        // 6. SPOTIFY OTHER PURCHASES Fields
        if (settings.other_purchases && settings.other_purchases.spotify) {
            setVal('cust-other-spotify-hero-badge', settings.other_purchases.spotify.hero?.badge);
            setVal('cust-other-spotify-hero-title', settings.other_purchases.spotify.hero?.title);
            setVal('cust-other-spotify-hero-subtitle', settings.other_purchases.spotify.hero?.subtitle);
            const spotifyPlans = settings.other_purchases.spotify.plans || [];
            if (spotifyPlans[0]) {
                setVal('cust-other-spotify-plan1-badge', spotifyPlans[0].badge);
                setVal('cust-other-spotify-plan1-title', spotifyPlans[0].title);
                setVal('cust-other-spotify-plan1-tagline', spotifyPlans[0].tagline);
                setVal('cust-other-spotify-plan1-price', spotifyPlans[0].price);
                setVal('cust-other-spotify-plan1-features', Array.isArray(spotifyPlans[0].features) ? spotifyPlans[0].features.join('\n') : '');
            }
        }

        // 7. NETFLIX OTHER PURCHASES Fields
        if (settings.other_purchases && settings.other_purchases.netflix) {
            setVal('cust-other-netflix-hero-badge', settings.other_purchases.netflix.hero?.badge);
            setVal('cust-other-netflix-hero-title', settings.other_purchases.netflix.hero?.title);
            setVal('cust-other-netflix-hero-subtitle', settings.other_purchases.netflix.hero?.subtitle);
            const netflixPlans = settings.other_purchases.netflix.plans || [];
            [1, 2, 3, 4].forEach((idx) => {
                const p = netflixPlans[idx - 1];
                if (p) {
                    setVal(`cust-other-netflix-plan${idx}-badge`, p.badge);
                    setVal(`cust-other-netflix-plan${idx}-title`, p.title);
                    setVal(`cust-other-netflix-plan${idx}-tagline`, p.tagline);
                    setVal(`cust-other-netflix-plan${idx}-price`, p.price);
                    setVal(`cust-other-netflix-plan${idx}-features`, Array.isArray(p.features) ? p.features.join('\n') : '');
                }
            });
        }

        const qrPreview = document.getElementById('cust-qr-preview');
        if (qrPreview) qrPreview.src = settings.qrCode || 'qr.jpg';
    }

    // Color picker realtime indicators
    const primCol = document.getElementById('cust-primary-color');
    if (primCol) {
        primCol.addEventListener('input', (e) => {
            const hex = document.getElementById('cust-primary-color-hex');
            if (hex) hex.textContent = e.target.value;
        });
    }
    const secCol = document.getElementById('cust-secondary-color');
    if (secCol) {
        secCol.addEventListener('input', (e) => {
            const hex = document.getElementById('cust-secondary-color-hex');
            if (hex) hex.textContent = e.target.value;
        });
    }

    const custUpiInput = document.getElementById('cust-upi-id');
    if (custUpiInput) {
        custUpiInput.addEventListener('input', (e) => {
            const upiDisplay = document.getElementById('upi-id-text');
            if (upiDisplay) upiDisplay.textContent = e.target.value.trim() || 'rithwik0000@fam';
        });
    }

    // Base64 QR Image Uploader Handler
    let customizerQRBase64 = null;
    const qrUploadInput = document.getElementById('cust-qr-upload');
    if (qrUploadInput) {
        qrUploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    showToast('QR Code file must be under 2MB', 'error');
                    qrUploadInput.value = '';
                    return;
                }
                const reader = new FileReader();
                reader.onload = (event) => {
                    customizerQRBase64 = event.target.result;
                    const preview = document.getElementById('cust-qr-preview');
                    if (preview) preview.src = customizerQRBase64;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Customizer Form Submission
    const customizerForm = document.getElementById('customizer-settings-form');
    if (customizerForm) {
        customizerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const getVal = (id) => {
                const el = document.getElementById(id);
                return el ? el.value.trim() : '';
            };

            const existingSettings = getStoredSettings();

            const brandIn = getVal('cust-brand-name');
            const discordIn = getVal('cust-discord-link');
            const upiIn = getVal('cust-upi-id');
            const primaryIn = getVal('cust-primary-color');
            const secondaryIn = getVal('cust-secondary-color');

            // OPTIMIZATION fields
            const heroBadgeIn = getVal('cust-hero-badge');
            const heroTitleIn = getVal('cust-hero-title');
            const heroSubIn = getVal('cust-hero-subtitle');
            const stat1NumIn = getVal('cust-hero-stat1-num');
            const stat1LabelIn = getVal('cust-hero-stat1-label');
            const stat2NumIn = getVal('cust-hero-stat2-num');
            const stat2LabelIn = getVal('cust-hero-stat2-label');
            const stat3NumIn = getVal('cust-hero-stat3-num');
            const stat3LabelIn = getVal('cust-hero-stat3-label');

            const parseFeat = (val) => val ? val.split('\n').map(f => f.trim()).filter(f => f.length > 0) : [];

            const optPlansOrig = existingSettings?.optimization?.plans || DEFAULT_SETTINGS.optimization.plans;
            const updatedOptPlans = [
                {
                    id: 'basic',
                    badge: getVal('cust-plan-basic-badge') || optPlansOrig[0]?.badge || DEFAULT_SETTINGS.optimization.plans[0].badge,
                    title: getVal('cust-plan-basic-title') || optPlansOrig[0]?.title || DEFAULT_SETTINGS.optimization.plans[0].title,
                    tagline: getVal('cust-plan-basic-tagline') || optPlansOrig[0]?.tagline || DEFAULT_SETTINGS.optimization.plans[0].tagline,
                    price: getVal('cust-plan-basic-price') || optPlansOrig[0]?.price || DEFAULT_SETTINGS.optimization.plans[0].price,
                    features: parseFeat(getVal('cust-plan-basic-features')).length > 0 ? parseFeat(getVal('cust-plan-basic-features')) : (optPlansOrig[0]?.features || DEFAULT_SETTINGS.optimization.plans[0].features)
                },
                {
                    id: 'pro',
                    badge: getVal('cust-plan-pro-badge') || optPlansOrig[1]?.badge || DEFAULT_SETTINGS.optimization.plans[1].badge,
                    title: getVal('cust-plan-pro-title') || optPlansOrig[1]?.title || DEFAULT_SETTINGS.optimization.plans[1].title,
                    tagline: getVal('cust-plan-pro-tagline') || optPlansOrig[1]?.tagline || DEFAULT_SETTINGS.optimization.plans[1].tagline,
                    price: getVal('cust-plan-pro-price') || optPlansOrig[1]?.price || DEFAULT_SETTINGS.optimization.plans[1].price,
                    features: parseFeat(getVal('cust-plan-pro-features')).length > 0 ? parseFeat(getVal('cust-plan-pro-features')) : (optPlansOrig[1]?.features || DEFAULT_SETTINGS.optimization.plans[1].features)
                },
                {
                    id: 'ultimate',
                    badge: getVal('cust-plan-ultimate-badge') || optPlansOrig[2]?.badge || DEFAULT_SETTINGS.optimization.plans[2].badge,
                    title: getVal('cust-plan-ultimate-title') || optPlansOrig[2]?.title || DEFAULT_SETTINGS.optimization.plans[2].title,
                    tagline: getVal('cust-plan-ultimate-tagline') || optPlansOrig[2]?.tagline || DEFAULT_SETTINGS.optimization.plans[2].tagline,
                    price: getVal('cust-plan-ultimate-price') || optPlansOrig[2]?.price || DEFAULT_SETTINGS.optimization.plans[2].price,
                    features: parseFeat(getVal('cust-plan-ultimate-features')).length > 0 ? parseFeat(getVal('cust-plan-ultimate-features')) : (optPlansOrig[2]?.features || DEFAULT_SETTINGS.optimization.plans[2].features)
                }
            ];

            // PC SENSI fields
            const pcHeroOrig = existingSettings?.sensi?.pc?.hero || DEFAULT_SETTINGS.sensi.pc.hero;
            const pcPlansOrig = existingSettings?.sensi?.pc?.plans || DEFAULT_SETTINGS.sensi.pc.plans;
            const pcHeroBadge = getVal('cust-sensi-pc-hero-badge') || pcHeroOrig.badge;
            const pcHeroTitle = getVal('cust-sensi-pc-hero-title') || pcHeroOrig.title;
            const pcHeroSub = getVal('cust-sensi-pc-hero-subtitle') || pcHeroOrig.subtitle;

            const updatedPcPlans = [1, 2, 3].map(idx => {
                const orig = pcPlansOrig[idx - 1] || DEFAULT_SETTINGS.sensi.pc.plans[idx - 1];
                return {
                    id: orig.id,
                    badge: getVal(`cust-sensi-pc-plan${idx}-badge`) || orig.badge,
                    title: getVal(`cust-sensi-pc-plan${idx}-title`) || orig.title,
                    tagline: getVal(`cust-sensi-pc-plan${idx}-tagline`) || orig.tagline,
                    price: getVal(`cust-sensi-pc-plan${idx}-price`) || orig.price,
                    features: parseFeat(getVal(`cust-sensi-pc-plan${idx}-features`)).length > 0 ? parseFeat(getVal(`cust-sensi-pc-plan${idx}-features`)) : orig.features
                };
            });

            // IOS SENSI fields
            const iosHeroOrig = existingSettings?.sensi?.ios?.hero || DEFAULT_SETTINGS.sensi.ios.hero;
            const iosPlansOrig = existingSettings?.sensi?.ios?.plans || DEFAULT_SETTINGS.sensi.ios.plans;
            const iosHeroBadge = getVal('cust-sensi-ios-hero-badge') || iosHeroOrig.badge;
            const iosHeroTitle = getVal('cust-sensi-ios-hero-title') || iosHeroOrig.title;
            const iosHeroSub = getVal('cust-sensi-ios-hero-subtitle') || iosHeroOrig.subtitle;

            const updatedIosPlans = [1, 2, 3].map(idx => {
                const orig = iosPlansOrig[idx - 1] || DEFAULT_SETTINGS.sensi.ios.plans[idx - 1];
                return {
                    id: orig.id,
                    badge: getVal(`cust-sensi-ios-plan${idx}-badge`) || orig.badge,
                    title: getVal(`cust-sensi-ios-plan${idx}-title`) || orig.title,
                    tagline: getVal(`cust-sensi-ios-plan${idx}-tagline`) || orig.tagline,
                    price: getVal(`cust-sensi-ios-plan${idx}-price`) || orig.price,
                    features: parseFeat(getVal(`cust-sensi-ios-plan${idx}-features`)).length > 0 ? parseFeat(getVal(`cust-sensi-ios-plan${idx}-features`)) : orig.features
                };
            });

            // ANDROID SENSI fields
            const androidHeroOrig = existingSettings?.sensi?.android?.hero || DEFAULT_SETTINGS.sensi.android.hero;
            const androidPlansOrig = existingSettings?.sensi?.android?.plans || DEFAULT_SETTINGS.sensi.android.plans;
            const androidHeroBadge = getVal('cust-sensi-android-hero-badge') || androidHeroOrig.badge;
            const androidHeroTitle = getVal('cust-sensi-android-hero-title') || androidHeroOrig.title;
            const androidHeroSub = getVal('cust-sensi-android-hero-subtitle') || androidHeroOrig.subtitle;

            const updatedAndroidPlans = [1, 2, 3].map(idx => {
                const orig = androidPlansOrig[idx - 1] || DEFAULT_SETTINGS.sensi.android.plans[idx - 1];
                return {
                    id: orig.id,
                    badge: getVal(`cust-sensi-android-plan${idx}-badge`) || orig.badge,
                    title: getVal(`cust-sensi-android-plan${idx}-title`) || orig.title,
                    tagline: getVal(`cust-sensi-android-plan${idx}-tagline`) || orig.tagline,
                    price: getVal(`cust-sensi-android-plan${idx}-price`) || orig.price,
                    features: parseFeat(getVal(`cust-sensi-android-plan${idx}-features`)).length > 0 ? parseFeat(getVal(`cust-sensi-android-plan${idx}-features`)) : orig.features
                };
            });

            // DISCORD OTHER PURCHASES fields
            const discordHeroOrig = existingSettings?.other_purchases?.discord?.hero || DEFAULT_SETTINGS.other_purchases.discord.hero;
            const discordPlansOrig = existingSettings?.other_purchases?.discord?.plans || DEFAULT_SETTINGS.other_purchases.discord.plans;
            const discordHeroBadge = getVal('cust-other-discord-hero-badge') || discordHeroOrig.badge;
            const discordHeroTitle = getVal('cust-other-discord-hero-title') || discordHeroOrig.title;
            const discordHeroSub = getVal('cust-other-discord-hero-subtitle') || discordHeroOrig.subtitle;

            const updatedDiscordPlans = [1, 2].map(idx => {
                const orig = discordPlansOrig[idx - 1] || DEFAULT_SETTINGS.other_purchases.discord.plans[idx - 1];
                return {
                    id: orig.id,
                    badge: getVal(`cust-other-discord-plan${idx}-badge`) || orig.badge,
                    title: getVal(`cust-other-discord-plan${idx}-title`) || orig.title,
                    tagline: getVal(`cust-other-discord-plan${idx}-tagline`) || orig.tagline,
                    price: getVal(`cust-other-discord-plan${idx}-price`) || orig.price,
                    features: parseFeat(getVal(`cust-other-discord-plan${idx}-features`)).length > 0 ? parseFeat(getVal(`cust-other-discord-plan${idx}-features`)) : orig.features
                };
            });

            // SPOTIFY OTHER PURCHASES fields
            const spotifyHeroOrig = existingSettings?.other_purchases?.spotify?.hero || DEFAULT_SETTINGS.other_purchases.spotify.hero;
            const spotifyPlansOrig = existingSettings?.other_purchases?.spotify?.plans || DEFAULT_SETTINGS.other_purchases.spotify.plans;
            const spotifyHeroBadge = getVal('cust-other-spotify-hero-badge') || spotifyHeroOrig.badge;
            const spotifyHeroTitle = getVal('cust-other-spotify-hero-title') || spotifyHeroOrig.title;
            const spotifyHeroSub = getVal('cust-other-spotify-hero-subtitle') || spotifyHeroOrig.subtitle;

            const updatedSpotifyPlans = [
                {
                    id: spotifyPlansOrig[0]?.id || DEFAULT_SETTINGS.other_purchases.spotify.plans[0].id,
                    badge: getVal('cust-other-spotify-plan1-badge') || spotifyPlansOrig[0]?.badge || DEFAULT_SETTINGS.other_purchases.spotify.plans[0].badge,
                    title: getVal('cust-other-spotify-plan1-title') || spotifyPlansOrig[0]?.title || DEFAULT_SETTINGS.other_purchases.spotify.plans[0].title,
                    tagline: getVal('cust-other-spotify-plan1-tagline') || spotifyPlansOrig[0]?.tagline || DEFAULT_SETTINGS.other_purchases.spotify.plans[0].tagline,
                    price: getVal('cust-other-spotify-plan1-price') || spotifyPlansOrig[0]?.price || DEFAULT_SETTINGS.other_purchases.spotify.plans[0].price,
                    features: parseFeat(getVal('cust-other-spotify-plan1-features')).length > 0 ? parseFeat(getVal('cust-other-spotify-plan1-features')) : (spotifyPlansOrig[0]?.features || DEFAULT_SETTINGS.other_purchases.spotify.plans[0].features)
                }
            ];

            // NETFLIX OTHER PURCHASES fields
            const netflixHeroOrig = existingSettings?.other_purchases?.netflix?.hero || DEFAULT_SETTINGS.other_purchases.netflix.hero;
            const netflixPlansOrig = existingSettings?.other_purchases?.netflix?.plans || DEFAULT_SETTINGS.other_purchases.netflix.plans;
            const netflixHeroBadge = getVal('cust-other-netflix-hero-badge') || netflixHeroOrig.badge;
            const netflixHeroTitle = getVal('cust-other-netflix-hero-title') || netflixHeroOrig.title;
            const netflixHeroSub = getVal('cust-other-netflix-hero-subtitle') || netflixHeroOrig.subtitle;

            const updatedNetflixPlans = [1, 2, 3, 4].map(idx => {
                const orig = netflixPlansOrig[idx - 1] || DEFAULT_SETTINGS.other_purchases.netflix.plans[idx - 1];
                return {
                    id: orig.id,
                    badge: getVal(`cust-other-netflix-plan${idx}-badge`) || orig.badge,
                    title: getVal(`cust-other-netflix-plan${idx}-title`) || orig.title,
                    tagline: getVal(`cust-other-netflix-plan${idx}-tagline`) || orig.tagline,
                    price: getVal(`cust-other-netflix-plan${idx}-price`) || orig.price,
                    features: parseFeat(getVal(`cust-other-netflix-plan${idx}-features`)).length > 0 ? parseFeat(getVal(`cust-other-netflix-plan${idx}-features`)) : orig.features
                };
            });

            const newSettings = {
                updatedAt: Date.now(),
                brandName: brandIn !== '' ? brandIn : (existingSettings.brandName || DEFAULT_SETTINGS.brandName),
                discordLink: discordIn !== '' ? discordIn : (existingSettings.discordLink || DEFAULT_SETTINGS.discordLink),
                upiId: upiIn !== '' ? upiIn : (existingSettings.upiId || DEFAULT_SETTINGS.upiId),
                primaryColor: primaryIn !== '' ? primaryIn : (existingSettings.primaryColor || DEFAULT_SETTINGS.primaryColor),
                secondaryColor: secondaryIn !== '' ? secondaryIn : (existingSettings.secondaryColor || DEFAULT_SETTINGS.secondaryColor),
                qrCode: customizerQRBase64 || existingSettings.qrCode || DEFAULT_SETTINGS.qrCode,
                optimization: {
                    hero: {
                        badge: heroBadgeIn !== '' ? heroBadgeIn : (existingSettings?.optimization?.hero?.badge || DEFAULT_SETTINGS.optimization.hero.badge),
                        title: heroTitleIn !== '' ? heroTitleIn : (existingSettings?.optimization?.hero?.title || DEFAULT_SETTINGS.optimization.hero.title),
                        subtitle: heroSubIn !== '' ? heroSubIn : (existingSettings?.optimization?.hero?.subtitle || DEFAULT_SETTINGS.optimization.hero.subtitle),
                        stat1Num: stat1NumIn !== '' ? stat1NumIn : (existingSettings?.optimization?.hero?.stat1Num || DEFAULT_SETTINGS.optimization.hero.stat1Num),
                        stat1Label: stat1LabelIn !== '' ? stat1LabelIn : (existingSettings?.optimization?.hero?.stat1Label || DEFAULT_SETTINGS.optimization.hero.stat1Label),
                        stat2Num: stat2NumIn !== '' ? stat2NumIn : (existingSettings?.optimization?.hero?.stat2Num || DEFAULT_SETTINGS.optimization.hero.stat2Num),
                        stat2Label: stat2LabelIn !== '' ? stat2LabelIn : (existingSettings?.optimization?.hero?.stat2Label || DEFAULT_SETTINGS.optimization.hero.stat2Label),
                        stat3Num: stat3NumIn !== '' ? stat3NumIn : (existingSettings?.optimization?.hero?.stat3Num || DEFAULT_SETTINGS.optimization.hero.stat3Num),
                        stat3Label: stat3LabelIn !== '' ? stat3LabelIn : (existingSettings?.optimization?.hero?.stat3Label || DEFAULT_SETTINGS.optimization.hero.stat3Label)
                    },
                    plans: updatedOptPlans
                },
                sensi: {
                    pc: {
                        hero: {
                            ...pcHeroOrig,
                            badge: pcHeroBadge,
                            title: pcHeroTitle,
                            subtitle: pcHeroSub
                        },
                        plans: updatedPcPlans
                    },
                    ios: {
                        hero: {
                            ...iosHeroOrig,
                            badge: iosHeroBadge,
                            title: iosHeroTitle,
                            subtitle: iosHeroSub
                        },
                        plans: updatedIosPlans
                    },
                    android: {
                        hero: {
                            ...androidHeroOrig,
                            badge: androidHeroBadge,
                            title: androidHeroTitle,
                            subtitle: androidHeroSub
                        },
                        plans: updatedAndroidPlans
                    }
                },
                other_purchases: {
                    discord: {
                        hero: {
                            ...discordHeroOrig,
                            badge: discordHeroBadge,
                            title: discordHeroTitle,
                            subtitle: discordHeroSub
                        },
                        plans: updatedDiscordPlans
                    },
                    spotify: {
                        hero: {
                            ...spotifyHeroOrig,
                            badge: spotifyHeroBadge,
                            title: spotifyHeroTitle,
                            subtitle: spotifyHeroSub
                        },
                        plans: updatedSpotifyPlans
                    },
                    netflix: {
                        hero: {
                            ...netflixHeroOrig,
                            badge: netflixHeroBadge,
                            title: netflixHeroTitle,
                            subtitle: netflixHeroSub
                        },
                        plans: updatedNetflixPlans
                    }
                }
            };

            isDbModifying = true;
            try {
                setStoredSettings(newSettings);
                await sendMongoAction('saveSettings', newSettings);
                await pushCloudData(true);
                renderDynamicWebsite(currentCustomerView);
                renderDynamicWebsite('optimization');
                populateCustomizerForm();
                showToast('Website configurations successfully published & synced live to MongoDB!', 'success');
            } finally {
                isDbModifying = false;
            }
        });
    }

    // Reset Customizer defaults
    const custResetBtn = document.getElementById('cust-reset-btn');
    if (custResetBtn) {
        custResetBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to reset all branding, pricing plans, and layout options back to system default?')) {
                isDbModifying = true;
                try {
                    setStoredSettings(DEFAULT_SETTINGS);
                    await sendMongoAction('saveSettings', DEFAULT_SETTINGS);
                    renderDynamicWebsite();
                    populateCustomizerForm();
                    showToast('Website configurations reset to system default.', 'info');
                } finally {
                    isDbModifying = false;
                }
            }
        });
    }

    // Delegated Event Listener for dynamic Pricing Card buttons
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.select-plan-btn');
        if (btn) {
            const currentUser = getCurrentUser();
            if (!currentUser) {
                showToast('Please sign in or register with your Gmail ID first!', 'info');
                openModal(authModal);
                return;
            }

            const pendingOrder = getPendingOrderForUser(currentUser.email);
            if (pendingOrder) {
                showToast(`Order Limit Reached! You currently have a pending order (#${pendingOrder.id}) waiting for admin verification. You can place a new order only after your previous order is approved or rejected by the admin.`, 'error');
                if (userOrdersSection) {
                    userOrdersSection.scrollIntoView({ behavior: 'smooth' });
                }
                return;
            }

            const price = btn.getAttribute('data-price');
            const name = btn.getAttribute('data-name');
            const category = btn.getAttribute('data-category') || 'optimization';
            const subCategory = btn.getAttribute('data-subcategory') || 'optimization';
            const categoryLabel = btn.getAttribute('data-catlabel') || 'OPTIMIZATION';

            selectedPlan = { price, name, category, subCategory, categoryLabel };

            checkoutPlanText.innerHTML = `Selected Plan: <strong>${name} (₹${price})</strong> <span class="badge-category ${getCategoryBadgeClass(category, subCategory)}">${categoryLabel}</span>`;
            openModal(paymentModal);
        }
    });

    // --- Live Activity order chart ---
    function renderActivityChart() {
        const barsContainer = document.getElementById('admin-activity-bars-container');
        const labelsRow = document.getElementById('admin-chart-labels-row');
        if (!barsContainer || !labelsRow) return;

        const orders = getStoredOrders();

        // Gather order volumes for the last 7 days
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            last7Days.push({
                dateString: d.toLocaleDateString(),
                label: d.toLocaleDateString(undefined, { weekday: 'short' }),
                count: 0
            });
        }

        orders.forEach(o => {
            if (!o.timestamp) return;
            try {
                const orderDate = new Date(o.timestamp).toLocaleDateString();
                const matchedDay = last7Days.find(d => d.dateString === orderDate);
                if (matchedDay) {
                    matchedDay.count++;
                }
            } catch (err) {
                // Skip invalid dates
            }
        });

        const maxCount = Math.max(...last7Days.map(d => d.count), 1);

        // Populate bars
        barsContainer.innerHTML = last7Days.map(d => {
            const pctHeight = Math.max(Math.round((d.count / maxCount) * 100), 5);
            return `
                <div class="activity-bar-col">
                    <div class="activity-bar-fill" style="height: ${pctHeight}%;" data-count="${d.count}"></div>
                </div>
            `;
        }).join('');

        // Populate day labels
        labelsRow.innerHTML = last7Days.map(d => `<span class="chart-label-day">${d.label}</span>`).join('');
    }

    // Call dynamic rendering at load time
    renderDynamicWebsite();

    // --- Live Admin Clock ---
    function updateAdminClock() {
        const clockEl = document.getElementById('admin-clock-text');
        if (!clockEl) return;
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    updateAdminClock();
    setInterval(updateAdminClock, 1000);

    // --- System Tools: Force Cloud Push / Pull buttons ---
    const forceCloudPushBtn = document.getElementById('force-cloud-push-btn');
    if (forceCloudPushBtn) {
        forceCloudPushBtn.addEventListener('click', async () => {
            showToast('Force pushing all local data to cloud...', 'info');
            await pushCloudData();
            showToast('Data successfully force-pushed to cloud database.', 'success');
        });
    }

    const forceCloudPullBtn = document.getElementById('force-cloud-pull-btn');
    if (forceCloudPullBtn) {
        forceCloudPullBtn.addEventListener('click', async () => {
            showToast('Force pulling latest data from cloud...', 'info');
            await fetchCloudData();
            showToast('Cloud data successfully pulled and merged.', 'success');
        });
    }

    // --- Mobile Sidebar Toggle ---
    const sidebarToggleBtn = document.getElementById('admin-sidebar-toggle');
    const adminSidebar = document.getElementById('admin-sidebar');
    if (sidebarToggleBtn && adminSidebar) {
        sidebarToggleBtn.addEventListener('click', () => {
            adminSidebar.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (adminSidebar.classList.contains('active') &&
                !adminSidebar.contains(e.target) &&
                !sidebarToggleBtn.contains(e.target)) {
                adminSidebar.classList.remove('active');
            }
        });
    }

    // --- Sidebar Sign Out Button ---
    const adminSidebarLogoutBtn = document.getElementById('admin-sidebar-logout-btn');
    if (adminSidebarLogoutBtn) {
        adminSidebarLogoutBtn.addEventListener('click', () => {
            localStorage.removeItem('smooth_current_user');
            isAdminLoggedIn = false;
            updateAuthUI();
            showToast('Signed out successfully.', 'info');
        });
    }

    // Initialize Page State & MongoDB Cloud Sync
    populateCustomizerForm();
    renderDynamicWebsite();   // Apply stored settings immediately (colors, brand, plans)
    updateAuthUI();
    fetchCloudData();

    // Auto sync with MongoDB database every 4 seconds for live cross-device updates
    setInterval(() => fetchCloudData(true), 4000);

    // --- Disable Right Click & Inspect Element / DevTools Shortcuts for Customers (Allowed for Admin) ---
    document.addEventListener('contextmenu', (e) => {
        if (isAdminLoggedIn) return true; // Allow right click for Admin
        e.preventDefault();
        showToast('Right click and Inspect Element are disabled.', 'warning');
    });

    document.addEventListener('keydown', (e) => {
        // Secret Shortcut to Reveal & Open Admin KeyAuth Login Page: Alt + Shift + M
        if (e.altKey && e.shiftKey && (e.key === 'M' || e.key === 'm' || e.keyCode === 77)) {
            e.preventDefault();

            const gateKeyauthBtn = document.getElementById('gate-tab-keyauth-btn');
            const tabKeyauthBtn = document.getElementById('tab-keyauth-btn');
            const authModal = document.getElementById('auth-modal');
            const welcomeAuthScreen = document.getElementById('welcome-auth-screen');

            if (gateKeyauthBtn) {
                gateKeyauthBtn.classList.remove('hidden');
            }
            if (tabKeyauthBtn) {
                tabKeyauthBtn.classList.remove('hidden');
            }

            // If welcome gate screen is visible, click welcome gate keyauth tab
            if (welcomeAuthScreen && !welcomeAuthScreen.classList.contains('hidden')) {
                if (gateKeyauthBtn) gateKeyauthBtn.click();
            } else {
                if (authModal) authModal.classList.remove('hidden');
                if (tabKeyauthBtn) tabKeyauthBtn.click();
            }

            showToast('Admin KeyAuth Login Portal Unlocked!', 'success');
            return false;
        }

        if (isAdminLoggedIn) return true; // Allow inspect / DevTools shortcuts for Admin

        // F12 key
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            showToast('Developer tools are disabled on this website.', 'warning');
            return false;
        }
        // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
            e.preventDefault();
            showToast('Inspect Element is disabled on this website.', 'warning');
            return false;
        }
        // Ctrl+U (View Source) and Ctrl+S (Save)
        if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S')) {
            e.preventDefault();
            showToast('Viewing page source is disabled.', 'warning');
            return false;
        }
    });
});