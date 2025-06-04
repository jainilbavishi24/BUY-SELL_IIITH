import express from 'express';
import Item from '../models/item.model.js';
import Order from '../models/order.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';


const router = express.Router();

export default router;

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




router.post('/',async (req,res)=>{
    const {transactionID,buyerID,sellerID,amount,hashedOTP} = req.body;
    if(!transactionID || !buyerID || !sellerID || !amount || !hashedOTP){
        return res.status(400).json({success:false,message:'All fields are required'});
    }
    try{
        const newOrder = new Order({transactionID,buyerID,sellerID,amount,hashedOTP});
        await newOrder.save();
        res.status(201).json({success:true,data:newOrder});
    }catch(err){
        console.error('Error saving order:',err);
        res.status(500).json({success:false,message:'Server error'});
    }
});

router.post('/',async (req,res)=>{
    const {fname,lname,email,age,contactNo,password} = req.body;
    if(!fname || !lname || !email || !age || !contactNo || !password){
        return res.status(400).json({success:false,message:'All fields are required'});
    }
    try{
        const newUser = new User({fname,lname,email,age,contactNo,password});
        await newUser.save();
        res.status(201).json({success:true,data:newUser});
    }catch(err){
        console.error('Error saving user:',err);
        res.status(500).json({success:false,message:'Server error'});
    }
});



router.get("/", async (req, res) => {
    try {
        const { categories } = req.query;
        let filter = {isActive: true};
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

router.get('/', async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json({ success: true, data: orders });
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ success: true, data: users });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

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


router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.status(200).json({ success: true, data: order });
    } catch (err) {
        console.error('Error fetching order:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

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

router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.status(200).json({ success: true, message: 'Order deleted' });
    } catch (err) {
        console.error('Error deleting order:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.put('/:id', async (req, res) => {
    const { name, price, description, category, sellerID, image, quantity } = req.body;

    if(!mongoose.Types.ObjectId.isValid(req.params.id)){
        return res.status(404).json({success:false,message:'Invalid item id'});
    }

    // Validate required fields
    if (!name || !price || !description || !category || !sellerID || !image || !quantity) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        const item = await Item.findByIdAndUpdate(req.params.id, { name, price, description, category, sellerID, image, quantity }, { new: true });
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        res.status(200).json({ success: true, data: item });
    } catch (err) {
        console.error('Error updating item:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.put('/:id', async (req, res) => {
    const {transactionID,buyerID,sellerID,amount,hashedOTP} = req.body;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({success:false,message:'Invalid order id'});
    }
    if(!transactionID || !buyerID || !sellerID || !amount || !hashedOTP){
        return res.status(400).json({success:false,message:'All fields are required'});
    }
    try{
        const order = await Order.findByIdAndUpdate(req.params.id,{transactionID,buyerID,sellerID,amount,hashedOTP},{new:true});
        if(!order){
            return res.status(404).json({success:false,message:'Order not found'});
        }
        res.status(200).json({success:true,data:order});
    }catch(err){
        console.error('Error updating order:',err);
        res.status(500).json({success:false,message:'Server error'});
    }
}
);

router.put('/:id', async (req, res) => {
    const {fname,lname,email,age,contactNo,password} = req.body;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({success:false,message:'Invalid user id'});
    }
    
    if(!fname || !lname || !email || !age || !contactNo || !password){
        return res.status(400).json({success:false,message:'All fields are required'});
    }
    try{
        const user = await User.findByIdAndUpdate(req.params.id,{fname,lname,email,age,contactNo,password},{new:true});
        if(!user){
            return res.status(404).json({success:false,message:'User not found'});
        }
        res.status(200).json({success:true,data:user});
    }catch(err){
        console.error('Error updating user:',err);
        res.status(500).json({success:false,message:'Server error'});
    }
}
);

router.get("/search", async (req, res) => {
    try {
      const { query, categories } = req.query;
  
      let filter = {};
  
      if (query) {
        filter.name = { $regex: query, $options: "i" }; 
      }
  
      if (categories) {
        const categoryArray = categories.split(",");
        filter.category = { $in: categoryArray };
      }
  
      const items = await Item.find(filter).populate("vendor");
      res.json({ success: true, items });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error });
    }
  });
  
  