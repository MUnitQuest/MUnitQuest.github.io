---
title: MUnitQuest Data Submission
feature_image: "https://picsum.photos/1300/400?image=989"
feature_text: |
  ## This website is under construction. For educational purposes only. All information is fictitious. 
---


Thanks you for submitting a dataset to the MUnitQuest and welcome to the MUnitQuest Data Submission Guide (for metadata only?). 

As data in the MUnitQuest competition will be in BIDS format we require certain metadata for processing. 

Here we provide instructions for creating the files we require. 
Our explanation covers the most common types of datasets. We also provide examples for each, you can base your files on. 
**If your dataset does not fit into this scheme you can and should still submit it!** Simply contact us and we will provide assistance. 

contact email: TODO 

Types of dataset that this explanation covers: 
- HDsEMG grid(s) only 
- HDsEMG grid(s) + invasive EMG (fine wire(s), concentric needle(s) or thin filament(s))
- Simulated


The idea is to follow CEDE guidelines ("Consensus for experimental design in electromyography (CEDE) project: Single motor unit matrix", see https://pubmed.ncbi.nlm.nih.gov/36571885/ )


# Short Intro into BIDS standard? 
Data in this competition will be in [BIDS](https://bids.neuroimaging.io/) format. BIDS support for EMG data is not yet official, but is in the works. 

The main body of the dataset will be in EDF, EDF+, BDF, or BDF+ format. (TODO which one?). Conversion to this format will be handled by us. We accept the following formats: TODO. 

The metadata of the dataset will be in several different .json and .tsv files. Some of these we require you to create when you submit your dataset. We will explain what we need and provide examples you can base your files on. 


[BIDS extension proposal](https://bids.neuroimaging.io/extensions/beps/bep_042.html) link here? or under "further info" section at bottom? or too much information? 
<!-- https://bids-specification--1998.org.readthedocs.build/en/1998/modality-specific-files/electromyography.html link this somewhere too?  -->


# Overview of whats required 
For initial submission of your dataset we require the following files: 
- dataset_description.json
- emg.json
- channels.tsv 
- electrodes.tsv 
- Photo of experimental setup and electrode wiring 
- the actual dataset itself??? 

Each will be explained further down accompanied by example files. 
We may require additional information and files once your dataset has been accepted. 

## We expect homogeneity of dataset
should be largely same setup for each participant
if not split into two datasets

if you used multiple amplifiers in your dataset contact us. 

if simulation pretend as if not simulated. Use "n/a" for datafields that no longer make sense in a simulated context, such as manufacturer name of amplifier. 


<!-- # Recommended software tools to edit files

vscode for json? 
excel for tsv?  -->



# Required files 
We provide example files in [this Github repository](https://github.com/MUnitQuest/startkit). This hopefully covers the most common types of experimental setups. As mentioned before if your dataset differs, simply contact us for help. 

## Photo of experimental setup
- Photo that shows placement of electrodes on the body
- photo that shows electrode names (could be drawn path)
could be just one photo that shows both 

## dataset_description.json
A short .json file where you specify authors of the dataset and its related publication as well as a license and the ethics approval. 

## emg.json
A .json file that specifies some general information about the experimental setup. 

<!-- EMGPlacementScheme: don't ask, will sort this in follow up if dataset accepted -->
- **EMGPlacementSchemeDescription:** Describe how electrodes are placed. Include anatomical landmarks used to position. how measured. placement of reference electrode. placement of ground electrode. incl if dry linear array was used or not. incl if innervation zone was measured and how positioned relative to it. For different types of electrodes (surface grid, invasive grid, fine wire, etc) use i), ii), iii), etc to separate placement description (similar to the example). 
- **EMGReference:** leave it as "channelspecific".  
- **SamplingFrequency:** the main sampling frequency of your data. If some channels of your data have a different sampling frequency contact us. 
- **PowerLineFrequency:** Frequency of the power grid where the data was recorded. 
- **SoftwareFilters:** "n/a" if no filters used. otherwise json object similar to examples. 
- **Taskname:** Name of the task done by participant. If multiple tasks split by using "i), ii), iii)". 
- **TaskDescription:** Description for each task. 


## Channels.tsv 
The channels.tsv file describes channel specific information. For example measurement unit, which channels in the data are derived from which signal and reference electrodes, the frequency of low pass and high pass filters used, etc. 

example .tsv file contains: 

## Electrodes.tsv
Contains information about the electrodes used. Such as geometry of grid(s), electrode surface area, material, manufacturer, type, etc. 


<!-- # Coordsystem.json 
only ask for in follow up, initially covered by photo -->


## Python checking script

<!-- we provide python script to check your json file for 
- correct json syntax
- required fields
- correct data types (number, string, etc) -->

