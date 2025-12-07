"use client";

import { AnimatedTestimonials } from "@/components/animated-testimonials";

const testimonials = [
  {
    quote:
      "I was in search of a scholarship to fund my education and was privileged to receive the very competitive Association of Commonwealth Universities (ACU) scholarship to study at CUI. This opportunity to studying molecular biology has given me the rare chance of contributing towards research on diseases that will hopefully help improve lives.",
    name: "Haneen Anwar",
    designation: "Jordanian Alumna",
    src: "/images/people/haneen-anwar.jpg",
  },
  {
    quote:
      "My experience can simply be described as amazing and fulfilling. Studying in such a serene and comfortable environment under the tutelage of professors greatly helped my academic pursuit. Hence, I look forward to a future academic engagement with CUI again.",
    name: "Rumeng HE",
    designation: "Chinese Alumna",
    src: "/images/people/Rumeng-HE.jpg",
  },
  {
    quote:
      "CUI is home to students from all over the world; with its great academic programs, supportive faculty, staff and social environment. CUI has given me confidence and taught me to never stop yearning for knowledge. I have become an independent individual and am equipped with skills necessary to be positive and confident to face the social world ahead of me. Thanks CUI and Thanks Pakistan.",
    name: "Abuelgasim Ibrahim Idriss Musa",
    designation: "Sudanese Alumnus",
    src: "/images/people/Abuelgasim Ibrahim Idriss Musa.jpg",
  },
  {
    quote:
      "Unlike the image portrayed abroad, Pakistan is a very safe place to live and study. Pakistanis love foreigners and have always made me feel at home. I would definitely recommend CUI to other prospective students.",
    name: "Essa M. I. Elhamalawia",
    designation: "Palestinian Alumnus",
    src: "/images/people/essa.jpg",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-6xl space-y-8 px-6 md:space-y-16">
        <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
          <h2 className="text-4xl font-medium lg:text-5xl">
            Build by makers, loved by thousand developers
          </h2>
          <p>
            Gemini is evolving to be more than just the models. It supports an
            entire to the APIs and platforms helping developers and businesses
            innovate.
          </p>
        </div>
        <AnimatedTestimonials autoplay testimonials={testimonials} />
      </div>
    </section>
  );
}
