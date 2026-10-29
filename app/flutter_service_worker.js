'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"version.json": "8b7883e53b0c6e8a53687856f98f72b3",
"flutter_bootstrap.js": "dd121a5efc18e209e863bbc386aa0687",
"index.html": "89d1c4ad6f0de53c0b9781f4096d8d3b",
"/": "89d1c4ad6f0de53c0b9781f4096d8d3b",
"main.dart.js": "80198393e14fb35a797f164f173754b3",
"assets/FontManifest.json": "e69c337dcd3471b8c09855e73ad84689",
"assets/fonts/MaterialIcons-Regular.otf": "2019831bb2e9ad4a3c83cc1f33e51f59",
"assets/NOTICES": "9b8aa0f4a895c2a40cd84015c811df43",
"assets/assets/brand/brand_watermark.jpg": "2e514b7dc1ee06d853bff7bc8294a8bd",
"assets/assets/brand/brand_logo_dark.jpg": "66220954f0189bc8e1dfe86133410e78",
"assets/assets/brand/plan_icon.png": "a4b6d9de920fc69b8aae6688d386c087",
"assets/assets/brand/plan_icon_flat.jpg": "fcae2f2a6913a0a9842ea9e55d73775d",
"assets/assets/fonts/NotoSans-Bold.ttf": "8bedd188f4c137b79409d437de74f91f",
"assets/assets/fonts/NotoSansDevanagari-Regular.ttf": "44e0b243bd0ac5430fca8b45ddd9e040",
"assets/assets/fonts/NotoSans-Regular.ttf": "2c157a50aeb376ee5a69032d7813ffb2",
"assets/assets/fonts/NotoSansDevanagari-Bold.ttf": "8a99933c276c0de9ff1eeb134d33b26a",
"assets/assets/journey/s07.jpg": "cbcfd7ef5532eb0c74a798fbd8da6c2d",
"assets/assets/journey/s08.jpg": "fdbe2f4a9146ef459a7a22e3e6dc8bfe",
"assets/assets/journey/s05.jpg": "92e1fc83ba88c97ce59f45c65ceaf24c",
"assets/assets/journey/s02.jpg": "116f955b8206eecfe9a9f91585ebcd93",
"assets/assets/journey/s06.jpg": "6c3eb2d353dd1d422d021b2e4266bd3a",
"assets/assets/journey/s03.jpg": "b07c94b05630b5002f4e0b3aa7dc9f2e",
"assets/assets/journey/s01.jpg": "bea0087cba0619dbd6388d0127491f18",
"assets/assets/journey/s04b.jpg": "c6eb231b8b3b9d98f70770031b54b83c",
"assets/assets/journey/s04.jpg": "f9564ff726739841a34b829d8ee4e444",
"assets/AssetManifest.json": "ce7b15692a017d2d8ea41e0d41e4e261",
"assets/AssetManifest.bin": "532f34f8717d4516420c8aea82d65911",
"assets/AssetManifest.bin.json": "d721528733603d58b204f65cc7066824",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"flutter.js": "888483df48293866f9f41d3d9274a779",
"canvaskit/canvaskit.js.symbols": "58832fbed59e00d2190aa295c4d70360",
"canvaskit/skwasm_heavy.js": "413f5b2b2d9345f37de148e2544f584f",
"canvaskit/skwasm.js.symbols": "0088242d10d7e7d6d2649d1fe1bda7c1",
"canvaskit/canvaskit.wasm": "07b9f5853202304d3b0749d9306573cc",
"canvaskit/skwasm.js": "1ef3ea3a0fec4569e5d531da25f34095",
"canvaskit/skwasm.wasm": "264db41426307cfc7fa44b95a7772109",
"canvaskit/canvaskit.js": "140ccb7d34d0a55065fbd422b843add6",
"canvaskit/skwasm_heavy.wasm": "8034ad26ba2485dab2fd49bdd786837b",
"canvaskit/chromium/canvaskit.js.symbols": "193deaca1a1424049326d4a91ad1d88d",
"canvaskit/chromium/canvaskit.wasm": "24c77e750a7fa6d474198905249ff506",
"canvaskit/chromium/canvaskit.js": "5e27aae346eee469027c80af0751d53d",
"canvaskit/skwasm_heavy.js.symbols": "3c01ec03b5de6d62c34e17014d1decd3",
"icons/Icon-512.png": "a4b6d9de920fc69b8aae6688d386c087",
"icons/Icon-maskable-512.png": "8952ffefb889a1fb8283117ada2985d0",
"icons/Icon-maskable-192.png": "e676a59b8cfd8377c0d303616f08b5d7",
"icons/Icon-192.png": "1833b18ef64501df58b3d3ac916cbb6f",
"favicon.png": "1c56493bdd02ae31dc978941586f6520",
"manifest.json": "e11e8962e52381bec9dfda5818a6bab9"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
