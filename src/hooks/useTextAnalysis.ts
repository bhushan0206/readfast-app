import { useState, useEffect } from 'react';
import { TextAnalysis } from '../utils/textAnalysis';
import { useAnalyticsStore } from '../store/analyticsStore';

export const useTextAnalysis = (textId: string, content: string, userWPM = 250) => {
  const { textAnalyses, analyzeCurrentText } = useAnalyticsStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<TextAnalysis | null>(null);

  useEffect(() => {
    // Check if we already have analysis for this text
    const existingAnalysis = textAnalyses.get(textId);
    if (existingAnalysis) {
      setAnalysis(existingAnalysis);
      return;
    }

    // Only analyze if we have content
    if (!content || content.length < 10) {
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate async analysis (could be made actually async for larger texts)
    const timeoutId = setTimeout(() => {
      try {
        const newAnalysis = analyzeCurrentText(textId, content, userWPM);
        setAnalysis(newAnalysis);
      } catch (error) {
        console.error('Error analyzing text:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [textId, content, userWPM, textAnalyses, analyzeCurrentText]);

  return {
    analysis,
    isAnalyzing
  };
};