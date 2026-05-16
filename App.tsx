import React, { useState } from 'react';
import ContractTypeSelector from './src/screens/ContractTypeSelector';
import ContractWizard from './src/screens/ContractWizard';
import ServiceWizard from './src/screens/ServiceWizard';
import TransportWizard from './src/screens/TransportWizard';
import SaleWizard from './src/screens/SaleWizard';
import CustomWizard from './src/screens/CustomWizard';

type Screen = null | 'remont' | 'usluga' | 'transport' | 'sprzedaz' | 'wlasna';

export default function App() {
  const [screen, setScreen] = useState<Screen>(null);
  const goHome = () => setScreen(null);

  if (screen === 'remont') return <ContractWizard onBack={goHome} />;
  if (screen === 'usluga') return <ServiceWizard onBack={goHome} />;
  if (screen === 'transport') return <TransportWizard onBack={goHome} />;
  if (screen === 'sprzedaz') return <SaleWizard onBack={goHome} />;
  if (screen === 'wlasna') return <CustomWizard onBack={goHome} />;
  return <ContractTypeSelector onSelect={setScreen} />;
}
