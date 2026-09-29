#!/usr/bin/env node
// Standalone grayscale image tracer for the Claude skill package.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { PNG } = require('pngjs');
const jpeg = require('jpeg-js');
const tracer = require('imagetracerjs');
const [input, output, ...options] = process.argv.slice(2);
const option = (key, fallback) => {
  const index = options.indexOf(key);
  return index < 0 ? fallback : Number(options[index + 1]);
};
const widthMm = option('--width-mm', 30);
const colors = option('--colors', 6);
const detail = option('--detail', 1.2);
const maxPx = option('--max-px', 900);
const minPath = option('--min-path', 16);
const inkThreshold = option('--ink', 85);

if (!input || !output || !(widthMm > 0 && widthMm <= 108) || !Number.isInteger(colors) || colors < 3 || colors > 12 || !(detail > 0 && detail <= 5)) {
  throw new Error('Usage: trace_artwork.mjs input.png|input.jpg output.svg --width-mm 30 [--colors 6] [--detail 1.2]; 3..12 gray levels; detail >0..5.');
}
if (fs.existsSync(output)) throw new Error('Output exists; use a new path to retain earlier artwork.');
if (!(maxPx >= 300 && maxPx <= 1800 && minPath >= 0 && minPath <= 100)) throw new Error('max-px: 300..1800; min-path: 0..100.');
if (!(inkThreshold >= 0 && inkThreshold <= 160)) throw new Error('ink: 0 (off) ..160.');

const bytes = fs.readFileSync(input);
const extension = path.extname(input).toLowerCase();
let im;
if (extension === '.png') im = PNG.sync.read(bytes);
else if (extension === '.jpg' || extension === '.jpeg') im = jpeg.decode(bytes, { useTArray: true });
else throw new Error('Input must be PNG or JPEG.');
if (!im.width || !im.height || !im.data || im.data.length !== im.width * im.height * 4) throw new Error('The source image could not be decoded.');

const scale = Math.min(1, maxPx / Math.max(im.width, im.height));
const w = Math.max(1, Math.round(im.width * scale));
const h = Math.max(1, Math.round(im.height * scale));
const pixels = new Uint8ClampedArray(w * h * 4);
const luminance = new Uint8Array(w * h);
let left = w, top = h, right = 0, bottom = 0;

function sample(x, y, channel) {
  const sx = Math.min(im.width - 1, Math.max(0, x));
  const sy = Math.min(im.height - 1, Math.max(0, y));
  const x0 = Math.floor(sx), y0 = Math.floor(sy), x1 = Math.min(im.width - 1, x0 + 1), y1 = Math.min(im.height - 1, y0 + 1);
  const fx = sx - x0, fy = sy - y0;
  const a = im.data[(y0 * im.width + x0) * 4 + channel];
  const b = im.data[(y0 * im.width + x1) * 4 + channel];
  const c = im.data[(y1 * im.width + x0) * 4 + channel];
  const d = im.data[(y1 * im.width + x1) * 4 + channel];
  return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
}

for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
  const sourceX = (x + .5) / scale - .5, sourceY = (y + .5) / scale - .5;
  const i = 4 * (y * w + x);
  const alpha = sample(sourceX, sourceY, 3) / 255;
  const r = sample(sourceX, sourceY, 0) * alpha + 255 * (1 - alpha);
  const g = sample(sourceX, sourceY, 1) * alpha + 255 * (1 - alpha);
  const b = sample(sourceX, sourceY, 2) * alpha + 255 * (1 - alpha);
  const gray = Math.round(.2126 * r + .7152 * g + .0722 * b);
  const quantized = Math.round(gray / 255 * (colors - 1)) * 255 / (colors - 1);
  pixels[i] = pixels[i + 1] = pixels[i + 2] = Math.round(quantized);
  pixels[i + 3] = 255;
  luminance[y * w + x] = gray;
  if (gray < 238) { left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y); }
}
if (left > right || top > bottom) throw new Error('No visible artwork found.');

