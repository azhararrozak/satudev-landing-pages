"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { ProductItem, ProductBuyLink, BuyLinkPlatform } from "@/schema/products-schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Upload,
  ExternalLink,
  Package,
  Search,
  Check,
  Copy,
  Code2,
  Globe,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Store,
} from "lucide-react";
import { toast } from "sonner";

interface ProductWithImageUrl extends ProductItem {
  imageUrl?: string | null;
}

const PLATFORM_PRESETS: {
  id: BuyLinkPlatform;
  label: string;
  placeholder: string;
  color: string;
  bgLight: string;
}[] = [
  {
    id: "shopee",
    label: "Shopee",
    placeholder: "https://shopee.co.id/...",
    color: "#ee4d2d",
    bgLight: "bg-[#ee4d2d]/10 text-[#ee4d2d] border-[#ee4d2d]/20",
  },
  {
    id: "tiktok",
    label: "TikTok Shop",
    placeholder: "https://shop.tiktok.com/...",
    color: "#000000",
    bgLight: "bg-slate-900/10 text-slate-900 border-slate-900/20 dark:text-slate-100",
  },
  {
    id: "tokopedia",
    label: "Tokopedia",
    placeholder: "https://www.tokopedia.com/...",
    color: "#03ac0e",
    bgLight: "bg-[#03ac0e]/10 text-[#03ac0e] border-[#03ac0e]/20",
  },
  {
    id: "whatsapp",
    label: "WhatsApp Order",
    placeholder: "https://wa.me/628123456789?text=Halo...",
    color: "#25d366",
    bgLight: "bg-[#25d366]/10 text-[#25d366] border-[#25d366]/20",
  },
  {
    id: "website",
    label: "Website / Web Store",
    placeholder: "https://product.satudev.id/...",
    color: "#0540ad",
    bgLight: "bg-[#0540ad]/10 text-[#0540ad] border-[#0540ad]/20",
  },
];

