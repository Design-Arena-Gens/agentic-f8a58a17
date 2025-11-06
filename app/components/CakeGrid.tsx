"use client";

import CakeCard, { CakeSpec } from "./CakeCard";

const CAKES: CakeSpec[] = [
  { id: "strawberry", name: "Strawberry Cream", price: 28, baseColor: "#f8d7e1", frostingColor: "#f49ab4" },
  { id: "chocolate", name: "Chocolate Fudge", price: 32, baseColor: "#d7b7a1", frostingColor: "#7b4a2d" },
  { id: "lemon", name: "Lemon Zest", price: 26, baseColor: "#f8edb8", frostingColor: "#f2cc59" },
  { id: "vanilla", name: "Vanilla Bean", price: 24, baseColor: "#f5efe6", frostingColor: "#e8d7c6" },
  { id: "blueberry", name: "Blueberry Bliss", price: 29, baseColor: "#e0e8ff", frostingColor: "#9ab0ff" },
  { id: "redvelvet", name: "Red Velvet", price: 34, baseColor: "#f7d1d1", frostingColor: "#b73a3a" },
];

export default function CakeGrid() {
  return (
    <section className="grid">
      {CAKES.map((cake) => (
        <CakeCard key={cake.id} cake={cake} />
      ))}
    </section>
  );
}
