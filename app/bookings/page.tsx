"use client";

import { FormEvent, useEffect, useState } from "react";
import QRCode from "qrcode";

type Product = {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  imageUrl: string;
  category: string;
  event?: string | null;
};

const UPI_ID = "9900960918@ybl";

export default function BookingsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedBouquet, setSelectedBouquet] = useState("");
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);
  const [cartProducts, setCartProducts] =
    useState<Product[]>([]);
  const [loadingProduct, setLoadingProduct] =
    useState(true);

  const [deliveryAddress, setDeliveryAddress] =
    useState("");

  const isCartCheckout = cartProducts.length > 0;

  const cartTotal = cartProducts.reduce(
    (total, product) => total + product.price,
    0
  );

  const orderSubtotal = isCartCheckout
    ? cartTotal
    : selectedProduct?.price || 0;

  const deliveryCharge =
    deliveryAddress
      .toLowerCase()
      .includes("bengaluru") ||
    deliveryAddress
      .toLowerCase()
      .includes("bangalore")
      ? 0
      : deliveryAddress.trim().length > 0
        ? 100
        : 0;

  const orderTotal =
    orderSubtotal + deliveryCharge;

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const productName =
      params.get("product") || "";

    setSelectedBouquet(productName);

    try {
      const savedCart = JSON.parse(
        localStorage.getItem("Aurivon-cart") || "[]"
      );

      if (
        Array.isArray(savedCart) &&
        savedCart.length > 0
      ) {
        setCartProducts(savedCart);
      }
    } catch (error) {
      console.error(
        "Unable to load cart:",
        error
      );
    }

    async function loadProduct() {
      if (!productName) {
        setLoadingProduct(false);
        return;
      }

      try {
        const response = await fetch(
          "/api/products"
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load products."
          );
        }

        const products: Product[] =
          await response.json();

        const databaseProduct =
          products.find(
            (product) =>
              product.name.toLowerCase() ===
              productName.toLowerCase()
          );

        if (databaseProduct) {
          setSelectedProduct(
            databaseProduct
          );
        }
      } catch (error) {
        console.error(
          "Product loading error:",
          error
        );
      } finally {
        setLoadingProduct(false);
      }
    }

    loadProduct();
  }, []);

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = String(
      formData.get("name") || ""
    ).trim();

    const phone = String(
      formData.get("phone") || ""
    ).trim();

    const date = String(
      formData.get("date") || ""
    ).trim();

    const address = String(
      formData.get("address") || ""
    ).trim();

    setDeliveryAddress(address);

    const message = String(
      formData.get("message") || ""
    ).trim();

    const bouquet = selectedBouquet;

    const newErrors: Record<string, string> =
      {};

    if (!name) {
      newErrors.name =
        "Please enter your name.";
    } else if (name.length < 2) {
      newErrors.name =
        "Name must contain at least 2 characters.";
    } else if (
      !/^[A-Za-z\s]+$/.test(name)
    ) {
      newErrors.name =
        "Please enter a valid name.";
    }

    const phoneDigits =
      phone.replace(/\D/g, "");

    if (!phone) {
      newErrors.phone =
        "Please enter your phone number.";
    } else if (
      phoneDigits.length < 10 ||
      phoneDigits.length > 15
    ) {
      newErrors.phone =
        "Please enter a valid phone number.";
    }

    if (
      !isCartCheckout &&
      (!bouquet || !selectedProduct)
    ) {
      newErrors.bouquet =
        "No valid product was selected. Please return to the home page and choose a product.";
    }

    if (
      isCartCheckout &&
      cartProducts.length === 0
    ) {
      newErrors.bouquet =
        "Your cart is empty.";
    }

    if (!date) {
      newErrors.date =
        "Please select a delivery date.";
    } else {
      const selectedDate =
        new Date(date);

      const today = new Date();

      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date =
          "Delivery date cannot be in the past.";
      }
    }

    if (!address) {
      newErrors.address =
        "Please enter your delivery address.";
    } else if (address.length < 10) {
      newErrors.address =
        "Please enter a more complete delivery address.";
    }

    if (!paymentMethod) {
      newErrors.paymentMethod =
        "Please select a payment method.";
    }

    setErrors(newErrors);

    if (
      Object.keys(newErrors).length > 0
    ) {
      return;
    }

    try {
      const productNames = isCartCheckout
        ? cartProducts
            .map((product) => product.name)
            .join(", ")
        : selectedProduct!.name;

      const response = await fetch(
        "/api/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
            phone,
            bouquet: isCartCheckout
              ? productNames
              : bouquet,
            date,
            address,
            message,
            paymentMethod,
            cartItems: isCartCheckout
              ? cartProducts
              : [],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Booking failed"
        );
      }

      setBookingId(data.bookingId);

      const paymentText =
        paymentMethod === "pay-now"
          ? `UPI Payment - ₹${orderTotal.toLocaleString(
              "en-IN"
            )}`
          : "Cash on Delivery";

      const productImageLines =
        isCartCheckout
          ? cartProducts
              .map(
                (product) =>
                  `${product.name}: ${product.imageUrl}`
              )
              .join("\n")
          : selectedProduct!.imageUrl;

      const whatsappMessage = `Hello Aurivon,

I have placed a bouquet/gift booking.

Booking ID: ${data.bookingId}
Name: ${name}
Phone: ${phone}
Products: ${productNames}
Products Subtotal: ₹${orderSubtotal.toLocaleString(
        "en-IN"
      )}
Delivery Charge: ${
        deliveryCharge === 0
          ? "FREE"
          : `₹${deliveryCharge.toLocaleString(
              "en-IN"
            )}`
      }
Total Price: ₹${orderTotal.toLocaleString(
        "en-IN"
      )}
Delivery Date: ${date}
Delivery Address: ${address}
Payment Method: ${paymentText}
Message: ${message || "None"}

Product Images:
${productImageLines}

Please confirm my order. Thank you! 🌸`;

      const whatsappUrl =
        `https://wa.me/919845507955?text=${encodeURIComponent(
          whatsappMessage
        )}`;

      window.open(
        whatsappUrl,
        "_blank"
      );

      localStorage.removeItem(
        "Aurivon-cart"
      );

      setCartProducts([]);
      setSubmitted(true);
    } catch (error) {
      console.error(
        "Booking error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Unable to save booking. Please try again."
      );
    }
  }

  return (
    <main className="booking-page">
      {submitted ? (
        <div
          className="success-message"
          style={{
            maxWidth: "650px",
            margin: "0 auto",
          }}
        >
          <p className="eyebrow">
            ORDER RECEIVED
          </p>

          <h1>
            Thank you! 🌸
          </h1>

          <p>
            Your bouquet or gift booking has
            been received successfully.
          </p>

          <div
            style={{
              marginTop: "24px",
              padding: "24px",
              borderRadius: "18px",
              background: "#f8eef2",
              border: "1px solid #eadde1",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#8b747d",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "1.5px",
              }}
            >
              YOUR BOOKING ID
            </p>

            <h2
              style={{
                margin: "10px 0",
                color: "#71384e",
                fontSize: "24px",
                wordBreak: "break-all",
              }}
            >
              {bookingId}
            </h2>

            <p
              style={{
                margin: 0,
                color: "#76666b",
                fontSize: "14px",
              }}
            >
              Keep this Booking ID safe. You can
              use it to track your order anytime.
            </p>
          </div>

          <a
            href={`/track?bookingId=${encodeURIComponent(
              bookingId
            )}`}
            className="primary-button"
            style={{
              display: "inline-flex",
              marginTop: "20px",
              textDecoration: "none",
            }}
          >
            Track Your Order
          </a>

          <p
            style={{
              marginTop: "20px",
              color: "#76666b",
            }}
          >
            Your booking details have also
            been prepared for WhatsApp. Please
            press Send in WhatsApp to notify
            Aurivon.
          </p>
        </div>
      ) : (
        <section className="booking-card">
          <p className="eyebrow">
            PLACE YOUR ORDER
          </p>

          <h1>
            {isCartCheckout
              ? "Complete Your Cart Order"
              : "Complete Your Order"}
          </h1>

          <p className="booking-intro">
            Fill in your details and we'll
            prepare your order with care.
          </p>

          {/* Cart Products */}
          {isCartCheckout ? (
            <div
              style={{
                marginBottom: "24px",
                padding: "16px",
                borderRadius: "12px",
                background: "#f8f5f0",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  opacity: 0.7,
                }}
              >
                Products in Your Cart
              </p>

              <div
                style={{
                  display: "grid",
                  gap: "14px",
                  marginTop: "14px",
                }}
              >
                {cartProducts.map(
                  (product, index) => (
                    <div
                      key={`${product.id}-${index}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                      }}
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        style={{
                          width: "70px",
                          height: "70px",
                          objectFit: "cover",
                          borderRadius: "10px",
                        }}
                      />

                      <div
                        style={{
                          flex: 1,
                        }}
                      >
                        <strong>
                          {product.name}
                        </strong>

                        <p
                          style={{
                            margin: "4px 0 0",
                            color: "#71384e",
                            fontWeight: 700,
                          }}
                        >
                          ₹
                          {product.price.toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div
                style={{
                  marginTop: "18px",
                  paddingTop: "16px",
                  borderTop:
                    "1px solid #e5d8dc",
                  display: "flex",
                  justifyContent:
                    "space-between",
                  fontWeight: 700,
                  fontSize: "18px",
                }}
              >
                <span>
                  Products Subtotal
                </span>

                <span
                  style={{
                    color: "#71384e",
                  }}
                >
                  ₹
                  {cartTotal.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>
            </div>
          ) : (
            /* Single Product */
            <div
              style={{
                marginBottom: "24px",
                padding: "16px",
                borderRadius: "12px",
                background: "#f8f5f0",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  opacity: 0.7,
                }}
              >
                Selected Product
              </p>

              <h2
                style={{
                  margin: "6px 0 0",
                }}
              >
                {loadingProduct
                  ? "Loading product..."
                  : selectedBouquet ||
                    "No product selected"}
              </h2>

              {selectedProduct && (
                <>
                  <p
                    style={{
                      margin: "6px 0 0",
                      fontWeight: 600,
                    }}
                  >
                    ₹
                    {selectedProduct.price.toLocaleString(
                      "en-IN"
                    )}
                  </p>

                  <img
                    src={
                      selectedProduct.imageUrl
                    }
                    alt={
                      selectedProduct.name
                    }
                    style={{
                      width: "100%",
                      maxWidth: "220px",
                      marginTop: "14px",
                      borderRadius: "12px",
                    }}
                  />
                </>
              )}
            </div>
          )}

          {errors.bouquet && (
            <p className="error-message">
              {errors.bouquet}
            </p>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="form-group">
              <label htmlFor="name">
                Your Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
              />

              {errors.name && (
                <p className="error-message">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                Phone Number
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
              />

              {errors.phone && (
                <p className="error-message">
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="date">
                Delivery Date
              </label>

              <input
                id="date"
                name="date"
                type="date"
              />

              {errors.date && (
                <p className="error-message">
                  {errors.date}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="address">
                Delivery Address
              </label>

              <textarea
                id="address"
                name="address"
                placeholder="Enter your delivery address"
                rows={4}
                value={deliveryAddress}
                onChange={(e) =>
                  setDeliveryAddress(
                    e.target.value
                  )
                }
              />

              {errors.address && (
                <p className="error-message">
                  {errors.address}
                </p>
              )}
            </div>

            {/* Order Summary */}
            <div
              style={{
                marginBottom: "24px",
                padding: "18px",
                borderRadius: "12px",
                background: "#f8f5f0",
                border: "1px solid #e5d8dc",
              }}
            >
              <h2
                style={{
                  margin: "0 0 14px",
                  fontSize: "20px",
                }}
              >
                Order Summary
              </h2>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  gap: "20px",
                  marginBottom: "8px",
                }}
              >
                <span>
                  Products Subtotal
                </span>

                <strong>
                  ₹
                  {orderSubtotal.toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  gap: "20px",
                  marginBottom: "12px",
                }}
              >
                <span>
                  Delivery Charge
                </span>

                <strong>
                  {deliveryAddress.trim().length ===
                  0
                    ? "Enter address"
                    : deliveryCharge === 0
                      ? "FREE"
                      : `₹${deliveryCharge.toLocaleString(
                          "en-IN"
                        )}`}
                </strong>
              </div>

              <div
                style={{
                  paddingTop: "12px",
                  borderTop:
                    "1px solid #e5d8dc",
                  display: "flex",
                  justifyContent:
                    "space-between",
                  gap: "20px",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#71384e",
                }}
              >
                <span>
                  Total
                </span>

                <span>
                  ₹
                  {orderTotal.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <p
                style={{
                  margin: "12px 0 0",
                  fontSize: "13px",
                  opacity: 0.7,
                }}
              >
                Bengaluru delivery is free.
                Delivery to other locations is
                ₹100.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="message">
                Message (Optional)
              </label>

              <textarea
                id="message"
                name="message"
                placeholder="Add a personal message..."
                rows={4}
              />
            </div>

            <div className="payment-section">
              <h2>
                Choose Payment Method
              </h2>

              <div className="payment-options">
                <button
                  type="button"
                  className={
                    paymentMethod ===
                    "pay-now"
                      ? "payment-option active"
                      : "payment-option"
                  }
                  onClick={() =>
                    setPaymentMethod(
                      "pay-now"
                    )
                  }
                >
                  <strong>
                    Pay Now
                  </strong>

                  <span>
                    Pay exact amount using UPI
                    QR
                  </span>
                </button>

                <button
                  type="button"
                  className={
                    paymentMethod === "cod"
                      ? "payment-option active"
                      : "payment-option"
                  }
                  onClick={() =>
                    setPaymentMethod(
                      "cod"
                    )
                  }
                >
                  <strong>
                    Cash on Delivery
                  </strong>

                  <span>
                    Pay when your order is
                    delivered
                  </span>
                </button>
              </div>

              {errors.paymentMethod && (
                <p className="error-message">
                  {errors.paymentMethod}
                </p>
              )}

              {paymentMethod ===
                "pay-now" &&
                orderTotal > 0 && (
                  <UPIPayment
                    amount={orderTotal}
                    productName={
                      isCartCheckout
                        ? "Aurivon Cart Order"
                        : selectedProduct?.name ||
                          "Aurivon Order"
                    }
                  />
                )}
            </div>

            <button
              type="submit"
              disabled={
                loadingProduct ||
                (!selectedProduct &&
                  !isCartCheckout)
              }
            >
              Confirm Booking
            </button>
          </form>
        </section>
      )}
    </main>
  );
}

function UPIPayment({
  amount,
  productName,
}: {
  amount: number;
  productName: string;
}) {
  const [qrCode, setQrCode] =
    useState("");

  const upiLink =
    `upi://pay?pa=${encodeURIComponent(
      UPI_ID
    )}&pn=${encodeURIComponent(
      "Aurivon"
    )}&am=${amount.toFixed(
      2
    )}&cu=INR&tn=${encodeURIComponent(
      productName
    )}`;

  useEffect(() => {
    QRCode.toDataURL(upiLink, {
      width: 300,
      margin: 2,
    })
      .then((url) => {
        setQrCode(url);
      })
      .catch((error) => {
        console.error(
          "QR generation error:",
          error
        );

        setQrCode("");
      });
  }, [upiLink]);

  return (
    <div className="qr-payment">
      <h3>
        UPI Payment
      </h3>

      <p>
        Payment amount for your order:
      </p>

      <div className="payment-amount">
        Amount:{" "}
        <strong>
          ₹
          {amount.toLocaleString(
            "en-IN"
          )}
        </strong>
      </div>

      <p className="payment-note">
        UPI ID:{" "}
        <strong>
          {UPI_ID}
        </strong>
      </p>

      {qrCode && (
        <div className="upi-qr-wrapper">
          <img
            src={qrCode}
            alt={`UPI QR code for ₹${amount}`}
            className="payment-qr"
          />
        </div>
      )}

      <p className="payment-note">
        Scan this QR with any UPI app. The
        amount will be pre-filled as ₹
        {amount.toLocaleString(
          "en-IN"
        )}.
      </p>
    </div>
  );
}