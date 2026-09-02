const Product = require('../models/Product');
const Category = require('../models/Category');
const Restaurant = require('../models/Restaurant');
const mongoose = require('mongoose');
const cache = require('../utils/cache');

/**
 * متحكم الأصناف والوجبات الفائق السرعة بـ MongoDB Atlas
 * McDonald's Grade Fast Product Controller with Lean Queries & Fast Retrieval
 * ⚡ مزود بكاش داخل الذاكرة لتخفيف الضغط على القاعدة في مسارات القراءة الحرجة
 */

// تخزين معرف المطعم في الذاكرة المؤقتة لتسريع الاستعلامات وتجنب تكرار قراءة جدول المطعم في كل طلب
let cachedRestaurantId = null;

async function getAbuQouraRestaurantId() {
    if (cachedRestaurantId) return cachedRestaurantId;
    let restaurant = await Restaurant.findOne({ slug: 'abu-qoura' }).select('_id').lean();
    if (!restaurant) {
        restaurant = await Restaurant.create({ name: 'مطبخ أبو قورة الفلاحي', slug: 'abu-qoura' });
    }
    cachedRestaurantId = restaurant._id;
    return cachedRestaurantId;
}

const PRODUCTS_CACHE_PREFIX = 'products:list:';
const PRODUCT_ITEM_CACHE_PREFIX = 'products:item:';
const PRODUCTS_CACHE_TTL = 3 * 60 * 1000; // 3 دقائق (المنتجات ممكن تتغير أكتر من الأقسام - مخزون، توفر...)

