"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Marquee } from "@/components/ui/marquee";

const testimonials = [
  {
    name: "Abuelgasim Ibrahim Idriss Musa",
    username: "@abuelgasim",
    body: "CUI is home to students from all over the world; with its great academic programs, supportive faculty, staff and social environment. CUI has given me confidence and taught me to never stop yearning for knowledge.",
    img: "/images/people/Abuelgasim.jpg",
    country: "🇸🇩 Sudan",
  },
  {
    name: "Essa M. I. Elhamalawia",
    username: "@essa",
    body: "Unlike the image portrayed abroad, Pakistan is a very safe place to live and study. Pakistanis love foreigners and have always made me feel at home.",
    img: "/images/people/essa.jpg",
    country: "🇵🇸 Palestine",
  },
  {
    name: "Haneen Anwar",
    username: "@haneen",
    body: "I was in search of a scholarship to fund my education and was privileged to receive the very competitive Association of Commonwealth Universities (ACU) scholarship to study at CUI.",
    img: "/images/people/haneen-anwar.jpg",
    country: "🇯🇴 Jordan",
  },
  {
    name: "Rumeng HE",
    username: "@rumeng",
    body: "My experience can simply be described as amazing and fulfilling. Studying in such a serene and comfortable environment under the tutelage of professors greatly helped my academic pursuit.",
    img: "/images/people/Rumeng-HE.jpg",
    country: "🇨🇳 China",
  },
];

function TestimonialCard({
  img,
  name,
  username,
  body,
  country,
}: (typeof testimonials)[number]) {
  return (
    <Card className="w-64">
      <CardContent>
        <div className="flex items-center gap-2.5">
          <Avatar className="size-9">
            <AvatarImage src={img} alt={name} />
            <AvatarFallback>{name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <figcaption className="text-sm font-medium text-foreground flex items-center gap-1">
              {name} <span className="text-xs">{country}</span>
            </figcaption>
            <p className="text-xs font-medium text-muted-foreground">
              {username}
            </p>
          </div>
        </div>
        <blockquote className="mt-3 text-sm text-muted-foreground">
          {body}
        </blockquote>
      </CardContent>
    </Card>
  );
}

export default function TestimonialsMarquee() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center gap-1 overflow-hidden py-8">
      <Marquee pauseOnHover repeat={3} className="[--duration:120s]">
        {testimonials.map((review) => (
          <TestimonialCard key={review.username} {...review} />
        ))}
      </Marquee>

      <Marquee
        pauseOnHover
        reverse
        repeat={3}
        className="[--duration:120s] mt-6"
      >
        {testimonials.map((review) => (
          <TestimonialCard key={review.username + "-rev"} {...review} />
        ))}
      </Marquee>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-background/95 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-background/95 to-transparent" />
      <div className="pointer-events-none absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-background/90 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-background/90 to-transparent" />
    </div>
  );
}
