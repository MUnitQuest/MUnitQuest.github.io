---
title: MUnitQuest BIDS-EMG Metadata Tool
feature_image: "/Images/header.jpeg"
layout: page
---

<p>Fill in the fields below to describe your dataset. When you reach the final step, click <strong>Download metadata.zip</strong> — a ZIP file containing all metadata files will be saved to your computer. For more instructions, go to the EMG-BIDS Specifications page <a href="https://bids-specification.readthedocs.io/en/stable/modality-specific-files/electromyography.html" target="_blank">here</a>, and our walkthrough <a href="/walkthrough/">here</a>.</p>

<div class="metadata-form">

<div class="mf-progress-bar">
    <div class="mf-progress-step active" data-step="1">
        <div class="mf-step-number">1</div>
        <div class="mf-step-label">Getting Started</div>
    </div>
    <div class="mf-progress-step" data-step="2">
        <div class="mf-step-number">2</div>
        <div class="mf-step-label">Dataset Info</div>
    </div>
    <div class="mf-progress-step" data-step="3">
        <div class="mf-step-number">3</div>
        <div class="mf-step-label">Participants</div>
    </div>
    <div class="mf-progress-step" data-step="4">
        <div class="mf-step-number">4</div>
        <div class="mf-step-label">Recording Info </div>
    </div>
    <div class="mf-progress-step" data-step="5">
        <div class="mf-step-number">5</div>
        <div class="mf-step-label">Experimental Protocol</div>
    </div>
    <div class="mf-progress-step" data-step="6">
        <div class="mf-step-number">6</div>
        <div class="mf-step-label">Decomposition and Editing</div>
    </div>
    <div class="mf-progress-step" data-step="7">
        <div class="mf-step-number">7</div>
        <div class="mf-step-label">Review</div>
    </div>
</div>