// 1. جلب الوجبات والأصناف مع الفلترة، البحث النصي، والفرز التلقائي بسرعة فائقة بـ .lean() والترقيم المتزايد
exports.getProducts = async (req, res) => {
    try {
        const { 
            category, 
            search, 
            minPrice, 
            maxPrice, 
            isAvailable, 
            isFeatured, 
            isDeal, 
            isTopSeller, 
            isNewArrival, 
            sort, 
            page = 1, 
            limit = 12 
        } = req.query;

        // ⚡ مفتاح كاش فريد لكل تركيبة فلاتر/بحث/ترقيم
        const cacheKey = `${PRODUCTS_CACHE_PREFIX}${JSON.stringify(req.query)}`;
        const cached = cache.get(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        let query = {};
        const restaurantId = await getAbuQouraRestaurantId();
        query.restaurantId = restaurantId;

        // الفلترة حسب القسم
        if (category && category !== 'all') {
            if (mongoose.Types.ObjectId.isValid(category)) {
                query.categoryId = category;
            } else {
                const categoryObj = await Category.findOne({ name: category }).select('_id').lean();
                if (categoryObj) {
                    query.categoryId = categoryObj._id;
                } else {
                    const escapedCat = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    query.$or = [
                        { title: { $regex: escapedCat, $options: 'i' } },
                        { keywords: { $in: [new RegExp(escapedCat, 'i')] } }
                    ];
                }
            }
        }

        // البحث النصي بالاسم والوصف والكلمات المفتاحية
        if (search && search.trim()) {
            const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const searchRegex = new RegExp(escapedSearch, 'i');
            const searchOr = [
                { title: searchRegex },
                { shortDescription: searchRegex },
                { keywords: { $in: [searchRegex] } }
            ];
            if (query.$or) {
                query.$and = [{ $or: query.$or }, { $or: searchOr }];
                delete query.$or;
            } else {
                query.$or = searchOr;
            }
        }

        if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
        if (isDeal !== undefined) query.isDeal = isDeal === 'true';
        if (isTopSeller !== undefined) query.isTopSeller = isTopSeller === 'true';
        if (isNewArrival !== undefined) query.isNewArrival = isNewArrival === 'true';

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (isAvailable !== undefined) {
            query.isAvailable = isAvailable === 'true';
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'price_asc') sortOption = { price: 1 };
        if (sort === 'price_desc') sortOption = { price: -1 };
        if (sort === 'top_sales') sortOption = { salesCount: -1 };
        if (sort === 'rating') sortOption = { rating: -1 };

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
        const skip = (pageNum - 1) * limitNum;

        // تنفيذ استعلام جلب المنتجات مع استعلام العدد بالتوازي لتقليل وقت الاستجابة
        const [products, total] = await Promise.all([
            Product.find(query)
                .select('-fullDescription')
                .populate('categoryId', 'name nameEn icon')
                .sort(sortOption)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Product.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limitNum) || 1;
        const hasMore = pageNum < totalPages;

        const responsePayload = {
            success: true,
            count: products.length,
            total,
            page: pageNum,
            pages: totalPages,
            hasMore,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: totalPages,
                hasMore
            },
            products
        };

        cache.set(cacheKey, responsePayload, PRODUCTS_CACHE_TTL);

        res.json(responsePayload);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. جلب تفاصيل وجبة محددة بـ ID بسرعة فائقة وحماية المعرف لمنع CastError
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        // الفحص الصارم لمعرف المونجو لتفادي CastError
        if (!id || id === 'undefined' || id === 'null' || !mongoose.Types.ObjectId.isValid(id)) {
            // جلب أول وجبة متاحة بـ MongoDB تلقائياً إذا كان المعرف غير صالح
            const firstProduct = await Product.findOne({ isAvailable: true }).populate('categoryId', 'name nameEn icon').lean();
            if (firstProduct) {
                const similar = await Product.find({ _id: { $ne: firstProduct._id }, isAvailable: true }).limit(4).lean();
                return res.json({ success: true, product: firstProduct, similarProducts: similar });
            }
            return res.status(404).json({ success: false, message: 'لا توجد وجبات مسجلة في قاعدة البيانات' });
        }

        // ⚡ محاولة القراءة من الكاش أولاً بمفتاح المعرف
        const cacheKey = `${PRODUCT_ITEM_CACHE_PREFIX}${id}`;
        const cached = cache.get(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const product = await Product.findById(id).populate('categoryId', 'name nameEn icon').lean();

        if (!product) {
            // إذا لم يتم العثور على المعرف بالتحديد، نرجع أحدث وجبة حقيقية بـ MongoDB
            const fallbackProduct = await Product.findOne({ isAvailable: true }).populate('categoryId', 'name nameEn icon').lean();
            if (fallbackProduct) {
                const similar = await Product.find({ _id: { $ne: fallbackProduct._id }, isAvailable: true }).limit(4).lean();
                return res.json({ success: true, product: fallbackProduct, similarProducts: similar });
            }
            return res.status(404).json({ success: false, message: 'الوجبة غير موجودة بقاعدة البيانات' });
        }

        const similarProducts = await Product.find({
            categoryId: product.categoryId ? product.categoryId._id : null,
            _id: { $ne: product._id },
            isAvailable: true
        }).limit(4).lean();

        const responsePayload = {
            success: true,
            product,
            similarProducts
        };

        cache.set(cacheKey, responsePayload, PRODUCTS_CACHE_TTL);

        res.json(responsePayload);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. إنشاء وجبة تجارية جديدة بـ MongoDB Atlas
exports.createProduct = async (req, res) => {
    try {
        const { 
            title, 
            titleEn, 
            shortDescription, 
            fullDescription, 
            price, 
            discountPrice, 
            category, 
            images, 
            sizes, 
            addons, 
            keywords,
            stockQuantity,
            maxOrderLimit,
            isAvailable, 
            isFeatured,
            isDeal,
            isTopSeller,
            isNewArrival
        } = req.body;

        if (!title || price === undefined) {
            return res.status(400).json({ success: false, message: 'يرجى إدخال اسم الوجبة والسعر الأساسي' });
        }

        let restaurant = await Restaurant.findOne({ slug: 'abu-qoura' });
        if (!restaurant) restaurant = await Restaurant.create({ name: 'مطبخ أبو قورة الفلاحي', slug: 'abu-qoura' });

        let categoryObj = await Category.findOne({ name: category || 'عام' });
        if (!categoryObj) {
            categoryObj = await Category.create({ restaurantId: restaurant._id, name: category || 'عام' });
        }

        let parsedKeywords = [];
        if (keywords) {
            parsedKeywords = Array.isArray(keywords) ? keywords : keywords.split(',').map(k => k.trim());
        }

        const product = new Product({
            restaurantId: restaurant._id,
            categoryId: categoryObj._id,
            title,
            titleEn: titleEn || '',
            shortDescription: shortDescription || '',
            fullDescription: fullDescription || shortDescription || '',
            price: Number(price),
            discountPrice: Number(discountPrice) || 0,
            images: images && images.length ? images : ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1'],
            sizes: sizes || [],
            addons: addons || [],
            keywords: parsedKeywords,
            stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : 100,
            maxOrderLimit: maxOrderLimit !== undefined ? Number(maxOrderLimit) : 10,
            isAvailable: isAvailable !== undefined ? isAvailable : true,
            isFeatured: isFeatured !== undefined ? isFeatured : false,
            isDeal: isDeal !== undefined ? isDeal : false,
            isTopSeller: isTopSeller !== undefined ? isTopSeller : false,
            isNewArrival: isNewArrival !== undefined ? isNewArrival : true
        });

        const createdProduct = await product.save();

        // ⚡ تفريغ كاش قوائم المنتجات فوراً (منتج جديد لازم يظهر في المنيو مباشرة)
        cache.delByPrefix(PRODUCTS_CACHE_PREFIX);

        const io = req.app.get('socketio');
        if (io) io.emit('products-updated', { type: 'CREATE', product: createdProduct });

        res.status(201).json({ 
            success: true, 
            message: '🎉 تم نشر وإدراج الوجبة بنجاح في قاعدة البيانات والمنيو!', 
            product: createdProduct 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. تعديل شامل للوجبة وأوسمتها ومخزونها في MongoDB Atlas
exports.updateProduct = async (req, res) => {
    try {
        const { category, keywords, price, discountPrice } = req.body;

        let updateData = { ...req.body };

        // ⚡ فحص آمن ومباشر لمطابقة سعر الخصم بالسعر الأساسي قبل حفظ التعديلات
        if (discountPrice && price && Number(discountPrice) > Number(price)) {
            return res.status(400).json({
                success: false,
                message: '🚫 سعر الخصم لا يمكن أن يكون أكبر من السعر الأساسي'
            });
        }

        if (category) {
            let categoryObj = await Category.findOne({ name: category });
            if (categoryObj) updateData.categoryId = categoryObj._id;
        }

        if (keywords && typeof keywords === 'string') {
            updateData.keywords = keywords.split(',').map(k => k.trim());
        }

        if (updateData.stockQuantity !== undefined && Number(updateData.stockQuantity) <= 0) {
            updateData.isAvailable = false;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true, runValidators: true }
        ).populate('categoryId', 'name nameEn');

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: 'الوجبة غير موجودة' });
        }

        // ⚡ تفريغ كاش القوائم وكاش عنصر المنتج نفسه فوراً بعد التعديل
        cache.delByPrefix(PRODUCTS_CACHE_PREFIX);
        cache.del(`${PRODUCT_ITEM_CACHE_PREFIX}${req.params.id}`);

        const io = req.app.get('socketio');
        if (io) io.emit('products-updated', { type: 'UPDATE', product: updatedProduct });

        res.json({ 
            success: true, 
            message: '✅ تم حفظ تعديلات الوجبة وتحديث المنيو بـ MongoDB بنجاح!', 
            product: updatedProduct 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. الحذف النهائي للوجبة من MongoDB Atlas والبث الحي
exports.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);

        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: 'الوجبة غير موجودة بقاعدة البيانات' });
        }

        // ⚡ تفريغ كاش القوائم وكاش عنصر المنتج نفسه فوراً بعد الحذف
        cache.delByPrefix(PRODUCTS_CACHE_PREFIX);
        cache.del(`${PRODUCT_ITEM_CACHE_PREFIX}${req.params.id}`);

        const io = req.app.get('socketio');
        if (io) io.emit('products-updated', { type: 'DELETE', productId: req.params.id });

        res.json({ 
            success: true, 
            message: '✅ تم حذف الوجبة بنجاح واختفائها الفوري من المنيو', 
            productId: req.params.id 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};