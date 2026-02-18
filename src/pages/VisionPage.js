import React from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Vision from "../components/Vision";
import PageLayout from "../components/Layout/PageLayout";

const VisionPage = () => {
  const canonical = "https://edutechexassessa.com/vision";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "url": canonical,
    "name": "Vision | EdutechEx AssessA",
    "description": "Learn about EdutechEx AssessA’s vision — shaping the future of AI-powered assessments."
  };

  return (
    <PageLayout>
      <>
        <Helmet>
          <title>Vision | EdutechEx AssessA</title>
          <meta
            name="description"
            content="Learn about EdutechEx AssessA’s vision — shaping the future of AI-powered assessments."
          />
          <link rel="canonical" href={canonical} />
          <script type="application/ld+json">
            {JSON.stringify(jsonLd)}
          </script>
        </Helmet>

        <Navbar />
        <main className="pt-20">
          <Vision />
        </main>
        <Footer />
      </>
    </PageLayout>
  );
};

export default VisionPage;
