import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TimeTimer",
    short_name: "TimeTimer",
    description: "원형 다이얼 타이머",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#D2203D",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
