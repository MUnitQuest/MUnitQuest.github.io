#!/usr/bin/env node
/**
 * generate_metadata.js
 * Reads form_inputs.json + the five template CSVs and writes a full BIDS folder to ./output/
 *
 * Usage:
 *   node scripts/generate_metadata.js
 *
 * Edit assets/files/form_inputs.json to supply values that would otherwise come from the web form.
 *
 * Output structure (metadata-only — actual .edf files are not generated):
 *
 *   output/{datasetName}/
 *   ├── dataset_description.json
 *   ├── README.md
 *   ├── participants.tsv
 *   ├── participants.json
 *   └── sub-XX/
 *       └── [ses-XX/]
 *           └── emg/
 *               ├── sub-XX_[ses-XX_]channels.tsv          ← inherited (one per sub/ses)
 *               ├── sub-XX_[ses-XX_]electrodes.tsv        ← inherited
 *               ├── sub-XX_[ses-XX_]space-{coord}_coordsystem.json  ← inherited
 *               ├── sub-XX_[ses-XX_]task-AA_run-01_emg.json  ← per recording
 *               ├── sub-XX_[ses-XX_]task-BB_run-01_emg.json
 *               └── ...
 */

const fs   = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const SCRIPT_DIR = __dirname;
const REPO_ROOT  = path.join(SCRIPT_DIR, '..');
const FILES_DIR  = path.join(REPO_ROOT, 'assets', 'files');

const FORM = JSON.parse(
    fs.readFileSync(path.join(FILES_DIR, 'form_inputs.json'), 'utf8')
);

const datasetName = (FORM.dataset.name || 'bids_dataset')
    .replace(/[^a-zA-Z0-9_-]/g, '_');
const OUT = path.join(REPO_ROOT, 'output', datasetName);

// ---------------------------------------------------------------------------
// CSV parser (handles quoted fields with embedded commas)
// ---------------------------------------------------------------------------
function parseCSV(text) {
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    const parseLine = line => {
        const fields = [];
        let cur = '', inQ = false;
        for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (c === '"') {
                if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
                else inQ = !inQ;
            } else if (c === ',' && !inQ) {
                fields.push(cur.trim()); cur = '';
            } else {
                cur += c;
            }
        }
        fields.push(cur.trim());
        return fields;
    };
    const nonEmpty = lines.filter(l => l.trim() !== '');
    if (nonEmpty.length === 0) return [];
    const headers = parseLine(nonEmpty[0]);
    return nonEmpty.slice(1).map(line => {
        const vals = parseLine(line);
        const obj = {};
        headers.forEach((h, i) => { obj[h.trim()] = (vals[i] || '').trim(); });
        return obj;
    });
}

function load(name) {
    return parseCSV(fs.readFileSync(path.join(FILES_DIR, name), 'utf8'));
}

const participantsData       = load('template_participants.csv');
const recordingsData         = load('template_recordings.csv');
const setupData              = load('template_setup.csv');
const coordsystemsData       = load('template_coordsystems.csv');
const channelsElectrodesData = load('template_channels_electrodes.csv');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const def    = v => (v && v !== '') ? v : undefined;
const defNum = v => { const n = parseFloat(v); return isNaN(n) ? undefined : n; };
const defInt = v => { const n = parseInt(v);   return isNaN(n) ? undefined : n; };

