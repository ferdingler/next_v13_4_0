const http = require("http");
const path = require("path");
const {
  createServerHandler,
} = require("next/dist/server/lib/render-server-standalone");

const dir = path.join(__dirname);

process.env.NODE_ENV = "production";
process.chdir(__dirname);

// Make sure commands gracefully respect termination signals (e.g. from Docker)
// Allow the graceful termination to be manually configurable
if (!process.env.NEXT_MANUAL_SIG_HANDLE) {
  process.on("SIGTERM", () => process.exit(0));
  process.on("SIGINT", () => process.exit(0));
}

let handler;

const currentPort = parseInt(process.env.PORT, 10) || 3000;
const hostname = process.env.HOSTNAME || "localhost";
const keepAliveTimeout = parseInt(process.env.KEEP_ALIVE_TIMEOUT, 10);
const nextConfig = {
  env: {},
  webpack: null,
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false, tsconfigPath: "tsconfig.json" },
  distDir: "./.next",
  cleanDistDir: true,
  assetPrefix: "",
  configOrigin: "next.config.js",
  useFileSystemPublicRoutes: true,
  generateEtags: true,
  pageExtensions: ["tsx", "ts", "jsx", "js"],
  poweredByHeader: true,
  compress: true,
  analyticsId: "",
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    path: "/_next/image",
    loader: "default",
    loaderFile: "",
    domains: [],
    disableStaticImages: false,
    minimumCacheTTL: 60,
    formats: ["image/webp"],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
    contentDispositionType: "inline",
    remotePatterns: [],
    unoptimized: false,
  },
  devIndicators: { buildActivity: true, buildActivityPosition: "bottom-right" },
  onDemandEntries: { maxInactiveAge: 15000, pagesBufferLength: 2 },
  amp: { canonicalBase: "" },
  basePath: "",
  sassOptions: {},
  trailingSlash: false,
  i18n: null,
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  excludeDefaultMomentLocales: true,
  serverRuntimeConfig: {},
  publicRuntimeConfig: {},
  reactStrictMode: false,
  httpAgentOptions: { keepAlive: true },
  outputFileTracing: true,
  staticPageGenerationTimeout: 60,
  swcMinify: true,
  output: "standalone",
  experimental: {
    appDocumentPreloading: true,
    clientRouterFilter: true,
    clientRouterFilterRedirects: false,
    fetchCacheKeyPrefix: "",
    middlewarePrefetch: "flexible",
    optimisticClientCache: true,
    manualClientBasePath: false,
    legacyBrowsers: false,
    newNextLinkBehavior: true,
    cpus: 9,
    sharedPool: true,
    isrFlushToDisk: true,
    workerThreads: false,
    pageEnv: false,
    optimizeCss: false,
    nextScriptWorkers: false,
    scrollRestoration: false,
    externalDir: false,
    disableOptimizedLoading: false,
    gzipSize: true,
    swcFileReading: true,
    craCompat: false,
    esmExternals: true,
    appDir: true,
    isrMemoryCacheSize: 52428800,
    fullySpecified: false,
    outputFileTracingRoot: "/Users/fdingler/Documents/nextapps/v13_4_0",
    swcTraceProfiling: false,
    forceSwcTransforms: false,
    largePageDataBytes: 128000,
    adjustFontFallbacks: false,
    adjustFontFallbacksWithSizeAdjust: false,
    typedRoutes: false,
    instrumentationHook: false,
    trustHostHeader: false,
  },
  configFileName: "next.config.js",
};

process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(nextConfig);

console.log("Creating http server");
const server = http.createServer(async (req, res) => {
  try {
    console.log("Handling request");
    await handler(req, res);
  } catch (err) {
    console.error("Failed to call handler", err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
});

if (
  !Number.isNaN(keepAliveTimeout) &&
  Number.isFinite(keepAliveTimeout) &&
  keepAliveTimeout >= 0
) {
  console.log("Setting keep alive timeout", keepAliveTimeout);
  server.keepAliveTimeout = keepAliveTimeout;
}

server.listen(currentPort, async (err) => {
  if (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }

  console.log("Creating server handler", {
    port: currentPort,
    hostname,
    dir,
  });

  try {
    handler = await createServerHandler({
      port: currentPort,
      hostname,
      dir,
      conf: nextConfig,
    });
  } catch (err) {
    console.log("Error, failed to create server handler", err);
  }

  console.log(
    "Listening on port",
    currentPort,
    "url: http://" + hostname + ":" + currentPort
  );
});
