"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteProduct = async () => {
    const confirmed = window.confirm(`Supprimer "${productName}" ? Cette action est definitive.`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      const payload: { error?: string } = await response.json().catch(() => ({}));

      if (!response.ok) {
        window.alert(payload.error ?? "Suppression impossible.");
        return;
      }

      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={deleteProduct}
      disabled={isDeleting}
      className="text-red-700 underline disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isDeleting ? "Suppression..." : "Supprimer"}
    </button>
  );
}
