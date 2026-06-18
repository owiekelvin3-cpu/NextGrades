/**
 * Creates or reuses NextGrades recurring prices in Stripe.
 * Usage: STRIPE_SECRET_KEY=sk_live_... node scripts/setup-stripe-prices.mjs
 */

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY?.trim();
if (!key) {
  console.error("Set STRIPE_SECRET_KEY before running this script.");
  process.exit(1);
}

const stripe = new Stripe(key);

const PLANS = [
  {
    key: "resource",
    envPrefix: "RESOURCE",
    name: "NextGrades Resource Membership",
    description: "Access to all premium learning materials",
    monthly: 2900,
    yearly: 24900,
  },
  {
    key: "group",
    envPrefix: "GROUP",
    name: "NextGrades Group Tutoring",
    description: "Learn in small groups with other students",
    monthly: 9900,
    yearly: 94900,
  },
  {
    key: "premium",
    envPrefix: "PREMIUM",
    name: "NextGrades 1:1 Premium Tutoring",
    description: "Individual support for maximum success",
    monthly: 24900,
    yearly: 239900,
  },
];

async function findOrCreateProduct(plan) {
  const existing = await stripe.products.search({
    query: `metadata['nextgrades_plan']:'${plan.key}'`,
    limit: 1,
  });
  if (existing.data[0]) return existing.data[0];

  return stripe.products.create({
    name: plan.name,
    description: plan.description,
    metadata: { nextgrades_plan: plan.key },
  });
}

async function findOrCreatePrice(productId, planKey, interval, amount) {
  const prices = await stripe.prices.list({ product: productId, active: true, limit: 100 });
  const match = prices.data.find(
    (p) =>
      p.recurring?.interval === interval &&
      p.unit_amount === amount &&
      p.currency === "eur" &&
      p.metadata?.nextgrades_plan === planKey &&
      p.metadata?.nextgrades_billing === interval
  );
  if (match) return match;

  return stripe.prices.create({
    product: productId,
    currency: "eur",
    unit_amount: amount,
    recurring: { interval },
    metadata: { nextgrades_plan: planKey, nextgrades_billing: interval },
  });
}

async function main() {
  const out = {};

  for (const plan of PLANS) {
    const product = await findOrCreateProduct(plan);
    const monthly = await findOrCreatePrice(product.id, plan.key, "month", plan.monthly);
    const yearly = await findOrCreatePrice(product.id, plan.key, "year", plan.yearly);

    out[`STRIPE_PRICE_${plan.envPrefix}_MONTHLY`] = monthly.id;
    out[`STRIPE_PRICE_${plan.envPrefix}_YEARLY`] = yearly.id;

    console.log(`\n${plan.name}`);
    console.log(`  monthly (${plan.monthly / 100} EUR): ${monthly.id}`);
    console.log(`  yearly  (${plan.yearly / 100} EUR): ${yearly.id}`);
  }

  console.log("\n--- Add to .env.local and Vercel ---");
  for (const [k, v] of Object.entries(out)) {
    console.log(`${k}=${v}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