function write(relPath, content) {
    const full = path.join(OUT, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf8');
    console.log('  wrote', path.relative(path.join(OUT, '..'), full));
}

function writeJSON(relPath, obj) {
    write(relPath, JSON.stringify(obj, null, 2));
}

// BIDS filename prefix for a subject/session pair
function bidsPrefix(sub, ses) {
    let p = `sub-${sub}`;
    if (ses && ses !== '') p += `_ses-${ses}`;
    return p;
}

// BIDS folder path (relative to dataset root) for a subject/session pair
function bidsFolder(sub, ses) {
    let f = `sub-${sub}/`;
    if (ses && ses !== '') f += `ses-${ses}/`;
    return f + 'emg/';
}

// ---------------------------------------------------------------------------
// Root-level files
// ---------------------------------------------------------------------------

function buildDatasetJson() {
    const d   = FORM.dataset;
    const dec = FORM.decomposition || {};
    const isSynthetic = (d.dataType || '').startsWith('synthetic');

    const generatedBy = [];
    if (isSynthetic) {
        (d.syntheticPipelines || []).forEach(p => {
            const entry = { Name: p.name || '' };
            if (p.version)     entry.Version     = p.version;
            if (p.description) entry.Description = p.description;
            if (p.codeUrl)     entry.CodeURL     = p.codeUrl;
            generatedBy.push(entry);
        });
    } else if (dec.method && dec.method !== 'simulation') {
        (dec.pipelines || []).forEach(p => {
            const entry = { Name: p.name || '' };
            if (p.version)     entry.Version     = p.version;
            if (p.description) entry.Description = p.description;
            if (p.codeUrl)     entry.CodeURL     = p.codeUrl;
            generatedBy.push(entry);
        });
        (dec.editingTools || []).forEach(p => {
            const entry = { Name: p.name || '' };
            if (p.version)     entry.Version     = p.version;
            if (p.description) entry.Description = p.description;
            if (p.codeUrl)     entry.CodeURL     = p.codeUrl;
            generatedBy.push(entry);
        });
    }

    const bids = {
        Name:               FORM.dataset.name        || '',
        BIDSVersion:        '1.11.1',
        DatasetType:        'raw',
        License:            FORM.dataset.license     || '',
        Authors:            FORM.dataset.authors     || [],
        Funding:            FORM.dataset.funding     || [],
        ReferencesAndLinks: FORM.dataset.referencesAndLinks || [],
        EthicsApprovals:    FORM.dataset.ethicsApprovals    || [],
        InstitutionName:    FORM.institution?.name    || '',
        InstitutionAddress: FORM.institution?.address || '',
    };
    if (generatedBy.length > 0) bids.GeneratedBy = generatedBy;
    return bids;
}

function buildParticipantsTSV() {
    if (participantsData.length === 0) return null;
    const headers = Object.keys(participantsData[0]);
    const lines = participantsData.map(row => headers.map(h => row[h] || 'n/a').join('\t'));
    return [headers.join('\t'), ...lines].join('\n');
}

function buildParticipantsJSON() {
    return {
        participant_id: { Description: 'Unique subject identifier' },
        age:            { Description: 'Age of the participant at time of testing', Unit: 'years' },
        sex:            { Description: 'Biological sex of the participant', Levels: { F: 'female', M: 'male', O: 'other' } },
        handedness:     { Description: 'Handedness as reported by participant', Levels: { L: 'left', R: 'right' } },
        weight:         { Description: 'Body weight of the participant', Unit: 'kg' },
        height:         { Description: 'Body height of the participant', Unit: 'm' },
    };
}

function buildREADME() {
    const d = FORM.dataset;
    return [
        `# ${d.name || 'Dataset'}`,
        '',
        d.description || 'Add a description of this dataset here.',
        '',
        '## License',
        d.license || '',
        '',
        '## Authors',
        (d.authors || []).join(', '),
        '',
        '## Ethics',
        (d.ethicsApprovals || []).join('\n'),
    ].join('\n');
}

// ---------------------------------------------------------------------------
// Per-recording emg.json  (placed at recording level; TaskName is specific)
// ---------------------------------------------------------------------------
function buildEMGJson(rec, setupRow) {
    const raw = {
        TaskName:                    def(rec.task_name)                              || 'n/a',
        Manufacturer:                def(setupRow.Manufacturer)                     || 'n/a',
        ManufacturersModelName:      def(setupRow.ManufacturersModelName)           || 'n/a',
        SamplingFrequency:           defNum(setupRow.SamplingFrequency)             ?? 'n/a',
        PowerLineFrequency:          defNum(setupRow.PowerLineFrequency)            ?? 'n/a',
        RecordingType:               def(setupRow.RecordingType)                    || 'continuous',
        SoftwareFilters: {
            HighPassFilter: { HalfAmplitudeCutOffHz: defNum(setupRow.SoftwareHighPassHz) ?? 'n/a' },
            LowPassFilter:  { HalfAmplitudeCutOffHz: defNum(setupRow.SoftwareLowPassHz)  ?? 'n/a' },
        },
        HardwareFilters: (setupRow.HardwareHighPassHz || setupRow.HardwareLowPassHz) ? {
            HighPassFilter: { HalfAmplitudeCutOffHz: defNum(setupRow.HardwareHighPassHz) ?? 'n/a' },
            LowPassFilter:  { HalfAmplitudeCutOffHz: defNum(setupRow.HardwareLowPassHz)  ?? 'n/a' },
        } : undefined,
        ElectrodeManufacturer:           def(setupRow.ElectrodeManufacturer),
        ElectrodeManufacturersModelName: def(setupRow.ElectrodeManufacturersModelName),
        EMGReference:        def(setupRow.EMGReference)       || 'n/a',
        EMGPlacementScheme:  def(setupRow.EMGPlacementScheme) || 'n/a',
        EMGChannelCount:     defInt(setupRow.EMGChannelCount),
        TaskDescription:     def(setupRow.TaskDescription),
        Instructions:        def(setupRow.Instructions),
        InstitutionName:             def(FORM.institution?.name),
        InstitutionAddress:          def(FORM.institution?.address),
        InstitutionalDepartmentName: def(FORM.institution?.departmentName),
    };
    return Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined));
}

