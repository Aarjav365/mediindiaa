// Medical Text Summarization API Integration
// This file handles the OpenAI API integration for medical text summarization

interface MedicalSummaryRequest {
  text: string;
  patientName?: string;
  timestamp?: string;
  patientId?: string;
}

interface MedicalSummaryResponse {
  chiefComplaint: string;
  historyOfIllness: string;
  examinationFindings: string;
  impression: string;
  recommendations: string;
  timestamp: string;
  patientId?: string;
  confidence: number;
  wordCount: number;
}

// OpenAI API configuration
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Medical summarization prompt template
const MEDICAL_PROMPT_TEMPLATE = `
You are an experienced clinical documentation specialist and medical AI assistant. Your task is to analyze the provided clinical notes and create a structured medical summary.

INSTRUCTIONS:
1. Extract and organize information into the following sections:
   - Chief Complaint: The primary reason for the patient's visit
   - History of Present Illness: Detailed description of symptoms, onset, duration, and progression
   - Examination Findings: Physical examination results, vital signs, and clinical observations
   - Clinical Impression: Diagnosis or differential diagnoses based on findings
   - Recommendations: Treatment plan, medications, follow-up instructions, and next steps

2. MEDICAL ACCURACY REQUIREMENTS:
   - Preserve all medical terminology exactly as stated
   - Maintain clinical accuracy and context
   - Do not add information not present in the original text
   - Use standard medical abbreviations appropriately
   - Ensure HIPAA compliance by focusing on clinical content only

3. FORMATTING REQUIREMENTS:
   - Each section should be 1-3 sentences maximum
   - Use clear, professional medical language
   - Highlight critical findings or urgent concerns
   - Maintain chronological order where applicable

4. SAFETY GUIDELINES:
   - If critical or emergency information is detected, note it prominently
   - Preserve medication names, dosages, and instructions exactly
   - Maintain allergy and contraindication information precisely
   - Flag any incomplete or unclear information

CLINICAL NOTES TO ANALYZE:
"""
{text}
"""

PATIENT CONTEXT:
- Patient Name: {patientName}
- Timestamp: {timestamp}

Please provide the structured summary in the following JSON format:
{
  "chiefComplaint": "Primary reason for visit",
  "historyOfIllness": "Detailed symptom history and progression",
  "examinationFindings": "Physical exam results and vital signs",
  "impression": "Clinical diagnosis or differential diagnoses",
  "recommendations": "Treatment plan and follow-up instructions"
}
`;

export async function generateMedicalSummary(request: MedicalSummaryRequest): Promise<MedicalSummaryResponse> {
  try {
    // Validate input
    if (!request.text || request.text.trim().length < 10) {
      throw new Error('Insufficient clinical text provided for summarization');
    }

    // Prepare the prompt
    const prompt = MEDICAL_PROMPT_TEMPLATE
      .replace('{text}', request.text)
      .replace('{patientName}', request.patientName || 'Patient')
      .replace('{timestamp}', request.timestamp || new Date().toISOString());

    // Call OpenAI API
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview', // Use GPT-4 for medical accuracy
        messages: [
          {
            role: 'system',
            content: 'You are a medical documentation specialist. Provide accurate, structured clinical summaries while maintaining HIPAA compliance and medical accuracy.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1, // Low temperature for consistency
        max_tokens: 1500,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    // Parse the JSON response
    const summaryText = data.choices[0].message.content;
    let summaryData;
    
    try {
      summaryData = JSON.parse(summaryText);
    } catch (parseError) {
      // Fallback: extract sections manually if JSON parsing fails
      summaryData = extractSectionsManually(summaryText);
    }

    // Validate and structure the response
    const result: MedicalSummaryResponse = {
      chiefComplaint: summaryData.chiefComplaint || 'Not specified in clinical notes',
      historyOfIllness: summaryData.historyOfIllness || 'History not detailed in provided notes',
      examinationFindings: summaryData.examinationFindings || 'Examination findings not documented',
      impression: summaryData.impression || 'Clinical impression pending further evaluation',
      recommendations: summaryData.recommendations || 'Treatment plan to be determined',
      timestamp: new Date().toISOString(),
      patientId: request.patientId,
      confidence: calculateConfidence(request.text, summaryData),
      wordCount: request.text.split(/\s+/).length
    };

    return result;

  } catch (error) {
    console.error('Medical summarization error:', error);
    
    // Fallback to rule-based extraction if API fails
    return generateFallbackSummary(request);
  }
}

// Fallback function for when API is unavailable
function generateFallbackSummary(request: MedicalSummaryRequest): MedicalSummaryResponse {
  const text = request.text.toLowerCase();
  
  return {
    chiefComplaint: extractChiefComplaint(text),
    historyOfIllness: extractHistoryOfIllness(text),
    examinationFindings: extractExaminationFindings(text),
    impression: extractImpression(text),
    recommendations: extractRecommendations(text),
    timestamp: new Date().toISOString(),
    patientId: request.patientId,
    confidence: 0.7, // Lower confidence for rule-based extraction
    wordCount: request.text.split(/\s+/).length
  };
}

// Helper functions for manual extraction
function extractSectionsManually(text: string): any {
  const sections = {
    chiefComplaint: '',
    historyOfIllness: '',
    examinationFindings: '',
    impression: '',
    recommendations: ''
  };

  // Simple regex patterns to extract sections
  const patterns = {
    chiefComplaint: /chief complaint[:\s]*(.*?)(?=history|examination|impression|recommendations|$)/is,
    historyOfIllness: /history[:\s]*(.*?)(?=examination|impression|recommendations|$)/is,
    examinationFindings: /examination[:\s]*(.*?)(?=impression|recommendations|$)/is,
    impression: /impression[:\s]*(.*?)(?=recommendations|$)/is,
    recommendations: /recommendations[:\s]*(.*?)$/is
  };

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match && match[1]) {
      sections[key as keyof typeof sections] = match[1].trim();
    }
  }

  return sections;
}

