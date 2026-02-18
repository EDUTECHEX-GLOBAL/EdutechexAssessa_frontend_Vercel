import React from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Team from "../components/Team/Team";
import PageLayout from "../components/Layout/PageLayout";

const TeamPage = () => {
  const canonical = "https://edutechexassessa.com/team";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "url": canonical,
    "name": "Team | EdutechEx AssessA",
    "description": "Meet the EdutechEx AssessA team — founders and engineers building AI-driven assessments."
  };

  return (
    <PageLayout>
      <>
        <Helmet>
          <title>Team | EdutechEx AssessA</title>
          <meta
            name="description"
            content="Meet the EdutechEx AssessA team — founders and engineers building AI-driven assessments."
          />
          <link rel="canonical" href={canonical} />
          <script type="application/ld+json">
            {JSON.stringify(jsonLd)}
          </script>
        </Helmet>

        <Navbar />
        <main className="pt-20">
          <Team />
        </main>
        <Footer />
      </>
    </PageLayout>
  );
};

export default TeamPage;
