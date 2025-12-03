<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1NLr58VHjKbVC2nlaRCbg6MfE1inu31MO

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
4. (Optional) Configure Supabase and use the schema below to persist acquisition data.

### Supabase table schema
Paste the following SQL into Supabase SQL Editor (Project → SQL Editor → Query):
```sql
create table acquisition_requests (
  id text primary key,
  title text not null,
  description text,
  acquiring_body text,
  status text,
  date_created date,
  last_updated date,
  budget numeric,
  gazette_notice_number text,
  funds_deposited boolean default false,
  parcels jsonb default '[]'::jsonb,
  documents jsonb default '[]'::jsonb,
  logs jsonb default '[]'::jsonb,
  stage_events jsonb default '[]'::jsonb
);

create index on acquisition_requests (last_updated desc);
```

### Environment variables
Add the following to `.env.local` once you have the URL/anon key from your Supabase project:
```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anonymous-public-key>
```
The frontend will now read from Supabase if both values are present; otherwise it falls back to the bundled mock data.

## Supported Land Acquisition Workflow

The UI now mirrors the entire compulsory land acquisition journey from submission to vesting. Key process actors (Applicant, NLC Chair, Director of Valuation & Taxation, Valuation Team, Legal / Land Registrar, Finance Committee, Government Printers, County Coordinators via Dr. Nthuni, Research, Land Use Planning, Land Admin, and Interested Parties) each have dedicated controls that align with the required documents (acquisition plans, parcel list with coordinates, ESIA, project certification, RAP, funds acknowledgement, auto land-search output).

- **Request details view** bundles document validation, AI-assisted analysis, contested parcel logs, notice generation, survey upload, payment schedule drafting, timeline, and stage event logging. Actions (scrutiny, recommendation, committee decisions, gazette publication, survey, valuation, funds requests/deposits, awards, payment, vesting) are available based on role and status.
- **Panels** now include a document viewer, validation summary, notice + survey kit (with intention/inquiry/awards/possession/vesting notice templates, gazette number entry, and final survey upload), and a review/decision panel that feeds reviewer comments/remarks into the action log.
- **Forward controls** expose labeled transitions between offices (e.g., Chair → Director, Director → Committee, Committee → Gazette, Gazette → Valuation, etc.), while notifications and activity logs surface every action (documents uploaded, notices generated, funds deposited, etc.).
- **Dashboard sections** cover gazette publishing, valuation & inquiry actions, payments/fund flows, claims management for interested parties, and live metrics, making the workflow easy to monitor and convert into software requirements.

With these additions the system now tracks every trigger, artifact, and office required for the land acquisition journey and provides the UI components needed for a compliant digital workflow.

## License

This project is licensed under the MIT License.
