
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_FINANCE, MOCK_CONTACTS, MOCK_COMPANIES } from '../constants';
import { X, Printer } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';

export const InvoicePrint: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { config } = useConfig();
  
  const invoice = MOCK_FINANCE.find(d => d.id === id);
  // Default to what's in config or fallback to classic
  const templateType = config.invoiceTemplate || 'classic'; 

  if (!invoice) {
    return <div className="p-8 text-center text-white">Document not found</div>;
  }

  const contact = MOCK_CONTACTS.find(c => c.id === invoice.contactId);
  const company = MOCK_COMPANIES.find(c => c.id === contact?.companyId);

  const handlePrint = () => {
    window.print();
  };

  // --- Style Configurations ---
  
  const isMinimal = templateType === 'minimal';
  const isQuote = invoice.type === 'Quote';
  const documentTitle = isQuote ? 'QUOTE' : 'INVOICE';

  // Use specific invoice logo if set, otherwise global logo
  const logoSrc = config.invoiceLogoUrl || config.logoUrl;

  // Borders
  const borderClass = isMinimal ? "" : "border-2 border-gray-900";
  const cellBorderClass = isMinimal ? "border-b border-gray-100" : "divide-x-2 divide-gray-900 border-b-2 border-gray-900";
  const headerBorderClass = isMinimal ? "border-b border-gray-200 pb-4 mb-6" : "border-b-2 border-gray-900";

  // Label Logic
  const orderNumberLabel = invoice.category === 'Product' ? 'LPO #' : 'LSO #';

  return (
    <div className="min-h-screen bg-gray-900 p-8 print:p-0 print:bg-white">
      {/* Print Optimization Styles */}
      <style>
        {`
          @media print {
            @page { margin: 0; size: auto; }
            body { 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important; 
            }
            /* Ensure background is white for printing even if dark mode was on */
            body, #root { background-color: white !important; color: black !important; }
          }
        `}
      </style>

      {/* Action Bar - Hidden on Print */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden">
        <button 
          onClick={() => navigate('/finance')}
          className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors"
        >
          <X size={18} /> Close
        </button>
        <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-400">Template: <span className="font-medium text-white capitalize">{templateType}</span></span>
            <button 
            onClick={handlePrint}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition-colors shadow-sm"
            title="Opens system print dialog. Select 'Save as PDF' to download."
            >
            <Printer size={18} /> Print / Save as PDF
            </button>
        </div>
      </div>

      {/* Invoice Page - A4 Dimensions - ALWAYS WHITE for PDF/Print consistency */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none print:w-full print:max-w-none min-h-[297mm] text-black">
        
        <div className="p-[10mm] h-full">
            
            {/* Template: Classic (Boxed) vs Minimal (Open) */}
            <div className={`${borderClass}`}>
                
                {/* Header */}
                <div className={`${headerBorderClass} p-3 flex justify-between items-center ${!isMinimal ? 'bg-gray-50 print:bg-gray-50' : ''}`}>
                    <div className="flex flex-col">
                        <span className={`font-bold text-xl ${isMinimal ? "text-3xl font-black tracking-tight" : ""}`}>
                            {documentTitle}
                            {invoice.status === 'Accepted' && isQuote && <span className="ml-2 text-green-600 text-sm font-medium uppercase">(Accepted)</span>}
                            {invoice.status === 'Draft' && <span className="ml-2 text-gray-400 text-sm font-medium uppercase">(Draft)</span>}
                        </span>
                        {isMinimal && <span className="text-sm font-normal text-gray-500 mt-1">#{invoice.number}</span>}
                    </div>
                    {/* Branding */}
                    {logoSrc && (
                        <img src={logoSrc} alt="Logo" className={isMinimal ? "h-16 object-contain" : "h-10 object-contain"} />
                    )}
                </div>

                {/* Meta Grid */}
                <div className={`grid grid-cols-4 ${cellBorderClass} text-sm ${isMinimal ? 'py-4 gap-4' : ''}`}>
                    <div className={isMinimal ? "" : "p-2"}>
                        <div className="font-bold text-gray-700">PIN No.</div>
                        <div>{invoice.legalEntityId || '-'}</div>
                    </div>
                    <div className={isMinimal ? "" : "p-2"}>
                        <div className="font-bold text-gray-700">{isQuote ? 'Date' : 'Tax date'}</div>
                        <div>{new Date(invoice.issueDate).toLocaleDateString('en-GB')}</div>
                    </div>
                    <div className={isMinimal ? "" : "p-2"}>
                        <div className="font-bold text-gray-700">{orderNumberLabel}</div>
                        <div>{invoice.lsoNumber || '-'}</div>
                    </div>
                    <div className={isMinimal ? "" : "p-2"}>
                        <div className="font-bold text-gray-700">{isQuote ? 'Quote #' : 'Invoice #'}</div>
                        <div>{invoice.number}</div>
                    </div>
                </div>

                {/* Recipient */}
                <div className={`${headerBorderClass} min-h-[100px] ${isMinimal ? 'py-6' : 'p-4'} text-sm`}>
                    <div className="font-bold mb-2 text-gray-700">To:</div>
                    <div className="uppercase leading-relaxed font-medium">
                        {contact?.name}<br/>
                        {company?.name}<br/>
                        {company?.address}
                    </div>
                </div>

                {/* Items Table Header */}
                <div className={`grid grid-cols-[1fr_150px] ${cellBorderClass} text-sm ${!isMinimal ? 'bg-gray-50 print:bg-gray-50' : 'uppercase tracking-wider text-gray-500'}`}>
                    <div className={`${isMinimal ? 'py-2' : 'p-2 font-bold text-center'}`}>Description</div>
                    <div className={`${isMinimal ? 'py-2 text-right' : 'p-2 font-bold text-center'}`}>Amount (Ksh)</div>
                </div>

                {/* Items */}
                <div className={`grid grid-cols-[1fr_150px] ${cellBorderClass} text-sm min-h-[300px] items-start ${isMinimal ? 'py-4' : ''}`}>
                    <div className={`${isMinimal ? '' : 'p-3'} space-y-3`}>
                        {invoice.items.map(item => (
                            <div key={item.id} className="leading-relaxed">
                                {item.description}
                            </div>
                        ))}
                    </div>
                    <div className={`${isMinimal ? 'text-right' : 'p-3 text-right'} font-mono`}>
                        {invoice.items.map(item => (
                            <div key={item.id}>
                                {(item.quantity * item.unitPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Total */}
                <div className={`grid grid-cols-[1fr_150px] ${cellBorderClass} text-sm ${isMinimal ? 'py-4 border-t-2 border-gray-900' : ''}`}>
                    <div className={`${isMinimal ? 'text-right pr-4 pt-2' : 'p-2'} font-bold text-right uppercase tracking-wider`}>Total Amount payable</div>
                    <div className={`${isMinimal ? 'text-right pt-2' : 'p-2'} font-bold text-right font-mono text-lg`}>{invoice.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>

                {/* Payment Details - Only show for Invoices or if configured */}
                {!isQuote || config.invoiceFooter ? (
                    <div className={`${isMinimal ? 'pt-8 border-t border-gray-200' : 'p-4'} text-sm`}>
                        <div className="font-bold mb-2 underline">Payment Details</div>
                        <div className="whitespace-pre-line leading-relaxed font-medium text-gray-800">
                            {invoice.paymentDetails || "Account Details: Account Name - Global Village Publishers (EA) Ltd -\nEquity Bank, Mombasa Road Branch, Ac No. 0260293429681\nCheques Payable to Global Village Publishers (EA) Ltd"}
                        </div>
                    </div>
                ) : null}
            </div>
            
            {/* Custom Footer / Notes (from config) */}
            {config.invoiceFooter && (
                <div className="mt-8 text-center text-xs text-gray-500">
                    {config.invoiceFooter}
                </div>
            )}
            
            {/* Custom Fields (Optional) */}
            {invoice.customFields && Object.keys(invoice.customFields).length > 0 && (
                <div className={`mt-8 ${isMinimal ? 'border-t border-gray-100' : 'border-t-2 border-gray-900'} pt-4 text-xs`}>
                    <div className="font-bold mb-2">Additional Information:</div>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(invoice.customFields).map(([key, value]) => (
                            <div key={key}>
                                <span className="font-semibold capitalize">{key.replace('_', ' ')}:</span> {value}
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};