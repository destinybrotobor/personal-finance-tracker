import { useCallback } from 'react';

export function useInitials() {
    interface UseInitialsParams {
        firstname: string;
        lastname?: string | null;
    }

    type UseInitialsFn = (firstname: string, lastname?: string | null) => string;

    return useCallback<UseInitialsFn>((firstname: string, lastname: string | null = ''): string => {
        const fname = firstname.trim();
        const lname = lastname?.trim() || '';

        if (fname.length === 0 && lname.length === 0) return '';

        if (fname.length > 1 && lname.length === 0) {
            return `${fname.charAt(0).toUpperCase()}${fname.charAt(1).toUpperCase()}`;
        }

        const firstInitial = fname.charAt(0);
        const lastInitial = lname.charAt(0);

        return `${firstInitial}${lastInitial}`.toUpperCase();
    }, []);
}
