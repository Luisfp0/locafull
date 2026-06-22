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
        priceCents: 18000,
        abacateProductId: "prod_SGcYj0qjrJG4cCYDZStTdbm1",
      },
      {
        id: "extra-day",
        label: "Cada dia adicional",
        priceCents: 1000,
        note: "por dia",
      },
      {
        id: "second-unit",
        label: "2ª caçamba em diante (locação seguida)",
        priceCents: 15000,
        note: "por caçamba",
      },
    ],
    rules: [
      "A 1ª caçamba custa R$ 180,00. A partir da 2ª caçamba, R$ 150,00 cada.",
      "O desconto da 2ª caçamba vale somente em locações seguidas: retiramos a cheia e trocamos na hora por outra, sem dias de intervalo.",
      "Indicado para: limpeza de quintal, pequenas obras, reformas, jardins e pinturas.",
      "Drywall e vidros: descarte somente em tambores — não use na mini caçamba.",
    ],
    ctaLabel: "Solicitar mini caçamba",
    orderEnabled: true,
  },
  {
    id: "drum",
    name: "Tambor",
    imageSrc: "/images/tambor-reforma.jpg",
    imageAlt: "Tambor Locafull com rodízios em reforma",
    capacity: "200 L · até 500 kg",
    plans: [
      {
        id: "5-days",
        label: "Aluguel por 5 dias",
        priceCents: 13000,
        abacateProductId: "prod_0yQK4p42kyAq1rZdnFLeRaBk",
      },
      {
        id: "extra-day",
        label: "Cada dia adicional",
        priceCents: 1000,
        note: "por tambor",
      },
    ],
    combos: [
      {
        id: "combo-1",
        label: "1 tambor",
        priceCents: 15000,
        abacateProductId: "prod_W6aYMGXLtZ4NL1Sbzwch2bfW",
      },
      {
        id: "combo-2",
        label: "2 tambores",
        priceCents: 20000,
        abacateProductId: "prod_JArSP3PMtELDRH01tPWX3Dx5",
      },
      {
        id: "combo-3",
        label: "3 tambores",
        priceCents: 25000,
        abacateProductId: "prod_H3ZBzRzygk3hd4dSccJHTJXC",
      },
    ],
    rules: [
      "Combos: desconto válido somente para os combos listados.",
      "A cada tambor adicional no combo, acrescenta R$ 50,00 por tambor.",
      "Não é permitido lixo orgânico ou líquido.",
      "Drywall e vidros devem ser descartados em tambores.",
    ],
    ctaLabel: "Solicitar tambor",
    orderEnabled: true,
  },
  {
    id: "barrel",
    name: "Barril",
    imageSrc: "/images/barril.jpeg",
    imageAlt: "Barril Locafull para resíduos de obra",
    capacity: "Consulte capacidade e valores",
    plans: [],
    rules: [
      "Valores e disponibilidade sob consulta.",
      "Entre em contato pelo WhatsApp para orçamento.",
    ],
    ctaLabel: "Consultar no WhatsApp",
    orderEnabled: false,
  },
];
