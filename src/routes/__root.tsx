import { useEffect } from "react";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { bootLocale, messages, useLocaleStore } from "@/lib/i18n";
import appCss from "../styles.css?url";

const LOCALE_BOOT = `(function(){try{var q=new URLSearchParams(location.search).get("lang");var s=localStorage.getItem("medireminder-locale");var l=(q==="en"||q==="fa")?q:(s==="en"||s==="fa")?s:"fa";document.documentElement.lang=l;document.documentElement.dir=l==="fa"?"rtl":"ltr";document.title=l==="fa"?"یادآور دارو":"MediReminder";}catch(e){}})();`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: messages.fa.appName },
      { name: "theme-color", content: "#0e1412" },
      { name: "description", content: messages.fa.metaDescription },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Vazirmatn:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="fa" dir="rtl" className="antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LOCALE_BOOT }} />
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <LocaleBoot />
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}

function LocaleBoot() {
  const locale = useLocaleStore((s) => s.locale);
  useEffect(() => {
    bootLocale();
  }, []);
  useEffect(() => {
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute("content", messages[locale].metaDescription);
  }, [locale]);
  return null;
}
