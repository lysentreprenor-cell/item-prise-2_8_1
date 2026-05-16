import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SaleContractData, INITIAL_SALE_DATA } from '../../types/sale';
import { C } from '../../theme';
import ProgressBar from '../ContractWizard/components/ProgressBar';
import WizardNavigation from '../ContractWizard/components/WizardNavigation';
import Step1Item from './steps/Step1Item';
import Step2Pricing from './steps/Step2Pricing';
import Step3Payment from './steps/Step3Payment';
import Step4Conditions from './steps/Step4Conditions';
import Step5Summary from './steps/Step5Summary';

const TOTAL_STEPS = 5;
const STEP_LABELS = ['Towar', 'Cena', 'Płatność', 'Warunki', 'Gotowe'];

export default function SaleWizard({ onBack }: { onBack: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<SaleContractData>(INITIAL_SALE_DATA);

  const updateData = (updates: Partial<SaleContractData>) => setData(prev => ({ ...prev, ...updates }));
  const goNext = () => { if (currentStep < TOTAL_STEPS) setCurrentStep(s => s + 1); };
  const goBack = () => { if (currentStep > 1) setCurrentStep(s => s - 1); };
  const goToStep = (step: number) => { if (step >= 1 && step <= TOTAL_STEPS) setCurrentStep(step); };
  const saveDraft = () => console.log('[SaleWizard] Draft saved', JSON.stringify(data, null, 2));
  const createContract = () => console.log('[SaleWizard] Creating contract', JSON.stringify(data, null, 2));

  const totalAmount = data.price * data.quantity + (data.deliveryMethod === 'shipping' ? data.deliveryPrice : 0);

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1Item data={data} updateData={updateData} />;
      case 2: return <Step2Pricing data={data} updateData={updateData} totalAmount={totalAmount} />;
      case 3: return <Step3Payment data={data} updateData={updateData} totalAmount={totalAmount} />;
      case 4: return <Step4Conditions data={data} updateData={updateData} />;
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
