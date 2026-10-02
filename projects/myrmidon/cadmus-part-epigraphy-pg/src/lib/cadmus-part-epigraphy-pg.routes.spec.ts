import { Route } from '@angular/router';

import { PendingChangesGuard } from '@myrmidon/cadmus-core';
import {
  EpiSupportPartFeatureComponent,
  EPI_SUPPORT_PART_TYPEID,
} from '@myrmidon/cadmus-part-epigraphy-support';
import {
  EpiScriptsPartFeatureComponent,
  EPI_SCRIPTS_PART_TYPEID,
} from '@myrmidon/cadmus-part-epigraphy-scripts';
import {
  EpiLigaturesFragmentFeatureComponent,
  EPI_LIGATURES_FRAGMENT_TYPEID,
} from '@myrmidon/cadmus-fr-epigraphy-ligatures';
import {
  EpiFormulaPatternsPartFeatureComponent,
  EPI_FORMULA_PATTERNS_PART_TYPEID,
} from '@myrmidon/cadmus-part-epigraphy-formula-patterns';
import {
  EPI_SIGNS_PART_TYPEID,
  EpiSignsPartFeatureComponent,
} from '@myrmidon/cadmus-part-epigraphy-signs';
import {
  EPI_SUPPORT_FRR_PART_TYPEID,
  EpiSupportFrrPartFeatureComponent,
} from '@myrmidon/cadmus-part-epigraphy-support-frr';
import {
  EPI_TECHNIQUE_PART_TYPEID,
  EpiTechniquePartFeatureComponent,
} from '@myrmidon/cadmus-part-epigraphy-technique';

import { CADMUS_PART_EPIGRAPHY_PG_ROUTES } from './cadmus-part-epigraphy-pg.routes';

const PART_ROUTES: [string, unknown][] = [
  [EPI_SUPPORT_FRR_PART_TYPEID, EpiSupportFrrPartFeatureComponent],
  [EPI_SUPPORT_PART_TYPEID, EpiSupportPartFeatureComponent],
  [EPI_SCRIPTS_PART_TYPEID, EpiScriptsPartFeatureComponent],
  [EPI_SIGNS_PART_TYPEID, EpiSignsPartFeatureComponent],
  [EPI_FORMULA_PATTERNS_PART_TYPEID, EpiFormulaPatternsPartFeatureComponent],
  [EPI_TECHNIQUE_PART_TYPEID, EpiTechniquePartFeatureComponent],
];

function findRoute(path: string): Route | undefined {
  return CADMUS_PART_EPIGRAPHY_PG_ROUTES.find((r) => r.path === path);
}

describe('CADMUS_PART_EPIGRAPHY_PG_ROUTES', () => {
  it('should define a route for each part and fragment', () => {
    expect(CADMUS_PART_EPIGRAPHY_PG_ROUTES.length).toBe(
      PART_ROUTES.length + 1,
    );
  });

  it('should have unique paths', () => {
    const paths = CADMUS_PART_EPIGRAPHY_PG_ROUTES.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  for (const [typeId, component] of PART_ROUTES) {
    it(`should route part ${typeId} to its editor`, () => {
      const route = findRoute(`${typeId}/:pid`);
      expect(route).toBeTruthy();
      expect(route!.component).toBe(component);
      expect(route!.pathMatch).toBe('full');
      expect(route!.canDeactivate).toEqual([PendingChangesGuard]);
    });

    it(`should let part feature ${typeId} get its type ID from the route`, () => {
      // EditPartFeatureBase gets the part type ID from the route
      // configuration path, up to the first slash
      const path = findRoute(`${typeId}/:pid`)!.path!;
      expect(path.substring(0, path.indexOf('/'))).toBe(typeId);
    });
  }

  it('should route ligatures fragment to its editor', () => {
    const route = findRoute(
      `fragment/:pid/${EPI_LIGATURES_FRAGMENT_TYPEID}/:loc`,
    );
    expect(route).toBeTruthy();
    expect(route!.component).toBe(EpiLigaturesFragmentFeatureComponent);
    expect(route!.pathMatch).toBe('full');
    expect(route!.canDeactivate).toEqual([PendingChangesGuard]);
  });

  it('should place fragment type ID as third URL segment', () => {
    // EditFragmentFeatureBase gets the fragment type ID from URL segment 2
    const route = findRoute(
      `fragment/:pid/${EPI_LIGATURES_FRAGMENT_TYPEID}/:loc`,
    )!;
    expect(route.path!.split('/')[2]).toBe(EPI_LIGATURES_FRAGMENT_TYPEID);
  });
});
