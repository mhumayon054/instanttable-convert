import { useState } from "react";
import TableInput from "./TableInput";
import CSVDownload from "./CSVDownload";
import StripeButton from "./StripeButton";

const ToolSection = () => {
  const [tableHTML, setTableHTML] = useState("");

  return (
    <section id="tool" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Convert Your Table Now
            </h2>
            <p className="text-lg text-foreground-muted">
              Paste your HTML table below and download the CSV instantly
            </p>
          </div>
          
          <div className="tool-container">
            <div className="space-y-8">
              {/* Table Input */}
              <TableInput value={tableHTML} onChange={setTableHTML} />
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <CSVDownload tableHTML={tableHTML} />
                <StripeButton />
              </div>
              
              {/* Help Text */}
              <div className="bg-background-muted rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-3">How to use:</h3>
                <ol className="list-decimal list-inside space-y-2 text-foreground-muted">
                  <li>Copy HTML table code from any website or create your own</li>
                  <li>Paste the HTML code in the textarea above</li>
                  <li>Click "Download CSV" to get your converted file</li>
                  <li>Open the CSV file in Excel, Google Sheets, or any spreadsheet app</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToolSection;