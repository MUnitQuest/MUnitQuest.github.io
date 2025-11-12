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


# Short Intro into BIDS standard? 
Data in this competition will be in [BIDS](https://bids.neuroimaging.io/) format. BIDS support for EMG data is not yet official, but is in the works. 

The main body of the dataset will be in EDF, EDF+, BDF, or BDF+ format. (TODO which one?). Conversion to this format will be handled by us. We accept the following formats: TODO. 

The metadata of the dataset will be in several different .json and .tsv files. Some of these we require you to create when you submit your dataset. We will explain what we need and provide examples you can base your files on. 


[BIDS extension proposal](https://bids.neuroimaging.io/extensions/beps/bep_042.html) link here? or under "further info" section at bottom? or too much information? 
<!-- https://bids-specification--1998.org.readthedocs.build/en/1998/modality-specific-files/electromyography.html link this somewhere too?  -->


# Overview of whats required 
For initial submission of your dataset we require the following files: 
- emg.json
- channels.tsv 
- electrodes.tsv 
- Photo of experimental setup and electrode wiring 
- the actual dataset itself??? 

Each will be explained further down accompanied by example files. 
We may require additional information once your dataset has been accepted. 

## We expect homogeneity of dataset
should be largely same setup for each participant
if not split into two datasets

if you used multiple amplifiers in your dataset contact us. 

if simulation pretend as if not simulated. Use "n/a" for datafields that no longer make sense in a simulated context, such as manufacturer name of amplifier. 


<!-- # Recommended software tools to edit files

vscode for json? 
excel for tsv?  -->

## Python checking script

we provide python script to check your json file for 
- correct json syntax
- required fields
- correct data types (number, string, etc)

# Photo of experimental setup

- Photo that shows placement of electrodes on the body
- photo that shows electrode names (could be drawn path)
could be just one photo that shows both 

# emg.json

<!-- EMGPlacementScheme: don't ask, will sort this in follow up if dataset accepted -->
- **EMGPlacementSchemeDescription:** incl anatomical landmarks used to position. how measured. placement of reference electrode. placement of ground electrode. incl if dry linear array was used or not. incl if innervation zone was measured and how positioned relative to it. 
- **EMGReference:** "channelspecific" always 
- **SamplingFrequency:** the main sampling frequency of your data. Everything that deviates from this will be specified in channels.tsv later. 
- **PowerLineFrequency:** Frequency of the power grid where the data was recorded. 
- **SoftwareFilters:** "n/a" if no filters used. otherwise json object similar to examples. 

- **Taskname:** name of the task done by participant
- **TaskDescription:** desc. 


# Channels.tsv 
The channels.tsv file describes which channels in the data are derived from which electrodes, what their sampling frequency is, which channels belong to which HDsEMG grid, the frequency of low pass and high pass filters used. 

example .tsv file contains: 

# Electrodes.tsv

describes the geometry of grid(s), electrode material etc. 


<!-- # Coordsystem.json 
only ask for in follow up, initially covered by photo -->


<!-- 
# Grid Only 

# Grid + Fine Wire

# Grid + concentric needle

# Grid + thin filament -->



