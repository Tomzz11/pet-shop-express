import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// @desc    Get cart by user ID
// @route   GET /api/cart
// @access  Private
export const getCartByUserId = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate("items.product");

    if (!cart) {
      return res.json({
        success: true,
        data: { items: [] },
      });
    }

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Get Cart By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าในตะกร้า",
    });
  }
};

// @desc    Create new cart
// @route   POST /api/cart
// @access  Private
export const createCart = async (req, res) => {
  try {
    const { items } = req.body;

    const existingCart = await Cart.findOne({ userId: req.user._id });

    if (existingCart) {
      return res.status(400).json({
        success: false,
        message: "มีตะกร้าสินค้าอยู่แล้ว กรุณาใช้ PUT /api/cart แทน",
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ",
      });
    }

    // Fetch all products at once
    const productIds = items.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const cartItems = [];

    for (const item of items) {
      const product = productMap.get(item.product.toString());

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `ไม่พบสินค้า ID: ${item.product}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `สินค้า ${product.name} มีไม่เพียงพอ (เหลือ ${product.stock} ชิ้น)`,
        });
      }

      cartItems.push({
        product: product._id,
        quantity: item.quantity,
      });
    }

    const cart = await Cart.create({
      userId: req.user._id,
      items: cartItems,
    });

    await cart.populate("items.product");

    res.status(201).json({
      success: true,
      message: "สร้างตะกร้าสินค้าสำเร็จ",
      data: cart,
    });
  } catch (error) {
    console.error("Create Cart Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการสร้างตะกร้าสินค้า",
    });
  }
};

// @desc    Update cart (replace all items)
// @route   PUT /api/cart
// @access  Private
export const updateCart = async (req, res) => {
  try {
    const { items } = req.body;

    // If items is empty, delete the cart
    if (!items || items.length === 0) {
      await Cart.findOneAndDelete({ userId: req.user._id });
      return res.json({
        success: true,
        message: "ล้างตะกร้าสินค้าสำเร็จ",
        data: { items: [] },
      });
    }

    // Fetch all products at once
    const productIds = items.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const cartItems = [];

    for (const item of items) {
      const product = productMap.get(item.product.toString());

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `ไม่พบสินค้า ID: ${item.product}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `สินค้า ${product.name} มีไม่เพียงพอ (เหลือ ${product.stock} ชิ้น)`,
        });
      }

      cartItems.push({
        product: product._id,
        quantity: item.quantity,
      });
    }

    const cart = await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { items: cartItems },
      { new: true, upsert: true, runValidators: true }
    ).populate("items.product");

    res.json({
      success: true,
      message: "อัปเดตตะกร้าสินค้าสำเร็จ",
      data: cart,
    });
  } catch (error) {
    console.error("Update Cart Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการอัปเดตตะกร้าสินค้า",
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user._id });

    res.json({
      success: true,
      message: "ล้างตะกร้าสินค้าสำเร็จ",
    });
  } catch (error) {
    console.error("Clear Cart Error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการล้างตะกร้าสินค้า",
    });
  }
};


