import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,  // นี่จะสร้าง index อัตโนมัติแล้ว
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// ❌ ลบบรรทัดนี้ออก เพราะ unique: true สร้าง index ให้แล้ว
// cartSchema.index({ userId: 1 });

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;



