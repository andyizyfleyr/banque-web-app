import "./globals.css";
import Layout from "@/components/Layout";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConfirmProvider } from "@/contexts/ConfirmContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { Toaster } from "react-hot-toast";
import SafeHydration from "@/components/SafeHydration";

const inter = Inter({ subsets: ["latin", "latin-ext", "greek"] });

export const metadata = {
  title: "REDBANK - Your Modern Bank",
  description: "Manage your finances with elegance and simplicity.",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning={true}>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning={true}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
                (function() {
                  if (typeof window !== 'undefined') {
                    const originalError = console.error;
                    console.error = function(...args) {
                      const msg = args.join(' ');
                      if (
                        msg.includes('bis_skin_checked') ||
                        msg.includes('Hydration failed') ||
                        msg.includes('attributes') ||
                        msg.includes('MetadataWrapper')
                      ) {
                        return;
                      }
                      originalError.apply(console, args);
                    };
                  }
                })();
              `,
          }}
        />
        <SafeHydration>
          <Toaster position="top-right" reverseOrder={false} />
        </SafeHydration>
        <LocaleProvider>
          <AuthProvider>
            <ConfirmProvider>
              <Layout>{children}</Layout>
            </ConfirmProvider>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html >
  );
}

