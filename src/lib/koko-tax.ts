/** Tax added to the total of orders paid through Koko, as a share of items plus delivery. */
export const KOKO_TAX_RATE = 0.1;

/** The tax for a Koko order, rounded to the cent. */
export function kokoTaxFor(itemsPlusDeliveryLKR: number): number {
  return Math.round(itemsPlusDeliveryLKR * KOKO_TAX_RATE * 100) / 100;
}
