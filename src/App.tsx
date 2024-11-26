import { LatLngTuple, LatLngBoundsExpression } from "leaflet";
import { useRef, useState, useCallback } from "react";
import { ImageOverlay, MapContainer, TileLayer, Tooltip } from "react-leaflet";

function App() {
  const [position] = useState<LatLngTuple>([
    32.3639162876347, 47.55944494696195,
  ]);
  const imageRef = useRef<L.ImageOverlay | null>(null);
  const [tooltip, setTooltip] = useState<string>("1");

  const rgbToHex = useCallback((rgb: string): string => {
    const hex = rgb.replace(/[^\d,]/g, "").split(",");
    const r = parseInt(hex[0], 10).toString(16).padStart(2, "0");
    const g = parseInt(hex[1], 10).toString(16).padStart(2, "0");
    const b = parseInt(hex[2], 10).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }, []);

  const onHover = useCallback((event: { originalEvent: MouseEvent }): void => {
    const canvas = document.createElement("canvas");
    canvas.style.display = "none";
    const ctx = canvas.getContext("2d");
    if (!ctx || !imageRef.current) return;

    const image = imageRef.current.getElement();
    if (!(image instanceof HTMLImageElement)) return;

    const width = image.width;
    const height = image.height;
    const x = event.originalEvent.offsetX;
    const y = event.originalEvent.offsetY;
    image.crossOrigin = "Anonymous";
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    const hexColor = rgbToHex(
      `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`
    );
    setTooltip(hexColor);
    console.log(hexColor);
  }, [rgbToHex]);

  const debounce = <T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: number;
    return (...args: Parameters<T>): void => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const debouncedOnHover = debounce(onHover, 10);

  const imageBounds: LatLngBoundsExpression = [
    [32.3639162876347, 47.55944494696195],
    [32.40922772144021, 47.60558379809906],
  ];

  return (
    <div className="min-h-screen">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100vh" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ImageOverlay
          url="https://fazayesh-indicators-bucket.s3.ir-thr-at1.arvanstorage.ir/ndvi/file_56a94fdc-f9df-4d1a-89e0-00721534b509.png"
          bounds={imageBounds}
          ref={imageRef}
          interactive={true}
          eventHandlers={{
            mousemove: debouncedOnHover,
            click: onHover,
          }}
        >
          <Tooltip sticky direction="bottom" offset={[0, 45]} opacity={1}>
            {tooltip}
          </Tooltip>
        </ImageOverlay>
      </MapContainer>
    </div>
  );
}

export default App;

