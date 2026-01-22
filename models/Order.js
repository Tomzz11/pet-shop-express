import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "จำนวนต้องมากกว่า 0"],
    },
    price: {
      type: Number,
      required: true,
      min: [0, "ราคาต้องไม่ติดลบ"],
    },
    image: {
      type: String,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: "ต้องมีสินค้าอย่างน้อย 1 รายการ",
      },
    },
    total: {
      type: Number,
      required: true,
      min: [0, "ยอดรวมต้องไม่ติดลบ"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "paid", "delivered", "cancelled"],
        message: "สถานะไม่ถูกต้อง",
      },
      default: "pending",
    },
    shippingAddress: {
      address: { type: String },
      city: { type: String },
      postalCode: { type: String },
      phone: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ userId: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;




