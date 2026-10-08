import Navbar from "@/components/public/navbar";
import Footer from "@/components/public/footer";

export default function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}