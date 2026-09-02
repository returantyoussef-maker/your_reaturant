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

        // 🏢 1. إنشاء بيانات مطبخ أبو قورة الفلاحي
        const restaurant = await Restaurant.create({
            name: 'مطبخ أبو قورة الفلاحي',
            slug: 'abu-qoura',
            description: 'أشهى المأكولات والمشويات الفلاحية والبلدي الأصيل',
            whatsappPhone: '01120751467',
            phone: '01120751467',
            address: 'القاهرة - شارع المعز - مصر',
            currency: 'ج.م',
            isAcceptingOrders: true,
            openingTime: '00:00',
            closingTime: '23:59',
            workingHoursText: 'يومياً على مدار 24 ساعة'
        });

        // 📂 2. إنشاء الأقسام الرئيسية بالكامل
        const catKebabs = await Category.create({ restaurantId: restaurant._id, name: 'مشويات', icon: '🥩' });
        const catTawajen = await Category.create({ restaurantId: restaurant._id, name: 'طواجن بلدي', icon: '🍲' });
        const catMeals = await Category.create({ restaurantId: restaurant._id, name: 'وجبات كاملة', icon: '🍱' });
        const catAppetizers = await Category.create({ restaurantId: restaurant._id, name: 'سلطات ومقبلات', icon: '🥗' });
        const catDesserts = await Category.create({ restaurantId: restaurant._id, name: 'حلويات ومشروبات', icon: '🍹' });

        // 🍱 3. إنشاء الأصناف والوجبات بالكامل
        const products = [
            {
                restaurantId: restaurant._id,
                categoryId: catKebabs._id,
                title: 'كيلو كباب وكفتة ضاني فلاحي',
                shortDescription: 'مشويات ضاني بلدي مشوية على الفحم مع الطحينة والخبز البلدى الطازج',
                fullDescription: 'تشكيلة ممتازة من الكباب والفرك والكفتة الضاني البلدي.',
                price: 550,
                discountPrice: 490,
                images: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1'],
                isAvailable: true,
                isFeatured: true,
                isDeal: true,
                isTopSeller: true,
                sizes: [
                    { name: 'ربع كيلو', price: 140 },
                    { name: 'نصف كيلو', price: 260 },
                    { name: 'كيلو كامل', price: 490 }
                ],
                addons: [
                    { name: 'طحينة زياده', price: 15 },
                    { name: 'سلطة خضراء بلدي', price: 15 },
                    { name: 'مخلل فلاحي', price: 10 }
                ]
            },
            {
                restaurantId: restaurant._id,
                categoryId: catKebabs._id,
                title: 'فرخة مشوية على الفحم فلاحي',
                shortDescription: 'دجاج بلدي تتبيلة أبو قورة المخصوصة مشوي على الجمر',
                fullDescription: 'دجاج طازج متبل بالبهارات البلدية العريقة ومشوي على جمر الفحم الطبيعي.',
                price: 240,
                discountPrice: 210,
                images: ['https://images.unsplash.com/photo-1598515214211-89d3c73ae83b'],
                isAvailable: true,
                isFeatured: true,
                isDeal: true,
                isTopSeller: true,
                sizes: [
                    { name: 'نصف فرخة', price: 110 },
                    { name: 'فرخة كاملة', price: 210 }
                ]
            },
            {
                restaurantId: restaurant._id,
                categoryId: catTawajen._id,
                title: 'طاجن بامية باللحمة الضاني البلدي',
                shortDescription: 'بامية فلاحي بالسمن البلدي والصلصة المسبكة مع قطع اللحم الضاني الطري',
                fullDescription: 'طاجن فخار مسبك بالفرن البلدي، مطبوخ بالسمن البلدي الصافي والأعشاب الشرقية.',
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
                title: 'طاجن عكاوي بالبصل والبهارات',
                shortDescription: 'عكاوي بلدي دايبة في صوص البصل المكرمل والبهارات الفلاحية',
                fullDescription: 'طاجن فخار عكاوي دايبة ومطبوخة بعناية فائقة بالفرن الفلاحي.',
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
                title: 'وجبة ملوك المشويات (شخصين)',
                shortDescription: 'كباب + كفتة + ربع فرخة + أرز بسمتي + طحينة وسلطة وخبز',
                fullDescription: 'وجبة تكفي لشخصين من أجود أنواع المشويات البلدية مع الأرز والسلطات.',
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
                title: 'سرفيس سلطات أبو قورة الفاخر',
                shortDescription: 'طحينة + بابا غنوج + سلطة بلدي + مخلل فلاحي + ثومية',
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
                title: 'أم علي بالسمن البلدي والمكسرات',
                shortDescription: 'طاجن أم علي سخن بالقشطة البلدية والمكسرات المحمصة',
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

        // 🛵 4. إنشاء مناطق التوصيل
        await DeliveryArea.insertMany([
            { restaurantId: restaurant._id, areaName: 'وسط البلد / المعز', deliveryFee: 15, estimatedDeliveryMinutes: 25 },
            { restaurantId: restaurant._id, areaName: 'المعادي والزهراء', deliveryFee: 25, estimatedDeliveryMinutes: 35 },
            { restaurantId: restaurant._id, areaName: 'مدينة نصر والمصر الجديدة', deliveryFee: 30, estimatedDeliveryMinutes: 40 },
            { restaurantId: restaurant._id, areaName: 'الجيزة والمهندسين', deliveryFee: 35, estimatedDeliveryMinutes: 45 }
        ]);

        // 🎟️ 5. إنشاء كود الخصم
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
            const conn = await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 5000
            });
            console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
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
        console.error(`❌ Database Connection Error: ${error.message}`);
    }
};

module.exports = connectDB;