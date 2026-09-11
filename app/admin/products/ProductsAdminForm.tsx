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

  const [editingId, setEditingId] = useState<string | null>(
    null
  );

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
      console.error("Product loading error:", error);

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
      formData.append("upload_preset", UPLOAD_PRESET);

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
          data.error?.message || "Image upload failed."
        );
      }

      setImageUrl(data.secure_url);
      setSuccess("Photo uploaded successfully.");
    } catch (error) {
      console.error("Image upload error:", error);

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
    setDescription(product.description || "");
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
      setError("Please enter a product name.");
      return;
    }

    if (!price || Number(price) <= 0) {
      setError("Please enter a valid price.");
      return;
    }

    if (!imageUrl) {
      setError("Please upload a product photo.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/products", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          name: name.trim(),
          price: Number(price),
          description: description.trim(),
          imageUrl,
          category,
          event,
        }),
      });

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
      console.error("Product save/update error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(
      `Remove "${product.name}" from the website?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/products", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: product.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to remove product."
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
      console.error("Product delete error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to remove product."
      );
    }
  }

  return (
    <main className="orders-page">
      <section className="orders-container">
        <p className="eyebrow">AURVINO ADMIN</p>

        <h1>
          {editingId ? "Edit Product" : "Add Product"}
        </h1>

        <p className="orders-intro">
          {editingId
            ? "Update your bouquet or gift details."
            : "Add a bouquet or gift directly from your phone."}
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            maxWidth: "600px",
            marginTop: "30px",
          }}
        >
          <div className="form-group">
            <label htmlFor="name">
              Product Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Example: Red Rose Bouquet"
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">
              Price (₹)
            </label>

            <input
              id="price"
              type="number"
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Example: 1499"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">
              Category
            </label>

            <select
              id="category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
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

          <div className="form-group">
            <label htmlFor="event">
              Event
            </label>

            <select
              id="event"
              value={event}
              onChange={(e) =>
                setEvent(e.target.value)
              }
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

          <div className="form-group">
            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Describe your bouquet or gift..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="product-image">
              Product Photo
            </label>

            <input
              id="product-image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
            />

            {uploading && (
              <p style={{ marginTop: "10px" }}>
                Uploading photo...
              </p>
            )}

            {imageUrl && (
              <div style={{ marginTop: "16px" }}>
                <img
                  src={imageUrl}
                  alt="Product preview"
                  style={{
                    width: "100%",
                    maxWidth: "300px",
                    borderRadius: "12px",
                  }}
                />
              </div>
            )}
          </div>

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          {success && (
            <p
              style={{
                marginBottom: "16px",
                fontWeight: 600,
              }}
            >
              {success}
            </p>
          )}

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="submit"
              disabled={saving || uploading}
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Product"
                : "Save Product"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving || uploading}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <section
          style={{
            marginTop: "50px",
          }}
        >
          <h2>Existing Products</h2>

          {loadingProducts && (
            <p style={{ marginTop: "20px" }}>
              Loading products...
            </p>
          )}

          {!loadingProducts &&
            products.length === 0 && (
              <p style={{ marginTop: "20px" }}>
                No products added yet.
              </p>
            )}

          {!loadingProducts &&
            products.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "20px",
                  marginTop: "25px",
                }}
              >
                {products.map((product) => (
                  <article
                    key={product.id}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "16px",
                      padding: "16px",
                    }}
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "220px",
                        objectFit: "cover",
                        borderRadius: "12px",
                      }}
                    />

                    <h3
                      style={{
                        marginTop: "14px",
                        marginBottom: "6px",
                      }}
                    >
                      {product.name}
                    </h3>

                    <p
                      style={{
                        fontWeight: 700,
                        marginBottom: "6px",
                      }}
                    >
                      ₹
                      {product.price.toLocaleString(
                        "en-IN"
                      )}
                    </p>

                    <p
                      style={{
                        fontSize: "14px",
                        marginBottom: "4px",
                      }}
                    >
                      {product.category}
                    </p>

                    {product.event && (
                      <p
                        style={{
                          fontSize: "14px",
                          marginBottom: "14px",
                        }}
                      >
                        {product.event}
                      </p>
                    )}

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          startEditing(product)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(product)
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
        </section>
      </section>
    </main>
  );
}