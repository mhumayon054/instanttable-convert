import { Crown } from "lucide-react";

const StripeButton = () => {
  const handlePremiumUpgrade = () => {
    // This would integrate with Stripe in a real application
    alert('Premium upgrade coming soon! This would integrate with Stripe for payment processing.');
  };

  return (
    <button
      onClick={handlePremiumUpgrade}
      className="btn-premium flex items-center justify-center space-x-2 w-full sm:w-auto"
    >
      <Crown className="w-5 h-5" />
      <span>Upgrade to Premium</span>
    </button>
  );
};

export default StripeButton;