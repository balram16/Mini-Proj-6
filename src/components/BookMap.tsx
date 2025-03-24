import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { Location, BookType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MapPin, Search } from 'lucide-react';

// Import OpenLayers CSS
import 'ol/ol.css';

interface BookMapProps {
  books: (BookType & { title: string; id: string })[];
  onBookSelect?: (bookId: string) => void;
  className?: string;
}

export default function BookMap({ books, onBookSelect, className = '' }: BookMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Create vector source for markers
    const vectorSource = new VectorSource();

    // Create vector layer for markers
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    // Create map instance
    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        // Base map layer
        new TileLayer({
          source: new OSM(),
        }),
        // Markers layer
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([-74.006, 40.7128]), // Default to NYC
        zoom: 12,
      }),
      controls: [], // We'll add custom controls later if needed
    });

    setMap(initialMap);

    // Cleanup
    return () => {
      if (initialMap) {
        initialMap.setTarget(undefined);
      }
    };
  }, []);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: '',
            city: '',
            state: '',
            country: '',
            postalCode: '',
          };
          setUserLocation(location);

          if (map) {
            map.getView().setCenter(fromLonLat([location.lng, location.lat]));
            updateMarkers(map, location, books);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [map]);

  // Update markers when books or user location changes
  useEffect(() => {
    if (map && userLocation) {
      updateMarkers(map, userLocation, books);
    }
  }, [map, userLocation, books, selectedBook]);

  const createMarkerStyle = (type: 'user' | 'book', isSelected = false) => {
    return new Style({
      image: new CircleStyle({
        radius: type === 'user' ? 8 : 6,
        fill: new Fill({
          color: type === 'user' 
            ? 'rgba(0, 128, 255, 0.5)' 
            : isSelected 
              ? 'rgba(255, 0, 0, 0.7)' 
              : 'rgba(255, 0, 0, 0.5)',
        }),
        stroke: new Stroke({
          color: type === 'user' ? '#0066cc' : '#cc0000',
          width: 2,
        }),
      }),
    });
  };

  const updateMarkers = (map: Map, userLoc: Location, books: BookMapProps['books']) => {
    // Get vector layer
    const vectorLayer = map.getLayers().getArray()
      .find(layer => layer instanceof VectorLayer) as VectorLayer<VectorSource>;
    
    if (!vectorLayer) return;

    const source = vectorLayer.getSource();
    if (!source) return;

    // Clear existing features
    source.clear();

    // Add user location marker
    const userFeature = new Feature({
      geometry: new Point(fromLonLat([userLoc.lng, userLoc.lat])),
      type: 'user',
    });
    userFeature.setStyle(createMarkerStyle('user'));
    source.addFeature(userFeature);

    // Add book markers
    books.forEach(book => {
      const bookFeature = new Feature({
        geometry: new Point(fromLonLat([book.location.lng, book.location.lat])),
        type: 'book',
        id: book.id,
        title: book.title,
      });
      bookFeature.setStyle(createMarkerStyle('book', selectedBook === book.id));
      source.addFeature(bookFeature);
    });
  };

  const handleSearch = async () => {
    if (!searchAddress || !map) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}`
      );
      const results = await response.json();

      if (results && results.length > 0) {
        const { lat, lon } = results[0];
        const location = {
          lat: parseFloat(lat),
          lng: parseFloat(lon),
          address: results[0].display_name,
          city: '',
          state: '',
          country: '',
          postalCode: '',
        };
        setUserLocation(location);
        map.getView().setCenter(fromLonLat([location.lng, location.lat]));
        map.getView().setZoom(13);
        updateMarkers(map, location, books);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  // Handle map click events
  useEffect(() => {
    if (!map) return;

    const handleClick = (event: any) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, feature => feature);
      
      if (feature) {
        const properties = feature.getProperties();
        if (properties.type === 'book' && properties.id) {
          setSelectedBook(properties.id);
          if (onBookSelect) {
            onBookSelect(properties.id);
          }
        }
      }
    };

    map.on('click', handleClick);

    return () => {
      map.un('click', handleClick);
    };
  }, [map, onBookSelect]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search location..."
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            className="pl-9"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      <Card className="relative h-[500px] w-full overflow-hidden">
        <div 
          ref={mapRef} 
          className="w-full h-full rounded-lg"
          style={{ backgroundColor: '#f8f9fa' }}
        />

        {/* Distance legend */}
        <div className="absolute bottom-4 right-4 bg-white p-2 rounded-md shadow-md text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Your location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Available books</span>
          </div>
        </div>
      </Card>
    </div>
  );
} 