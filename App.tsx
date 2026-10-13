import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ContractWizard from './src/screens/ContractWizard';

export default function App() {
  return (
    <SafeAreaProvider>
      <ContractWizard />
    </SafeAreaProvider>
  );
}
