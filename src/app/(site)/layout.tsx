import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImpersonationBanner from "@/components/ImpersonationBanner";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ImpersonationBanner />
      <Header />
      {children}
      <Footer />
    </>
  );
}