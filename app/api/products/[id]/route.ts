import { db } from "@/lib/backend/db";
import { products, ProductBuyLink } from "@/schema";
import { eq, or } from "drizzle-orm";
import { auth } from "@/lib/backend/auth";
import { headers } from "next/headers";
import { ensureProductsTable } from "@/lib/backend/products-db";
import { handleCorsPreflight, jsonWithCors } from "@/lib/backend/cors";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ id: string }>;
};

function resolveImageUrl(image: string | null | undefined, origin: string): string | null {
  if (!image) return null;
  if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("data:")) {
    return image;
  }
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || origin;
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanPath = image.startsWith("/") ? image : `/${image}`;
  return `${cleanBase}${cleanPath}`;
}

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    await ensureProductsTable();
    const { id } = await params;

    if (!id) {
      return jsonWithCors(
        { error: "Product ID or slug is required" },
        { status: 400 },
        request
      );
    }

    // Allow lookup by ID or slug
    const [product] = await db
      .select()
      .from(products)
      .where(or(eq(products.id, id), eq(products.slug, id)))
      .limit(1);

    if (!product) {
      return jsonWithCors(
        { error: "Product not found" },
        { status: 404 },
        request
      );
    }

    const url = new URL(request.url);
    const productWithImageUrl = {
      ...product,
      imageUrl: resolveImageUrl(product.image, url.origin),
    };

    return jsonWithCors(productWithImageUrl, { status: 200 }, request);
  } catch (error) {
    console.error("Error fetching product:", error);
    return jsonWithCors(
      { error: "Failed to fetch product" },
      { status: 500 },
      request
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    await ensureProductsTable();

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return jsonWithCors(
        { error: "Unauthorized: Silakan login terlebih dahulu" },
        { status: 401 },
        request
      );
    }

    const userRole = session.user.role as string;
    if (userRole !== "admin" && userRole !== "penulis") {
      return jsonWithCors(
        { error: "Forbidden: Hanya admin dan penulis yang dapat mengedit produk" },
        { status: 403 },
        request
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      slug,
      description,
      image,
      price,
      category,
      buyLinks,
      isActive,
    } = body as {
      name?: string;
      slug?: string;
      description?: string;
      image?: string;
      price?: number | string | null;
      category?: string;
      buyLinks?: ProductBuyLink[];
      isActive?: boolean;
    };

    if (!name || !name.trim()) {
      return jsonWithCors(
        { error: "Nama produk wajib diisi" },
        { status: 400 },
        request
      );
    }

    if (!description || !description.trim()) {
      return jsonWithCors(
        { error: "Deskripsi singkat wajib diisi" },
        { status: 400 },
        request
      );
    }

    // Format & validate buy links
    let formattedBuyLinks: ProductBuyLink[] = [];
    if (Array.isArray(buyLinks)) {
      formattedBuyLinks = buyLinks
        .filter((link) => link && typeof link.url === "string" && link.url.trim().length > 0)
        .map((link) => ({
          platform: link.platform || "other",
          label: link.label?.trim() || link.platform || "Beli",
          url: link.url.trim(),
        }));
    }

    const updatePayload: Record<string, unknown> = {
      name: name.trim(),
      description: description.trim(),
      image: image !== undefined ? image?.trim() || null : undefined,
      price: price !== undefined ? (price ? price.toString() : null) : undefined,
      category: category !== undefined ? category?.trim() || null : undefined,
      buyLinks: formattedBuyLinks,
      updatedAt: new Date(),
    };

    if (slug?.trim()) {
      updatePayload.slug = slug.trim();
    }

    if (typeof isActive === "boolean") {
      updatePayload.isActive = isActive;
    }

    const [updatedProduct] = await db
      .update(products)
      .set(updatePayload)
      .where(eq(products.id, id))
      .returning();

    if (!updatedProduct) {
      return jsonWithCors(
        { error: "Product not found" },
        { status: 404 },
        request
      );
    }

    const url = new URL(request.url);
    const productWithImageUrl = {
      ...updatedProduct,
      imageUrl: resolveImageUrl(updatedProduct.image, url.origin),
    };

    return jsonWithCors(productWithImageUrl, { status: 200 }, request);
  } catch (error) {
    console.error("Error updating product:", error);
    return jsonWithCors(
      { error: error instanceof Error ? error.message : "Failed to update product" },
      { status: 500 },
      request
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await ensureProductsTable();

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return jsonWithCors(
        { error: "Unauthorized: Silakan login terlebih dahulu" },
        { status: 401 },
        request
      );
    }

    const userRole = session.user.role as string;
    if (userRole !== "admin" && userRole !== "penulis") {
      return jsonWithCors(
        { error: "Forbidden: Hanya admin dan penulis yang dapat menghapus produk" },
        { status: 403 },
        request
      );
    }

    const { id } = await params;

    const [deletedProduct] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();

    if (!deletedProduct) {
      return jsonWithCors(
        { error: "Product not found" },
        { status: 404 },
        request
      );
    }

    return jsonWithCors(
      {
        success: true,
        message: "Produk berhasil dihapus",
        id: deletedProduct.id,
      },
      { status: 200 },
      request
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return jsonWithCors(
      { error: error instanceof Error ? error.message : "Failed to delete product" },
      { status: 500 },
      request
    );
  }
}

