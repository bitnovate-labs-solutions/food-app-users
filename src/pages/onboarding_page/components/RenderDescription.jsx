const RenderDescription = ({ currentStep, onboardingSteps }) => {
  return (
    <p className="text-lightgray">{onboardingSteps[currentStep].description}</p>
  );
};

export default RenderDescription;
