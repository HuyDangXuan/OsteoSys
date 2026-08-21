import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import MetricsStrip from "@/components/MetricsStrip";
import EquipmentSection from "@/components/EquipmentSection";
import SolutionsSection from "@/components/SolutionsSection";
import ClinicalSection from "@/components/ClinicalSection";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <MetricsStrip />
        <EquipmentSection />
        <SolutionsSection />
        <ClinicalSection />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
