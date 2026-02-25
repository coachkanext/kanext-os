/**
 * RBAC Constitution — Barrel Export
 *
 * Re-exports all RBAC modules for convenient single-path imports.
 * Consumer files should continue using their existing import paths
 * (e.g. `@/utils/sports-rbac`) which are now re-export shims.
 */

export * from './constitution';
export * from './system';
export * from './dispatcher';
export * from './nexus-bridge';

// Mode registries — exported under their namespaces via the shim files.
// Direct imports from here would cause naming collisions (e.g. multiple `Visibility` types).
// Use the mode-specific shim files instead:
//   @/utils/sports-rbac, @/utils/business-rbac, @/utils/church-rbac,
//   @/utils/education-rbac, @/utils/competition-rbac
