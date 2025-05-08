import BrandLogo from "@/assets/tyd_logo.png";

export function Logo() {
  return (
    <div className="flex justify-center mb-8">
      <img src={BrandLogo} alt="TreatYourDate logo" />
    </div>
  );
}
