import { useState } from "react";

export default function BarcodeInputScanner() {
  const [barcode, setBarcode] = useState("");

  const handleScan = (e) => {
    if (e.key === "Enter") {
      console.log("Scanned barcode:", barcode);
      setBarcode(""); // reset after scan
    }
  };

  return (
    <input
      type="text"
      value={barcode}
      onChange={(e) => setBarcode(e.target.value)}
      onKeyDown={handleScan}
      autoFocus
      placeholder="Scan barcode here..."
      style={{ opacity: 0, position: "absolute" }}
    />
  );
}