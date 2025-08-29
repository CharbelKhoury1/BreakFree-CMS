import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark'; // The actual applied theme (resolves 'system')
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Load theme from localStorage or default to 'light'
    const saved = localStorage.getItem('cms-appearance-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.theme || 'light';
      } catch {
        return 'light';
      }
    }
    return 'light';
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // Function to get system theme preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Update actual theme based on current theme setting
  useEffect(() => {
    let newActualTheme: 'light' | 'dark';
    
    if (theme === 'system') {
      newActualTheme = getSystemTheme();
    } else {
      newActualTheme = theme;
    }
    
    setActualTheme(newActualTheme);
    
    // Apply theme to document
    const root = document.documentElement;
    if (newActualTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    console.log('Theme applied:', { theme, actualTheme: newActualTheme });
  }, [theme]);

  // Listen for system theme changes when theme is set to 'system'
  useEffect(() => {
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const newSystemTheme = getSystemTheme();
      setActualTheme(newSystemTheme);
      
      // Apply theme to document
      const root = document.documentElement;
      if (newSystemTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      console.log('System theme changed:', newSystemTheme);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    
    // Update localStorage
    const currentSettings = localStorage.getItem('cms-appearance-settings');
    let settings = {};
    
    if (currentSettings) {
      try {
        settings = JSON.parse(currentSettings);
      } catch {
        settings = {};
      }
    }
    
    const updatedSettings = { ...settings, theme: newTheme };
    localStorage.setItem('cms-appearance-settings', JSON.stringify(updatedSettings));
    
    console.log('Theme updated:', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook to get theme-aware classes
export function useThemeClasses() {
  const { actualTheme } = useTheme();
  
  return {
    bg: actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50',
    cardBg: actualTheme === 'dark' ? 'bg-gray-800' : 'bg-white',
    text: actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900',
    textSecondary: actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    border: actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    hover: actualTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
  };
}