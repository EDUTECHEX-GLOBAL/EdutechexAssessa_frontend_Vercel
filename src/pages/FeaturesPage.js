import React from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Features from "../components/Features";
import PageLayout from "../components/Layout/PageLayout";

const FeaturesPage = () => {
  const canonical = "https://edutechexassessa.com/features";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "url": canonical,
    "name": "Features | EdutechEx AssessA",
    "description": "Explore EdutechEx AssessA features — innovative tools for AI-powered assessments."
  };

  return (
    <PageLayout>
      <>
        <Helmet>
          <title>Features | EdutechEx AssessA</title>
          <meta
            name="description"
            content="Explore EdutechEx AssessA features — innovative tools for AI-powered assessments."
          />
          <link rel="canonical" href={canonical} />
          <script type="application/ld+json">
            {JSON.stringify(jsonLd)}
          </script>
        </Helmet>

        <Navbar />
        <main className="pt-20">
          <Features />
        </main>
        <Footer />
      </>
    </PageLayout>
  );
};

export default FeaturesPage;
