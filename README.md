# Cadmus Epigraphy Shell

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.0.4.

Cadmus epigraphic components development shell.

- [models](https://github.com/vedph/cadmus-epigraphy)
- [API](https://github.com/vedph/cadmus-epigraphy-api)

## Docker

🐋 Quick Docker image build:

1. `npm run build-lib` (publish if required);
2. update version in `env.js` (and Docker files) and `ng build`;
3. `docker build . -t vedph2020/cadmus-epigraphy-shell:0.0.2 -t vedph2020/cadmus-epigraphy-shell:latest` (replace with the current version).

## History

- 2023-04-13: token values in formula editor.

### 0.0.2

- 2023-03-11: updated Angular and packages.
- 2023-03-08:
  - adding epigraphic formula patterns part.
  - updated Angular and packages.
- 2023-02-11: integrated new flags component.
- 2023-02-10: updated Angular and packages.

### 0.0.1

- 2023-01-28: updated packages.
- 2023-01-05: added MapBoxGL for asserted locations.
