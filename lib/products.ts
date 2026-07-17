export type Product = {
  id: string;
  handle: string;
  title: string;
  price: string;
  available: boolean;
  color: string;
  images: string[];
  sizingMen: string;
  sizingWomen: string;
  description?: string;
  measurements?: string;
  variantId?: string;
};

type ProductSeed = Omit<Product, "id" | "images" | "sizingMen" | "sizingWomen">;

const productSeeds: ProductSeed[] = [
  { handle: "paris-sun-dyed-jacket-1", title: '"Paris" (1) Sun-Dyed Jacket', price: "$350.00 USD", available: true, color: "Blue" },
  { handle: "paris-sun-dyed-jacket-2", title: '"Paris" (2) Sun-Dyed Jacket', price: "$350.00 USD", available: true, color: "Blue" },
  { handle: "carpenter-patchwork-chore-jacket-1", title: "Carpenter Patchwork Chore Jacket (1)", price: "$320.00 USD", available: true, color: "Black" },
  { handle: "carpenter-chore-jacket-2-bordeaux", title: "Carpenter Chore Jacket (2)", price: "$320.00 USD", available: true, color: "Bordeaux" },
  { handle: "purple-cotton-workwear-jacket", title: "Purple Cotton Workwear Jacket", price: "$300.00 USD", available: true, color: "Purple" },
  { handle: "dustline-hooded-workwear-jacket-1", title: "Dustline (1) Hooded Workwear Jacket", price: "$280.00 USD", available: true, color: "Beige" },
  { handle: "dustline-hooded-workwear-jacket-2", title: "Dustline (2) Hooded Workwear Jacket", price: "$280.00 USD", available: true, color: "Beige" },
  { handle: "patchwork-canvas-army-jacket", title: "Patchwork Canvas Army Jacket", price: "$340.00 USD", available: true, color: "Beige" },
  { handle: "f1-army-field-jacket-1", title: "F1 Army Field Jacket (1)", price: "$360.00 USD", available: true, color: "Beige" },
  { handle: "swedish-moto-jacket", title: "Swedish Moto Jacket", price: "$380.00 USD", available: true, color: "Green" },
  { handle: "blue-ww-jacket-1", title: "Blue WW Jacket (1)", price: "$300.00 USD", available: true, color: "Blue" },
  { handle: "blue-ww-jacket-faded-nametag", title: "Blue WW Jacket - Faded Nametag", price: "$300.00 USD", available: true, color: "Blue" },
  { handle: "blue-ww-jacket-3", title: "Blue WW Jacket (3)", price: "$300.00 USD", available: true, color: "Blue" },
  { handle: "blue-ww-jacket-4", title: "Blue WW Jacket (4)", price: "$300.00 USD", available: true, color: "Blue" },
  { handle: "m47-pants-1", title: "M47 Pants (1)", price: "$260.00 USD", available: true, color: "Green" },
  { handle: "heelbite-workwear-pant-1", title: "Heelbite Workwear Pant (1)", price: "$240.00 USD", available: true, color: "Blue" },
  { handle: "linen-utility-pants-1", title: "Linen Utility Pants (1)", price: "$220.00 USD", available: true, color: "Canvas" },
  { handle: "patchwork-utility-workwear-pants", title: "Patchwork Utility Workwear Pants", price: "$260.00 USD", available: true, color: "Beige" },
  { handle: "custom-waxed-military-pants", title: "Custom Waxed Military Pants", price: "$280.00 USD", available: true, color: "Olive" },
  { handle: "workwear-pant-2-black", title: "Workwear Pant (2)", price: "$240.00 USD", available: true, color: "Black" },
  { handle: "tailored-dress-trousers-1", title: "Tailored Dress Trousers (1)", price: "$260.00 USD", available: true, color: "Black" },
  { handle: "rose-workwear-pant", title: "Rose Workwear Pant", price: "$240.00 USD", available: true, color: "Pink" },
  { handle: "m47-pants-2", title: "M47 Pants (2)", price: "$260.00 USD", available: false, color: "Green" },
];

export const products: Product[] = productSeeds.map((product, index) => ({
  ...product,
  id: String(index + 1),
  images: [],
  sizingMen: "M/L",
  sizingWomen: "S/M",
}));

export const getProduct = (handle: string) =>
  products.find((product) => product.handle === handle);
