# ARC-CDG: The Curriculum Dataset Generator for ARC-AGI

This repository contains the code of the web application named ARC-CDG, of which a live copy is hosted at

https://cdg.openai.nl/

ARC-CDG offers a curriculum consisting of subjects that are further divided into lessons, which generate tasks in the format of [ARC-AGI-1 and ARC-AGI-2]([https://arcprize.org/](https://arcprize.org/)), to supplement the available training data involving the necessary priors for solving those.

## Generating an arbitrary number of tasks

By default, the generated datasets will be written to a string in memory, and then zipped. This will make the generator fail if you try to generate a huge dataset. Do the following instead:

Clone this repository, then do `node serve.js`. This will serve a local copy. If you then generate a dataset in the UI, the files will be written to the `./output` directory. Only the RE-ARC and JSONL formats are supported this way.

## Adding new lessons

To add a new lesson, copy a similar lesson file as a template and modify it. You then have to reference it in a `<script>` tag in `index.html`, and include it into the curriculum in the `main.js` file. The way the application was made is by modifying the internals to accomodate each new lesson. As a result, some functions may not do exactly what you expect from their name.

Each lesson instantiates a `Scene` and adds objects to it. The scene is set to record. The lesson then does some logic and uses `scene.step()` and `scene.render()`. The resulting `scene.video` is a generated task or task pair for that lesson.