<form id="submissionForm" class="mf-submission-form">

    <!-- Section 1: Getting Started -->
    <section class="form-section active" data-section="1">
        <h2>Getting Started</h2>

        <p>This tool generates a complete set of BIDS-EMG metadata files for your dataset. Work through each section and click <strong>Download metadata.zip</strong> at the end. We recommend going through our <a href="/walkthrough/" target="_blank">walkthrough</a> alongside this form — it explains every field with a worked example.</p>

        <p>Before you begin, prepare the following five CSV files. Templates are provided in Sections 3–5 below.</p>

        <table class="mf-getting-started-table">
            <thead>
                <tr><th>File</th><th>What it describes</th><th>Where to upload</th></tr>
            </thead>
            <tbody>
                <tr>
                    <td><code>participants.csv</code></td>
                    <td>One row per subject — age, sex, height, weight, handedness</td>
                    <td>Section 3</td>
                </tr>
                <tr>
                    <td><code>setup.csv</code></td>
                    <td>Amplifier and acquisition settings for each recording configuration</td>
                    <td>Section 4</td>
                </tr>
                <tr>
                    <td><code>coordsystems.csv</code></td>
                    <td>Anatomical and grid coordinate systems for each setup</td>
                    <td>Section 4</td>
                </tr>
                <tr>
                    <td><code>channels_electrodes.csv</code></td>
                    <td>Every channel and its corresponding electrode position</td>
                    <td>Section 4</td>
                </tr>
                <tr>
                    <td><code>recordings.csv</code></td>
                    <td>One row per recording — subject, session, task, run, and which setup applies</td>
                    <td>Section 5</td>
                </tr>
            </tbody>
        </table>

        <p>Your progress is saved automatically in your browser.</p>
    </section>

    <!-- Section 2: General Dataset Metadata -->
    <section class="form-section" data-section="2">
        <h2>General Dataset Metadata</h2>

        <div class="mf-form-group">
            <label>Submission Type *</label>
            <div class="mf-radio-group">
                <label class="mf-radio-card">
                    <input type="radio" name="dataType" value="experimental" required>
                    <div class="mf-radio-content">
                        <strong>Experimental HDsEMG</strong>
                        <p>Surface EMG recordings with labelled motor unit spike trains</p>
                    </div>
                </label>

                <label class="mf-radio-card">
                    <input type="radio" name="dataType" value="experimental_iemg">
                    <div class="mf-radio-content">
                        <strong>Experimental HDsEMG + concurrent iEMG</strong>
                        <p>Surface EMG with simultaneous intramuscular validation</p>
                    </div>
                </label>

                <label class="mf-radio-card">
                    <input type="radio" name="dataType" value="synthetic_full">
                    <div class="mf-radio-content">
                        <strong>Synthetic (Full-Spectrum Simulation)</strong>
                        <p>End-to-end simulation including motor unit pool, volume conduction, and electrode interface</p>
                    </div>
                </label>

                <label class="mf-radio-card">
                    <input type="radio" name="dataType" value="synthetic_hybrid">
                    <div class="mf-radio-content">
                        <strong>Synthetic (Hybrid Simulation)</strong>
                        <p>Experimental MUAP waveforms combined with simulated spike trains</p>
                    </div>
                </label>
            </div>
        </div>

        <!-- Synthetic details — shown inline when a synthetic type is selected -->
        <div id="syntheticDataSection" style="display:none;">
            <h3>Synthetic Data Details</h3>

            <div class="mf-form-group">
                <label>Software pipeline(s) used to generate the dataset <span id="pipelineRequiredMark" style="display:none;">*</span></label>
                <small>Add one entry per pipeline step, in processing order.</small>
                <div id="syntheticPipelineList"></div>
                <button type="button" class="mf-btn-secondary" onclick="addSyntheticPipeline()">
                    + Add Pipeline
                </button>
            </div>

            <div class="mf-form-group">
                <label>Source Datasets</label>
                <small>Datasets from which any experimental data (e.g., MUAPs) were derived.</small>
                <div id="sourceDatasetList"></div>
                <button type="button" class="mf-btn-secondary" onclick="addSourceDataset()">
                    + Add Source Dataset
                </button>
            </div>
        </div>

        <div class="mf-form-group">
            <label for="datasetName">Dataset Name *</label>
            <input type="text" id="datasetName" name="datasetName" required>
            <small>Short identifier used as the root folder name (e.g., "TibAnt_Isometric_2025")</small>
        </div>

        <div class="mf-form-group">
            <label for="datasetDescription">Dataset Description</label>
            <textarea id="datasetDescription" name="datasetDescription" rows="4" maxlength="500"></textarea>
            <small class="char-count">0 / 500 characters</small>
        </div>

        <div class="mf-form-group">
            <label for="license">License *</label>
            <select id="license" name="license" required>
                <option value="">Select a license</option>
                <option value="CC0">CC0 - Public Domain</option>
                <option value="CC-BY-4.0">CC-BY-4.0 - Attribution Required</option>
                <option value="CC-BY-NC-4.0">CC-BY-NC-4.0 - Non-Commercial</option>
                <option value="other">Other (specify)</option>
            </select>
        </div>

        <div class="mf-form-group" id="otherLicenseGroup" style="display:none;">
            <label for="otherLicense">Specify License</label>
            <input type="text" id="otherLicense" name="otherLicense">
        </div>

        <div class="mf-form-group">
            <label>Authors *</label>
            <div id="authorsList"></div>

            <button type="button" class="mf-btn-secondary" onclick="addAuthor('authorsList')">
                + Add Author
            </button>
        </div>

        <div class="mf-form-group">
            <label>Funding sources</label>
            <div id="fundingList"></div>

            <button type="button" class="mf-btn-secondary" onclick="addFunding('fundingList')">
                + Add Funding source
            </button>
        </div> 

        <div class="mf-form-group">
            <label>Ethics Approvals *</label>
            <div id="ethicsList"></div>

            <button type="button" class="mf-btn-secondary" onclick="addEthics('ethicsList')">
                + Add Ethics approval
            </button>
        </div> 

        <div class="mf-form-group">
            <label>References and Links</label>
            <div id="referencesList"></div>

            <button type="button" class="mf-btn-secondary" onclick="addReference('referencesList')">
                + Add Reference
            </button>
        </div> 

        <div class="mf-form-group">
            <label for="institutionName">Institution Name *</label>
            <input type="text" id="institutionName" name="institutionName" required>
        </div>

        <div class="mf-form-group">
            <label for="institutionAddress">Institution Address</label>
            <input type="text" id="institutionAddress" name="institutionAddress">
        </div>

        <div class="mf-form-group">
            <label for="institutionalDepartmentName">Institutional Department Name</label>
            <input type="text" id="institutionalDepartmentName" name="institutionalDepartmentName" placeholder="e.g., Department of Neuroscience">
        </div>
    </section>

    <!-- Section 3: Participant Information -->
    <section class="form-section" data-section="3">
        <h2>Participant Information</h2>

        <p>One row per subject. Use the same subject IDs here that you will use in <code>recordings.csv</code> — these become the <code>sub-XX</code> labels throughout the BIDS output.</p>

        <div class="mf-form-group">
            <label>Step 1 — Download the template and fill it in</label>
            <div class="mf-download-item">
                <a href="/assets/files/template_participants.csv" download class="mf-download-link">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download participants template
                </a>
                <small class="mf-download-desc">Columns: participant_id, sex, age, height, weight, handedness, group</small>
            </div>
        </div>

        <div class="mf-form-group">
            <label for="participantsFile">Step 2 — Upload your completed file *</label>
            <input type="file" id="participantsFile" name="participantsFile" accept=".csv"
                onchange="handleParticipantsUpload(this)">
            <div id="participantsValidationMsg"></div>
        </div>

    </section>

    <!-- Section 4: Recording Information -->
    <section class="form-section" data-section="4">
        <h2>Recording Information</h2>

        <p>A <strong>setup</strong> is a named bundle of hardware and electrode configuration shared across a group of recordings. All setup details — amplifier, filters, electrode positions, and coordinate systems — live in the three CSV files below. See the <a href="/walkthrough/" target="_blank">walkthrough</a> for column-by-column guidance.</p>

        <div class="mf-form-group">
            <label>Step 1 — Download the templates and fill them in</label>
            <small>Add one block of rows per setup in your dataset. Refer to the walkthrough for examples.</small>
            <div class="mf-download-list">
                <div class="mf-download-item">
                    <a href="/assets/files/template_setup.csv" download class="mf-download-link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Download setup template
                    </a>
                    <small class="mf-download-desc">Columns: setup_name, Manufacturer, ManufacturersModelName, ElectrodeManufacturer, ElectrodeManufacturersModelName, SamplingFrequency, PowerLineFrequency, RecordingType, SoftwareHighPassHz, SoftwareLowPassHz, HardwareHighPassHz, HardwareLowPassHz, EMGChannelCount, EMGReference, EMGPlacementScheme, TaskDescription, Instructions</small>
                </div>
                <div class="mf-download-item">
                    <a href="/assets/files/template_coordsystems.csv" download class="mf-download-link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Download coordinate systems template
                    </a>
                    <small class="mf-download-desc">Columns: setup, name, type, units, description, parent_coord_system, anchor_electrode, anchor_x, anchor_y</small>
                </div>
                <div class="mf-download-item">
                    <a href="/assets/files/template_channels_electrodes.csv" download class="mf-download-link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Download channels &amp; electrodes template
                    </a>
                    <small class="mf-download-desc">Columns: setup, electrode_name, channel_name, type, units, x, y, z, coordinate_system, reference, group, target_muscle, material, impedance, low_cutoff, high_cutoff</small>
                </div>
            </div>
        </div>

        <div class="mf-form-group">
            <label>Step 2 — Upload your completed files *</label>
            <div class="mf-upload-list">
                <div class="mf-upload-item">
                    <span class="mf-upload-label"><code>setup.csv</code></span>
                    <input type="file" id="setupFile" name="setupFile" accept=".csv"
                        onchange="handleSetupUpload(this)">
                    <div id="setupValidationMsg"></div>
                </div>
                <div class="mf-upload-item">
                    <span class="mf-upload-label"><code>coordsystems.csv</code></span>
                    <input type="file" id="coordsystemsFile" name="coordsystemsFile" accept=".csv"
                        onchange="handleCoordsystemsUpload(this)">
                    <div id="coordsystemsValidationMsg"></div>
                </div>
                <div class="mf-upload-item">
                    <span class="mf-upload-label"><code>channels_electrodes.csv</code></span>
                    <input type="file" id="channelsElectrodesFile" name="channelsElectrodesFile" accept=".csv"
                        onchange="handleChannelsElectrodesUpload(this)">
                    <div id="channelsElectrodesValidationMsg"></div>
                </div>
            </div>
        </div>

    </section>

    <!-- Section 5: Task & Protocol Information -->
    <section class="form-section" data-section="5">

        <h2>Task &amp; Protocol Information</h2>

        <p>One row per recording file. The <code>setup</code> column links each recording to the hardware configuration you described in Section 4 — every recording that shares the same electrode grid and amplifier settings should reference the same setup name.</p>

        <div class="mf-form-group">
            <label>Step 1 — Download the template and fill it in</label>
            <div class="mf-download-item">
                <a href="/assets/files/template_recordings.csv" download class="mf-download-link">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download recordings template
                </a>
                <small class="mf-download-desc">Columns: sub, ses, task_name, run, setup, path_to_emg_file, path_to_labels_file</small>
            </div>
        </div>

        <div class="mf-form-group">
            <label for="recordingsFile">Step 2 — Upload your completed file *</label>
            <input type="file" id="recordingsFile" name="recordingsFile" accept=".csv"
                onchange="handleRecordingsUpload(this)">
            <div id="recordingsValidationMsg"></div>
        </div>

    </section>

    <!-- Section 6: Decomposition and Editing -->
    <section class="form-section" data-section="6">
        <h2>Decomposition and Editing</h2>

        <p>Describe how motor unit spike trains were identified in your dataset. For concurrent sEMG + iEMG datasets, fill in both the surface and intramuscular decomposition separately.</p>

        <!-- Shown until a dataset type is selected in Section 2 -->
        <div id="decompSection2Notice" class="mf-notice">
            Please select a <strong>Submission Type</strong> in Section 2 to see the relevant options here.
        </div>

        <!-- sEMG decomposition block (shown for experimental and concurrent) -->
        <div id="semgDecompBlock" style="display:none;">

            <h3 id="semgDecompHeading">Surface EMG</h3>

            <div class="mf-form-group">
                <label>How were motor unit spike trains identified? *</label>
                <div class="mf-radio-group">

                    <label class="mf-radio-card mf-dec-opt mf-dec-experimental mf-dec-concurrent">
                        <input type="radio" name="decompositionMethod" value="fully-automated" required>
                        <div class="mf-radio-content">
                            <strong>Fully automated</strong>
                            <p>Decomposition algorithm output used as-is — no manual review or curation was performed</p>
                        </div>
                    </label>

                    <label class="mf-radio-card mf-dec-opt mf-dec-experimental mf-dec-concurrent">
                        <input type="radio" name="decompositionMethod" value="semi-automated">
                        <div class="mf-radio-content">
                            <strong>Semi-automated</strong>
                            <p>Algorithm output was manually reviewed and curated before finalising spike trains</p>
                        </div>
                    </label>

                    <label class="mf-radio-card mf-dec-opt mf-dec-simulation" style="display:none;">
                        <input type="radio" name="decompositionMethod" value="ground-truth">
                        <div class="mf-radio-content">
                            <strong>Simulation ground truth</strong>
                            <p>Spike trains are exact outputs of the simulation model — no decomposition was performed</p>
                        </div>
                    </label>

                </div>
            </div>

            <div id="decompositionAlgorithmSection" style="display:none;">
                <div class="mf-form-group">
                    <label>Decomposition Algorithm(s) *</label>
                    <small>Add one entry per algorithm, in processing order.</small>
                    <div id="decompositionPipelineList"></div>
                    <button type="button" class="mf-btn-secondary" onclick="addDecompositionPipeline()">+ Add Algorithm</button>
                </div>
            </div>

            <div id="editingToolSection" style="display:none;">
                <div class="mf-form-group">
                    <label>Curation / Editing Tool</label>
                    <small>Only fill this in if a different tool was used for manual curation (leave empty if same as the decomposition algorithm above).</small>
                    <div id="editingToolList"></div>
                    <button type="button" class="mf-btn-secondary" onclick="addEditingTool()">+ Add Editing Tool</button>
                </div>
            </div>

        </div><!-- end semgDecompBlock -->

        <!-- iEMG decomposition block (shown for concurrent only) -->
        <div id="iemgDecompBlock" style="display:none;">

            <h3>Intramuscular EMG</h3>

            <div class="mf-form-group">
                <label>How were motor unit spike trains identified from the intramuscular recordings? *</label>
                <div class="mf-radio-group">

                    <label class="mf-radio-card">
                        <input type="radio" name="iemgDecompositionMethod" value="fully-automated" required>
                        <div class="mf-radio-content">
                            <strong>Fully automated</strong>
                            <p>Decomposition algorithm output used as-is — no manual review or curation was performed</p>
                        </div>
                    </label>

                    <label class="mf-radio-card">
                        <input type="radio" name="iemgDecompositionMethod" value="semi-automated">
                        <div class="mf-radio-content">
                            <strong>Semi-automated</strong>
                            <p>Algorithm output was manually reviewed and curated before finalising spike trains</p>
                        </div>
                    </label>

                    <label class="mf-radio-card">
                        <input type="radio" name="iemgDecompositionMethod" value="manual">
                        <div class="mf-radio-content">
                            <strong>Manual annotation</strong>
                            <p>Spike trains identified by a human annotator against the intramuscular reference, without an automated algorithm</p>
                        </div>
                    </label>

                </div>
            </div>

            <div id="iemgDecompositionAlgorithmSection" style="display:none;">
                <div class="mf-form-group">
                    <label>Decomposition Algorithm(s) *</label>
                    <small>Add one entry per algorithm, in processing order.</small>
                    <div id="iemgDecompositionPipelineList"></div>
                    <button type="button" class="mf-btn-secondary" onclick="addIemgDecompositionPipeline()">+ Add Algorithm</button>
                </div>
            </div>

            <div id="iemgEditingToolSection" style="display:none;">
                <div class="mf-form-group">
                    <label>Curation / Editing Tool</label>
                    <small>Only fill this in if a different tool was used for manual curation (leave empty if same as above).</small>
                    <div id="iemgEditingToolList"></div>
                    <button type="button" class="mf-btn-secondary" onclick="addIemgEditingTool()">+ Add Editing Tool</button>
                </div>
            </div>

            <div id="iemgAnnotationToolSection" style="display:none;">
                <div class="mf-form-group">
                    <label>Annotation Tool *</label>
                    <small>Software used to manually identify and label spike trains from intramuscular recordings.</small>
                    <div id="iemgAnnotationToolList"></div>
                    <button type="button" class="mf-btn-secondary" onclick="addIemgAnnotationTool()">+ Add Annotation Tool</button>
                </div>
            </div>

        </div><!-- end iemgDecompBlock -->

        <div class="mf-form-group">
            <label for="numMotorUnits">Total Number of Motor Units Identified *</label>
            <input type="number" id="numMotorUnits" name="numMotorUnits" min="1" required>
            <small>Across all recordings in this dataset</small>
        </div>
    </section>

    <!-- Section 7: Review & Download -->
    <section class="form-section" data-section="7">
        <h2>Review &amp; Download</h2>

        <div class="mf-review-container">
            <h3>Dataset Summary</h3>
            <div id="reviewSummary"></div>

            <h3>Generated BIDS Metadata Preview</h3>
            <p><em>Previews show the first setup. All setups are included in the downloaded ZIP.</em></p>

            <h4>dataset_description.json</h4>
            <pre id="bidsDatasetPreview" class="mf-json-preview">{}</pre>

            <h4>participants.tsv</h4>
            <pre id="bidsSubjectsPreview" class="mf-json-preview"></pre>

            <h4>*_emg.json</h4>
            <pre id="bidsEMGPreview" class="mf-json-preview">{}</pre>

            <h4>*_channels.tsv</h4>
            <pre id="bidsChannelsPreview" class="mf-json-preview"></pre>

            <h4>*_electrodes.tsv</h4>
            <pre id="bidsElectrodesPreview" class="mf-json-preview"></pre>

            <h4>*_coordsystem.json</h4>
            <pre id="bidsCoordPreview" class="mf-json-preview">{}</pre>
        </div>

        <div class="mf-form-group">
            <div class="mf-checkbox-group">
                <label class="mf-checkbox-label">
                    <input type="checkbox" name="confirmEthics" required>
                    I confirm this dataset has ethics approval *
                </label>
                <label class="mf-checkbox-label">
                    <input type="checkbox" name="confirmAnonymization" required>
                    I confirm all personal data is anonymized *
                </label>
                <label class="mf-checkbox-label">
                    <input type="checkbox" name="confirmLicense" required>
                    I agree to license this data under the selected license *
                </label>
                <label class="mf-checkbox-label">
                    <input type="checkbox" name="confirmResubmission" required>
                    I understand I can resubmit up to 3 times *
                </label>
            </div>
        </div>

        <div class="mf-submission-status" id="submissionStatus" style="display:none;"></div>
    </section>

    <!-- Navigation Buttons -->
    <div class="mf-form-navigation">
        <button type="button" class="mf-btn-secondary" id="prevBtn" onclick="navigateForm(-1)" style="display:none;">Previous</button>
        <button type="button" class="mf-btn-secondary" id="saveDraftBtn" onclick="saveDraft()">Save Draft</button>
        <button type="button" class="mf-btn-primary" id="nextBtn" onclick="navigateForm(1)">Next</button>
        <button type="button" class="mf-btn-primary" id="downloadBtn" style="display:none;">Download metadata.zip</button>
    </div>

</form>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<script src="/assets/js/metadata-form.js"></script>
