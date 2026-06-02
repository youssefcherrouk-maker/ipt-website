import { Request, Response, NextFunction } from 'express';

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePlanId(planId: string): boolean {
  const validPlans = ['free', 'month1', 'month6', 'year1'];
  return validPlans.includes(planId);
}

interface ValidationRule {
  field: string;
  required?: boolean;
  validate?: (value: string) => boolean;
  message?: string;
}

export function validateBody(rules: ValidationRule[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    for (const rule of rules) {
      const value = req.body[rule.field];

      if (rule.required && (!value || typeof value !== 'string' || !value.trim())) {
        errors.push(rule.message || `${rule.field} is required`);
        continue;
      }

      if (value && rule.validate && !rule.validate(value)) {
        errors.push(rule.message || `${rule.field} is invalid`);
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: errors.join('; '),
      });
      return;
    }

    next();
  };
}
