import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}