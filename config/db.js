const mongoose = require('mongoose');

let mongoMemoryServer = null;

const seedDatabase = async () => {
    try {
        const Restaurant = require('../models/Restaurant');
        const User = require('../models/User');
        const Category = require('../models/Category');
        const Product = require('../models/Product');
        const DeliveryArea = require('../models/DeliveryArea');
        const Coupon = require('../models/Coupon');

        const existingRest = await Restaurant.findOne({ slug: 'abu-qoura' });
        if (existingRest) return;

        console.log('🌱 [AI Studio] Seeding initial restaurant data into database...');

        // 🏢 1. Create Abu Qoura Traditional Kitchen data
        const restaurant = await Restaurant.create({
            name: 'Abu Qoura Traditional Kitchen',
            slug: 'abu-qoura',
            description: 'Delicious traditional food and authentic charcoal-grilled dishes',
            whatsappPhone: '01120751467',
            phone: '01120751467',
            address: 'Cairo - Al-Muizz Street - Egypt',
            currency: 'EGP',
            isAcceptingOrders: true,
            openingTime: '00:00',
            closingTime: '23:59',
            workingHoursText: 'Open 24 hours daily'
        });

        // 📂 2. Create the main categories
        const catKebabs = await Category.create({ restaurantId: restaurant._id, name: 'Grills', icon: '🥩' });
        const catTawajen = await Category.create({ restaurantId: restaurant._id, name: 'Traditional Clay Pots', icon: '🍲' });
        const catMeals = await Category.create({ restaurantId: restaurant._id, name: 'Full Meals', icon: '🍱' });
        const catAppetizers = await Category.create({ restaurantId: restaurant._id, name: 'Salads and Appetizers', icon: '🥗' });
        const catDesserts = await Category.create({ restaurantId: restaurant._id, name: 'Desserts and Drinks', icon: '🍹' });

        // 🍱 3. Create menu items and meals
        const products = [
            {
                restaurantId: restaurant._id,
                categoryId: catKebabs._id,
                title: 'One Kilo Traditional Lamb Kebab and Kofta',
                shortDescription: 'Traditional charcoal-grilled lamb served with tahini and fresh bread',
                fullDescription: 'An excellent selection of traditional lamb kebab and kofta.',
                price: 550,
                discountPrice: 490,
                images: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1'],
                isAvailable: true,
                isFeatured: true,
                isDeal: true,
                isTopSeller: true,
                sizes: [
                    { name: 'Quarter Kilo', price: 140 },
                    { name: 'Half Kilo', price: 260 },
                    { name: 'Full Kilo', price: 490 }
                ],
                addons: [
                    { name: 'Extra Tahini', price: 15 },
                    { name: 'Traditional Green Salad', price: 15 },
                    { name: 'Traditional Pickles', price: 10 }
                ]
            },
            {
                restaurantId: restaurant._id,
                categoryId: catKebabs._id,
                title: 'Traditional Charcoal-Grilled Chicken',
                shortDescription: 'Traditional chicken with Abu Qoura special seasoning, grilled over coals',
                fullDescription: 'Fresh chicken seasoned with traditional spices and grilled over natural charcoal.',
                price: 240,
                discountPrice: 210,
                images: ['https://images.unsplash.com/photo-1598515214211-89d3c73ae83b'],
                isAvailable: true,
                isFeatured: true,
                isDeal: true,
                isTopSeller: true,
                sizes: [
                    { name: 'Half Chicken', price: 110 },
                    { name: 'Whole Chicken', price: 210 }
                ]
            },
            {
                restaurantId: restaurant._id,
                categoryId: catTawajen._id,
                title: 'Traditional Lamb Okra Clay Pot',
                shortDescription: 'Traditional okra with clarified butter, rich tomato sauce, and tender lamb pieces',
                fullDescription: 'A clay pot baked in a traditional oven with pure clarified butter and Eastern herbs.',
                price: 190,
                discountPrice: 170,
                images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c'],
                isAvailable: true,
                isFeatured: true,
                isDeal: false,
                isTopSeller: true
            },
            {
                restaurantId: restaurant._id,
                categoryId: catTawajen._id,
                title: 'Oxtail Clay Pot with Onions and Spices',
                shortDescription: 'Tender traditional oxtail in caramelized onion sauce and countryside spices',
                fullDescription: 'Tender oxtail clay pot carefully cooked in a traditional oven.',
                price: 230,
                discountPrice: 0,
                images: ['https://images.unsplash.com/photo-1544025162-d76694265947'],
                isAvailable: true,
                isFeatured: true,
                isDeal: false,
                isTopSeller: true
            },
            {
                restaurantId: restaurant._id,
                categoryId: catMeals._id,
                title: 'Grill Kings Meal (Two People)',
                shortDescription: 'Kebab + kofta + quarter chicken + basmati rice + tahini, salad, and bread',
                fullDescription: 'A meal for two featuring premium traditional grills, rice, and salads.',
                price: 360,
                discountPrice: 320,
                images: ['https://images.unsplash.com/photo-1544025162-d76694265947'],
                isAvailable: true,
                isFeatured: true,
                isDeal: true,
                isTopSeller: true
            },
            {
                restaurantId: restaurant._id,
                categoryId: catAppetizers._id,
                title: 'Abu Qoura Premium Salad Platter',
                shortDescription: 'Tahini + baba ghanoush + traditional salad + pickles + garlic sauce',
                price: 50,
                discountPrice: 40,
                images: ['https://images.unsplash.com/photo-1540420773420-3366772f4999'],
                isAvailable: true,
                isFeatured: false,
                isDeal: false,
                isTopSeller: false
            },
            {
                restaurantId: restaurant._id,
                categoryId: catDesserts._id,
                title: 'Om Ali with Clarified Butter and Nuts',
                shortDescription: 'Warm Om Ali clay pot with traditional cream and toasted nuts',
                price: 65,
                discountPrice: 55,
                images: ['https://images.unsplash.com/photo-1551024709-8f23befc6f87'],
                isAvailable: true,
                isFeatured: true,
                isDeal: true,
                isTopSeller: true
            }
        ];

        await Product.insertMany(products);

        // 🛵 4. Create delivery areas
        await DeliveryArea.insertMany([
            { restaurantId: restaurant._id, areaName: 'Downtown / Al-Muizz', deliveryFee: 15, estimatedDeliveryMinutes: 25 },
            { restaurantId: restaurant._id, areaName: 'Maadi and Zahraa', deliveryFee: 25, estimatedDeliveryMinutes: 35 },
            { restaurantId: restaurant._id, areaName: 'Nasr City and Heliopolis', deliveryFee: 30, estimatedDeliveryMinutes: 40 },
            { restaurantId: restaurant._id, areaName: 'Giza and Mohandessin', deliveryFee: 35, estimatedDeliveryMinutes: 45 }
        ]);

        // 🎟️ 5. Create the discount code
        await Coupon.create({
            restaurantId: restaurant._id,
            code: 'SAVE20',
            discountType: 'percentage',
            discountValue: 20,
            minOrderValue: 100,
            maxDiscountAmount: 100,
            isActive: true
        });

        console.log('✅ [AI Studio] Initial database seed completed successfully!');
    } catch (e) {
        console.error('⚠️ [AI Studio] Database seed error:', e.message);
    }
};

