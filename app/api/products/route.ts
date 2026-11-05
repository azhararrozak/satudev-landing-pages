import { db } from "@/lib/backend/db";
import { products, ProductBuyLink } from "@/schema";
import { eq, desc, ilike, and, or } from "drizzle-orm";
import { auth } from "@/lib/backend/auth";
import { headers } from "next/headers";
import { ensureProductsTable } from "@/lib/backend/products-db";
import { handleCorsPreflight, jsonWithCors } from "@/lib/backend/cors";

export const dynamic = "force-dynamic";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

export async function GET(request: Request) {
  try {
    await ensureProductsTable();

    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim();
    const category = url.searchParams.get("category")?.trim();
    const status = url.searchParams.get("status")?.trim(); // "all" | "active" | "inactive"
    const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "50", 10), 1), 100);
    const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
    const offset = (page - 1) * limit;

    const conditions = [];

    // Filter by status (default: all for dashboard when status=all, otherwise active for public website)
    if (status === "active") {
      conditions.push(eq(products.isActive, true));
    } else if (status === "inactive") {
      conditions.push(eq(products.isActive, false));
    } else if (status !== "all") {
      // By default, if not specified, show all products in API or allow caller to decide
      // But if requested by frontend catalog, usually status=active
    }

    if (category && category !== "all") {
      conditions.push(eq(products.category, category));
    }

    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.description, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const query = db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    const result = whereClause ? await query.where(whereClause) : await query;

    // Attach absolute imageUrl for cross-subdomain consumption
    const formattedProducts = result.map((p) => ({
      ...p,
      imageUrl: resolveImageUrl(p.image, url.origin),
    }));

    return jsonWithCors(
      {
        products: formattedProducts,
        total: formattedProducts.length,
        page,
        limit,
      },
      { status: 200 },
      request
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return jsonWithCors(
      { error: "Failed to fetch products" },
      { status: 500 },
      request
    );
  }
}

export async function POST(request: Request) {
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
        { error: "Forbidden: Hanya admin dan penulis yang dapat mengelola produk" },
        { status: 403 },
        request
      );
    }

    const body = await request.json();
    const {
      name,
      slug: customSlug,
      description,
      image,
      price,
      category,
      buyLinks,
      isActive = true,
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

    // Generate unique slug
    let finalSlug = slugify(customSlug || name);
    if (!finalSlug) finalSlug = `product-${Date.now()}`;

    // Check slug collision
    const existing = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, finalSlug))
      .limit(1);

    if (existing.length > 0) {
      finalSlug = `${finalSlug}-${Date.now().toString(36)}`;
    }

    const [newProduct] = await db
      .insert(products)
      .values({
        name: name.trim(),
        slug: finalSlug,
        description: description.trim(),
        image: image?.trim() || null,
        price: price ? price.toString() : null,
        category: category?.trim() || null,
        buyLinks: formattedBuyLinks,
        isActive: Boolean(isActive),
        createdBy: session.user.id,
      })
      .returning();

    const url = new URL(request.url);
    const productWithImageUrl = {
      ...newProduct,
      imageUrl: resolveImageUrl(newProduct.image, url.origin),
    };

    return jsonWithCors(productWithImageUrl, { status: 201 }, request);
  } catch (error) {
    console.error("Error creating product:", error);
    return jsonWithCors(
      { error: error instanceof Error ? error.message : "Failed to create product" },
      { status: 500 },
      request
    );
  }
}

