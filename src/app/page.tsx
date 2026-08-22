import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import MetricsStrip from "@/components/MetricsStrip";
import EquipmentSection from "@/components/EquipmentSection";
import SolutionsSection from "@/components/SolutionsSection";
import ClinicalSection from "@/components/ClinicalSection";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import { getCmsContent } from "@/lib/actions/cms";

export default async function Home() {
  const [globalContent, heroContent, clinicalContent] = await Promise.all([
    getCmsContent("global"),
    getCmsContent("home_hero"),
    getCmsContent("clinical_evidence"),
  ]);

  return (
    <>
      <Header globalData={globalContent.data} />
      <main>
        <HeroSection data={heroContent.data} />
        <MetricsStrip />
        <EquipmentSection />
        <SolutionsSection />
        <ClinicalSection data={clinicalContent.data} />
        <ContactForm />
      </main>
      <Footer globalData={globalContent.data} />
    </>
  );
}
