export type DiscountValueInput =
  | { type: 'percentage'; percentage: number }
  | { type: 'fixedAmount'; amount: number; appliesOnEachItem?: boolean };

export type DiscountItemsInput =
  | { type: 'all' }
  | { type: 'products'; productIds: string[] }
  | { type: 'collections'; collectionIds: string[] };

export type DiscountCustomerSelectionInput =
  | { type: 'all' }
  | { type: 'customers'; customerIdsToAdd?: string[]; customerIdsToRemove?: string[] }
  | { type: 'customerSegments'; segmentIdsToAdd?: string[]; segmentIdsToRemove?: string[] };

export type DiscountMinimumRequirementInput =
  | { type: 'quantity'; greaterThanOrEqualToQuantity: number }
  | { type: 'subtotal'; greaterThanOrEqualToSubtotal: number };

export function buildDiscountValue(value: DiscountValueInput): Record<string, unknown> {
  if (value.type === 'percentage') {
    return { percentage: value.percentage };
  }
  return {
    discountAmount: {
      amount: value.amount,
      appliesOnEachItem: value.appliesOnEachItem ?? false,
    },
  };
}

export function buildDiscountItems(items: DiscountItemsInput): Record<string, unknown> {
  if (items.type === 'all') return { all: true };
  if (items.type === 'products') {
    return { products: { productsToAdd: items.productIds } };
  }
  return { collections: { add: items.collectionIds } };
}

export function buildCustomerSelection(
  selection: DiscountCustomerSelectionInput
): Record<string, unknown> {
  if (selection.type === 'all') return { all: true };
  if (selection.type === 'customers') {
    return {
      customers: {
        add: selection.customerIdsToAdd,
        remove: selection.customerIdsToRemove,
      },
    };
  }
  return {
    customerSegments: {
      add: selection.segmentIdsToAdd,
      remove: selection.segmentIdsToRemove,
    },
  };
}

export function buildMinimumRequirement(
  req: DiscountMinimumRequirementInput
): Record<string, unknown> {
  if (req.type === 'quantity') {
    return { quantity: { greaterThanOrEqualToQuantity: String(req.greaterThanOrEqualToQuantity) } };
  }
  return {
    subtotal: { greaterThanOrEqualToSubtotal: req.greaterThanOrEqualToSubtotal },
  };
}

export type BxgyBuysValue =
  | { type: 'quantity'; quantity: number }
  | { type: 'amount'; amount: number };

export type BxgyGetsValue =
  | { type: 'percentage'; percentage: number }
  | { type: 'amount'; amount: number; appliesOnEachItem?: boolean }
  | {
      type: 'discountOnQuantity';
      quantity: number;
      effect: { type: 'percentage'; percentage: number };
    };

export function buildBxgyBuysValue(value: BxgyBuysValue): Record<string, unknown> {
  if (value.type === 'quantity') return { quantity: String(value.quantity) };
  return { amount: value.amount };
}

export function buildBxgyGetsValue(value: BxgyGetsValue): Record<string, unknown> {
  if (value.type === 'percentage') return { percentage: value.percentage };
  if (value.type === 'amount') {
    return {
      discountAmount: {
        amount: value.amount,
        appliesOnEachItem: value.appliesOnEachItem ?? false,
      },
    };
  }
  return {
    discountOnQuantity: {
      quantity: String(value.quantity),
      effect: { percentage: value.effect.percentage },
    },
  };
}

export function checkUserErrors(
  userErrors: Array<{ field?: string[] | null; message: string; code?: string }>,
  operation: string
): void {
  if (userErrors.length > 0) {
    throw new Error(
      `${operation} failed: ${userErrors
        .map((e) => (e.field ? `${e.field.join('.')}: ${e.message}` : e.message))
        .join(', ')}`
    );
  }
}
