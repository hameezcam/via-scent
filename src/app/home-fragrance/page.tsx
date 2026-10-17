import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Wind,
  Droplets,
  HeartHandshake,
  Smartphone,
  Flame,
  VolumeX,
  Compass,
  Layers,
  HelpCircle,
  PhoneCall,
  Home as HomeIcon,
} from "lucide-react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { BRAND_CONFIG } from "@/config/brand.config";
import { productService } from "@/services/product.service";
import { ProductCard } from "@/components/product/ProductCard";
import { HomeConsultationForm } from "@/components/home-fragrance/HomeConsultationForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Luxury Home Fragrance & Residential Scent Architecture | Dr. Scent Sri Lanka | VIA Scent",
  description:
    "Curate your private residence into an atmosphere of quiet luxury. Waterless, heatless cold-air diffusers, artisanal fragrance oils, and bespoke in-home scent styling across Sri Lanka.",
};

export default async function HomeFragranceMarketingPage() {
  const breadcrumbs = [{ label: "Home Fragrance Architecture" }];

  // Fetch residential products
  const allOils = await productService.getByCategory("fragrance-oils");
  const homeInstruments = await productService.getByCategory("home-fragrance");
  const aromaDiffusers = await productService.getByCategory("aroma-diffusers");

  // Combine top home friendly products
  const featuredHomeOils = allOils.slice(0, 4);

  const residentialPillars = [
    {
      icon: Wind,
      title: "100% Waterless Cold-Air Nebulization",
      description:
        "Unlike ultrasonic water humidifiers that dilute scent with moisture, cold-air technology atomizes pure fragrance oil into microscopic sub-micron dry vapor, preserving 100% of the botanicals.",
    },
    {
      icon: Droplets,
      title: "Zero Moisture, Steam or Fabric Residue",
      description:
        "Completely dry dispersal leaves zero oily film or moisture buildup on fine timber, Italian marble, upholstery, or silk drapery—engineered specifically for tropical climates.",
    },
    {
      icon: ShieldCheck,
      title: "Family, Child & Pet Safe (IFRA Certified)",
      description:
        "Every formulation conforms to the strict 51st Amendment of the International Fragrance Association. Free from burning wicks, soot, volatile organic compounds, and harsh phthalates.",
    },
    {
      icon: Smartphone,
      title: "Intelligent Ambient Scheduling",
      description:
        "Control fragrance intensity and operating hours automatically via Bluetooth or discrete touch controls. Awaken to crisp citrus and return home to warm agarwood and amber.",
    },
  ];

  const roomGuide = [
    {
      room: "The Living Lounge & Foyer",
      scent: "Royal Oud & Amber Noir",
      family: "Noble Woody Oriental",
      notes: "Cardamom, Smoked Agarwood, Amber, Bourbon Vanilla",
      description:
        "Creates an unforgettable first impression for arriving guests. Warm, enveloping, and distinctly five-star.",
      image: "/images/categories/home-fragrance.jpg",
      recommendedHardware: "Dr. Scent Smart Tower Pro or Ceramic Nebulizer",
    },
    {
      room: "The Master Suite & Dressing Room",
      scent: "Damask Rose & Cashmere Veil",
      family: "Velvety Floral & Cashmere Wood",
      notes: "Bulgarian Rose, Pink Pepper, Cashmere Wood, Soft Musk",
      description:
        "Designed to decelerate the mind after dusk. A tactile, gentle cocoon of calm that supports restful sleep.",
      image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=85",
      recommendedHardware: "Architectural Ceramic Nebulizer",
    },
    {
      room: "The Dining Pavilion & Open Kitchen",
      scent: "White Tea & Morning Bergamot",
      family: "Crisp Citrus & Botanical Mist",
      notes: "Italian Bergamot, Silver Needle White Tea, Neroli, Transparent Cedar",
      description:
        "Effortlessly neutralizes ambient cooking aromas without overpowering delicate meals or table conversation.",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=85",
      recommendedHardware: "Dr. Scent Portable Ambient Diffuser",
    },
    {
      room: "The Executive Study & Library",
      scent: "Santal & Black Cardamom",
      family: "Woody Spicy & Papyrus",
      notes: "Black Cardamom, Australian Sandalwood, Orris Butter, Smoked Leather",
      description:
        "Deepens cognitive focus and contemplation. Grounding timber notes harmonize with leather, books, and teak.",
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=85",
      recommendedHardware: "Dr. Scent Portable Ambient Diffuser",
    },
  ];

  const instruments = [
    {
      title: "Architectural Ceramic Nebulizer",
      subtitle: "Hand-Poured Porcelain with Halo Illumination",
      coverage: "Up to 600 sq.ft (60 m²)",
      price: "LKR 34,500",
      description:
        "A sculptural vessel blending tactile matte stoneware with sub-micron scent atomization. Features an integrated warm 2700K ambient LED base that casts a gentle candlelight glow across bedside pedestals and consoles.",
      image: "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=800&q=85",
      link: "/products/luxe-acoustic-ceramic-nebulizer",
      badge: "Best for Master Suites",
    },
    {
      title: "Dr. Scent Portable Ambient Diffuser",
      subtitle: "Cordless Anodized Aluminum Nebulizer",
      coverage: "Up to 300 sq.ft (30 m²)",
      price: "LKR 28,500",
      description:
        "Machined from aerospace-grade brushed aluminum. Operates cordlessly on a rechargeable lithium battery for up to 72 hours. Perfect for vehicle cup holders, home study desks, and private bathrooms.",
      image: "/images/categories/aroma-diffusers.jpg",
      link: "/products/dr-scent-luxe-portable-diffuser",
      badge: "Rechargeable & Cordless",
    },
    {
      title: "Dr. Scent Smart Aroma Tower Pro",
      subtitle: "Floor-Standing Column for Expansive Residences",
      coverage: "Up to 1,500 sq.ft (150 m²)",
      price: "LKR 68,500",
      description:
        "The definitive architectural scenting statement for double-height living rooms, beachfront villas, and open-plan penthouses. Bluetooth app scheduling allows automated intensity calibration from morning to night.",
      image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=85",
      link: "/products/dr-scent-smart-tower-pro",
      badge: "High-Capacity Coverage",
    },
    {
      title: "The Grand Discovery Scent Flight",
      subtitle: "Curated 5 x 15ml Pure Diffuser Oils",
      coverage: "5 Distinct Olfactory Worlds",
      price: "LKR 18,500",
      description:
        "Housed in an ivory linen presentation coffer with gold hot-stamped insignia. Includes 5 signature 15ml flacons: Royal Oud, White Tea, Santal, Coastal Fig, and Amber Velvet.",
      image: "/images/categories/gift-collections.jpg",
      link: "/products/discovery-scent-flight-collection",
      badge: "Curated Discovery Gift",
    },
  ];

  const faqs = [
    {
      question: "How does cold-air nebulization differ from traditional scented candles and water diffusers?",
      answer:
        "Traditional candles burn oils with an open flame, releasing carbon soot, altering the natural scent chemistry through heat, and presenting a continuous fire hazard. Water diffusers (ultrasonic humidifiers) dilute fragrance in water and disperse wet vapor that raises indoor humidity in Sri Lanka's tropical climate. Dr. Scent cold-air nebulizers use compressed dry airflow to atomize 100% pure fragrance oil into invisible micro-droplets without water, heat, or dilution.",
    },
    {
      question: "Will the fragrance mist leave residue or stains on my furniture, curtains, or art?",
      answer:
        "No. Because the atomized particles measure under 5 microns (smaller than household dust), they remain suspended in the natural air currents rather than settling down. They will not deposit dampness, condensation, or oily residue on hardwood floors, Italian leather, silk curtains, or artwork.",
    },
    {
      question: "How long does a 100ml fragrance oil bottle last in a home?",
      answer:
        "At average residential operation (e.g., operating 4 to 6 hours per day at moderate intensity), a 100ml bottle of pure Dr. Scent fragrance oil typically lasts between 45 to 60 days. Our portable diffusers using 10ml to 15ml bottles last approximately 3 to 4 weeks depending on frequency.",
    },
    {
      question: "Are VIA Scent home formulations safe around children and household pets?",
      answer:
        "Yes. All our pure fragrance oils are compounded under the international standards of the International Fragrance Association (IFRA 51st Amendment). They are free from phthalates, volatile parabens, carcinogens, and harsh aerosol propellants. As with all aromatic products, diffusers should operate in well-ventilated living spaces.",
    },
    {
      question: "Can I receive in-home assistance in selecting the right diffusers and fragrances?",
      answer:
        "Yes. We offer complimentary bespoke residential scent consultations. Our Colombo fragrance stylist can provide personal recommendations over WhatsApp or arrange an on-site scent flight demonstration at your private residence or villa.",
    },
  ];

  return (
    <div className="bg-[#FAF8F5] text-[#151412] min-h-screen">
      {/* 1. Cinematic Hero Section */}
      <section className="relative bg-[#151412] text-[#F8F6F1] py-24 sm:py-36 border-b border-[#2A2622] overflow-hidden">
        {/* Background Image with Depth Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src="/images/categories/home-fragrance.jpg"
            alt="Luxury residential sanctuary living room"
            fill
            priority
            className="object-cover object-center opacity-30 brightness-[0.75] contrast-110 filter"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#151412] via-[#151412]/60 to-[#151412]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#151412] via-[#151412]/70 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-7">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFFFF]/10 backdrop-blur-md border border-[#B49A70]/40 text-[#B49A70] text-[10px] uppercase tracking-[0.24em] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#B49A70]" />
              <span>RESIDENTIAL SCENT ARCHITECTURE</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-[1.12]">
              Curate your home into an atmosphere of{" "}
              <span className="italic font-light text-[#B49A70]">quiet, timeless elegance.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-[#D8D0C4] leading-relaxed max-w-2xl font-light">
              From intimate master suites and dressing rooms to expansive open-concept penthouses and coastal villas, discover cold-air micro-nebulization engineered to scent private spaces without water, heat, or residue.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <a
                href="#instruments"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#B49A70] text-[#151412] hover:bg-[#C5AD85] font-semibold text-xs tracking-[0.2em] uppercase rounded-xl transition-all duration-300 shadow-md hover:shadow-xl group"
              >
                <span>Explore Home Instruments</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#consultation"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent border border-white/20 text-[#F8F6F1] hover:border-[#B49A70] hover:text-[#B49A70] font-medium text-xs tracking-[0.2em] uppercase rounded-xl transition-colors backdrop-blur-xs"
              >
                <span>Book In-Home Consultation</span>
              </a>
            </div>

            {/* Key Trust Signals */}
            <div className="pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-[#D8D0C4]/90">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B49A70] shrink-0" />
                <span>100% Waterless Cold Mist</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B49A70] shrink-0" />
                <span>Zero Fabric or Timber Residue</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B49A70] shrink-0" />
                <span>IFRA Certified Safe</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B49A70] shrink-0" />
                <span>Ultra-Quiet &lt;25dB</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* 2. Core Architectural Principles */}
        <section className="py-12 border-b border-[#E7E2D8]">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[#B49A70] block mb-2">
              THE SCIENCE OF RESIDENTIAL DIFFUSION
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#151412] font-normal tracking-tight">
              Why Cold-Air Nebulization Transcends Traditional Candles & Mists
            </h2>
            <p className="text-sm text-[#57534E] mt-3 font-light leading-relaxed">
              Engineered with sub-micron atomization technology to maintain absolute molecular fragrance fidelity without raising humidity or creating fire risks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {residentialPillars.map((pillar) => {
              const IconComponent = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-7 bg-[#FFFFFF] rounded-2xl border border-[#E7E2D8] hover:border-[#B49A70]/60 shadow-xs hover:shadow-lg transition-all duration-300 space-y-3 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] group-hover:bg-[#B49A70]/10 border border-[#E7E2D8] group-hover:border-[#B49A70]/30 flex items-center justify-center text-[#B49A70] transition-colors">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg font-medium text-[#151412]">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-[#57534E] leading-relaxed font-light">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. Room-by-Room Olfactory Guide */}
        <section className="py-16 border-b border-[#E7E2D8]">
          <div className="max-w-2xl mb-12">
            <span className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[#B49A70] block mb-1.5">
              ROOM-BY-ROOM SCENT MAPPING
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#151412] font-normal tracking-tight">
              Curate Each Living Space with Tailored Olfactory Moods
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E] mt-2 font-light leading-relaxed">
              Every room possesses distinct airflow dynamics and emotional purposes. We curate specific fragrance families to harmonize seamlessly with each space.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {roomGuide.map((item, idx) => (
              <div
                key={item.room}
                className="bg-[#FFFFFF] rounded-2xl border border-[#E7E2D8] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-500 flex flex-col justify-between group"
              >
                <div className="relative aspect-[16/9] w-full bg-[#151412] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.room}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out brightness-[0.85] group-hover:brightness-[0.92]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#151412]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[#F8F6F1]">
                    <span className="text-xs font-semibold tracking-wider uppercase text-[#B49A70]">
                      {item.family}
                    </span>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#151412]/70 backdrop-blur-xs border border-white/10">
                      0{idx + 1}
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#78716C] block">
                      {item.room}
                    </span>
                    <h3 className="font-serif text-2xl font-medium text-[#151412]">
                      {item.scent}
                    </h3>
                    <p className="text-xs text-[#B49A70] font-medium tracking-wide">
                      Notes: {item.notes}
                    </p>
                    <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed font-light pt-1">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E7E2D8] flex items-center justify-between text-xs text-[#78716C]">
                    <span className="italic font-light">Recommended: {item.recommendedHardware}</span>
                    <Link
                      href="/shop/fragrance-oils"
                      className="text-[#151412] font-semibold uppercase tracking-[0.15em] hover:text-[#B49A70] flex items-center gap-1 transition-colors"
                    >
                      <span>Explore Blend</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Curated Residential Instruments Showcase */}
        <section id="instruments" className="py-16 border-b border-[#E7E2D8]">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[#B49A70] block mb-2">
              PRECISION HARDWARE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#151412] font-normal tracking-tight">
              Aesthetic Residential Cold-Air Diffusers
            </h2>
            <p className="text-sm text-[#57534E] mt-3 font-light leading-relaxed">
              Architectural vessels designed to integrate seamlessly into minimalist, contemporary, and classical interior decors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {instruments.map((inst) => (
              <div
                key={inst.title}
                className="bg-[#FFFFFF] rounded-2xl border border-[#E7E2D8] hover:border-[#B49A70]/60 shadow-xs hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-[4/3] w-full bg-[#FAF8F5] overflow-hidden">
                    <Image
                      src={inst.image}
                      alt={inst.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-3 left-3 bg-[#151412]/85 backdrop-blur-xs text-[#B49A70] text-[9px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full border border-[#B49A70]/30">
                      {inst.badge}
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B49A70] block">
                      {inst.coverage}
                    </span>
                    <h3 className="font-serif text-xl font-medium text-[#151412] leading-snug">
                      {inst.title}
                    </h3>
                    <p className="text-xs text-[#57534E] leading-relaxed line-clamp-3 font-light">
                      {inst.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-[#E7E2D8]/60 mt-4 flex items-center justify-between">
                  <span className="font-serif text-base font-semibold text-[#151412]">
                    {inst.price}
                  </span>
                  <Link
                    href={inst.link}
                    className="px-4 py-2 bg-[#151412] text-[#F8F6F1] hover:bg-[#B49A70] hover:text-[#151412] text-[10px] uppercase tracking-[0.18em] font-semibold rounded-xl transition-colors shadow-xs"
                  >
                    View Instrument
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Signature Pure Fragrance Formulations */}
        <section className="py-16 border-b border-[#E7E2D8]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[#B49A70] block mb-2">
                COLD-AIR DIFFUSION OILS
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#151412] font-normal tracking-tight">
                Curated Home Fragrance Blends
              </h2>
              <p className="text-xs sm:text-sm text-[#57534E] mt-2 font-light">
                100% pure undiluted perfume oils formulated strictly for waterless aroma nebulizers.
              </p>
            </div>
            <Link
              href="/shop/fragrance-oils"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#151412] hover:text-[#B49A70] pb-1 border-b border-[#151412]/30 hover:border-[#B49A70] transition-colors self-start sm:self-auto"
            >
              <span>Explore All Fragrance Oils</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredHomeOils.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* 6. In-Home Consultation & Scent Styling Section */}
        <section id="consultation" className="py-16 border-b border-[#E7E2D8]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Context Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B49A70]/10 border border-[#B49A70]/30 text-[#B49A70] text-[10px] uppercase tracking-[0.22em] font-semibold">
                <Compass className="w-3.5 h-3.5" />
                <span>CONCIERGE OLFACTORY STYLING</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl text-[#151412] font-normal tracking-tight leading-snug">
                Private In-Home Scent Consultation & Olfactory Mapping
              </h2>

              <p className="text-sm text-[#57534E] leading-relaxed font-light">
                Finding the precise balance of diffuser hardware, intensity calibration, and scent notes for your home is an art. Our Colombo fragrance concierge works directly with homeowners, luxury villa operators, and interior designers.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#151412] text-[#B49A70] flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#151412]">Architectural Review</h4>
                    <p className="text-xs text-[#57534E] font-light mt-0.5">
                      We evaluate your room dimensions, airflow directions, and interior material palettes (timber, marble, textiles).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#151412] text-[#B49A70] flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#151412]">Private Scent Flight Flight</h4>
                    <p className="text-xs text-[#57534E] font-light mt-0.5">
                      Experience tester flacons of noble oud, fresh white tea, sandalwood, and velvet botanicals in your own environment.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#151412] text-[#B49A70] flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#151412]">Turnkey Installation & Scheduling</h4>
                    <p className="text-xs text-[#57534E] font-light mt-0.5">
                      Discreet placement, power routing, and automated daypart schedules aligned to your daily routine.
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct Concierge Contact Box */}
              <div className="p-6 rounded-2xl bg-[#151412] text-[#F8F6F1] space-y-3 mt-6">
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#B49A70] block">
                  INSTANT PRIVATE CONCIERGE
                </span>
                <p className="text-xs text-[#D8D0C4] font-light leading-relaxed">
                  Prefer to speak immediately with our Senior Fragrance Stylist?
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <a
                    href="https://wa.me/94770000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] text-white rounded-xl text-xs font-semibold tracking-wider uppercase hover:bg-[#20ba5a] transition-colors"
                  >
                    <span>WhatsApp Concierge</span>
                  </a>
                  <a
                    href="tel:+94112000000"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-white/20 text-[#F8F6F1] rounded-xl text-xs font-medium tracking-wider uppercase hover:border-[#B49A70] hover:text-[#B49A70] transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Showroom</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Form Column */}
            <div className="lg:col-span-7">
              <HomeConsultationForm />
            </div>
          </div>
        </section>

        {/* 7. Homeowner FAQ Section */}
        <section className="py-16">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[#B49A70] block mb-2">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#151412] font-normal tracking-tight">
              Essential Guidance for Homeowners
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={faq.question}
                className="group p-6 bg-[#FFFFFF] rounded-2xl border border-[#E7E2D8] hover:border-[#B49A70]/60 transition-all [&_summary::-webkit-details-marker]:hidden"
                open={idx === 0}
              >
                <summary className="flex items-center justify-between cursor-pointer list-none text-left gap-4">
                  <h3 className="font-serif text-lg font-medium text-[#151412] group-hover:text-[#B49A70] transition-colors">
                    {faq.question}
                  </h3>
                  <span className="w-7 h-7 rounded-full bg-[#FAF8F5] border border-[#E7E2D8] text-[#151412] flex items-center justify-center shrink-0 group-open:rotate-180 transition-transform">
                    ↓
                  </span>
                </summary>
                <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed font-light mt-3 pt-3 border-t border-[#E7E2D8]/60">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
