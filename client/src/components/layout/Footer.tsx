import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t bg-slate-50 py-6 mt-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-sm uppercase mb-3">About GreenWealth</h3>
            <p className="text-sm text-slate-600">
              Helping investors track and analyze sustainable investments across environmental, social, and governance factors.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm uppercase mb-3">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-slate-600 hover:text-primary">ESG Methodology</a></li>
              <li><a href="#" className="text-sm text-slate-600 hover:text-primary">Sustainability Blog</a></li>
              <li><a href="#" className="text-sm text-slate-600 hover:text-primary">Market Insights</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm uppercase mb-3">Contact</h3>
            <ul className="space-y-2">
              <li className="text-sm text-slate-600">support@esginvest.com</li>
              <li className="text-sm text-slate-600">+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-center text-sm text-slate-500">
            © {new Date().getFullYear()} GreenWealth. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;