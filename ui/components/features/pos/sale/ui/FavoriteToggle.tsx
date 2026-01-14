"use client";

import dynamic from "next/dynamic";

export const FavoriteToggle = dynamic(
  () => import("./FavoriteToggle.impl").then((m) => m.FavoriteToggleImpl),
  { ssr: false }
);
