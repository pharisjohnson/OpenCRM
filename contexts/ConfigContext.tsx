
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppConfig } from '../types';
import { useUser } from './UserContext';
import { supabase } from '../lib/supabaseClient';

const DEFAULT_CONFIG: AppConfig = {
  appName: 'OpenCRM',
  primaryColor: '#0ea5e9', // Tailwind Sky-500
  fontFamily: 'Inter',
  storageType: 'local',
  invoiceTemplate: 'classic',
  invoiceFooter: 'Thank you for your business!',
  darkMode: false,
  aiProvider: 'gemini',
  accessibility: {
    highContrast: false,
    fontSize: 'normal',
    reduceMotion: false
  },
  onboardingCompleted: false
};

interface ConfigContextType {
  config: AppConfig;
  updateConfig: (updates: Partial<AppConfig>) => void;
  resetConfig: () => void;
  toggleDarkMode: () => void;
  isLoaded: boolean;
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
const generatePalette = (hex: string) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const mix = (color: typeof rgb, mixColor: typeof rgb, weight: number) => ({
    r: Math.round(color.r * (1 - weight) + mixColor.r * weight),
    g: Math.round(color.g * (1 - weight) + mixColor.g * weight),
    b: Math.round(color.b * (1 - weight) + mixColor.b * weight)
  });

  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 15, g: 23, b: 42 };

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
  const { currentOrganization } = useUser();
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Load Local Overrides (e.g. Dark Mode preferred locally)
    const localSaved = localStorage.getItem('opencrm_local_config');
    const localOverrides = localSaved ? JSON.parse(localSaved) : {};

    // 2. If Org active, use Org Settings
    if (currentOrganization) {
      const orgSettings = currentOrganization.settings || {};
      setConfig({
        ...DEFAULT_CONFIG,
        ...orgSettings,
        appName: currentOrganization.name,
        primaryColor: currentOrganization.primary_color || DEFAULT_CONFIG.primaryColor,
        ...localOverrides
      });
    } else {
      // Use fallback/mock config from localStorage or default
      const saved = localStorage.getItem('opencrm_config');
      if (saved) {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(saved), ...localOverrides });
      } else {
        setConfig({ ...DEFAULT_CONFIG, ...localOverrides });
      }
    }
    setIsLoaded(true);
  }, [currentOrganization]);

  const updateConfig = async (updates: Partial<AppConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);

    // Persist to Supabase if we have an organization
    if (currentOrganization) {
      try {
        const { error } = await supabase
          .from('organizations')
          .update({
            settings: newConfig,
            name: newConfig.appName,
            primary_color: newConfig.primaryColor
          })
          .eq('id', currentOrganization.id);

        if (error) throw error;
      } catch (e) {
        console.error('Failed to update organization settings:', e);
      }
    } else {
      localStorage.setItem('opencrm_config', JSON.stringify(newConfig));
    }

    // Keep some things local (like dark mode and accessibility preferred on this machine)
    if ('darkMode' in updates || 'accessibility' in updates) {
      const currentLocal = localStorage.getItem('opencrm_local_config');
      const parsedLocal = currentLocal ? JSON.parse(currentLocal) : {};

      const newLocal = {
        ...parsedLocal,
        ...(updates.darkMode !== undefined ? { darkMode: updates.darkMode } : {}),
        ...(updates.accessibility ? { accessibility: { ...config.accessibility, ...updates.accessibility } } : {})
      };

      localStorage.setItem('opencrm_local_config', JSON.stringify(newLocal));
    }
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    localStorage.removeItem('opencrm_config');
    localStorage.removeItem('opencrm_local_config');
  };

  const toggleDarkMode = () => {
    const newMode = !config.darkMode;
    updateConfig({ darkMode: newMode });
  };

  // Apply Theme Side Effects
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--font-family', `'${config.fontFamily}'`);

    const palette = generatePalette(config.primaryColor);
    if (palette) {
      Object.entries(palette).forEach(([shade, rgb]) => {
        root.style.setProperty(`--color-primary-${shade}`, `${rgb.r} ${rgb.g} ${rgb.b}`);
      });
    }

    document.title = config.appName;

    if (config.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply Accessibility Settings
    if (config.accessibility?.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (config.accessibility?.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Font Size
    root.classList.remove('font-size-normal', 'font-size-medium', 'font-size-large');
    if (config.accessibility?.fontSize) {
      root.classList.add(`font-size-${config.accessibility.fontSize}`);
    } else {
      root.classList.add('font-size-normal');
    }

  }, [config.primaryColor, config.fontFamily, config.appName, config.darkMode, config.accessibility]);

  return (
    <ConfigContext.Provider value={{ config, updateConfig, resetConfig, toggleDarkMode, isLoaded }}>
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
