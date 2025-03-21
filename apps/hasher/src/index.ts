/// <reference types="@types/bun" />

import path from "node:path";
import AdmZip from "adm-zip";
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const CACHE_DIR = path.join(process.cwd(), "apps", "hasher", "cache");

process.env.FONTCONFIG_PATH = path.join(
  process.cwd(),
  "assets",
  "fonts",
  "fonts.conf"
);

const colors = {
  black: { r: 0, g: 0, b: 0, alpha: 77 / 255 },
  blue: { r: 28, g: 65, b: 86, alpha: 77 / 255 },
  default: { r: 127, g: 127, b: 127, alpha: 77 / 255 },
  green: { r: 21, g: 45, b: 0, alpha: 77 / 255 },
  grey: { r: 29, g: 29, b: 29, alpha: 77 / 255 },
  orange: { r: 60, g: 25, b: 0, alpha: 77 / 255 },
  red: { r: 109, g: 36, b: 24, alpha: 77 / 255 },
  violet: { r: 76, g: 42, b: 85, alpha: 77 / 255 },
  yellow: { r: 104, g: 102, b: 40, alpha: 77 / 255 },
};

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

const gridCellTile = sharp(path.join(process.cwd(), "assets", "grid_cell.png"));

const gridCellTileBuffer = await gridCellTile.toBuffer();

async function main() {
  const itemLookup: Record<string, { shortName: string; id: string }> = {};

  mkdirSync(CACHE_DIR, { recursive: true });

  const tarkovDataPromise = getTarkovData();

  await getRawDataset();
  await extractIconsFromArchive();
  const tarkovData = await tarkovDataPromise;

  for (const itemIndex in tarkovData.items) {
    const item = tarkovData.items[itemIndex];

    if (!item) {
      continue;
    }

    const iconPath = path.join(CACHE_DIR, "icons", `${item.id}.png`);
    if (await Bun.file(iconPath).exists()) {
      console.log(`${item.id} - ${item.shortName}`);

      const iconBuffer = await Bun.file(iconPath).arrayBuffer();
      const sharpIcon = sharp(iconBuffer);

      const iconSize = await sharpIcon.metadata();

      const defaultIcon = await getIconFromBufferAndSize(
        iconBuffer,
        iconSize.width!,
        iconSize.height!,
        item.backgroundColor,
        item.shortName
      );

      const highlightedIcon = await getIconFromBufferAndSize(
        iconBuffer,
        iconSize.width!,
        iconSize.height!,
        item.backgroundColor,
        item.shortName,
        true
      );

      await Bun.write(
        path.join(CACHE_DIR, "generatedIcons", `${item.id}-default.png`),
        defaultIcon
      );

      await Bun.write(
        path.join(CACHE_DIR, "generatedIcons", `${item.id}-highlighted.png`),
        highlightedIcon
      );

      itemLookup[item.id] = { shortName: item.shortName, id: item.id };
    }
  }

  await Bun.write(
    path.join(CACHE_DIR, "itemLookup.json"),
    JSON.stringify(itemLookup, null, 2)
  );
}

async function getIconFromBufferAndSize(
  iconBuffer: ArrayBuffer | Buffer,
  width: number,
  height: number,
  itemBackgroundColor: string,
  shortName: string,
  isHightlighted = false
) {
  const sharpIcon = sharp(iconBuffer);

  const backgroundColor = colors[itemBackgroundColor as keyof typeof colors];

  const svgText = Buffer.from(`
    <svg width="${width}" height="${height}">
      <style>
        text {
          font-family: Bender;
          font-size: 12px;
          font-weight: bold;
          fill: white;
          paint-order: stroke;
          stroke: #000000;
          stroke-width: 2px;
          stroke-linecap: butt;
          stroke-linejoin: miter;
        }
      </style>
      <text x="99%" y="11" fill="#a4aeb4" text-anchor="end">${escapeXml(
        shortName
      )}</text>
    </svg>
  `);

  const compositeIcon = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: isHightlighted
        ? { r: 255, g: 255, b: 255, alpha: 255 }
        : { r: 0, g: 0, b: 0, alpha: 255 },
    },
  })
    .composite([
      {
        input: gridCellTileBuffer,
        tile: true,
        gravity: "southwest",
      },
      {
        input: await sharp({
          create: {
            width,
            height,
            channels: 4,
            background: backgroundColor,
          },
        })
          .png()
          .toBuffer(),
      },
      {
        input: await sharpIcon.toBuffer(),
        top: 0,
        left: 0,
      },
      {
        input: svgText,
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer();

  return compositeIcon;
}

type TarkovData = {
  items: {
    id: string;
    backgroundColor: string;
    shortName: string;
  }[];
};

async function getTarkovData() {
  const response = await fetch("https://api.tarkov.dev/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `query Items {
        items {
          id
          backgroundColor
          shortName
        }
      }`,
    }),
  });

  const { data } = (await response.json()) as any;
  return data as TarkovData;
}

async function extractIconsFromArchive() {
  const zip = new AdmZip(path.join(CACHE_DIR, "Data.zip"));
  const entries = zip.getEntries();

  for (const entry of entries) {
    if (entry.name.includes(".png")) {
      const icon = entry.getData();
      const iconName = entry.name.split("/").pop();
      const iconPath = path.join(CACHE_DIR, "icons", iconName!);
      await Bun.write(iconPath, icon);
    }
  }
}

async function getRawDataset() {
  console.log("Getting raw dataset");

  const cachePath = path.join(CACHE_DIR, "Data.zip");

  // Check if cached version exists
  if (await Bun.file(cachePath).exists()) {
    console.log("Using cached dataset");
    return;
  }

  const response = await fetch(
    "https://api.github.com/repos/RatScanner/RatScannerData/releases/latest"
  );
  const data = (await response.json()) as any;

  const zipAsset = data.assets.find((asset: any) => asset.name === "Data.zip");
  if (!zipAsset) {
    throw new Error("Could not find Data.zip in latest release");
  }

  const zipResponse = await fetch(zipAsset.browser_download_url);
  const zipArrayBuffer = await zipResponse.arrayBuffer();

  // Ensure cache directory exists
  mkdirSync(path.join(process.cwd(), "cache"), { recursive: true });

  // Cache the dataset
  await Bun.write(cachePath, zipArrayBuffer);

  console.log("Raw dataset downloaded and cached");
}

main();
