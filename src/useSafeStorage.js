import { useState, useEffect, useCallback } from 'react';
export function useSafeStorage({ key, schema, defaultValue, version = 1, migrate, }) {
    const parseStorageData = useCallback((rawValue) => {
        if (!rawValue)
            return defaultValue;
        try {
            const parsed = JSON.parse(rawValue);
            let data = parsed.data;
            const dataVersion = parsed.version || 0;
            if (dataVersion < version && migrate) {
                data = migrate(data, dataVersion);
            }
            const result = schema.safeParse(data);
            if (!result.success) {
                console.error(`[zod-persist] Validation failed for "${key}":`, result.error.format());
                return defaultValue;
            }
            return result.data;
        }
        catch (error) {
            console.error(`[zod-persist] Error parsing "${key}":`, error);
            return defaultValue;
        }
    }, [key, schema, defaultValue, version, migrate]);
    const [state, setState] = useState(() => {
        if (typeof window === 'undefined')
            return defaultValue;
        const saved = localStorage.getItem(key);
        return parseStorageData(saved);
    });
    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(state) : value;
            schema.parse(valueToStore);
            const envelope = {
                data: valueToStore,
                version: version
            };
            setState(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(envelope));
        }
        catch (error) {
            console.error(`[zod-persist] Could not save "${key}":`, error);
        }
    }, [key, state, schema, version]);
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === key && e.newValue !== null) {
                setState(parseStorageData(e.newValue));
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key, parseStorageData]);
    return [state, setValue];
}
