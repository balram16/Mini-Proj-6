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
import CircleGeom from 'ol/geom/Circle';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MapPin, Search } from 'lucide-react';

// Import OpenLayers CSS
import 'ol/ol.css';

interface BookLocation {
  _id: string;
  title: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    coordinates?: {
      lat: number;
      lng: number;
    }
  }
}

interface BookLocationMapProps {
  books: BookLocation[];
  onBookSelect?: (bookId: string) => void;
  className?: string;
}

export default function BookLocationMap({ books, onBookSelect, className = '' }: BookLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [radius, setRadius] = useState(5); // Radius in kilometers
  const radiusLayerRef = useRef<VectorLayer<VectorSource> | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Create vector source for markers
    const vectorSource = new VectorSource();

    // Create vector layer for markers
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    // Create vector source and layer for radius circle
    const radiusSource = new VectorSource();
    const radiusLayer = new VectorLayer({
      source: radiusSource,
      style: new Style({
        fill: new Fill({
          color: 'rgba(0, 128, 255, 0.1)',
        }),
        stroke: new Stroke({
          color: 'rgba(0, 128, 255, 0.6)',
          width: 2,
        }),
      }),
    });
    radiusLayerRef.current = radiusLayer;

    // Create map instance
    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        // Base map layer
        new TileLayer({
          source: new OSM(),
        }),
        // Radius layer
        radiusLayer,
        // Markers layer
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([78.9629, 20.5937]), // Default to center of India
        zoom: 5,
      }),
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
          };
          setUserLocation(location);

          if (map) {
            map.getView().setCenter(fromLonLat([location.lng, location.lat]));
            map.getView().setZoom(12);
            updateMarkers(map, location, books);
            updateRadiusCircle(map, location, radius);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default fallback location
          const defaultLocation = { lat: 28.6139, lng: 77.2090 }; // New Delhi
          setUserLocation(defaultLocation);
          
          if (map) {
            map.getView().setCenter(fromLonLat([defaultLocation.lng, defaultLocation.lat]));
            updateMarkers(map, defaultLocation, books);
            updateRadiusCircle(map, defaultLocation, radius);
          }
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

  // Update radius circle when radius changes
  useEffect(() => {
    if (map && userLocation) {
      updateRadiusCircle(map, userLocation, radius);
    }
  }, [map, userLocation, radius]);

  const createMarkerStyle = (type: 'user' | 'book', isSelected = false) => {
    return new Style({
      image: new CircleStyle({
        radius: type === 'user' ? 8 : 6,
        fill: new Fill({
          color: type === 'user' 
            ? 'rgba(0, 128, 255, 0.7)' 
            : isSelected 
              ? 'rgba(255, 0, 0, 0.9)' 
              : 'rgba(255, 0, 0, 0.7)',
        }),
        stroke: new Stroke({
          color: type === 'user' ? '#0066cc' : '#cc0000',
          width: 2,
        }),
      }),
    });
  };

  // Convert kilometers to map units (EPSG:3857)
  const kmToMapUnits = (km: number, latitude: number) => {
    // Rough approximation
    return km * 1000;
  };

  const updateRadiusCircle = (map: Map, userLoc: {lat: number, lng: number}, radiusKm: number) => {
    if (!radiusLayerRef.current) return;
    
    const source = radiusLayerRef.current.getSource();
    if (!source) return;
    
    // Clear existing features
    source.clear();
    
    // Create a point feature at user location
    const userPoint = fromLonLat([userLoc.lng, userLoc.lat]);
    
    // Create a circle feature
    const circleFeature = new Feature({
      geometry: new CircleGeom(
        userPoint,
        kmToMapUnits(radiusKm, userLoc.lat)
      )
    });
    
    source.addFeature(circleFeature);
  };

  const updateMarkers = (map: Map, userLoc: {lat: number, lng: number}, books: BookLocation[]) => {
    // Get vector layer
    const vectorLayer = map.getLayers().getArray()
      .find(layer => layer instanceof VectorLayer && layer !== radiusLayerRef.current) as VectorLayer<VectorSource>;
    
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

    // Add book markers for books with valid coordinates
    books.forEach(book => {
      if (book.location?.coordinates?.lat && book.location?.coordinates?.lng) {
        const bookFeature = new Feature({
          geometry: new Point(fromLonLat([book.location.coordinates.lng, book.location.coordinates.lat])),
          type: 'book',
          id: book._id,
          title: book.title,
        });
        bookFeature.setStyle(createMarkerStyle('book', selectedBook === book._id));
        source.addFeature(bookFeature);
      }
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
        };
        setUserLocation(location);
        map.getView().setCenter(fromLonLat([location.lng, location.lat]));
        map.getView().setZoom(13);
        updateMarkers(map, location, books);
        updateRadiusCircle(map, location, radius);
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

  // Function to find books within the radius
  const getBooksInRadius = () => {
    if (!userLocation) return [];
    
    return books.filter(book => {
      if (!book.location?.coordinates?.lat || !book.location?.coordinates?.lng) {
        return false;
      }
      
      // Calculate distance (simple approximation)
      const lat1 = userLocation.lat;
      const lon1 = userLocation.lng;
      const lat2 = book.location.coordinates.lat;
      const lon2 = book.location.coordinates.lng;
      
      // Haversine formula
      const R = 6371; // Radius of the earth in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c; // Distance in km
      
      // Check if the book is within the radius
      return distance <= radius;
    });
  };

  return (
    <div className={`space-y-4 h-full flex flex-col ${className}`}>
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

      <div className="flex-1 relative">
        <div 
          ref={mapRef} 
          className="w-full h-full rounded-lg"
          style={{ height: '400px', backgroundColor: '#f8f9fa' }}
        />

        {/* Distance legend and radius adjustment */}
        <Card className="absolute bottom-4 right-4 p-3 bg-white shadow-md text-sm w-64">
          <div className="space-y-3">
            <h4 className="font-medium">Search Radius: {radius} km</h4>
            <Slider
              value={[radius]}
              min={1}
              max={50}
              step={1}
              onValueChange={(value) => setRadius(value[0])}
            />
            <div className="text-xs text-muted-foreground">
              Found {getBooksInRadius().length} books within {radius} km
            </div>
            
            <div className="pt-2 border-t border-gray-100 mt-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Your location</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Available books</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Book list within radius */}
      <div className="mt-4">
        <h3 className="font-medium mb-2">Books within {radius} km</h3>
        {getBooksInRadius().length > 0 ? (
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {getBooksInRadius().map(book => (
              <Card 
                key={book._id} 
                className={`p-3 cursor-pointer ${selectedBook === book._id ? 'border-primary' : ''}`}
                onClick={() => {
                  setSelectedBook(book._id);
                  if (onBookSelect) {
                    onBookSelect(book._id);
                  }
                }}
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{book.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {[
                        book.location?.address,
                        book.location?.city,
                        book.location?.state
                      ].filter(Boolean).join(', ') || 'Location not specified'}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No books found within this radius</div>
        )}
      </div>
    </div>
  );
} 