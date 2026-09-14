import type { PricingProduct } from "./types";

export const PRICING_PRODUCTS: PricingProduct[] = [
  {
    id: "mini-dumpster",
    name: "Mini caçamba",
    imageSrc: "/images/cacamba.jpeg",
    imageAlt: "Mini caçamba Locafull laranja em obra",
    capacity: "1 m³ · até 1.800 kg",
    plans: [
      {
        id: "48h",
        label: "Aluguel 48h",
        priceCents: 25000,
        abacateProductId: "prod_d1WrtSzLDHuK2AsgRGDmLemn",
      },
      {
        id: "extra-day",
        label: "Cada dia adicional",
        priceCents: 2000,
        note: "por dia",
      },
    ],
    rules: [],
    ctaLabel: "Solicitar mini caçamba",
    orderEnabled: true,
  },
  // Removed produtct for now, maybe will be added back later
  // {
  //   id: "drum",
  //   name: "Tambor",
  //   imageSrc: "/images/tambor-reforma.jpg",
  //   imageAlt: "Tambor Locafull com rodízios em reforma",
  //   capacity: "200 L · até 500 kg",
  //   plans: [
  //     {
  //       id: "5-days",
  //       label: "Aluguel por 5 dias",
  //       priceCents: 15000,
  //       abacateProductId: "prod_5t1fC1PnC3Dke0jXgG6HxZte",
  //     },
  //     {
  //       id: "extra-day",
  //       label: "Cada dia adicional",
  //       priceCents: 1000,
  //       note: "por tambor",
  //     },
  //   ],
  //   combos: [
  //     {
  //       id: "combo-1",
  //       label: "1 tambor",
  //       priceCents: 15000,
  //       abacateProductId: "prod_tCgwUeXb5wFhKm0MR6SREfMy",
  //     },
  //     {
  //       id: "combo-2",
  //       label: "2 tambores",
  //       priceCents: 25000,
  //       abacateProductId: "prod_Nw4UxU3tAYzse2kU1gaL2k5n",
  //     },
  //     {
  //       id: "combo-3",
  //       label: "3 tambores",
  //       priceCents: 35000,
  //       abacateProductId: "prod_H3ZBzRzygk3hd4dSccJHTJXC",
  //     },
  //   ],
  //   rules: [
  //     "Pagamento via Pix ou cartão no site.",
  //     "O desconto dos combos é válido somente para os combos listados.",
  //     "A cada tambor adicional no combo, acrescenta R$ 100,00 por tambor.",
  //     "Não é permitido lixo orgânico ou líquido.",
  //     "Drywall e vidros devem ser descartados em tambores.",
  //   ],
  //   ctaLabel: "Solicitar tambor",
  //   orderEnabled: true,
  // },
];
