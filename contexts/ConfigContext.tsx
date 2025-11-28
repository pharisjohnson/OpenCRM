import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppConfig } from '../types';

const DEFAULT_CONFIG: AppConfig = {
  appName: 'OpenCRM',
  primaryColor: '#0ea5e9', // Tailwind Sky-500
  fontFamily: 'Inter',
  storageType: 'local'
};

interface ConfigContextType {
  config: AppConfig;
  updateConfig: (updates: Partial<AppConfig>) => void;
  resetConfig: () => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

// Helper to convert Hex to RGB for Tailwind CSS variables
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Helper to generate a rough palette (50-900) from a base color
// This is a simplified algorithm.
const generatePalette = (hex: string) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  // We simply mix with white for lighter shades and black for darker shades
  // In a real SaaS, we might use a library like 'chroma-js'
  const mix = (color: typeof rgb, mixColor: typeof rgb, weight: number) => ({
    r: Math.round(color.r * (1 - weight) + mixColor.r * weight),
    g: Math.round(color.g * (1 - weight) + mixColor.g * weight),
    b: Math.round(color.b * (1 - weight) + mixColor.b * weight)
  });

  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 15, g: 23, b: 42 }; // Slate-900ish

  return {
    50: mix(rgb, white, 0.95),
    100: mix(rgb, white, 0.9),
    200: mix(rgb, white, 0.75),
    300: mix(rgb, white, 0.6),
    400: mix(rgb, white, 0.3),
    500: rgb, // Base
    600: mix(rgb, black, 0.1),
    700: mix(rgb, black, 0.3),
    800: mix(rgb, black, 0.5),
    900: mix(rgb, black, 0.7),
  };
};

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('opencrm_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const updateConfig = (updates: Partial<AppConfig>) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates };
      localStorage.setItem('opencrm_config', JSON.stringify(newConfig));
      return newConfig;
    });
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    localStorage.removeItem('opencrm_config');
  };

  // Apply Theme Side Effects
  useEffect(() => {
    const root = document.documentElement;
    
    // 1. Update Font
    root.style.setProperty('--font-family', `'${config.fontFamily}'`);

    // 2. Update Colors
    const palette = generatePalette(config.primaryColor);
    if (palette) {
      Object.entries(palette).forEach(([shade, rgb]) => {
        root.style.setProperty(`--color-primary-${shade}`, `${rgb.r} ${rgb.g} ${rgb.b}`);
      });
    }

    // 3. Update Title
    document.title = config.appName;

  }, [config.primaryColor, config.fontFamily, config.appName]);

  return (
    <ConfigContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};