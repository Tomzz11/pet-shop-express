import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ไม่มีสินค้าในตะกร้า'
      });
    }

    // ตรวจสอบและคำนวณราคา
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `ไม่พบสินค้า ID: ${item.productId}`
        });
      }

      // ตรวจสอบ stock
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `สินค้า ${product.name} มีไม่เพียงพอ (เหลือ ${product.stock} ชิ้น)`
        });
      }

      orderItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        image: product.image
      });

      total += product.price * item.quantity;

      // ลด stock
      product.stock -= item.quantity;
      await product.save();
    }

    // สร้าง order
    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      total,
      shippingAddress,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'สั่งซื้อสำเร็จ',
      data: order
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ'
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get My Orders Error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ'
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'userId',
      'name email'
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคำสั่งซื้อ'
      });
    }

    // ตรวจสอบว่าเป็น order ของ user นี้หรือเป็น admin
    if (
      order.userId._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'ไม่มีสิทธิ์เข้าถึงคำสั่งซื้อนี้'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get Order By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ'
    });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคำสั่งซื้อ'
      });
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: 'อัปเดตสถานะสำเร็จ',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Update Order Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ'
    });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Get All Orders Error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ'
    });
  }
};



export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'userId',
      'name email'
    );


    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบออเดอร์'
      });
    }

    await order.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'ลบออเดอร์สำเร็จ'
    });
  } catch (error) {
    console.error('Delete Product Error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบสินค้า'
    });
  }
};
