export type TelecomDeviceGroup = {
  slug: string;
  label: string;
};

export type TelecomDeviceMeta = {
  slug: string;
  image: string;
  group: string;
  specs: string[];
};

export const TELECOM_DEVICE_GROUPS: TelecomDeviceGroup[] = [
  { slug: "tat-ca", label: "Tất cả sản phẩm" },
  { slug: "thiet-bi-mang", label: "Thiết bị mạng" },
  { slug: "camera", label: "Camera" },
  { slug: "truyen-hinh", label: "Truyền hình" },
  { slug: "smart-home", label: "Smart Home" },
  { slug: "thiet-bi-dau-cuoi", label: "Thiết bị đầu cuối" },
];

export const TELECOM_DEVICE_META: TelecomDeviceMeta[] = [
  {
    slug: "vnpt-technology-xgs-pon-ont",
    image: "/images/thiet-bi/xgs-pon-ont.jpg",
    group: "thiet-bi-mang",
    specs: ["10Gbps", "XGS-PON", "WiFi 6"],
  },
  {
    slug: "vnpt-technology-gpon-ont-olt",
    image: "/images/thiet-bi/gpon-ont-olt.jpg",
    group: "thiet-bi-mang",
    specs: ["GPON", "2.5Gbps", "IPv6"],
  },
  {
    slug: "vnpt-technology-mesh-wifi",
    image: "/images/thiet-bi/mesh-wifi.jpg",
    group: "thiet-bi-mang",
    specs: ["WiFi 6", "Mesh", "MU-MIMO"],
  },
  {
    slug: "vnpt-technology-fwa-va-5g",
    image: "/images/thiet-bi/fwa-va-5g.jpg",
    group: "thiet-bi-mang",
    specs: ["5G NR", "WiFi 6", "Up to 1Gbps"],
  },
  {
    slug: "vnpt-technology-wifi-cho-vien-thong-va-doanh-nghiep",
    image: "/images/thiet-bi/wifi-cho-vien-thong-va-doanh-nghiep.jpg",
    group: "thiet-bi-mang",
    specs: ["WiFi 6/7", "PoE", "Dual Band"],
  },
  {
    slug: "vnpt-technology-camera-gia-dinh",
    image: "/images/thiet-bi/camera-gia-dinh.jpg",
    group: "camera",
    specs: ["2MP/4MP", "FHD", "Cloud Storage"],
  },
  {
    slug: "vnpt-technology-camera-doanh-nghiep",
    image: "/images/thiet-bi/camera-doanh-nghiep.jpg",
    group: "camera",
    specs: ["4MP/8MP", "AI", "IP67"],
  },
  {
    slug: "vnpt-technology-dau-thu-thong-minh-smartbox",
    image: "/images/thiet-bi/dau-thu-thong-minh-smartbox.jpg",
    group: "truyen-hinh",
    specs: ["Android TV", "4K", "Voice Control"],
  },
  {
    slug: "vnpt-technology-dau-thu-ky-thuat-so-dvb-t2",
    image: "/images/thiet-bi/dau-thu-ky-thuat-so-dvb-t2.jpg",
    group: "truyen-hinh",
    specs: ["DVB-T2", "Full HD", "USB PVR"],
  },
  {
    slug: "vnpt-technology-dien-thoai-thong-minh",
    image: "/images/thiet-bi/dien-thoai-thong-minh.jpg",
    group: "thiet-bi-dau-cuoi",
    specs: ["5G", "AMOLED", "Fingerprint"],
  },
  {
    slug: "vnpt-technology-vnpt-smart-home",
    image: "/images/thiet-bi/vnpt-smart-home.jpg",
    group: "smart-home",
    specs: ["IoT", "Zigbee", "App Control"],
  },
];

export function getTelecomDeviceMeta(slug: string): TelecomDeviceMeta | undefined {
  return TELECOM_DEVICE_META.find((item) => item.slug === slug);
}

export function getTelecomDeviceGroupLabel(slug: string): string {
  return TELECOM_DEVICE_GROUPS.find((group) => group.slug === slug)?.label ?? slug;
}
