import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TransportContractData, INITIAL_TRANSPORT_DATA } from '../../types/transport';
import { C } from '../../theme';
import ProgressBar from '../ContractWizard/components/ProgressBar';
import WizardNavigation from '../ContractWizard/components/WizardNavigation';
import Step1Basics from './steps/Step1Basics';
import Step2Route from './steps/Step2Route';
import Step3Cargo from './steps/Step3Cargo';
import Step4Pricing from './steps/Step4Pricing';
import Step5Summary from './steps/Step5Summary';

const TOTAL_STEPS = 5;
const STEP_LABELS = ['Podstawy', 'Trasa', 'Ładunek', 'Wycena', 'Gotowe'];

export default function TransportWizard({ onBack }: { onBack: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<TransportContractData>(INITIAL_TRANSPORT_DATA);

  const updateData = (updates: Partial<TransportContractData>) => setData(prev => ({ ...prev, ...updates }));
  const goNext = () => { if (currentStep < TOTAL_STEPS) setCurrentStep(s => s + 1); };
  const goBack = () => { if (currentStep > 1) setCurrentStep(s => s - 1); };
  const goToStep = (step: number) => { if (step >= 1 && step <= TOTAL_STEPS) setCurrentStep(step); };
  const saveDraft = () => console.log('[TransportWizard] Draft saved', JSON.stringify(data, null, 2));
  const createContract = () => console.log('[TransportWizard] Creating contract', JSON.stringify(data, null, 2));

  const totalAmount = data.pricingMethod === 'fixed' ? data.fixedPrice : data.pricingMethod === 'per_km' ? data.pricePerKm * data.distanceKm : 0;

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1Basics data={data} updateData={updateData} />;
      case 2: return <Step2Route data={data} updateData={updateData} />;
      case 3: return <Step3Cargo data={data} updateData={updateData} />;
      case 4: return <Step4Pricing data={data} updateData={updateData} totalAmount={totalAmount} />;
      case 5: return <Step5Summary data={data} totalAmount={totalAmount} goToStep={goToStep} onCreateContract={createContract} />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor={C.bg} />
      <View style={styles.container}>
        <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} onStepPress={goToStep} stepLabels={STEP_LABELS} onBack={onBack} />
        <View style={styles.content}>{renderStep()}</View>
        <WizardNavigation currentStep={currentStep} totalSteps={TOTAL_STEPS} onBack={goBack} onNext={goNext} onSaveDraft={saveDraft} onCreateContract={createContract} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, backgroundColor: C.bg },
  content: { flex: 1 },
});
