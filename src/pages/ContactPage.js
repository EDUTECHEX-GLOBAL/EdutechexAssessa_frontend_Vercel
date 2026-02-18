import React from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Contact from "../components/Contact";
import PageLayout from "../components/Layout/PageLayout";

const ContactPage = () => {
  const canonical = "https://edutechexassessa.com/contact";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "url": canonical,
    "name": "Contact | EdutechEx AssessA",
    "description": "Get in touch with EdutechEx AssessA — contact us for demos, partnerships and support."
  };

  return (
    <PageLayout>
      <>
        <Helmet>
          <title>Contact | EdutechEx AssessA</title>
          <meta
            name="description"
            content="Get in touch with EdutechEx AssessA — contact us for demos, partnerships and support."
          />
          <link rel="canonical" href={canonical} />
          <script type="application/ld+json">
            {JSON.stringify(jsonLd)}
          </script>
        </Helmet>

        <Navbar />
        <main className="pt-20">
          <Contact />
        </main>
        <Footer />
      </>
    </PageLayout>
  );
};

export default ContactPage;
