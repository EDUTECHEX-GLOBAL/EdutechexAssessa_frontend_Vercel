import React, { Suspense, lazy, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "../../components/Navbar";
import { useSelector } from "react-redux";
import { Skeleton } from "antd";

const Discover = lazy(() => import("../../components/Discover"));
const Vision = lazy(() => import("../../components/Vision"));
const Features = lazy(() => import("../../components/Features"));
const Team = lazy(() => import("../../components/Team/Team"));
const Pricing = lazy(() => import("../../components/Pricing"));
const Faq = lazy(() => import("../../components/Faq"));
const Contact = lazy(() => import("../../components/Contact"));
const Footer = lazy(() => import("../../components/Footer"));

// ✅ Organization JSON-LD for rich results
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "EdutechEx AssessA",
  "url": "https://edutechexassessa.com",
  "description": "AssessA AI is your AI-driven educational companion — intelligent assessments, study tools, and learning solutions.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Hyderabad",
    "addressRegion": "Telangana",
    "addressCountry": "IN"
  },
  "sameAs": [
    "https://edutechexassessa.com/discover",
    "https://edutechexassessa.com/features",
    "https://edutechexassessa.com/vision",
    "https://edutechexassessa.com/faqs"
  ]
};

function Home() {
  const { assessaData } = useSelector((state) => state.root);
  const memoizedData = useMemo(() => assessaData, [assessaData]);

  return (
    <div className="font-inter">
      {/* ✅ Added Helmet for homepage SEO */}
      <Helmet>
        <title>Assessa AI | Your AI-Driven Educational Companion</title>
        <meta
          name="description"
          content="AssessA AI is your AI-driven educational companion — intelligent assessments, study tools, and learning solutions for students and institutions."
        />
        <link rel="canonical" href="https://edutechexassessa.com/" />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      <Navbar />
      <div className="pt-20">
        {/* ✅ Always render components — don't gate on API data */}
        <Suspense
          fallback={
            <div className="px-[20px] lg:px-20 mx-auto">
              <Skeleton active />
            </div>
          }
        >
          <Discover />
          <div className="px-[20px] lg:px-20 mx-auto">
            <Vision className="mt-16" />
            <Features className="mt-16" />
            <Team className="mt-16" />
            <Pricing className="mt-16" />
            <Faq className="mt-16" />
            <Contact className="mt-16" />
            <Footer className="mt-16" />
          </div>
        </Suspense>
      </div>
    </div>
  );
}

export default Home;