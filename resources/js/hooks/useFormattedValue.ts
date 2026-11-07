import { useCallback } from 'react';

/**
 * Hook to format a number as a currency or plain value.
 * @returns A function to format values.
 */
export function useFormattedValue() {
    return useCallback((
        value: number | undefined,
        isCurrency: boolean = false,
        currencyCode: string = 'USD'
    ): string | undefined => {
        if (isCurrency && value !== undefined) {
            if (currencyCode === 'USD') {
                return Number(value)?.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0,
                });
            } else if (currencyCode === 'EUR') {
                return Number(value)?.toLocaleString('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                    maximumFractionDigits: 0,
                });
            } else if (currencyCode === 'GBP') {
                return Number(value)?.toLocaleString('en-GB', {
                    style: 'currency',
                    currency: 'GBP',
                    maximumFractionDigits: 0,
                });
            } else if (currencyCode === 'NGN') {
                return Number(value)?.toLocaleString('en-NG', {
                    style: 'currency',
                    currency: 'NGN',
                    maximumFractionDigits: 0,
                });
            } else {
                return value.toLocaleString();
            }
        }
        return value?.toLocaleString(undefined, { maximumFractionDigits: 0 });
    }, []);
}
