import React from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Discover from "../components/Discover";

const DiscoverPage = () => {
  const canonical = "https://edutechexassessa.com/discover";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "url": canonical,
    "name": "Discover | EdutechEx AssessA",
    "description": "Discover how EdutechEx AssessA transforms assessments with intelligent solutions."
  };

  return (
    <>
      <Helmet>
        <title>Discover | EdutechEx AssessA</title>
        <meta
          name="description"
          content="Discover how EdutechEx AssessA transforms assessments with intelligent solutions."
        />
        <link rel="canonical" href={canonical} />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      <Navbar />
      <main className="pt-20">
        <Discover />
      </main>
      <Footer />
    </>
  );
};

export default DiscoverPage;
