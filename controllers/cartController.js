import Cart from '../models/Cart.js';
import Product from '../models/Product.js';


// @desc    Get cart by ID
// @route   GET /api/cart
// @access  Private
export const getCartByUserId = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id});

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคำสั่งซื้อ'
      });
    }

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Get Cart By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าในตะกร้า'
    });
  }
};

// @desc    Create new cart
// @route   POST /api/cart
// @access  Private
export const createCart = async (req, res) => {
  try {
    const { items } = req.body;
    const cartItem = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

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
      cartItem.push({
        product: product._id,
        quantity: item.quantity,
      })
    }

    // สร้าง cart
    const cart = await Cart.create({
      userId: req.user._id,
      items: cartItem,
    });

    res.status(201).json({
      success: true,
      message: 'เพิ่มสินค้าในตะกร้าสำเร็จ',
      data: cart
    });
  } catch (error) {
    console.error('Add to cart Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการเพิ่มสินค้าลงตะกร้า'
    });
  }
};


