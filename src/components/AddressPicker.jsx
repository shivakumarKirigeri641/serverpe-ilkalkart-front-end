import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, Search, MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Default Leaflet markers don't load from a bundler — point them at CDN copies.
const markerIcon = new L.Icon({
  iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const INDIA_CENTER = [20.5937, 78.9629];

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) { onPick([e.latlng.lat, e.latlng.lng]); }
  });
  return null;
}

function Recenter({ pos }) {
  const map = useMap();
  useEffect(() => { if (pos) map.flyTo(pos, 16, { duration: 0.8 }); }, [pos, map]);
  return null;
}

export default function AddressPicker({ value, onChange }) {
  const [pos, setPos] = useState(value?.lat && value?.lng ? [value.lat, value.lng] : null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const reverseGeocode = async (lat, lng) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      const a = data.address || {};
      const line1 = [a.house_number, a.road || a.pedestrian || a.neighbourhood].filter(Boolean).join(' ');
      const line2 = [a.suburb, a.village, a.hamlet].filter(Boolean).join(', ');
      const city  = a.city || a.town || a.village || a.county || '';
      const state = a.state || '';
      const pin   = a.postcode || '';
      const district = a.state_district || a.county || '';
      onChange({
        ...(value || {}),
        line1: line1 || (data.display_name?.split(',')[0] ?? ''),
        line2,
        city,
        district,
        state,
        pin: (pin || '').replace(/\D/g, '').slice(0, 6),
        lat, lng,
        display: data.display_name
      });
      toast.success('Address filled from map');
    } catch (e) {
      toast.error('Could not read location. Please enter manually.');
    } finally { setLoading(false); }
  };

  const pick = (latlng) => { setPos(latlng); reverseGeocode(latlng[0], latlng[1]); };

  const useCurrent = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      p => pick([p.coords.latitude, p.coords.longitude]),
      () => { toast.error('Permission denied or unavailable'); setLoading(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const searchPlace = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', India')}&format=json&limit=1&countrycodes=in`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (!data.length) { toast.error('Place not found'); return; }
      pick([+data[0].lat, +data[0].lon]);
    } catch {
      toast.error('Search failed');
    } finally { setSearching(false); }
  };

  return (
    <div className="space-y-2">
      <form onSubmit={searchPlace} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ilkal-maroon" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search a place, area or pincode…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-ilkal-cream border border-ilkal-gold/30 focus:border-ilkal-maroon focus:outline-none text-sm" />
        </div>
        <button type="submit" disabled={searching}
          className="px-3 py-2.5 rounded-xl bg-ilkal-maroon text-white text-sm font-semibold shadow disabled:opacity-60">
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find'}
        </button>
        <button type="button" onClick={useCurrent} title="Use my current location"
          className="px-3 py-2.5 rounded-xl bg-white border border-ilkal-gold/40 text-ilkal-maroon shadow">
          <Crosshair className="w-4 h-4" />
        </button>
      </form>

      <div className="relative rounded-2xl overflow-hidden border border-ilkal-gold/30 shadow-inner">
        <MapContainer
          center={pos || INDIA_CENTER}
          zoom={pos ? 16 : 5}
          style={{ height: 280, width: '100%' }}
          scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={pick} />
          {pos && (
            <Marker
              position={pos}
              icon={markerIcon}
              draggable
              eventHandlers={{
                dragend(e) {
                  const ll = e.target.getLatLng();
                  pick([ll.lat, ll.lng]);
                }
              }}
            />
          )}
          {pos && <Recenter pos={pos} />}
        </MapContainer>

        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur grid place-items-center z-[400]">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow text-ilkal-maroon font-semibold text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Reading your location…
            </div>
          </div>
        )}

        <div className="absolute bottom-2 left-2 right-2 z-[400] flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 shadow text-[11px] text-ilkal-deep">
          <MapPin className="w-3.5 h-3.5 text-ilkal-maroon" />
          {pos ? <span className="truncate">{value?.display || `${pos[0].toFixed(4)}, ${pos[1].toFixed(4)}`}</span>
               : <span className="opacity-70">Tap the map, drag the pin, or use 📍 to detect your location</span>}
        </div>
      </div>
    </div>
  );
}
