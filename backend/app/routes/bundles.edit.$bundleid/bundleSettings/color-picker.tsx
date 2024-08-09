import {
  ColorPicker,
  Popover,
  Text,
  InlineStack,
  BlockStack,
  TextField,
  Box,
  RGBColor,
} from "@shopify/polaris";
import { GapInsideSection } from "../../../constants";
import { useState, useEffect } from "react";
import { hsbToHex, rgbToHsb } from "@shopify/polaris";

// User can select a color from the color picker or enter a hex code
// The selected color is displayed in a small square

// Inside this component, color is stored as HSB, but it is displayed as a hex code
// Inside the database, color is stored as a hex code
export default function Index({
  color,
  label,
  colorId,
  updateColor,
}: {
  color: string; // Hex color code
  label: string;
  colorId: string;
  updateColor: (newHexColor: string, colorId: string) => void;
}) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [HSBColor, setHSBColor] = useState(
    rgbToHsb(hexToRgb(color) as RGBColor),
  );

  useEffect(() => {
    updateColor(hsbToHex(HSBColor), colorId);
  }, [HSBColor]);

  return (
    <Popover
      active={showColorPicker}
      activator={
        <InlineStack gap={GapInsideSection} blockAlign="center">
          <div
            style={{
              backgroundColor: `${hsbToHex(HSBColor)}`,
              width: "30px",
              height: "30px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={() => setShowColorPicker(true)}
          ></div>
          <Text as="p">{label}</Text>
        </InlineStack>
      }
      onClose={() => {
        setShowColorPicker(false);
      }}
    >
      <Box padding="400">
        <BlockStack gap={GapInsideSection}>
          <ColorPicker
            onChange={(newHSBColor) => {
              setHSBColor(newHSBColor);
            }}
            color={HSBColor}
          />

          <TextField
            label="Enter color hex code"
            name={label}
            labelHidden
            value={hsbToHex(HSBColor)}
            onChange={(newHexColor) => {
              setHSBColor(formatHexToHsb(newHexColor));
            }}
            autoComplete="false"
          />
        </BlockStack>
      </Box>
    </Popover>
  );
}

function formatHexToHsb(hex: string) {
  return rgbToHsb(hexToRgb(hex) as RGBColor);
}

//https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex: string) {
  let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        red: parseInt(result[1], 16),
        green: parseInt(result[2], 16),
        blue: parseInt(result[3], 16),
      }
    : null;
}
