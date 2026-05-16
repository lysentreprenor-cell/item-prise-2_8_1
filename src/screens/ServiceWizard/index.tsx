import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ServiceContractData, INITIAL_SERVICE_DATA } from '../../types/service';
import { C } from '../../theme';
import ProgressBar from '../ContractWizard/components/ProgressBar';
import WizardNavigation from '../ContractWizard/components/WizardNavigation';
import Step1Basics from './steps/Step1Basics';
import Step2Pricing from './steps/Step2Pricing';
import Step3Payment from './steps/Step3Payment';
import Step4Conditions from './steps/Step4Conditions';
import Step5Summary from './steps/Step5Summary';

const TOTAL_STEPS = 5;
const STEP_LABELS = ['Podstawy', 'Wycena', 'Płatność', 'Warunki', 'Gotowe'];

interface Props { onBack: () => void; }

export default function ServiceWizard({ onBack }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<ServiceContractData>(INITIAL_SERVICE_DATA);

  const updateData = (updates: Partial<ServiceContractData>) => setData(prev => ({ ...prev, ...updates }));
  const goNext = () => { if (currentStep < TOTAL_STEPS) setCurrentStep(s => s + 1); };
  const goBack = () => { if (currentStep > 1) setCurrentStep(s => s - 1); };
  const goToStep = (step: number) => { if (step >= 1 && step <= TOTAL_STEPS) setCurrentStep(step); };
  const saveDraft = () => console.log('[ServiceWizard] Draft saved', JSON.stringify(data, null, 2));
  const createContract = () => console.log('[ServiceWizard] Creating contract', JSON.stringify(data, null, 2));

  const stepProps = { data, updateData };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1Basics {...stepProps} />;
      case 2: return <Step2Pricing {...stepProps} />;
      case 3: return <Step3Payment {...stepProps} />;
      case 4: return <Step4Conditions {...stepProps} />;
      case 5: return <Step5Summary {...stepProps} goToStep={goToStep} onCreateContract={createContract} />;
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
