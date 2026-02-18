import React from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Pricing from "../components/Pricing";
import PageLayout from "../components/Layout/PageLayout";

const PricingPage = () => {
  const canonical = "https://edutechexassessa.com/pricing";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "url": canonical,
    "name": "Pricing | EdutechEx AssessA",
    "description": "EdutechEx AssessA pricing plans — find the right plan for students, teachers, and institutions."
  };

  return (
    <PageLayout>
      <>
        <Helmet>
          <title>Pricing | EdutechEx AssessA</title>
          <meta
            name="description"
            content="EdutechEx AssessA pricing plans — find the right plan for students, teachers, and institutions."
          />
          <link rel="canonical" href={canonical} />
          <script type="application/ld+json">
            {JSON.stringify(jsonLd)}
          </script>
        </Helmet>

        <Navbar />
        <main className="pt-20">
          <Pricing />
        </main>
        <Footer />
      </>
    </PageLayout>
  );
};

export default PricingPage;
