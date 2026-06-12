// miniapp/src/telegram.js
// ============================================================
// Telegram WebApp SDK integration.
// Provides typed access to all Telegram Mini App APIs.
// ============================================================

const tg = window.Telegram?.WebApp;

// Initialize the Mini App
export const initTelegram = () => {
  if (!tg) return false;
  tg.ready();
  tg.expand(); // Full screen
  return true;
};

// Get Telegram user info (no login needed — already authenticated)
export const getTelegramUser = () => {
  if (!tg) return null;
  return tg.initDataUnsafe?.user || null;
};

// Get raw initData string for API authentication
export const getInitData = () => tg?.initData || '';

// Telegram theme colors — auto dark/light mode
export const getTelegramTheme = () => ({
  bg:            tg?.backgroundColor || '#ffffff',
  text:          tg?.themeParams?.text_color || '#000000',
  button:        tg?.themeParams?.button_color || '#008751',
  buttonText:    tg?.themeParams?.button_text_color || '#ffffff',
  hint:          tg?.themeParams?.hint_color || '#999999',
  link:          tg?.themeParams?.link_color || '#008751',
  secondaryBg:   tg?.themeParams?.secondary_bg_color || '#f5f5f5',
  isDark:        tg?.colorScheme === 'dark'
});

// Show native Telegram confirmation popup
export const showConfirm = (message) =>
  new Promise((resolve) => {
    if (!tg) { resolve(window.confirm(message)); return; }
    tg.showConfirm(message, resolve);
  });

// Show native Telegram alert
export const showAlert = (message) =>
  new Promise((resolve) => {
    if (!tg) { alert(message); resolve(); return; }
    tg.showAlert(message, resolve);
  });

// Close the Mini App
export const closeMiniApp = () => tg?.close();

// Enable/disable main button
export const setMainButton = ({ text, color, textColor, isActive = true, isVisible = true, onClick }) => {
  if (!tg) return;
  tg.MainButton.text      = text;
  tg.MainButton.color     = color || tg.themeParams.button_color;
  tg.MainButton.textColor = textColor || tg.themeParams.button_text_color;
  if (isVisible) tg.MainButton.show(); else tg.MainButton.hide();
  if (isActive)  tg.MainButton.enable(); else tg.MainButton.disable();
  if (onClick)   tg.MainButton.onClick(onClick);
};

export const hideMainButton = () => tg?.MainButton.hide();

// Show/hide loading spinner on main button
export const setMainButtonLoading = (loading) => {
  if (!tg) return;
  if (loading) tg.MainButton.showProgress();
  else         tg.MainButton.hideProgress();
};

// Back button
export const setBackButton = (onClick) => {
  if (!tg) return;
  tg.BackButton.show();
  tg.BackButton.onClick(onClick);
};
export const hideBackButton = () => tg?.BackButton.hide();

// Haptic feedback
export const haptic = {
  light:   () => tg?.HapticFeedback.impactOccurred('light'),
  medium:  () => tg?.HapticFeedback.impactOccurred('medium'),
  success: () => tg?.HapticFeedback.notificationOccurred('success'),
  error:   () => tg?.HapticFeedback.notificationOccurred('error'),
  warning: () => tg?.HapticFeedback.notificationOccurred('warning')
};

export default tg;
