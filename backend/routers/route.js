import express from 'express';
import Item from '../models/item.model.js';
import Order from '../models/order.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';


const router = express.Router();

export default router;

// Create new item
router.post('/', async (req, res) => {
    const { name, price, description, category, sellerID, image } = req.body;

    if (!name || !price || !description || !category || !sellerID || !image) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        const newItem = new Item({ name, price, description, category, sellerID, image });
        await newItem.save();
        res.status(201).json({ success: true, data: newItem });
    } catch (err) {
        console.error('Error saving item:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});





// Search items (must come before /:id route)
router.get("/search", async (req, res) => {
    try {
      const { query, categories } = req.query;

      let filter = { status: "available", isActive: true };

      if (query) {
        filter.name = { $regex: query, $options: "i" };
      }

      if (categories) {
        const categoryArray = categories.split(",");
        filter.category = { $in: categoryArray };
      }

      const items = await Item.find(filter).populate("sellerID");
      res.json({ success: true, items });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error });
    }
});

// Get items with optional category filter
router.get("/", async (req, res) => {
    try {
        const { categories } = req.query;
        let filter = {status: "available", isActive: true};
        if (categories) {
            filter.category = { $in: categories.split(",") };
        }
        const items = await Item.find(filter);
        res.json({ success: true, items });
    } catch (error) {
        console.error("Error fetching items:", error);
        res.status(500).json({ success: false, message: "Error fetching items.", error: error.message });
    }
});

// Get item by ID
router.get('/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ success: false, message: 'Invalid item id' });
    }

    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        res.status(200).json({ success: true, data: item });
    } catch (err) {
        console.error('Error fetching item:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});



// Delete item by ID
router.delete('/:id', async (req, res) => {
    try {
        const item = await Item.findByIdAndDelete(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        res.status(200).json({ success: true, message: 'Item deleted' });
    } catch (err) {
        console.error('Error deleting item:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});



// Update item by ID
router.put('/:id', async (req, res) => {
    const { name, price, description, category, sellerID, image, quantity } = req.body;

    if(!mongoose.Types.ObjectId.isValid(req.params.id)){
        return res.status(404).json({success:false,message:'Invalid item id'});
    }

    // Validate required fields
    if (!name || !price || !description || !category || !sellerID || !image) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        const item = await Item.findByIdAndUpdate(req.params.id, { name, price, description, category, sellerID, image }, { new: true });
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        res.status(200).json({ success: true, data: item });
    } catch (err) {
        console.error('Error updating item:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});




  
  