function extractChiefComplaint(text: string): string {
  const keywords = ['complains of', 'presents with', 'chief complaint', 'main problem', 'reason for visit'];
  const sentences = text.split(/[.!?]+/);
  
  for (const sentence of sentences) {
    for (const keyword of keywords) {
      if (sentence.includes(keyword)) {
        return sentence.trim() || 'Patient presents with symptoms requiring medical evaluation.';
      }
    }
  }
  
  return 'Chief complaint not clearly documented in provided notes.';
}

function extractHistoryOfIllness(text: string): string {
  const keywords = ['history', 'started', 'began', 'duration', 'symptoms', 'onset'];
  const sentences = text.split(/[.!?]+/);
  
  const relevantSentences = sentences.filter(sentence => 
    keywords.some(keyword => sentence.includes(keyword))
  );
  
  return relevantSentences.slice(0, 3).join('. ').trim() || 
         'Patient reports symptoms with onset and progression to be further clarified.';
}

function extractExaminationFindings(text: string): string {
  const keywords = ['examination', 'vital signs', 'blood pressure', 'temperature', 'pulse', 'findings', 'physical exam'];
  const sentences = text.split(/[.!?]+/);
  
  const relevantSentences = sentences.filter(sentence => 
    keywords.some(keyword => sentence.includes(keyword))
  );
  
  return relevantSentences.slice(0, 2).join('. ').trim() || 
         'Physical examination findings to be documented.';
}

function extractImpression(text: string): string {
  const keywords = ['diagnosis', 'impression', 'likely', 'suggests', 'indicates', 'differential'];
  const sentences = text.split(/[.!?]+/);
  
  for (const sentence of sentences) {
    for (const keyword of keywords) {
      if (sentence.includes(keyword)) {
        return sentence.trim() || 'Clinical impression based on history and examination findings.';
      }
    }
  }
  
  return 'Clinical impression pending further evaluation and diagnostic workup.';
}

function extractRecommendations(text: string): string {
  const keywords = ['recommend', 'suggest', 'advise', 'treatment', 'follow up', 'plan', 'prescribe'];
  const sentences = text.split(/[.!?]+/);
  
  const relevantSentences = sentences.filter(sentence => 
    keywords.some(keyword => sentence.includes(keyword))
  );
  
  return relevantSentences.slice(0, 2).join('. ').trim() || 
         'Treatment plan and follow-up recommendations to be determined.';
}

function calculateConfidence(originalText: string, summary: any): number {
  // Simple confidence calculation based on text length and completeness
  const textLength = originalText.length;
  const summaryCompleteness = Object.values(summary).filter(value => 
    value && typeof value === 'string' && value.length > 10
  ).length;
  
  let confidence = 0.5; // Base confidence
  
  if (textLength > 100) confidence += 0.2;
  if (textLength > 500) confidence += 0.1;
  if (summaryCompleteness >= 4) confidence += 0.2;
  
  return Math.min(confidence, 1.0);
}

// Alternative API providers (for backup)
export async function generateSummaryWithAzure(request: MedicalSummaryRequest): Promise<MedicalSummaryResponse> {
  // Azure Text Analytics implementation
  // This would use Azure's medical text analysis capabilities
  throw new Error('Azure Text Analytics integration not implemented yet');
}

export async function generateSummaryWithGoogle(request: MedicalSummaryRequest): Promise<MedicalSummaryResponse> {
  // Google Cloud Natural Language API implementation
  // This would use Google's healthcare natural language processing
  throw new Error('Google Cloud Natural Language integration not implemented yet');
}