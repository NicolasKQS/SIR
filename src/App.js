import React from 'react';
import { motion } from 'framer-motion';
import SIRHeader from './components/SIRHeader';
import SIRExplanation from './components/SIRExplanation';
import SIREquations from './components/SIREquations';
import SIRGraph from './components/SIRGraph';
import SIRFooter from './components/SIRFooter';

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <SIRHeader />
      <SIRExplanation />
      <SIREquations />
      <SIRGraph />
      <SIRFooter />
    </div>
  );
};

export default App;