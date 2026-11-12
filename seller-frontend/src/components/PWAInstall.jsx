import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Download } from 'lucide-react';

const PWAInstallContext = createContext(null);

export function PWAInstallProvider({ children }) {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    const syncInstalledState = () => {
      setIsInstalled(standaloneQuery.matches || window.navigator.standalone === true);
    };
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    syncInstalledState();
    standaloneQuery.addEventListener('change', syncInstalledState);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      standaloneQuery.removeEventListener('change', syncInstalledState);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }, [installPrompt]);

  return (
    <PWAInstallContext.Provider value={{ canInstall: Boolean(installPrompt) && !isInstalled, installApp }}>
      {children}
    </PWAInstallContext.Provider>
  );
}

export default function PWAInstallButton() {
  const installState = useContext(PWAInstallContext);

  if (!installState?.canInstall) return null;

  return (
    <button
      type="button"
      onClick={installState.installApp}
      aria-label="Install FreeFire Hotel Seller app"
      title="Install app"
      className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-colors touch-active"
    >
      <Download size={16} aria-hidden="true" />
      <span className="hidden sm:inline">Install App</span>
    </button>
  );
}
