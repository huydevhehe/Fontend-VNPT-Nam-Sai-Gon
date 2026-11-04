import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import type { Product } from "@/lib/types";

export default function ProductCard({
  product,
  categorySlug,
}: {
  product: Product;
  categorySlug: string;
}) {
  const href = `/san-pham/${categorySlug}/${product.slug}`;
  return (
    <Link
      href={href}
      className="flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative flex h-40 items-center justify-center bg-vnpt-light">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <Package size={40} className="text-vnpt" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold text-slate-800">{product.title}</h3>
        <p className="line-clamp-2 text-sm text-slate-500">{product.shortDesc}</p>
        <span className="mt-auto text-sm font-semibold text-vnpt">Xem chi tiết →</span>
      </div>
    </Link>
  );
}