left = Math.max(0, left - 4); top = Math.max(0, top - 4); right = Math.min(w - 1, right + 4); bottom = Math.min(h - 1, bottom + 4);
const cropWidth = right - left + 1, cropHeight = bottom - top + 1;
const croppedData = new Uint8ClampedArray(cropWidth * cropHeight * 4);
const croppedLuminance = new Uint8Array(cropWidth * cropHeight);
for (let y = 0; y < cropHeight; y++) for (let x = 0; x < cropWidth; x++) {
  const source = ((top + y) * w + left + x) * 4, target = (y * cropWidth + x) * 4;
  croppedData.set(pixels.subarray(source, source + 4), target);
  croppedLuminance[y * cropWidth + x] = luminance[(top + y) * w + left + x];
}
const cropped = { width: cropWidth, height: cropHeight, data: croppedData };
const pal = Array.from({ length: colors }, (_, i) => { const gray = Math.round(255 * i / (colors - 1)); return { r: gray, g: gray, b: gray, a: 255 }; });
const traced = tracer.imagedataToTracedata(cropped, { pal, colorsampling: 0, numberofcolors: colors, colorquantcycles: 1, pathomit: minPath, ltres: detail, qtres: detail, roundcoords: 2, strokewidth: 0, linefilter: false, rightangleenhance: false, blurradius: 0, layering: 0 });

let exteriorWhitePathsRemoved = 0;
traced.layers.forEach((layer, index) => {
  const color = traced.palette[index];
  if (color.r !== 255 || color.g !== 255 || color.b !== 255) return;
  for (const item of layer) {
    const bounds = item.boundingbox;
    if (!item.isholepath && bounds && bounds[0] <= 0 && bounds[1] <= 0 && bounds[2] >= cropped.width && bounds[3] >= cropped.height) {
      item.isholepath = true;
      exteriorWhitePathsRemoved++;
    }
  }
});
let svg = tracer.getsvgstring(traced, { roundcoords: 2, strokewidth: 0, scale: 1, viewbox: true, desc: false });
let inkPathCount = 0;
if (inkThreshold > 0) {
  const ink = { width: cropped.width, height: cropped.height, data: new Uint8ClampedArray(cropped.data.length) };
  for (let y = 0; y < ink.height; y++) for (let x = 0; x < ink.width; x++) {
    const i = (y * ink.width + x) * 4, gray = croppedLuminance[y * ink.width + x] < inkThreshold ? 0 : 255;
    ink.data[i] = ink.data[i + 1] = ink.data[i + 2] = gray;
    ink.data[i + 3] = 255;
  }
  const inkOptions = { pal: [{ r: 0, g: 0, b: 0, a: 255 }, { r: 255, g: 255, b: 255, a: 255 }], colorsampling: 0, numberofcolors: 2, colorquantcycles: 1, pathomit: Math.min(minPath, 6), ltres: Math.min(detail, .6), qtres: Math.min(detail, .6), strokewidth: 0, roundcoords: 3, rightangleenhance: false, blurradius: 0, layering: 0 };
  const inkTrace = tracer.imagedataToTracedata(ink, inkOptions);
  inkTrace.layers = [inkTrace.layers[0]];
  inkTrace.palette = [inkTrace.palette[0]];
  const inkPaths = tracer.getsvgstring(inkTrace, inkOptions).match(/<path\b[^>]*>/g) || [];
  inkPathCount = inkPaths.length;
  svg = svg.replace('</svg>', `<g data-name="ink-contours">${inkPaths.join('')}</g></svg>`);
}
const pathCount = (svg.match(/<path\b/g) || []).length;
const heightMm = widthMm * cropped.height / cropped.width;
svg = svg.replace(/<svg\b[^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" width="${widthMm}mm" height="${heightMm.toFixed(6)}mm" viewBox="0 0 ${cropped.width} ${cropped.height}">`);
fs.writeFileSync(output, svg);
const report = { input, output, widthMm, heightMm, pathCount, inkPathCount, inkThreshold, exteriorWhitePathsRemoved, grayLevels: colors, sourcePixels: [im.width, im.height], tracePixels: [cropped.width, cropped.height], detail, minPath, maxPx, embeddedRaster: false, needsVisualReview: true, complexityWarning: pathCount > 2500 ? 'Many paths: simplify the original detail or increase detail tolerance and recheck small features.' : null };
fs.writeFileSync(output.replace(/\.svg$/i, '') + '.trace.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
