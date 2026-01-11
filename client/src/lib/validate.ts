/**
 * Validate expense object structure
 */
export function validateExpense(expense: any) {
  if (!expense || typeof expense !== 'object') {
    return false;
  }

  const { amount, category, description, date } = expense;

  // Validate amount
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount < 0) {
    return false;
  }

  // Validate category
  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    return false;
  }

  // Validate description
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    return false;
  }

  // Validate date
  if (!date || isNaN(new Date(date).getTime())) {
    return false;
  }

  return true;
}

/**
 * Validate budget value
 */
export function validateBudget(budget: any): boolean {
  const numBudget = Number(budget);
  return !isNaN(numBudget) && numBudget > 0;
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error("JSON parse error:", error);
    return fallback;
  }
}
