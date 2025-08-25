const HeroSection = () => {
  return (
    <section className="bg-gradient-hero py-20 lg:py-32">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
          Convert HTML Tables to CSV
          <span className="block text-primary-blue mt-2">Instantly</span>
        </h1>
        <p className="text-lg md:text-xl text-foreground-muted max-w-3xl mx-auto mb-8">
          Transform any HTML table into a downloadable CSV file with just a few clicks. 
          Fast, secure, and completely free. No registration required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a 
            href="#tool" 
            className="btn-primary inline-flex items-center"
          >
            Try It Now
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <a 
            href="#features" 
            className="text-primary-blue hover:text-primary-blue-dark transition-colors font-medium"
          >
            Learn More →
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;