import { ScoreBreakdown, Target } from '../types';

// Related semantic groups to recognize near-synonyms in sensory perception
const SYNONYM_MAP: Record<string, string[]> = {
  water: ['ocean', 'river', 'coastal', 'island'],
  ocean: ['water', 'coastal'],
  river: ['water'],
  coastal: ['water', 'ocean'],
  island: ['water', 'ocean'],
  tall: ['tower', 'modern_skyscraper', 'high_altitude'],
  tower: ['tall'],
  mountain: ['high_altitude', 'cliff'],
  pyramid: ['triangular', 'ancient'],
  stone: ['sandstone', 'marble', 'limestone'],
  sandstone: ['stone', 'earth'],
  marble: ['stone', 'white'],
  iron: ['metal', 'steel'],
  golden: ['ochre', 'sandstone'],
  ancient: ['sacred'],
};

export function calculateScore(
  selectedDescriptors: string[],
  target: Target
): ScoreBreakdown {
  if (selectedDescriptors.length === 0) {
    return {
      percentage: 0,
      matchedTags: [],
      unmatchedSelected: [],
      targetTags: target.hiddenTags,
      verdict: 'No match',
      explanation: 'No sensory descriptors were selected for algorithmic comparison.',
    };
  }

  const targetTagSet = new Set(target.hiddenTags.map(t => t.toLowerCase()));
  const matchedTags: string[] = [];
  const unmatchedSelected: string[] = [];

  for (const descriptor of selectedDescriptors) {
    const dLower = descriptor.toLowerCase();
    
    // Direct match
    if (targetTagSet.has(dLower)) {
      matchedTags.push(descriptor);
    } else {
      // Check semantic synonym map
      const related = SYNONYM_MAP[dLower] || [];
      const hasRelated = related.some(r => targetTagSet.has(r));
      if (hasRelated) {
        matchedTags.push(descriptor);
      } else {
        unmatchedSelected.push(descriptor);
      }
    }
  }

  // Harmonic match score calculation
  const precision = matchedTags.length / selectedDescriptors.length;
  const recallTargetRatio = Math.min(1, matchedTags.length / Math.min(6, target.hiddenTags.length));
  
  // Weighted score (heavier weight on accuracy of what was perceived)
  const rawScore = (precision * 0.65 + recallTargetRatio * 0.35) * 100;
  const percentage = Math.round(Math.max(0, Math.min(100, rawScore)));

  let verdict: 'Strong match' | 'Partial match' | 'No match';
  if (percentage >= 65) {
    verdict = 'Strong match';
  } else if (percentage >= 30) {
    verdict = 'Partial match';
  } else {
    verdict = 'No match';
  }

  let explanation = '';
  if (verdict === 'Strong match') {
    explanation = `High sensory resonance: ${matchedTags.length} of ${selectedDescriptors.length} descriptors align with the target's physical and structural reality.`;
  } else if (verdict === 'Partial match') {
    explanation = `Subtle alignment: ${matchedTags.length} perceived features correspond to the target's core properties, alongside divergent impressions.`;
  } else {
    explanation = `Low automated overlap: the chosen physical tags did not directly match the target's cataloged attributes.`;
  }

  return {
    percentage,
    matchedTags,
    unmatchedSelected,
    targetTags: target.hiddenTags,
    verdict,
    explanation,
  };
}
