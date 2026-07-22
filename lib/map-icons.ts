import L from 'leaflet';

export const createCustomIcon = (type: 'seeker' | 'donor' | 'user' | 'selected') => {
  let color = 'ef4444';
  if (type === 'donor') color = '10b981';
  if (type === 'user') color = '3b82f6';
  if (type === 'selected') color = 'f59e0b';
  
  const size = type === 'user' || type === 'selected' ? 28 : 24;
  const innerSize = type === 'user' || type === 'selected' ? 16 : 14;
  const margin = type === 'user' || type === 'selected' ? 6 : 5;
  
  const showPulse = type === 'seeker';
  
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px;">
        ${showPulse ? `<span style="position: absolute; inset: 0; border-radius: 50%; opacity: 0.75; background-color: #${color};"></span>` : ''}
        <span style="position: relative; display: flex; align-items: center; justify-content: center; width: ${innerSize}px; height: ${innerSize}px; margin: ${margin}px; border-radius: 50%; background-color: #${color}; box-shadow: 0 0 10px rgba(0,0,0,0.5); border: 2px solid white;"></span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

export const seekerIcon = createCustomIcon('seeker');
export const donorIcon = createCustomIcon('donor');
export const userIcon = createCustomIcon('user');
export const selectedIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `
    <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">
      <span style="position: absolute; inset: 0; border-radius: 50%; opacity: 0.25; background-color: #f59e0b;"></span>
      <div style="position: relative; width: 32px; height: 32px; border-radius: 50%; background-color: #ffffff; border: 2.5px solid #f59e0b; box-shadow: 0 3px 8px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 6V2"/>
          <path d="M4.72 16H3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h1.72"/>
          <path d="M19.28 16H21a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-1.72"/>
          <path d="M18 22V7a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v15"/>
          <path d="M16 14H8"/>
          <path d="M12 10v8"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -21],
});

export const INACTIVE_HOSPITAL_ICON = L.divIcon({
  className: 'inactive-leaflet-icon',
  html: `
    <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; opacity: 0.95;">
      <div style="position: relative; width: 18px; height: 18px; border-radius: 50%; background-color: #ffffff; border: 1.5px solid #64748b; box-shadow: 0 1.5px 4px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 6V2"/>
          <path d="M4.72 16H3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h1.72"/>
          <path d="M19.28 16H21a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-1.72"/>
          <path d="M18 22V7a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v15"/>
          <path d="M16 14H8"/>
          <path d="M12 10v8"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});