const connectDB = async () => {
    try {
        if (process.env.MONGO_URI) {
            // 🔒 Guard: a URI without a database name silently falls back to the
            // 'test' database, which caused production data to diverge across two
            // databases. Refuse to connect in that ambiguous state.
            const uriAfterSlashes = process.env.MONGO_URI.split('://')[1] || '';
            const pathAfterHost = uriAfterSlashes.split('/')[1] || '';
            const dbName = pathAfterHost.split('?')[0];
            if (!dbName) {
                throw new Error(
                    'MONGO_URI has no database name (e.g. mongodb.net/<db-name>?...). ' +
                    'Connecting without one would silently use the wrong "test" database. ' +
                    'Add the intended database name to MONGO_URI.'
                );
            }

            const conn = await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 5000
            });
            console.log(`✅ MongoDB Connected: ${conn.connection.host} | Database: ${conn.connection.name}`);
            await seedDatabase();
            return;
        }

        console.log('⚡ [AI Studio] Starting MongoMemoryServer for standalone execution...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create();
        const uri = mongoMemoryServer.getUri();

        const conn = await mongoose.connect(uri);
        console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);
        await seedDatabase();
    } catch (error) {
        // ❌ Never continue serving the API without a database connection:
        // fail fast so the real error is visible instead of requests hanging
        // on Mongoose buffering and timing out with misleading 500s.
        console.error(`❌ Database Connection Error: ${error.message}`);
        throw error;
    }
};

module.exports = connectDB;
