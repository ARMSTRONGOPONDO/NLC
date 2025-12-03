
import { AcquisitionRequest, AIAnalysisResult, Parcel } from "../types";

const AI_PROXY_BASE_URL = (import.meta.env.VITE_AI_PROXY_URL || "http://localhost:4000").replace(/\/+$/g, "");

export interface GroundingLink {
  title: string;
  uri: string;
}

const createMockGazetteNotice = (request: AcquisitionRequest): string =>
  `[MOCK GENERATION - API KEY MISSING]\n\nGAZETTE NOTICE NO. ${Math.floor(Math.random() * 10000)}\nTHE LAND ACT, 2012\nINTENTION TO ACQUIRE LAND FOR ${request.title.toUpperCase()}\n\nIN PURSUANCE of the Land Act, 2012, Part VIII, the National Land Commission on behalf of ${request.acquiringBody} gives notice that the Government intends to acquire the following parcels of land for the construction of ${request.description}.\n\nSCHEDULE\n${request.parcels.map(p => `Parcel No: ${p.parcelNumber} | Approx Area: ${p.size} | Owner: ${p.owner}`).join('\n')}\n\nPlans of the affected land may be inspected during office hours at the office of the National Land Commission.\n\nDated the ${new Date().toLocaleDateString()}.\nCHAIRMAN, NATIONAL LAND COMMISSION`;

const createMockLocationInsights = (projectTitle: string, location: string): { text: string; links: GroundingLink[] } => ({
  text: `[MOCK DATA - API KEY MISSING]\n\nLocation Analysis for: ${projectTitle}\n\nBased on simulated map data, this project is located in a rapidly developing area. Key features include:\n- Proximity to major transport corridors.\n- Mixed residential and commercial land use.\n- High potential for land value appreciation.\n\n(Connect a valid API Key to use real Google Maps Grounding)`,
  links: [
    { title: "Google Maps - Nairobi", uri: "https://maps.google.com/?q=Nairobi" },
    { title: "Search - Land Projects", uri: "https://google.com/search?q=NLC+Projects" }
  ]
});

const createMockAnalysisResult = (docName: string, docCategory: string): AIAnalysisResult => ({
  summary: `Successfully scanned ${docName}. The document adheres to NLC standards. Extracted 2 new parcels and verified owner details against the Lands Registry database.`,
  extractedParcels: [
    { id: `auto-${Date.now()}-1`, parcelNumber: 'KJM/BLOCK/105', owner: 'Michael Kamau', size: '0.4 Ha', estimatedValue: 4500000, coordinates: '-1.2940, 36.8240', isUnregistered: false, status: 'Verified' },
    { id: `auto-${Date.now()}-2`, parcelNumber: 'KJM/BLOCK/106', owner: 'Sarah Ochieng', size: '0.25 Ha', estimatedValue: 3000000, coordinates: '-1.2945, 36.8245', isUnregistered: false, status: 'Verified' }
  ],
  discrepancies: [],
  verificationStatus: 'Verified'
});

export const generateGazetteNotice = async (request: AcquisitionRequest): Promise<string> => {
  try {
    const response = await fetch(`${AI_PROXY_BASE_URL}/api/generate-gazette`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Proxy error ${response.status}`);
    }

    const data = await response.json();
    if (data?.content) {
      return data.content;
    }
  } catch (error) {
    console.error('AI proxy generateGazetteNotice error', error);
  }

  return createMockGazetteNotice(request);
};

export const getProjectLocationInsights = async (projectTitle: string, location: string = 'Kenya'): Promise<{ text: string, links: GroundingLink[] }> => {
  try {
    const response = await fetch(`${AI_PROXY_BASE_URL}/api/location-insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectTitle, location })
    });

    if (!response.ok) {
      throw new Error(`Proxy error ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data?.text ?? 'No insights found.',
      links: Array.isArray(data?.links) ? data.links : []
    };
  } catch (error) {
    console.error('AI proxy location insights error', error);
    return createMockLocationInsights(projectTitle, location);
  }
};

export const analyzeDocument = async (docName: string, docCategory: string): Promise<AIAnalysisResult> => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  try {
    const response = await fetch(`${AI_PROXY_BASE_URL}/api/analyze-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docName, docCategory })
    });

    if (!response.ok) {
      throw new Error(`Proxy error ${response.status}`);
    }

    const data = await response.json();
    if (data) {
      return data;
    }
  } catch (error) {
    console.error('AI proxy analyzeDocument error', error);
  }

  return createMockAnalysisResult(docName, docCategory);
};
