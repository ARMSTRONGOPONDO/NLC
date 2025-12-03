import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 4000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || '';
const client = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

app.use(cors());
app.use(express.json());

const createMockGazetteNotice = (request) =>
  `[MOCK GENERATION - API KEY MISSING]\n\nGAZETTE NOTICE NO. ${Math.floor(Math.random() * 10000)}\nTHE LAND ACT, 2012\nINTENTION TO ACQUIRE LAND FOR ${request.title.toUpperCase()}\n\nIN PURSUANCE of the Land Act, 2012, Part VIII, the National Land Commission on behalf of ${request.acquiringBody} gives notice that the Government intends to acquire the following parcels of land for the construction of ${request.description}.\n\nSCHEDULE\n${request.parcels.map(p => `Parcel No: ${p.parcelNumber} | Approx Area: ${p.size} | Owner: ${p.owner}`).join('\n')}\n\nPlans of the affected land may be inspected during office hours at the office of the National Land Commission.\n\nDated the ${new Date().toLocaleDateString()}.\nCHAIRMAN, NATIONAL LAND COMMISSION`;

const createMockLocationInsights = (projectTitle, location) => ({
  text: `[MOCK DATA - API KEY MISSING]\n\nLocation Analysis for: ${projectTitle}\n\nBased on simulated map data, this project is located in a rapidly developing area. Key features include:\n- Proximity to major transport corridors.\n- Mixed residential and commercial land use.\n- High potential for land value appreciation.\n\n(Connect a valid API Key to use real Google Maps Grounding)`,
  links: [
    { title: 'Google Maps - Nairobi', uri: 'https://maps.google.com/?q=Nairobi' },
    { title: 'Search - Land Projects', uri: 'https://google.com/search?q=NLC+Projects' }
  ]
});

const createMockAnalysisResult = (docName, docCategory) => ({
  summary: `Successfully scanned ${docName}. The document adheres to NLC standards. Extracted 2 new parcels and verified owner details against the Lands Registry database.`,
  extractedParcels: [
    { id: `auto-${Date.now()}-1`, parcelNumber: 'KJM/BLOCK/105', owner: 'Michael Kamau', size: '0.4 Ha', estimatedValue: 4500000, coordinates: '-1.2940, 36.8240', isUnregistered: false, status: 'Verified' },
    { id: `auto-${Date.now()}-2`, parcelNumber: 'KJM/BLOCK/106', owner: 'Sarah Ochieng', size: '0.25 Ha', estimatedValue: 3000000, coordinates: '-1.2945, 36.8245', isUnregistered: false, status: 'Verified' }
  ],
  discrepancies: [],
  verificationStatus: 'Verified',
  suggestedCategory: docCategory
});

const normalizeAnalysisResult = (raw, fallbackCategory) => ({
  summary: typeof raw?.summary === 'string' ? raw.summary : 'Analysis completed.',
  extractedParcels: Array.isArray(raw?.extractedParcels) ? raw.extractedParcels : [],
  discrepancies: Array.isArray(raw?.discrepancies) ? raw.discrepancies : [],
  verificationStatus: raw?.verificationStatus ?? 'Unverified',
  suggestedCategory: raw?.suggestedCategory ?? fallbackCategory
});

app.post('/api/generate-gazette', async (req, res) => {
  const requestBody = req.body;
  if (!requestBody) {
    return res.status(400).json({ error: 'Request body is required' });
  }
  if (!client) {
    return res.json({ content: createMockGazetteNotice(requestBody) });
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: 'You are a professional Kenyan legal drafter that writes gazette notices in a strict official tone.'
        },
        {
          role: 'user',
          content: `Create a formal Kenyan Gazette Notice for Intention to Acquire Land.\nProject: ${requestBody.title}\nPurpose: ${requestBody.description}\nAcquiring Body: ${requestBody.acquiringBody}\nParcels: ${JSON.stringify(requestBody.parcels.map(p => ({ no: p.parcelNumber, area: p.size, owner: p.owner })))}\n`
        }
      ]
    });

    const content = response.choices?.[0]?.message?.content?.trim();
    return res.json({ content: content || 'Failed to generate content.' });
  } catch (error) {
    console.error('OpenAI toGenerateGazette Error', error);
    return res.status(500).json({
      error: 'openai_error',
      content: createMockGazetteNotice(requestBody)
    });
  }
});

app.post('/api/location-insights', async (req, res) => {
  const { projectTitle, location } = req.body ?? {};
  if (!projectTitle || !location) {
    return res.status(400).json({ error: 'projectTitle and location are required' });
  }

  if (!client) {
    return res.json(createMockLocationInsights(projectTitle, location));
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: 'You are a Kenyan land management analyst who explains contextual insights about locations.'
        },
        {
          role: 'user',
          content: `Provide a detailed location overview for ${projectTitle} in ${location}. Highlight landmarks, major infrastructure, nearby transport, and prevailing land uses. Suggest any open data or map links you reference.`
        }
      ]
    });

    const text = response.choices?.[0]?.message?.content?.trim() || 'No insights found.';
    return res.json({
      text,
      links: [
        { title: `${projectTitle} on Google Maps`, uri: `https://maps.google.com/?q=${encodeURIComponent(location)}` },
        { title: `Search ${projectTitle}`, uri: `https://google.com/search?q=${encodeURIComponent(projectTitle)}` }
      ]
    });
  } catch (error) {
    console.error('OpenAI location insights error', error);
    return res.status(500).json({
      text: 'Failed to retrieve location insights. Please try again later.',
      links: []
    });
  }
});

app.post('/api/analyze-document', async (req, res) => {
  const { docName, docCategory } = req.body ?? {};
  if (!docName || !docCategory) {
    return res.status(400).json({ error: 'docName and docCategory are required' });
  }

  if (!client) {
    return res.json(createMockAnalysisResult(docName, docCategory));
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.25,
      messages: [
        {
          role: 'system',
          content: 'You are a meticulous land acquisition reviewer that outputs JSON with specific schema.'
        },
        {
          role: 'user',
          content: `Simulate scanning a PDF document named "${docName}" of type "${docCategory}" for a land acquisition project.
Tasks:
1. Extract 2-3 parcels with owner details, id, size, coordinates, estimated value, unregistered flag, and status.
2. Highlight any discrepancies or missing items.
3. Suggest the most likely document category from the approved list, respond with that as "suggestedCategory".
4. Set verificationStatus to either Verified or Issues Found.
5. Respond only in JSON matching the AIAnalysisResult shape with summary, extractedParcels, discrepancies, verificationStatus, and suggestedCategory.`
        }
      ]
    });

    const text = response.choices?.[0]?.message?.content?.trim();
    if (text) {
      try {
        const parsed = JSON.parse(text);
        return res.json(normalizeAnalysisResult(parsed, docCategory));
      } catch (parseError) {
        console.warn('Failed to parse OpenAI analysis response', parseError);
      }
    }

    throw new Error('Empty or unparseable response');
  } catch (error) {
    console.error('OpenAI analysis error', error);
    return res.status(500).json({
      summary: 'Error analyzing document. Manual review required.',
      extractedParcels: [],
      discrepancies: ['AI Service Unavailable'],
      verificationStatus: 'Unverified'
    });
  }
});

app.listen(PORT, () => {
  console.log(`AI proxy server listening on http://localhost:${PORT}`);
});
