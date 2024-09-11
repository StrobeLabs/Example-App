import Image from "next/image";

export default function Header() {
  return (
    <Image
      src="/Header.png"
      alt="Beacon"
      width={100}
      height={100}
      className="absolute top-0 left-0 pointer-events-none w-screen h-auto"
    />
  );
}