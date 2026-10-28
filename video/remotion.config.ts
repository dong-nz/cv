import { Config } from '@remotion/cli/config';

// Output tuned for a self-hosted web asset: H.264 at CRF 23 keeps the 62-second
// 1080p explainer under ~10 MB, JPEG frames speed up stills and rendering.
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setCodec('h264');
Config.setCrf(23);
