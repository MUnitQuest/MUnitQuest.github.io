---
title: MUnitQuest Data Submission
feature_image: "https://picsum.photos/1300/400?image=989"
feature_text: |
  ## This website is under construction. For educational purposes only. All information is fictitious. 
---


Thanks you for submitting a dataset to the MUnitQuest and welcome to the MUnitQuest Dataset Submission Guide (for metadata only?). 

Datasets in the MUnitQuest competition will be in [BIDS](https://bids.neuroimaging.io/) format while also following [CEDE guidelines](https://pubmed.ncbi.nlm.nih.gov/36571885/). Datasets in BIDS format consist of .bdf or .edf files for the raw data and accompanying .json and .tsv files that store the metadata. To submit a dataset we therefore require certain metadata files from you. 

On this page we provide instructions for creating the files we require. 
Our explanation covers the most common types of datasets we expect people to submit. These are: 
- Datasets containing only **HDsEMG grid(s)** 
- Datasets containing **HDsEMG grid(s) and concurrent invasive EMG** (fine wire(s), concentric needle(s) or thin filament(s))
- Datasets based on **Simulation**

We also provide examples you can base your files on. **If your dataset does not fit into this scheme you can and should still submit it!** Simply contact us and we will provide assistance. 

contact email: TODO 

## Short Intro into BIDS standard? 
Data in this competition will be in [BIDS](https://bids.neuroimaging.io/) format. BIDS support for EMG data is not yet official, but is in the works. 

The main body of the dataset will be in EDF, EDF+, BDF, or BDF+ format. (TODO which one?). Conversion to this format will be handled by us. We accept the following formats: TODO. 

The metadata of the dataset will be in several different .json and .tsv files. Some of these we require you to create when you submit your dataset. We will explain what we need and provide examples you can base your files on. 


[BIDS extension proposal](https://bids.neuroimaging.io/extensions/beps/bep_042.html) link here? or under "further info" section at bottom? or too much information? 
<!-- https://bids-specification--1998.org.readthedocs.build/en/1998/modality-specific-files/electromyography.html link this somewhere too?  -->

## We expect homogenous data
Datasets should have the same setup (electrodes and electrode placement) for each participant. Minor deviations like a missing electrode are okay, and can be specified accordingly in the metadata (more on this later). 
But if your dataset contains major deviations between participants it should be split into smaller homogenous datasets. 

If your data was collected with more than one amplifier contact us. 
## Simulated datasets 
If your dataset is the result of a simulation, simply pretend as if it were measured experimentally while submitting the dataset. Use "n/a" for datafields that no longer make sense in a simulated context, such as manufacturer name of amplifier or PowerLineFrequency. 

# Overview of required files 
For initial submission of your dataset we require the following files: 
- dataset_description.json
- emg.json
- channels.tsv 
- electrodes.tsv 
- Photo(s) of experimental setup and electrode wiring 
- the actual dataset itself??? 

We provide example files in [this Github repository](https://github.com/MUnitQuest/startkit). Further, each file is explained below. 

This hopefully covers the most common types of experimental setups. As mentioned before, if your dataset differs, simply contact us for help. 

We may require additional information and files once your dataset has been accepted. 
<!-- # Recommended software tools to edit files
vscode for json? 
excel for tsv?  -->
## Photo of experimental setup
- Photo that shows placement of electrodes on the body. Include at least one adjacent joint for context. 
- Photo or drawing that shows electrode names

It's also possible to combine both these photos into one.

TODO example electrode name picture with drawn path

## dataset_description.json
A short .json file where you specify authors of the dataset and its related publication as well as a license and the ethics approval. 

## emg.json
A .json file that specifies some general information about the experimental setup. 

<!-- EMGPlacementScheme: don't ask, will sort this in follow up if dataset accepted -->
- **EMGPlacementSchemeDescription:** Describe how electrodes are placed. Include anatomical landmarks used to position. Include the measurement method for placement. Include placement of reference electrode(s). Include placement of ground electrode. Include if a dry linear array for fiber alignment was used or not. Include if innervation zone was measured and how electrodes are positioned relative to it. For different types of electrodes (surface grid, invasive grid, fine wire, etc) use i), ii), iii), ... to separate placement description (similar to the example). 
- **EMGReference:** Leave it as "channelspecific".  
- **EMGGround:** The name of the ground electrode (specified in electrodes.tsv). 
- **SamplingFrequency:** The main sampling frequency (in Hz) of your data. If some channels of your data have a different sampling frequency contact us. 
- **PowerLineFrequency:** Frequency (in Hz) of the power grid where the data was recorded. 
- **SoftwareFilters:** A json object containing filter parameters (see example emg.json file). Use "n/a" if no filter was used.
- **Taskname:** Name of the task done by participant. If multiple tasks were performed, list them by using "i), ii), iii)". 
- **TaskDescription:** Description for each task. 
- **Preamplification:** Amplification built into an EMG bipolar sensor, electrode grid, or other device.
- **Gain:** Signal gain from an in-line amplifier, applied between the EMG sensor/device and the data acquisition computer. 
- **Manufacturer:** Manufacturer of the amplifier used to collect the data. 
- **ManufacturerModelName:** Model name of the amplifier. 

## Electrodes.tsv
Contains information about the electrodes used. Such as geometry of grid(s), electrode surface area, material, manufacturer, type, etc. 




- **name:** Name of a single electrode. Can be any string containing letters and numbers. Every electrode needs a unique name. 
- **x:** X-coordinate of the electrode in its child coordinate system. More on coordinate systems below. 
- **y:** Y-coordinate of the electrode in its child coordinate system.
- **z:** Z-coordinate of the electrode in its child coordinate system. Usually this is left empty. 
- **coordinate_system:** Name of the child coordinate System. 
- **Group:** Name of the group this electrode belongs to. 
- **ElectrodeMaterial:** Material the electrode surface is made from. 
- **InterelectrodeDistance:** Distance between electrodes. In a grid this means distance between neighboring electrodes. In a fine wire it means distance between the wire tips. 
- **ElectrodeSurfaceArea:** Surface area of the electrode. For fine wire this will be "n/a" because FineWireDiameter and FineWireRecordingTipLength already specify surface area. 
- **FineWireDiameter:** Diameter of the fine wire tip. "n/a" for every electrode that is not a fine wire. Column can be deleted if no fine wire present. 
- **FineWireRecordingTipLength:** Unisolated length of the fine wire tip. "n/a" for every electrode that is not a fine wire. Column can be deleted if no fine wire present. 
- **ConcentricNeedleDiameter:** Concentric needle size/gauge. "n/a" for every electrode that is not a concentric needle. Column can be deleted if no concentric needle present. 
- **ConcentricNeedleLength:** Length of concentric needle. "n/a" for every electrode that is not a concentric needle. Column can be deleted if no concentric needle present. 
- **ElectrodeManufacturer:** Name of electrode manufacturer. 
- **ElectrodeManufacturersModelName:** Model name of Electrode. 
- **ElectrodeType:** Type of electrode. Must be one of the following: "HDsEMG", "thin-film HDiEMG", "fine wire", "concentric needle" or "ring". 

### On Coordinate Systems
BIDS requires that electrodes position on the body be specified. For this, coordinate systems defined by anatomical landmarks are specified in several .json files. For grids of electrodes, positions can be specified in device specific coordinates. These device specific coordinates are then located within parent coordinate systems in additional .json files. **We do not require _coordsystem.json files for initial submission.** If your dataset is accepted we will require these files at a later stage. 


## Channels.tsv 
The channels.tsv file describes channel specific information. For example which channels in the data are derived from which signal and reference electrodes, measurement unit, the frequency of low pass and high pass filters used, etc. 

- **name:** Name of a single channel. Can be any string containing letters and numbers. Every channel needs a unique name. 
- **type:** Type of channel. Must be "EMG" or "Misc". 
- **unit:** Unit of measurement of the channel. 
- **description:** Description of the channel. 
- **signal_electrode:** Name of the signal electrode. Must match an electrode name specified in electrodes.tsv. 
- **reference_electrode:** Name of the reference electrode. Must match an electrode name specified in electrodes.tsv. 
- **group:** 
- **status:** Status of the channel. Optional. Can be used to tag channels which should be ignored in data analysis. 
- **low_cutoff:** High-pass filter frequency (in Hz). 
- **high_cutoff:** Low-pass filter frequency (in Hz). 


## Minor experimental setup deviations between participants
BIDS metadata follows an inheritance principle. In practice this means the following: 

If all your participants have exactly the same experimental setup, you only need to specify each metadata file once, since it is the same for each participant. It will be placed in the top-most directory, on the same level where the folders for each participant are. 

If you have minor deviations from the intended experimental setup in some participants, you still place metadata files in the top-most directory. But additionally you place metadata files inside the folder of the participant that deviates. The metadata files in the lower directory will override the files in the higher directories. 

## Python checking script

<!-- we provide python script to check your json file for 
- correct json syntax
- required fields
- correct data types (number, string, etc) -->