// ---------------------------------------------------------------------------
// Inherited per-setup sidecar files
// ---------------------------------------------------------------------------
function buildChannelsTSV(setupName) {
    const rows = channelsElectrodesData.filter(r =>
        r.setup === setupName && r.channel_name && r.channel_name !== 'n/a'
    );
    if (rows.length === 0) return null;
    const cols      = ['channel_name','type','units','electrode_name','reference','group','target_muscle','low_cutoff','high_cutoff'];
    const bidsNames = ['name',        'type','units','signal_electrode','reference','group','target_muscle','low_cutoff','high_cutoff'];
    const lines = rows.map(r => cols.map(c => (r[c] && r[c] !== '') ? r[c] : 'n/a').join('\t'));
    return [bidsNames.join('\t'), ...lines].join('\n');
}

function buildElectrodesTSV(setupName) {
    const rows = channelsElectrodesData.filter(r =>
        r.setup === setupName && r.electrode_name && r.electrode_name !== 'n/a'
    );
    if (rows.length === 0) return null;
    const seen = new Set();
    const unique = rows.filter(r => {
        if (seen.has(r.electrode_name)) return false;
        seen.add(r.electrode_name);
        return true;
    });
    const header = 'name\tx\ty\tz\tcoordinate_system\ttype\tmaterial\timpedance\tgroup';
    const lines = unique.map(r => [
        r.electrode_name, r.x, r.y, r.z,
        r.coordinate_system, r.type, r.material, r.impedance, r.group,
    ].map(v => (v && v !== '') ? v : 'n/a').join('\t'));
    return [header, ...lines].join('\n');
}

// Returns { spaceName: jsonObject } — one entry per coordinate system row (anatomical + grids).
// Each grid gets its own space-{name}_coordsystem.json with top-level ParentCoordinateSystem,
// AnchorElectrode, AnchorCoordinates fields per the BIDS EMG spec.
function buildCoordsystemJSONs(setupName) {
    const rows = coordsystemsData.filter(r => r.setup === setupName);
    if (rows.length === 0) return {};

    const result = {};
    for (const row of rows) {
        const json = {
            EMGCoordinateSystem: 'Other',
            EMGCoordinateUnits:  row.units,
        };
        if (row.description)         json.EMGCoordinateSystemDescription = row.description;
        if (row.parent_coord_system) json.ParentCoordinateSystem = row.parent_coord_system;
        if (row.anchor_electrode)    json.AnchorElectrode = row.anchor_electrode;
        if (row.anchor_x || row.anchor_y) {
            json.AnchorCoordinates = [
                parseFloat(row.anchor_x) || 0,
                parseFloat(row.anchor_y) || 0,
            ];
        }
        result[row.name] = json;
    }
    return result;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
console.log('\n=== Generating BIDS metadata ===\n');

// Root-level files
writeJSON('dataset_description.json', buildDatasetJson());
write('README.md', buildREADME());
const ptsTSV = buildParticipantsTSV();
if (ptsTSV) write('participants.tsv', ptsTSV);
writeJSON('participants.json', buildParticipantsJSON());

// Group recordings by (sub, ses) — each group shares one setup
const groups = {};
for (const rec of recordingsData) {
    const key = `${rec.sub}|||${rec.ses || ''}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(rec);
}

for (const [key, recs] of Object.entries(groups)) {
    const [sub, ses] = key.split('|||');
    const folder     = bidsFolder(sub, ses);
    const prefix     = bidsPrefix(sub, ses);

    // All recordings in this group should share one setup (warn if mixed)
    const setups = [...new Set(recs.map(r => r.setup).filter(Boolean))];
    if (setups.length > 1) {
        console.warn(`  WARNING: sub-${sub}${ses ? '/ses-' + ses : ''} uses multiple setups (${setups.join(', ')}). Inheriting from first setup.`);
    }
    const setupName = setups[0];
    const setupRow  = setupData.find(r => r.setup_name === setupName) || {};

    // Inherited sidecar files (electrodes + coordsystem only — one per sub/ses)
    const elTSV = buildElectrodesTSV(setupName);
    if (elTSV) write(`${folder}${prefix}_electrodes.tsv`, elTSV);

    const coordJSONs = buildCoordsystemJSONs(setupName);
    for (const [coordName, coordJSON] of Object.entries(coordJSONs)) {
        writeJSON(`${folder}${prefix}_space-${coordName}_coordsystem.json`, coordJSON);
    }

    // Per-recording emg.json + channels.tsv
    for (const rec of recs) {
        let recPrefix = `${prefix}_task-${rec.task_name}`;
        if (rec.run && rec.run !== '') recPrefix += `_run-${rec.run}`;
        writeJSON(`${folder}${recPrefix}_emg.json`, buildEMGJson(rec, setupRow));
        const chTSV = buildChannelsTSV(setupName);
        if (chTSV) write(`${folder}${recPrefix}_channels.tsv`, chTSV);
    }
}

console.log('\nDone. Output in ./output/' + datasetName + '/\n');
