const { MongoClient } = require('mongodb');

const DEFAULT_URI = "mongodb+srv://Vercel-Admin-atlas-citrine-cloud:rithwik94950315@atlas-citrine-cloud.v99ntaq.mongodb.net/?retryWrites=true&w=majority&appName=atlas-citrine-cloud";

let MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI || MONGODB_URI.includes('smoothxoptimization')) {
    MONGODB_URI = DEFAULT_URI;
}

let cachedClient = null;
let cachedDb = null;

function escapeRegExp(string) {
    return string ? string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';
}

async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }
    const client = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
    });
    await client.connect();
    const db = client.db('smooth_store');
    cachedClient = client;
    cachedDb = db;
    return { client, db };
}

module.exports = async (req, res) => {
    // Enable CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const { db } = await connectToDatabase();

        if (req.method === 'GET') {
            const orders = await db.collection('orders').find({}).sort({ _id: -1 }).toArray().catch(() => []);
            const users = await db.collection('users').find({}).toArray().catch(() => []);
            const login_history = await db.collection('login_history').find({}).sort({ _id: -1 }).limit(200).toArray().catch(() => []);
            const verification_history = await db.collection('verification_history').find({}).sort({ _id: -1 }).limit(300).toArray().catch(() => []);
            const settingsDoc = await db.collection('settings').findOne({ _id: 'site_settings' }).catch(() => null);

            res.status(200).json({
                success: true,
                orders,
                users,
                login_history,
                verification_history,
                settings: settingsDoc ? settingsDoc.data : null
            });
            return;
        }

        if (req.method === 'POST') {
            const body = req.body || {};
            const { action, data } = body;

            if (action === 'saveOrder' && data && data.id) {
                await db.collection('orders').updateOne({ id: data.id }, { $set: data }, { upsert: true });
                res.status(200).json({ success: true });
                return;
            }

            if (action === 'updateOrderStatus' && (body.orderId || data?.orderId) && (body.status || data?.status)) {
                const orderId = body.orderId || data?.orderId;
                const status = body.status || data?.status;
                await db.collection('orders').updateOne({ id: orderId }, { $set: { status } });
                res.status(200).json({ success: true });
                return;
            }

            if (action === 'removeOrder' && (body.orderId || data?.orderId)) {
                const orderId = body.orderId || data?.orderId;
                await db.collection('orders').deleteOne({ id: orderId });
                res.status(200).json({ success: true });
                return;
            }

            if (action === 'purgeUser' && (body.email || data?.email)) {
                const email = String(body.email || data?.email).trim();
                const escapedEmail = escapeRegExp(email);
                await db.collection('orders').deleteMany({ userEmail: new RegExp(`^${escapedEmail}$`, 'i') });
                res.status(200).json({ success: true });
                return;
            }

            if (action === 'saveUser' && data && data.email) {
                await db.collection('users').updateOne({ email: data.email.toLowerCase() }, { $set: data }, { upsert: true });
                res.status(200).json({ success: true });
                return;
            }

            if (action === 'recordLogin' && data && data.id) {
                await db.collection('login_history').updateOne({ id: data.id }, { $set: data }, { upsert: true });
                res.status(200).json({ success: true });
                return;
            }

            if (action === 'recordVerification' && data && data.id) {
                await db.collection('verification_history').updateOne({ id: data.id }, { $set: data }, { upsert: true });
                res.status(200).json({ success: true });
                return;
            }

            if (action === 'saveSettings' && (data || body.settings)) {
                const settingsData = data || body.settings;
                await db.collection('settings').updateOne({ _id: 'site_settings' }, { $set: { _id: 'site_settings', data: settingsData } }, { upsert: true });
                res.status(200).json({ success: true });
                return;
            }

            if (action === 'clearLoginHistory') {
                await db.collection('login_history').deleteMany({});
                res.status(200).json({ success: true });
                return;
            }

            if (action === 'clearVerificationHistory') {
                await db.collection('verification_history').deleteMany({});
                res.status(200).json({ success: true });
                return;
            }

            // Full Sync Fallback
            if (body.orders || body.users || body.settings) {
                if (Array.isArray(body.orders)) {
                    for (const o of body.orders) {
                        if (o.id) await db.collection('orders').updateOne({ id: o.id }, { $set: o }, { upsert: true });
                    }
                }
                if (Array.isArray(body.users)) {
                    for (const u of body.users) {
                        if (u.email) await db.collection('users').updateOne({ email: u.email.toLowerCase() }, { $set: u }, { upsert: true });
                    }
                }
                if (body.settings) {
                    await db.collection('settings').updateOne({ _id: 'site_settings' }, { $set: { _id: 'site_settings', data: body.settings } }, { upsert: true });
                }
                res.status(200).json({ success: true });
                return;
            }

            res.status(400).json({ error: 'Unknown action' });
            return;
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('MongoDB API Error:', error);
        cachedClient = null;
        cachedDb = null;
        res.status(500).json({ success: false, error: error.message || 'Database connection failure' });
    }
};
