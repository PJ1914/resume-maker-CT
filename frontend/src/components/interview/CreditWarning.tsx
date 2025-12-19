import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface CreditWarningProps {
    balance: number;
    cost: number;
}

export function CreditWarning({ balance, cost }: CreditWarningProps) {
    if (balance >= 10 && balance > cost) return null; // Only show if low (<10) or insufficient

    const isInsufficient = balance < cost;

    return (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm border ${isInsufficient
                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
            }`}>
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
                {isInsufficient
                    ? `Insufficient Credits: You have ${balance} credits. Cost is ${cost}.`
                    : `Low Balance: You have ${balance} credits remaining.`}
            </span>
        </div>
    );
}
