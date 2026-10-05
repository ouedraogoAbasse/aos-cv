"use client";

import Builder from "./components/Builder";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Landing from "./components/Landing";
import PaymentModal from "./components/PaymentModal";
import PreviewModal from "./components/PreviewModal";
import { CVProvider } from "@/state/CVContext";

export default function Home() {
  return (
    <CVProvider>
      <div className="min-h-screen bg-base-100 text-base-content">
        <Header />

        <main>
          <Landing />
          <Builder />
        </main>

        <Footer />

        {/* Modales : montées en permanence pour pouvoir être ouvertes par id. */}
        <PaymentModal />
        <PreviewModal />
      </div>
    </CVProvider>
  );
}
