import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CustomContractData, INITIAL_CUSTOM_DATA } from '../../types/custom';
import { C } from '../../theme';
import ProgressBar from '../ContractWizard/components/ProgressBar';
import WizardNavigation from '../ContractWizard/components/WizardNavigation';
import Step1Basics from './steps/Step1Basics';
import Step2Items from './steps/Step2Items';
import Step3Review from './steps/Step3Review';
import Step4Payment from './steps/Step4Payment';
import Step5Summary from './steps/Step5Summary';

const TOTAL_STEPS = 5;
const STEP_LABELS = ['Podstawy', 'Pozycje', 'Wycena', 'Płatność', 'Gotowe'];

interface Props { onBack?: () => void; }

export default function CustomWizard({ onBack }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<CustomContractData>(INITIAL_CUSTOM_DATA);

  const updateData = (updates: Partial<CustomContractData>) => setData(prev => ({ ...prev, ...updates }));
  const goNext = () => { if (currentStep < TOTAL_STEPS) setCurrentStep(s => s + 1); };
  const goBack = () => { if (currentStep > 1) setCurrentStep(s => s - 1); else onBack?.(); };
  const goToStep = (step: number) => { if (step >= 1 && step <= TOTAL_STEPS) setCurrentStep(step); };
  const saveDraft = () => console.log('[CustomWizard] Draft', JSON.stringify(data, null, 2));
  const createContract = () => console.log('[CustomWizard] Contract', JSON.stringify(data, null, 2));

  const stepProps = { data, updateData };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1Basics {...stepProps} />;
      case 2: return <Step2Items {...stepProps} />;
      case 3: return <Step3Review data={data} />;
      case 4: return <Step4Payment {...stepProps} />;
      case 5: return <Step5Summary data={data} updateData={updateData} goToStep={goToStep} onCreateContract={createContract} />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor={C.bg} />
      <View style={styles.container}>
        <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} stepLabels={STEP_LABELS} onStepPress={goToStep} onBack={onBack} />
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
