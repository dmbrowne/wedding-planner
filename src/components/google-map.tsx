import React, { useEffect, useRef } from "react";
import { withGoogleApiGuard } from "./google-api-guard";
import theme from "../theme";
import { Box } from "grommet";

interface IProps {
  lat: number;
  lng: number;
  onLoaded?: (map: google.maps.Map) => void;
  mapOptions: google.maps.MapOptions;
}

const GoogleMap: React.FC<IProps> = withGoogleApiGuard()<IProps>(({ lat, lng, onLoaded, mapOptions = {} }) => {
  const mapEl = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map<HTMLDivElement> | null>(null);
  const area = new google.maps.LatLng(lat, lng);

  useEffect(() => {
    if (mapEl.current) {
      map.current = new google.maps.Map(mapEl.current, {
        center: area,
        zoom: 15,
        ...mapOptions,
      });
      if (onLoaded) onLoaded(map.current);
      new google.maps.Marker({
        position: { lat, lng },
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 7,
          strokeColor: theme.global.colors.brand,
        },
        map: map.current,
      });
    }
  }, [lat, lng]);

  return <Box fill as="div" ref={mapEl} />;
});

export default GoogleMap;
