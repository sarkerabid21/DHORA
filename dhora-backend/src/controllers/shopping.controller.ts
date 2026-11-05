import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/product.model';

const isDbConnected = (): boolean => mongoose.connection.readyState === 1;

const SEED_CURATED_PRODUCTS = [
  {
    title: 'Aarong Embroidered Fine Cotton Kurta',
    description: 'Heritage Bangladeshi design featuring delicate Kantha stitch embroidery on lightweight pure cotton.',
    merchantName: 'Aarong',
    category: 'TRADITIONAL',
    price: 3600,
    discountPrice: 3200,
    currency: 'BDT',
    images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600'],
    affiliateUrl: 'https://aarong.com/men/panjabi',
    inStock: true,
    tags: ['Festive', 'Traditional', 'Summer'],
  },
  {
    title: 'Sailor Raw Japanese Selvedge Denim',
    description: '13.5oz premium Japanese raw selvedge denim woven on vintage shuttle looms. Slim tapered fit.',
    merchantName: 'Sailor',
    category: 'BOTTOMS',
    price: 3200,
    discountPrice: 2850,
    currency: 'BDT',
    images: ['https://images.unsplash.com/photo-1542272604-780c96856592?w=600'],
    affiliateUrl: 'https://sailor.clothing/denim',
    inStock: true,
    tags: ['Staple', 'Selvedge', 'Streetwear'],
  },
  {
    title: 'Taaga Contemporary Block Print Kaftan',
    description: 'Relaxed modern silhouette with traditional hand-block geometric printing on breathable modal fabric.',
    merchantName: 'Taaga',
    category: 'DRESSES',
    price: 2450,
    currency: 'BDT',
    images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600'],
    affiliateUrl: 'https://aarong.com/taaga',
    inStock: true,
    tags: ['Contemporary', 'Casual'],
  },
  {
    title: 'Klothe 240 GSM Heavyweight Streetwear Hoodie',
    description: 'Minimalist boxy drop-shoulder cut crafted from ultra-soft combed fleece cotton.',
    merchantName: 'Klothe',
    category: 'OUTERWEAR',
    price: 1950,
    discountPrice: 1650,
    currency: 'BDT',
    images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600'],
    affiliateUrl: 'https://klothe.com/hoodies',
    inStock: true,
    tags: ['Streetwear', 'Winter', 'Oversized'],
  },
  {
    title: 'Apex Royal Hand-Finished Penny Loafers',
    description: 'Full-grain Italian calf leather upper with Blake stitched leather sole and cushioned arch support.',
    merchantName: 'Apex',
    category: 'FOOTWEAR',
    price: 5200,
    discountPrice: 4800,
    currency: 'BDT',
    images: ['https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600'],
    affiliateUrl: 'https://apexfootwear.com/men/formal',
    inStock: true,
    tags: ['Formal', 'Smart Casual', 'Leather'],
  },
];

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;

    if (isDbConnected()) {
      try {
        const filter: any = {};
        if (category && category !== 'ALL' && category !== 'All') {
          filter.category = (category as string).toUpperCase();
        }
        if (minPrice || maxPrice) {
          filter.price = {};
          if (minPrice) filter.price.$gte = Number(minPrice);
          if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        if (search) {
          const regex = new RegExp(search as string, 'i');
          filter.$or = [{ title: regex }, { merchantName: regex }, { tags: regex }];
        }

        let products = await Product.find(filter).sort({ createdAt: -1 });

        // Seed initial curated products if empty
        if (products.length === 0 && !search && (!category || category === 'ALL')) {
          await Product.insertMany(SEED_CURATED_PRODUCTS);
          products = await Product.find().sort({ createdAt: -1 });
        }

        res.status(200).json({
          success: true,
          count: products.length,
          data: products,
        });
        return;
      } catch (dbErr) {}
    }

    // Resilient fallback mode
    let fallback = SEED_CURATED_PRODUCTS.map((p, idx) => ({
      _id: `prod_seed_${idx + 1}`,
      ...p,
      createdAt: new Date(),
    }));

    if (category && category !== 'ALL' && category !== 'All') {
      fallback = fallback.filter((p) => p.category.toUpperCase() === (category as string).toUpperCase());
    }
    if (search) {
      const q = (search as string).toLowerCase();
      fallback = fallback.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.merchantName.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (minPrice) fallback = fallback.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) fallback = fallback.filter((p) => p.price <= Number(maxPrice));

    res.status(200).json({
      success: true,
      count: fallback.length,
      data: fallback,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching fashion shopping catalog.',
    });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    if (isDbConnected()) {
      try {
        const product = await Product.findById(id).populate('merchantId');
        if (product) {
          res.status(200).json({ success: true, data: product });
          return;
        }
      } catch (err) {}
    }

    const found = SEED_CURATED_PRODUCTS.find((p, idx) => `prod_seed_${idx + 1}` === id || p.title.includes(id));
    if (found) {
      res.status(200).json({
        success: true,
        data: { _id: id, ...found },
      });
      return;
    }

    res.status(404).json({ success: false, message: 'Product not found.' });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching product details.',
    });
  }
};
