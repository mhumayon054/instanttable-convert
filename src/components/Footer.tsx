const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Left side - Copyright */}
          <div className="text-background/80">
            © {currentYear} Table2CSV Pro. All rights reserved.
          </div>
          
          {/* Right side - Links */}
          <nav className="flex space-x-6">
            <a 
              href="#privacy" 
              className="text-background/80 hover:text-background transition-colors hover:underline"
            >
              Privacy Policy
            </a>
            <a 
              href="#terms" 
              className="text-background/80 hover:text-background transition-colors hover:underline"
            >
              Terms of Service
            </a>
            <a 
              href="#support" 
              className="text-background/80 hover:text-background transition-colors hover:underline"
            >
              Support
            </a>
          </nav>
        </div>
        
        {/* Additional info */}
        <div className="mt-8 pt-8 border-t border-background/20 text-center">
          <p className="text-background/60">
            Secure, fast, and reliable HTML table to CSV conversion tool
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;