function getPlatformBadge(platform: string) {
  const p = platform.toLowerCase();
  if (p === "shopee") {
    return {
      name: "Shopee",
      classes: "bg-[#ee4d2d]/10 text-[#ee4d2d] border-[#ee4d2d]/30",
    };
  }
  if (p === "tiktok") {
    return {
      name: "TikTok Shop",
      classes: "bg-slate-800 text-white border-slate-700",
    };
  }
  if (p === "tokopedia") {
    return {
      name: "Tokopedia",
      classes: "bg-[#03ac0e]/10 text-[#03ac0e] border-[#03ac0e]/30",
    };
  }
  if (p === "whatsapp") {
    return {
      name: "WhatsApp",
      classes: "bg-[#25d366]/10 text-[#25d366] border-[#25d366]/30",
    };
  }
  return {
    name: platform || "Link",
    classes: "bg-blue-50 text-blue-700 border-blue-200",
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductWithImageUrl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    price: "",
    category: "",
    isActive: true,
  });

  const [buyLinks, setBuyLinks] = useState<ProductBuyLink[]>([
    { platform: "shopee", label: "Shopee", url: "" },
    { platform: "tiktok", label: "TikTok Shop", url: "" },
    { platform: "tokopedia", label: "Tokopedia", url: "" },
    { platform: "whatsapp", label: "WhatsApp Order", url: "" },
  ]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/products?status=all");
      if (!res.ok) throw new Error("Gagal mengambil daftar produk");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error(error instanceof Error ? error.message : "Gagal memuat produk");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddDialog = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      image: "",
      price: "",
      category: "",
      isActive: true,
    });
    setBuyLinks([
      { platform: "shopee", label: "Shopee", url: "" },
      { platform: "tiktok", label: "TikTok Shop", url: "" },
      { platform: "tokopedia", label: "Tokopedia", url: "" },
      { platform: "whatsapp", label: "WhatsApp Order", url: "" },
    ]);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (prod: ProductItem) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name || "",
      slug: prod.slug || "",
      description: prod.description || "",
      image: prod.image || "",
      price: prod.price ? prod.price.toString() : "",
      category: prod.category || "",
      isActive: prod.isActive ?? true,
    });

    const existingLinks = Array.isArray(prod.buyLinks) ? [...prod.buyLinks] : [];
    // Ensure all main platforms exist in editor for user convenience
    const merged = [...PLATFORM_PRESETS.map((p) => {
      const found = existingLinks.find((l) => l.platform.toLowerCase() === p.id.toLowerCase());
      return found || { platform: p.id, label: p.label, url: "" };
    })];

    // Add any custom extra platforms
    existingLinks.forEach((l) => {
      if (!merged.some((m) => m.platform.toLowerCase() === l.platform.toLowerCase())) {
        merged.push(l);
      }
    });

    setBuyLinks(merged);
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload/featured-image", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Gagal mengunggah gambar");
      }

      setFormData((prev) => ({ ...prev, image: result.url }));
      toast.success("Gambar produk berhasil diunggah");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error instanceof Error ? error.message : "Gagal mengunggah gambar");
    } finally {
      setIsUploading(false);
      // Reset input value so same file can be selected again
      e.target.value = "";
    }
  };

  const handleAddCustomBuyLink = () => {
    setBuyLinks((prev) => [
      ...prev,
      { platform: "other", label: "Custom Platform", url: "" },
    ]);
  };

  const handleUpdateBuyLink = (index: number, field: "platform" | "label" | "url", value: string) => {
    setBuyLinks((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveBuyLink = (index: number) => {
    setBuyLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Nama produk wajib diisi");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Deskripsi singkat wajib diisi");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      // Filter only populated buy links
      const activeBuyLinks = buyLinks.filter(
        (link) => link.url && link.url.trim().length > 0
      );

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || undefined,
        description: formData.description.trim(),
        image: formData.image.trim() || null,
        price: formData.price ? parseFloat(formData.price) || null : null,
        category: formData.category.trim() || null,
        isActive: formData.isActive,
        buyLinks: activeBuyLinks,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan produk");
      }

      toast.success(
        editingProduct
          ? "Produk berhasil diperbarui"
          : "Produk baru berhasil ditambahkan"
      );
      setIsDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan produk");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus produk");
      }
      toast.success("Produk berhasil dihapus");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(error instanceof Error ? error.message : "Gagal menghapus produk");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (prod: ProductItem) => {
    try {
      const nextStatus = !prod.isActive;
      const res = await fetch(`/api/products/${prod.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: prod.name,
          description: prod.description,
          isActive: nextStatus,
        }),
      });

      if (!res.ok) throw new Error("Gagal mengubah status produk");

      setProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, isActive: nextStatus } : p))
      );

      toast.success(
        nextStatus
          ? `Produk "${prod.name}" sekarang Aktif`
          : `Produk "${prod.name}" dinonaktifkan`
      );
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Gagal mengubah status produk");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    toast.success(`URL ${label} berhasil disalin ke clipboard!`);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        searchQuery === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && p.isActive) ||
        (statusFilter === "inactive" && !p.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [products, searchQuery, statusFilter]);

  const activeCount = products.filter((p) => p.isActive).length;
  const inactiveCount = products.filter((p) => !p.isActive).length;
  const totalBuyLinksCount = products.reduce((acc, p) => {
    return acc + (Array.isArray(p.buyLinks) ? p.buyLinks.length : 0);
  }, 0);

  const apiEndpointUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/products`
    : "https://satudev.id/api/products";

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-[#dfdfe0] bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0540ad]/10 text-[#0540ad] dark:bg-blue-500/20 dark:text-blue-400">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-[26px] sm:text-[30px] font-extrabold tracking-[-0.6px] leading-tight text-[#002253] dark:text-white">
                Katalog Produk
              </h1>
              <p className="text-sm sm:text-[15px] font-medium text-[#66666b] dark:text-slate-400">
                Input produk dan link pembelian (Shopee, TikTok, dll) untuk ditampilkan di subdomain{" "}
                <span className="font-semibold text-[#0540ad] dark:text-blue-400">
                  product.satudev.id
                </span>{" "}
                via REST API
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsApiDialogOpen(true)}
            className="h-10 rounded-[20px] border-[#dfdfe0] text-[#002253] hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
          >
            <Code2 className="h-4 w-4 mr-1.5 text-[#0540ad]" />
            <span>Dokumentasi API</span>
          </Button>

          <Button
            type="button"
            onClick={handleOpenAddDialog}
            className="h-10 rounded-[20px] bg-[#0540ad] px-5 text-white hover:bg-[#043591]"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Tambah Produk</span>
          </Button>
        </div>
      </div>

      {/* REST API Callout Card */}
      <div className="rounded-[20px] border border-blue-200 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white p-5 dark:border-blue-900/50 dark:from-blue-950/20 dark:to-slate-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0540ad] text-white">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0540ad] dark:text-blue-400">
                  Subdomain REST API Ready
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  CORS Enabled
                </span>
              </div>
              <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-300">
                Gunakan endpoint ini di frontend <strong>product.satudev.id</strong> untuk mengambil semua produk aktif beserta link pembelian:
              </p>
              <code className="mt-1.5 inline-block rounded bg-white px-2.5 py-1 text-xs font-mono font-medium text-[#002253] border border-blue-100 shadow-xs dark:bg-slate-950 dark:text-blue-300 dark:border-slate-800">
                GET {apiEndpointUrl}?status=active
              </code>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(`${apiEndpointUrl}?status=active`, "Endpoint API")}
              className="h-8 rounded-lg bg-white border-blue-200 text-xs text-[#0540ad] hover:bg-blue-50 dark:bg-slate-900 dark:border-slate-700 dark:text-blue-400"
            >
              {copiedUrl === `${apiEndpointUrl}?status=active` ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  <span>Salin URL API</span>
                </>
              )}
            </Button>
            <a
              href={`${apiEndpointUrl}?status=active`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-transparent bg-[#0540ad]/10 px-2.5 text-xs font-medium text-[#0540ad] transition hover:bg-[#0540ad]/20 dark:bg-blue-500/20 dark:text-blue-300"
            >
              <span>Uji JSON</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-[20px] border border-[#dfdfe0] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#66666b] dark:text-slate-400 uppercase tracking-wider">
              Total Produk
            </span>
            <Package className="h-4 w-4 text-[#0540ad]" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#002253] dark:text-white">
            {products.length}
          </p>
        </div>

        <div className="rounded-[20px] border border-[#dfdfe0] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#66666b] dark:text-slate-400 uppercase tracking-wider">
              Produk Aktif
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-600">
            {activeCount}
          </p>
        </div>

        <div className="rounded-[20px] border border-[#dfdfe0] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#66666b] dark:text-slate-400 uppercase tracking-wider">
              Nonaktif / Draf
            </span>
            <XCircle className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-500 dark:text-slate-400">
            {inactiveCount}
          </p>
        </div>

        <div className="rounded-[20px] border border-[#dfdfe0] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#66666b] dark:text-slate-400 uppercase tracking-wider">
              Link Marketplace
            </span>
            <Store className="h-4 w-4 text-orange-500" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-orange-600">
            {totalBuyLinksCount}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-[20px] border border-[#dfdfe0] bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau deskripsi produk..."
            className="pl-9 h-10 rounded-xl border-[#dfdfe0] dark:border-slate-700"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">
            Status:
          </span>
          <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`rounded-lg px-3 py-1.5 transition ${
                statusFilter === "all"
                  ? "bg-white text-[#002253] shadow-xs dark:bg-slate-700 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              Semua ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`rounded-lg px-3 py-1.5 transition ${
                statusFilter === "active"
                  ? "bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-300"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              Aktif ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("inactive")}
              className={`rounded-lg px-3 py-1.5 transition ${
                statusFilter === "inactive"
                  ? "bg-white text-slate-700 shadow-xs dark:bg-slate-700 dark:text-slate-200"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              Nonaktif ({inactiveCount})
            </button>
          </div>
        </div>
      </div>

      {/* Products Content */}
      {isLoading ? (
        <div className="rounded-[24px] border border-[#dfdfe0] bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#0540ad]" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Memuat data produk...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-[#dfdfe0] bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0540ad] dark:bg-slate-800 dark:text-blue-400">
            <Package className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-[#002253] dark:text-white">
            {searchQuery || statusFilter !== "all"
              ? "Tidak ada produk yang cocok dengan pencarian"
              : "Belum ada produk yang ditambahkan"}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {searchQuery || statusFilter !== "all"
              ? "Coba ubah kata kunci pencarian atau reset filter status produk."
              : "Tambahkan produk pertama Anda beserta link pembelian (Shopee, TikTok, Tokopedia) untuk ditampilkan di subdomain."}
          </p>
          <Button
            type="button"
            onClick={handleOpenAddDialog}
            className="mt-5 rounded-xl bg-[#0540ad] text-white hover:bg-[#043591]"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Tambah Produk Baru</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => {
            const hasLinks = Array.isArray(product.buyLinks) && product.buyLinks.length > 0;

            return (
              <div
                key={product.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-[#dfdfe0] bg-white p-5 transition-all duration-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
              >
                {/* Product Image Thumbnail */}
                <div>
                  <div className="relative aspect-video w-full overflow-hidden rounded-[16px] bg-slate-100 dark:bg-slate-800">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                        <ShoppingBag className="h-10 w-10 text-slate-400" />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(product)}
                        title="Klik untuk mengubah status aktif/nonaktif"
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold backdrop-blur-md transition ${
                          product.isActive
                            ? "bg-emerald-500/90 text-white shadow-xs hover:bg-emerald-600"
                            : "bg-slate-800/80 text-slate-200 hover:bg-slate-900"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            product.isActive ? "bg-white animate-pulse" : "bg-slate-400"
                          }`}
                        />
                        <span>{product.isActive ? "Aktif" : "Nonaktif"}</span>
                      </button>
                    </div>

                    {/* Category pill */}
                    {product.category && (
                      <div className="absolute bottom-3 left-3">
                        <span className="rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md">
                          {product.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="mt-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold text-[#002253] dark:text-white line-clamp-1">
                        {product.name}
                      </h3>
                      {product.price && (
                        <span className="shrink-0 text-sm font-extrabold text-[#0540ad] dark:text-blue-400">
                          Rp {Number(product.price).toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>

                    <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    <div className="mt-2 text-[11px] font-mono text-slate-400 dark:text-slate-500">
                      slug: <span className="text-slate-600 dark:text-slate-300">/{product.slug}</span>
                    </div>

                    {/* Marketplace Links Badges */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Link Pembelian:
                      </span>
                      {hasLinks ? (
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {product.buyLinks!.map((link, idx) => {
                            const badge = getPlatformBadge(link.platform);
                            return (
                              <a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition hover:opacity-80 ${badge.classes}`}
                              >
                                <span>{link.label || badge.name}</span>
                                <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                              </a>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="mt-1 text-xs text-amber-600/90 italic">
                          Belum ada link marketplace
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        copyToClipboard(
                          `${apiEndpointUrl}/${product.slug}`,
                          `API Produk ${product.name}`
                        )
                      }
                      title="Salin endpoint JSON produk ini"
                      className="h-8 px-2 text-xs text-slate-500 hover:text-[#0540ad]"
                    >
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      <span>API</span>
                    </Button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEditDialog(product)}
                      className="h-8 rounded-lg border-slate-200 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1 text-[#0540ad]" />
                      <span>Edit</span>
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={deletingId === product.id}
                      onClick={() => handleDelete(product.id)}
                      className="h-8 rounded-lg px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
                    >
                      {deletingId === product.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[92dvh] overflow-y-auto rounded-[24px] border-[#dfdfe0] p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-[#002253] dark:text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-[#0540ad]" />
              <span>{editingProduct ? "Edit Informasi Produk" : "Tambah Produk Baru"}</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 pt-3">
            {/* Nama Produk */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-[#002253] dark:text-slate-200">
                Nama Produk <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    name: val,
                    // Auto generate slug if creating new product
                    slug: editingProduct ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
                  }));
                }}
                placeholder="Contoh: SatuDev Web Template Pro"
                required
                className="h-11 rounded-xl"
              />
            </div>

            {/* Slug & Category Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="slug" className="text-xs font-bold uppercase tracking-wider text-[#002253] dark:text-slate-200">
                  Slug URL (Otomatis)
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="satudev-web-template-pro"
                  className="h-11 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-[#002253] dark:text-slate-200">
                  Kategori
                </Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Template, Course, Source Code, dll"
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            {/* Deskripsi Singkat */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-[#002253] dark:text-slate-200">
                  Deskripsi Singkat <span className="text-red-500">*</span>
                </Label>
                <span className="text-[11px] text-slate-400">
                  {formData.description.length} karakter
                </span>
              </div>
              <Textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tuliskan deskripsi singkat produk yang memikat calon pembeli..."
                required
                className="rounded-xl resize-none"
              />
            </div>

            {/* Harga (Opsional) */}
            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-xs font-bold uppercase tracking-wider text-[#002253] dark:text-slate-200">
                Harga (IDR - Opsional)
              </Label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="149000"
                  className="pl-11 h-11 rounded-xl font-mono"
                />
              </div>
            </div>

            {/* Gambar Produk */}
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#002253] dark:text-slate-200">
                Gambar Produk
              </Label>

              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="URL gambar atau unggah file di samping..."
                  className="h-10 rounded-xl bg-white dark:bg-slate-950"
                />

                <div className="relative shrink-0">
                  <input
                    type="file"
                    id="product-image-file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="sr-only"
                  />
                  <Label
                    htmlFor="product-image-file"
                    className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0540ad] px-4 text-xs font-semibold text-white transition hover:bg-[#043591] disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Mengunggah...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>Unggah Gambar</span>
                      </>
                    )}
                  </Label>
                </div>
              </div>

              {formData.image && (
                <div className="mt-2 relative aspect-video w-full max-w-xs overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800">
                  <Image
                    src={formData.image}
                    alt="Preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: "" })}
                    className="absolute top-2 right-2 rounded-md bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-xs hover:bg-red-700"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>

            {/* Link Pembelian (Marketplaces) */}
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#002253] dark:text-slate-200">
                    Link Pembelian (Shopee, TikTok, dll)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Isi tautan marketplace tempat pembeli dapat membeli produk ini.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCustomBuyLink}
                  className="h-8 rounded-lg text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  <span>Tambah Link Lain</span>
                </Button>
              </div>

              <div className="space-y-2.5">
                {buyLinks.map((link, idx) => {
                  const preset = PLATFORM_PRESETS.find(
                    (p) => p.id.toLowerCase() === link.platform.toLowerCase()
                  );

                  return (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-950"
                    >
                      <div className="w-full sm:w-40 shrink-0">
                        <Input
                          type="text"
                          value={link.label}
                          onChange={(e) => handleUpdateBuyLink(idx, "label", e.target.value)}
                          placeholder="Platform Label"
                          className="h-9 text-xs rounded-lg font-semibold"
                        />
                      </div>

                      <div className="w-full relative">
                        <Input
                          type="url"
                          value={link.url}
                          onChange={(e) => handleUpdateBuyLink(idx, "url", e.target.value)}
                          placeholder={preset?.placeholder || "https://..."}
                          className="h-9 text-xs rounded-lg"
                        />
                      </div>

                      <div className="flex items-center gap-1 shrink-0 w-full sm:w-auto justify-end">
                        {link.url && (
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-[#0540ad] hover:bg-slate-50"
                            title="Buka link"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveBuyLink(idx)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Hapus baris ini"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Aktif Switch */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <div>
                <Label htmlFor="is-active" className="text-sm font-bold text-[#002253] dark:text-white cursor-pointer">
                  Tampilkan di Subdomain product.satudev.id
                </Label>
                <p className="text-xs text-slate-500">
                  Jika dinonaktifkan, produk tidak akan muncul di endpoint publik REST API
                </p>
              </div>

              <input
                type="checkbox"
                id="is-active"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-5 w-5 rounded border-gray-300 text-[#0540ad] focus:ring-[#0540ad] cursor-pointer"
              />
            </div>

            {/* Dialog Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl border-slate-200"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-[#0540ad] px-6 text-white hover:bg-[#043591]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>{editingProduct ? "Simpan Perubahan" : "Simpan Produk"}</span>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* API Documentation Dialog */}
      <Dialog open={isApiDialogOpen} onOpenChange={setIsApiDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto rounded-[24px] border-[#dfdfe0] p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-[#002253] dark:text-white flex items-center gap-2">
              <Code2 className="h-5 w-5 text-[#0540ad]" />
              <span>Panduan REST API untuk product.satudev.id</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 text-sm text-slate-700 dark:text-slate-300 pt-2">
            <p>
              REST API ini dirancang untuk diakses oleh frontend di subdomain{" "}
              <strong className="text-[#0540ad] dark:text-blue-400">product.satudev.id</strong>. Header CORS
              sudah terpasang sehingga tidak akan diblokir oleh browser.
            </p>

            {/* Endpoint 1 */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
                  GET
                </span>
                <span className="text-xs text-slate-500">Public (No Auth)</span>
              </div>
              <p className="mt-2 font-mono text-xs font-bold text-[#002253] dark:text-blue-300">
                /api/products?status=active
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Mengambil seluruh daftar produk yang berstatus aktif.
              </p>
            </div>

            {/* Endpoint 2 */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
                  GET
                </span>
                <span className="text-xs text-slate-500">Public (No Auth)</span>
              </div>
              <p className="mt-2 font-mono text-xs font-bold text-[#002253] dark:text-blue-300">
                /api/products/[id-atau-slug]
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Mengambil detail 1 produk berdasarkan ID atau slug.
              </p>
            </div>

            {/* Contoh Kode JavaScript Fetch */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#002253] dark:text-slate-200 mb-1.5">
                Contoh Fetch di Subdomain (Next.js / React / Vue):
              </h4>
              <pre className="rounded-xl bg-slate-900 p-4 text-xs font-mono text-slate-100 overflow-x-auto">
{`// Di frontend product.satudev.id
const res = await fetch("${apiEndpointUrl}?status=active");
const data = await res.json();

console.log(data.products);
/*
Output Array:
[
  {
    "id": "e3b0c442...",
    "name": "SatuDev Starter Kit",
    "slug": "satudev-starter-kit",
    "description": "Template Next.js siap pakai dengan Better Auth dan Drizzle",
    "price": "149000.00",
    "image": "/featuredImageBlog/...",
    "imageUrl": "https://satudev.id/featuredImageBlog/...",
    "buyLinks": [
      { "platform": "shopee", "label": "Shopee", "url": "https://shopee.co.id/..." },
      { "platform": "tiktok", "label": "TikTok Shop", "url": "https://shop.tiktok.com/..." }
    ],
    "isActive": true
  }
]
*/`}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                onClick={() => setIsApiDialogOpen(false)}
                className="rounded-xl bg-[#0540ad] text-white"
              >
                Tutup Panduan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
