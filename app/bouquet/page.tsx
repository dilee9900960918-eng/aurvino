"use client";

import Image from "next/image";

export default function BouquetPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <h1>Aurvino Bouquet 🌸</h1>

      <div style={{ marginTop: "20px" }}>
        <Image
          src="/images/rose-bouquete.png"
          alt="Aurvino Rose Elegance Bouquet"
          width={500}
          height={500}
          style={{
            width: "100%",
            maxWidth: "500px",
            height: "auto",
            borderRadius: "16px",
          }}
        />
      </div>

      <p style={{ marginTop: "20px" }}>
        Thank you for choosing Aurvino 🌷
      </p>
    </main>
  );
}