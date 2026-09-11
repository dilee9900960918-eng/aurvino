"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

type Product = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string;
  category: string;
  event: string | null;
  active: boolean;
};

const CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";

const UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

export default function ProductsAdminForm() {
  const [products, setProducts] = useState<Product[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Bouquets");
  const [event, setEvent] = useState("General");
  const [imageUrl, setImageUrl] = useState("");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoadingProducts(true);
      setError("");

      const response = await fetch("/api/products");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load products."
        );
      }

      setProducts(data);
    } catch (error) {
      console.error(
        "Product loading error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load products."
      );
    } finally {
      setLoadingProducts(false);
    }
  }

  async function handleImageUpload(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");
    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append(
        "upload_preset",
        UPLOAD_PRESET
      );

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message ||
            "Image upload failed."
        );
      }

      setImageUrl(data.secure_url);
      setSuccess(
        "Photo uploaded successfully."
      );
    } catch (error) {
      console.error(
        "Image upload error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to upload image."
      );
    } finally {
      setUploading(false);
    }
  }

  function startEditing(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setPrice(String(product.price));
    setDescription(
      product.description || ""
    );
    setCategory(product.category);
    setEvent(product.event || "General");
    setImageUrl(product.imageUrl);

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setName("");
    setPrice("");
    setDescription("");
    setCategory("Bouquets");
    setEvent("General");
    setImageUrl("");

    setError("");
    setSuccess("");
  }

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError(
        "Please enter a product name."
      );
      return;
    }

    if (!price || Number(price) <= 0) {
      setError(
        "Please enter a valid price."
      );
      return;
    }

    if (!imageUrl) {
      setError(
        "Please upload a product photo."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "/api/products",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            ...(editingId
              ? { id: editingId }
              : {}),
            name: name.trim(),
            price: Number(price),
            description:
              description.trim(),
            imageUrl,
            category,
            event,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            (editingId
              ? "Unable to update product."
              : "Unable to save product.")
        );
      }

      setSuccess(
        editingId
          ? "Product updated successfully! 🌸"
          : "Product saved successfully! 🌸"
      );

      cancelEditing();

      await loadProducts();
    } catch (error) {
      console.error(
        "Product save/update error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    product: Product
  ) {
    const confirmed = window.confirm(
      `Remove "${product.name}" from the website?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "/api/products",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: product.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to remove product."
        );
      }

      setSuccess(
        `"${product.name}" was removed successfully.`
      );

      if (editingId === product.id) {
        cancelEditing();
      }

      await loadProducts();
    } catch (error) {
      console.error(
        "Product delete error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to remove product."
      );
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #fcf8f6 0%, #f8f1f3 100%)",
        padding: "60px 24px 100px",
        color: "#242235",
      }}
    >
      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <header
          style={{
            marginBottom: "36px",
            position: "relative",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#934263",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "4px",
              textTransform: "uppercase",
            }}
          >
            ✿ AURVINO ADMIN
          </p>

          <h1
            style={{
              margin:
                "12px 0 8px",
              fontFamily:
                "Georgia, 'Times New Roman', serif",
              fontSize:
                "clamp(42px, 6vw, 68px)",
              lineHeight: 1,
              fontWeight: 500,
              letterSpacing: "-2px",
            }}
          >
            {editingId
              ? "Edit Product"
              : "Add Product"}
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: "600px",
              fontSize: "17px",
              lineHeight: 1.7,
              color: "#716b75",
            }}
          >
            {editingId
              ? "Refresh your collection with updated product details."
              : "Add a beautiful bouquet or thoughtful gift to your Aurvino collection."}
          </p>

          <div
            style={{
              width: "54px",
              height: "2px",
              background: "#a34c70",
              marginTop: "22px",
            }}
          />
        </header>

        {/* FORM CARD */}
        <section
          style={{
            background:
              "rgba(255,255,255,0.9)",
            border:
              "1px solid rgba(163,76,112,0.12)",
            borderRadius: "28px",
            padding:
              "clamp(24px, 4vw, 44px)",
            boxShadow:
              "0 20px 60px rgba(74,42,57,0.08)",
            marginBottom: "70px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom: "32px",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  letterSpacing: "2px",
                  textTransform:
                    "uppercase",
                  color: "#a34c70",
                  fontWeight: 700,
                }}
              >
                {editingId
                  ? "UPDATE COLLECTION"
                  : "NEW COLLECTION"}
              </p>

              <h2
                style={{
                  margin:
                    "7px 0 0",
                  fontFamily:
                    "Georgia, 'Times New Roman', serif",
                  fontWeight: 500,
                  fontSize: "28px",
                }}
              >
                Product Details
              </h2>
            </div>

            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background:
                  "#f6e6ec",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "center",
                fontSize: "20px",
              }}
            >
              🌸
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "28px",
              }}
            >
              {/* LEFT */}
              <div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>
                    Product Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(
                        e.target.value
                      )
                    }
                    placeholder="e.g. Red Rose Bouquet"
                    style={inputStyle}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div style={fieldStyle}>
                    <label
                      style={labelStyle}
                    >
                      Price (₹)
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={price}
                      onChange={(e) =>
                        setPrice(
                          e.target.value
                        )
                      }
                      placeholder="1499"
                      style={inputStyle}
                    />
                  </div>

                  <div style={fieldStyle}>
                    <label
                      style={labelStyle}
                    >
                      Category
                    </label>

                    <select
                      value={category}
                      onChange={(e) =>
                        setCategory(
                          e.target.value
                        )
                      }
                      style={
                        inputStyle
                      }
                    >
                      <option value="Bouquets">
                        Bouquets
                      </option>
                      <option value="Gifts">
                        Gifts
                      </option>
                    </select>
                  </div>
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>
                    Event
                  </label>

                  <select
                    value={event}
                    onChange={(e) =>
                      setEvent(
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  >
                    <option value="General">
                      General
                    </option>
                    <option value="Birthday">
                      Birthday
                    </option>
                    <option value="Anniversary">
                      Anniversary
                    </option>
                    <option value="Wedding">
                      Wedding
                    </option>
                    <option value="Valentine's Day">
                      Valentine's Day
                    </option>
                    <option value="Baby Shower">
                      Baby Shower
                    </option>
                    <option value="Graduation">
                      Graduation
                    </option>
                    <option value="Other Events">
                      Other Events
                    </option>
                  </select>
                </div>
              </div>

              {/* RIGHT */}
              <div>
                <div style={fieldStyle}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                    }}
                  >
                    <label
                      style={labelStyle}
                    >
                      Description
                    </label>

                    <span
                      style={{
                        fontSize: "11px",
                        color: "#aaa0a7",
                      }}
                    >
                      Optional
                    </span>
                  </div>

                  <textarea
                    value={description}
                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }
                    placeholder="Describe your bouquet or gift..."
                    rows={5}
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                      minHeight: "135px",
                    }}
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>
                    Product Photo
                  </label>

                  <label
                    htmlFor="product-image"
                    style={{
                      display: "block",
                      border:
                        "1.5px dashed #dbaec1",
                      borderRadius: "18px",
                      padding: "26px",
                      textAlign: "center",
                      background:
                        "#fffafd",
                      cursor:
                        uploading
                          ? "wait"
                          : "pointer",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "30px",
                        marginBottom:
                          "8px",
                      }}
                    >
                      ☁
                    </div>

                    <strong
                      style={{
                        display:
                          "block",
                        color:
                          "#934263",
                        marginBottom:
                          "5px",
                      }}
                    >
                      {uploading
                        ? "Uploading photo..."
                        : "Choose a product photo"}
                    </strong>

                    <span
                      style={{
                        fontSize:
                          "13px",
                        color:
                          "#8d858d",
                      }}
                    >
                      JPG or PNG ·
                      Click to browse
                    </span>

                    <input
                      id="product-image"
                      type="file"
                      accept="image/*"
                      onChange={
                        handleImageUpload
                      }
                      disabled={
                        uploading
                      }
                      style={{
                        display: "none",
                      }}
                    />
                  </label>
                </div>

                {imageUrl && (
                  <div
                    style={{
                      marginTop:
                        "18px",
                      position:
                        "relative",
                      borderRadius:
                        "18px",
                      overflow:
                        "hidden",
                      background:
                        "#f6eff2",
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt="Product preview"
                      style={{
                        width: "100%",
                        height:
                          "230px",
                        objectFit:
                          "cover",
                        display:
                          "block",
                      }}
                    />

                    <div
                      style={{
                        position:
                          "absolute",
                        bottom:
                          "12px",
                        left:
                          "12px",
                        background:
                          "rgba(255,255,255,0.92)",
                        padding:
                          "7px 12px",
                        borderRadius:
                          "20px",
                        fontSize:
                          "12px",
                        fontWeight: 600,
                        color:
                          "#7e3b58",
                      }}
                    >
                      ✓ Photo ready
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* MESSAGES */}
            {error && (
              <div
                style={{
                  marginTop: "24px",
                  padding: "14px 16px",
                  borderRadius:
                    "12px",
                  background:
                    "#fff0f1",
                  color: "#a43d48",
                  fontSize: "14px",
                }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                style={{
                  marginTop: "24px",
                  padding: "14px 16px",
                  borderRadius:
                    "12px",
                  background:
                    "#f1f8f3",
                  color: "#477453",
                  fontSize: "14px",
                }}
              >
                {success}
              </div>
            )}

            {/* ACTIONS */}
            <div
              style={{
                display: "flex",
                justifyContent:
                  "flex-end",
                gap: "12px",
                marginTop: "30px",
                flexWrap: "wrap",
              }}
            >
              {editingId && (
                <button
                  type="button"
                  onClick={
                    cancelEditing
                  }
                  disabled={
                    saving ||
                    uploading
                  }
                  style={{
                    padding:
                      "13px 24px",
                    borderRadius:
                      "10px",
                    border:
                      "1px solid #d9c5ce",
                    background:
                      "white",
                    color:
                      "#70465a",
                    fontWeight: 600,
                    cursor:
                      "pointer",
                  }}
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={
                  saving ||
                  uploading
                }
                style={{
                  padding:
                    "14px 28px",
                  borderRadius:
                    "10px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, #9b4569, #7d3454)",
                  color: "white",
                  fontWeight: 700,
                  fontSize:
                    "15px",
                  cursor:
                    saving ||
                    uploading
                      ? "wait"
                      : "pointer",
                  boxShadow:
                    "0 8px 20px rgba(125,52,84,0.22)",
                }}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Product"
                  : "＋ Save Product"}
              </button>
            </div>
          </form>
        </section>

        {/* EXISTING PRODUCTS */}
        <section>
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "flex-end",
              gap: "20px",
              marginBottom: "26px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  color: "#a34c70",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing:
                    "2px",
                  textTransform:
                    "uppercase",
                }}
              >
                YOUR COLLECTION
              </p>

              <h2
                style={{
                  margin:
                    "7px 0 5px",
                  fontFamily:
                    "Georgia, 'Times New Roman', serif",
                  fontSize: "38px",
                  fontWeight: 500,
                }}
              >
                Existing Products
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#756e76",
                }}
              >
                View and manage your
                current collection.
              </p>
            </div>

            {!loadingProducts &&
              products.length > 0 && (
                <div
                  style={{
                    padding:
                      "8px 15px",
                    borderRadius:
                      "30px",
                    background:
                      "#f2e2e8",
                    color:
                      "#873d5d",
                    fontSize:
                      "13px",
                    fontWeight: 700,
                  }}
                >
                  {products.length}{" "}
                  {products.length ===
                  1
                    ? "Product"
                    : "Products"}
                </div>
              )}
          </div>

          {loadingProducts && (
            <div
              style={{
                background:
                  "white",
                borderRadius:
                  "20px",
                padding: "40px",
                textAlign: "center",
                color: "#817780",
              }}
            >
              Loading your
              collection...
            </div>
          )}

          {!loadingProducts &&
            products.length === 0 && (
              <div
                style={{
                  background:
                    "white",
                  border:
                    "1px dashed #d9bcc8",
                  borderRadius:
                    "22px",
                  padding:
                    "60px 30px",
                  textAlign:
                    "center",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "42px",
                    marginBottom:
                      "12px",
                  }}
                >
                  🌷
                </div>

                <h3
                  style={{
                    fontFamily:
                      "Georgia, 'Times New Roman', serif",
                    fontSize:
                      "24px",
                    fontWeight:
                      500,
                    margin:
                      "0 0 8px",
                  }}
                >
                  Your collection
                  is waiting
                </h3>

                <p
                  style={{
                    color:
                      "#817780",
                    margin: 0,
                  }}
                >
                  Add your first
                  bouquet or gift
                  above.
                </p>
              </div>
            )}

          {!loadingProducts &&
            products.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "24px",
                }}
              >
                {products.map(
                  (product) => (
                    <article
                      key={product.id}
                      style={{
                        background:
                          "white",
                        border:
                          "1px solid rgba(163,76,112,0.1)",
                        borderRadius:
                          "22px",
                        overflow:
                          "hidden",
                        boxShadow:
                          "0 12px 35px rgba(74,42,57,0.07)",
                      }}
                    >
                      <div
                        style={{
                          position:
                            "relative",
                        }}
                      >
                        <img
                          src={
                            product.imageUrl
                          }
                          alt={
                            product.name
                          }
                          style={{
                            width: "100%",
                            height:
                              "260px",
                            objectFit:
                              "cover",
                            display:
                              "block",
                          }}
                        />

                        <div
                          style={{
                            position:
                              "absolute",
                            top: "14px",
                            left: "14px",
                            display:
                              "flex",
                            gap: "7px",
                            flexWrap:
                              "wrap",
                          }}
                        >
                          <span
                            style={{
                              background:
                                "rgba(255,255,255,0.94)",
                              color:
                                "#873d5d",
                              padding:
                                "6px 10px",
                              borderRadius:
                                "20px",
                              fontSize:
                                "11px",
                              fontWeight:
                                700,
                            }}
                          >
                            {product.category}
                          </span>

                          {product.event &&
                            product.event !==
                              "General" && (
                              <span
                                style={{
                                  background:
                                    "rgba(255,255,255,0.94)",
                                  color:
                                    "#655b63",
                                  padding:
                                    "6px 10px",
                                  borderRadius:
                                    "20px",
                                  fontSize:
                                    "11px",
                                  fontWeight:
                                    600,
                                }}
                              >
                                {
                                  product.event
                                }
                              </span>
                            )}
                        </div>
                      </div>

                      <div
                        style={{
                          padding:
                            "22px",
                        }}
                      >
                        <h3
                          style={{
                            margin:
                              "0 0 7px",
                            fontFamily:
                              "Georgia, 'Times New Roman', serif",
                            fontSize:
                              "24px",
                            fontWeight:
                              500,
                            color:
                              "#282332",
                          }}
                        >
                          {product.name}
                        </h3>

                        {product.description && (
                          <p
                            style={{
                              margin:
                                "0 0 14px",
                              color:
                                "#777079",
                              fontSize:
                                "14px",
                              lineHeight:
                                1.6,
                              minHeight:
                                "44px",
                            }}
                          >
                            {
                              product.description
                            }
                          </p>
                        )}

                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "center",
                            marginTop:
                              "16px",
                          }}
                        >
                          <span
                            style={{
                              fontSize:
                                "21px",
                              fontWeight:
                                700,
                              color:
                                "#913f61",
                            }}
                          >
                            ₹
                            {product.price.toLocaleString(
                              "en-IN"
                            )}
                          </span>

                          <span
                            style={{
                              fontSize:
                                "12px",
                              color:
                                "#9b9198",
                            }}
                          >
                            Aurvino
                          </span>
                        </div>

                        <div
                          style={{
                            display:
                              "grid",
                            gridTemplateColumns:
                              "1fr 1fr",
                            gap: "10px",
                            marginTop:
                              "20px",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              startEditing(
                                product
                              )
                            }
                            style={{
                              padding:
                                "11px",
                              borderRadius:
                                "9px",
                              border:
                                "1px solid #d9c3cd",
                              background:
                                "#fff",
                              color:
                                "#713b55",
                              fontWeight:
                                700,
                              cursor:
                                "pointer",
                            }}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                product
                              )
                            }
                            style={{
                              padding:
                                "11px",
                              borderRadius:
                                "9px",
                              border:
                                "1px solid #ead2d7",
                              background:
                                "#fff7f7",
                              color:
                                "#a24b55",
                              fontWeight:
                                700,
                              cursor:
                                "pointer",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
        </section>
      </div>
    </main>
  );
}

const fieldStyle = {
  marginBottom: "20px",
};

const labelStyle = {
  display: "block",
  marginBottom: "9px",
  fontSize: "13px",
  fontWeight: 700,
  color: "#403943",
  letterSpacing: "0.3px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "14px 15px",
  borderRadius: "11px",
  border: "1px solid #ddd1d7",
  background: "#fff",
  color: "#302a34",
  fontSize: "15px",
  outline: "none",
};