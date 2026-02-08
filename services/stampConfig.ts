import { StampConfig, StampCheckpoint } from '../types';

const STAMP_CONFIG_CACHE_KEY = 'dice_stamp_config_cache_v1';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// API URL - same as storage.ts
const API_URL = 'https://script.google.com/macros/s/AKfycbwJUABZ9PsGEv91FjlB33kOAsYsMm6oz77isOwtvw2JQQNSpvtwkBdby2EzyZgB7qcmVg/exec';

// Default configuration (fallback)
const DEFAULT_CONFIG: StampConfig = {
    maxStamps: 10,
    checkpoints: [
        { stampCount: 3, reward: 'Free iced tea' },
        { stampCount: 5, reward: 'Free drink upgrade' },
        { stampCount: 10, reward: 'Free beverage' }
    ]
};

interface CachedConfig {
    config: StampConfig;
    timestamp: number;
}

/**
 * Fetch stamp configuration from API
 */
const fetchConfigFromAPI = async (): Promise<StampConfig> => {
    try {
        const url = new URL(API_URL);
        url.searchParams.append('action', 'getCheckpointConfig');
        url.searchParams.append('_t', Date.now().toString());

        const response = await fetch(url.toString(), {
            method: 'GET',
            mode: 'cors'
        });

        const data = await response.json();

        if (data.success && data.config) {
            return data.config;
        }

        console.warn('API returned unsuccessful response, using default config');
        return DEFAULT_CONFIG;
    } catch (error) {
        console.error('Failed to fetch stamp config from API:', error);
        return DEFAULT_CONFIG;
    }
};

/**
 * Get cached configuration if still valid
 */
const getCachedConfig = (): StampConfig | null => {
    try {
        const cached = localStorage.getItem(STAMP_CONFIG_CACHE_KEY);
        if (cached) {
            const { config, timestamp }: CachedConfig = JSON.parse(cached);
            const age = Date.now() - timestamp;

            if (age < CACHE_DURATION) {
                return config;
            }
        }
    } catch (e) {
        console.error('Failed to read cached config:', e);
    }
    return null;
};

/**
 * Cache configuration
 */
const cacheConfig = (config: StampConfig): void => {
    try {
        const cached: CachedConfig = {
            config,
            timestamp: Date.now()
        };
        localStorage.setItem(STAMP_CONFIG_CACHE_KEY, JSON.stringify(cached));
    } catch (e) {
        console.error('Failed to cache config:', e);
    }
};

/**
 * Get stamp configuration (with caching)
 */
export const getStampConfig = (): StampConfig => {
    // Try cache first
    const cached = getCachedConfig();
    if (cached) {
        return cached;
    }

    // Return default synchronously, fetch async in background
    fetchConfigFromAPI().then(config => {
        cacheConfig(config);
    });

    return DEFAULT_CONFIG;
};

/**
 * Get stamp configuration (async version for initial load)
 */
export const fetchStampConfig = async (): Promise<StampConfig> => {
    const config = await fetchConfigFromAPI();
    cacheConfig(config);
    return config;
};

/**
 * Save stamp configuration to API
 */
export const saveStampConfig = async (config: StampConfig): Promise<boolean> => {
    try {
        const url = new URL(API_URL);
        url.searchParams.append('action', 'saveCheckpointConfig');

        const response = await fetch(url.toString(), {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify(config)
        });

        const data = await response.json();

        if (data.success) {
            // Update cache
            cacheConfig(config);
            // Clear old localStorage key if it exists
            localStorage.removeItem('dice_stamp_config_v1');
            return true;
        }

        return false;
    } catch (error) {
        console.error('Failed to save stamp config:', error);
        return false;
    }
};

export const isCheckpoint = (stampCount: number): boolean => {
    const config = getStampConfig();
    return config.checkpoints.some(cp => cp.stampCount === stampCount);
};

export const getCheckpointReward = (stampCount: number): string | null => {
    const config = getStampConfig();
    const checkpoint = config.checkpoints.find(cp => cp.stampCount === stampCount);
    return checkpoint ? checkpoint.reward : null;
};

export const resetStampConfig = (): void => {
    localStorage.removeItem(STAMP_CONFIG_CACHE_KEY);
    localStorage.removeItem('dice_stamp_config_v1');
    console.log('Stamp configuration cache cleared');
};
