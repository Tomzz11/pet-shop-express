import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'กรุณากรอกชื่อสินค้า'],
      trim: true,
      maxlength: [100, 'ชื่อสินค้าต้องไม่เกิน 100 ตัวอักษร']
    },
    description: {
      type: String,
      required: [true, 'กรุณากรอกรายละเอียดสินค้า'],
      maxlength: [2000, 'รายละเอียดต้องไม่เกิน 2000 ตัวอักษร']
    },
    price: {
      type: Number,
      required: [true, 'กรุณากรอกราคาสินค้า'],
      min: [0, 'ราคาต้องไม่ติดลบ']
    },
    category: {
      type: String,
      required: [true, 'กรุณาเลือกหมวดหมู่'],
      enum: {
        values: ['dog', 'cat', 'bird', 'fish', 'other'],
        message: 'หมวดหมู่ไม่ถูกต้อง'
      }
    },
    stock: {
      type: Number,
      required: [true, 'กรุณากรอกจำนวนสต็อก'],
      min: [0, 'สต็อกต้องไม่ติดลบ'],
      default: 0
    },
    image: {
      type: String,
      required: [true, 'กรุณาใส่ URL รูปภาพ'],
      default: 'https://via.placeholder.com/300x300?text=No+Image'
    }
  },
  {
    timestamps: true
  }
);

// Index สำหรับ search
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;
