import Image from "next/image";

type Partner = {
  name: string;
  logo: string;
};

const partners: Partner[] = [
  { name: "BIDV", logo: "/images/partners/bidv.png" },
  { name: "Vietcombank", logo: "/images/partners/vietcombank.png" },
  { name: "Hoà Phát", logo: "/images/partners/hoaphat.png" },
  { name: "Viettel", logo: "/images/partners/viettel.png" },
  { name: "FPT", logo: "/images/partners/fpt.png" },
  { name: "Becamex", logo: "/images/partners/becamex.png" },
  { name: "VinFast", logo: "/images/partners/vinfast.png" },
  { name: "MobiFone", logo: "/images/partners/mobifone.png" },
];

export default function PartnerLogos() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h2 className="text-vnpt-darker">ĐỐI TÁC ĐÃ TRIỂN KHAI</h2>
          <p className="mt-2 text-sm text-slate-600">
            Đồng hành cùng hàng nghìn tổ chức và doanh nghiệp
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="relative h-16 rounded-lg border border-slate-100 bg-white shadow-sm transition hover:border-vnpt/40 hover:shadow-md"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                fill
                sizes="120px"
                className="object-contain p-3"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
