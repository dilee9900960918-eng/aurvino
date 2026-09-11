import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProductsAdminForm from "./ProductsAdminForm";

export default async function ProductsAdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  return <ProductsAdminForm />;
}