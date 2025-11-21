import BrandLogo from "@/assets/logos/logo1.png";

export function Logo() {
  return (
    <div className="flex justify-center mb-8">
      <img src={BrandLogo} alt="TreatYourDate logo" />
    </div>
  );
}
