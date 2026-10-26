import product1 from "../assets/product1.png";
import product2 from "../assets/product2.png";
import product3 from "../assets/product3.png";

const products = [
  {
    id: "1",
    name: "Dinora Moisture + Suncream",
    category: "Sun Protection",
    badge: "SUNSCREEN",
    price: 199,
    originalPrice: 249,
    description:
      "Your daily skincare essential. Moisturize your skin and make sun protection part of your everyday routine.",
    image: product1,
    images: [product1, product2, product3],
    features: [
      "Everyday skincare",
      "Moisture + sun protection",
      "Suitable for daily use",
    ],
    size: "Check product packaging",
  },
  {
    id: "2",
    name: "Dinora Moisturizer",
    category: "Moisturizing Care",
    price: 199,
    originalPrice: 249,
    description:
      "A daily moisturizing skincare essential designed to help keep your skin feeling soft and hydrated.",
    image: product2,
    images: [product2, product1, product3],
    features: [
      "Daily moisturizing care",
      "Helps keep skin feeling soft",
      "Easy to add to your skincare routine",
    ],
    size: "20 ml",
  },
  {
    id: "3",
    name: "Dinora New Skincare Product",
    category: "Skincare",
    price: 249,
    originalPrice: 299,
    description: "Description of your new skincare product.",
    image: product3,
    images: [product3, product1, product2],
    features: [
      "Dinora Moisture + Suncream combines daily moisturization with sun protection", 
      "in one convenient skincare product. Its lightweight formula helps keep skin soft," ,
      "smooth, and hydrated throughout the day. Designed for both men and women", 
      "it fits easily into any daily skincare routine. Ideal for everyday use", 
      "it helps maintain a fresh, healthy-looking appearance. ",
      "An affordable skincare essential for people who want simple", 
      "convenient, and effective daily care.",
    ],
    size: "50 ml"
  },
];

export default products;
