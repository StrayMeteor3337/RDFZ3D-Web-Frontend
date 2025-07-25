import type { RequestEvent } from "@sveltejs/kit";

type PlatformInfo = {
  name: string;
  key: string;
  downloadUrl: string;
  icon: string;
};

const PLATFORMS: PlatformInfo[] = [
  {
    name: "Windows",
    key: "windows",
    downloadUrl: "https://example.com/download/windows-installer.exe",
    icon: "fa-brands fa-windows",
  },
  {
    name: "macOS",
    key: "macos",
    downloadUrl: "https://example.com/download/macos-installer.dmg",
    icon: "fa-brands fa-apple",
  },
  {
    name: "Linux",
    key: "linux",
    downloadUrl: "https://example.com/download/linux-installer.AppImage",
    icon: "fa-brands fa-linux",
  },
  {
    name: "Android",
    key: "android",
    downloadUrl: "https://example.com/download/android.apk",
    icon: "fa-brands fa-android",
  },
  {
    name: "iOS",
    key: "ios",
    downloadUrl: "https://example.com/download/ios.ipa",
    icon: "fa-brands fa-apple",
  },
];

//这都是copilot写的，通过检测UA标识获取目标设备的平台

function detectPlatform(userAgent: string): string | null {
  userAgent = userAgent.toLowerCase();

  // 1. 先检测明确的iOS设备（iPhone/iPod/iPad）
  if (/iphone|ipod|ipad/.test(userAgent)) return "ios";

  // 2. 检测新版iPadOS（UA同时包含Macintosh|Mac OS X和Mobile）
  if (/macintosh|mac os x/.test(userAgent) && /mobile/.test(userAgent)) return "ios";

  // 3. 其他平台检测
  if (/android/.test(userAgent)) return "android";
  if (/windows nt/.test(userAgent)) return "windows";
  if (/macintosh|mac os x/.test(userAgent)) return "macos";
  if (/linux/.test(userAgent) && !/android/.test(userAgent)) return "linux";

  return null;
}

export const load = async ({ request }: RequestEvent) => {
  const userAgent = request.headers.get("user-agent") || "";
  const detected = detectPlatform(userAgent);

  let top: PlatformInfo | undefined;
  let others: PlatformInfo[] = [];

  if (detected) {
    top = PLATFORMS.find((p) => p.key === detected);
    others = PLATFORMS.filter((p) => p.key !== detected);
  } else {
    others = PLATFORMS;
  }

  return {
    detectedPlatform: top,
    otherPlatforms: others,
  };
};
