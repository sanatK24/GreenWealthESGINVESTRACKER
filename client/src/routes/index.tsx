import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainLayout from './MainLayout'; // Assuming this component exists
import CompanyPrices from './CompanyPrices'; // Assuming this component exists
import ActivityHistory from './ActivityHistory'; // This component needs to be created
import NotFound from './NotFound'; // Assuming this component exists

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/company-prices" element={<MainLayout><CompanyPrices /></MainLayout>} />
        <Route path="/activity-history" element={<MainLayout><ActivityHistory /></MainLayout>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;