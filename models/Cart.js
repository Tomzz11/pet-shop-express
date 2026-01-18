import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
  },
  {
    timestamps: true
  }
);
const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: {
      type: [cartItemSchema],
      required: true,
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: 'ต้องมีสินค้าอย่างน้อย 1 รายการ'
      }
    }
  },
  {
    timestamps: true
  }
);

// Index สำหรับ search
cartSchema.index({ name: 'text', description: 'text' });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
