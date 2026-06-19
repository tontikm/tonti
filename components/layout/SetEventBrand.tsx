"use client";

import { useEffect } from "react";
import { useEventBrand } from "@/components/layout/EventBrandProvider";

type SetEventBrandProps = {
  slug: string;
  name?: string;
  logo?: string;
};

export function SetEventBrand({ slug, name, logo }: SetEventBrandProps) {
  const { setBrand } = useEventBrand();

  useEffect(() => {
    if (logo && name) {
      setBrand({
        name,
        logo,
        href: `/events/${slug}`,
      });
    } else {
      setBrand(null);
    }

    return () => setBrand(null);
  }, [slug, name, logo, setBrand]);

  return null;
}
