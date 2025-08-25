import { useState } from "react";

interface TableInputProps {
  value: string;
  onChange: (value: string) => void;
}

const TableInput = ({ value, onChange }: TableInputProps) => {
  return (
    <div className="space-y-3">
      <label htmlFor="table-input" className="block text-lg font-semibold text-foreground">
        Paste Your HTML Table
      </label>
      <textarea
        id="table-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your HTML table code here... 
Example:
<table>
  <tr><th>Name</th><th>Age</th></tr>
  <tr><td>John</td><td>25</td></tr>
  <tr><td>Jane</td><td>30</td></tr>
</table>"
        className="styled-input min-h-[200px] font-mono text-sm resize-y"
        rows={8}
      />
      <p className="text-sm text-foreground-muted">
        💡 Tip: Copy table HTML from any webpage or paste your own table markup
      </p>
    </div>
  );
};

export default TableInput;