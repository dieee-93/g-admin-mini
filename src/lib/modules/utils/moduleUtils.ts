/**
 * Module Utilities for G-Admin v3.0
 * Helper functions for module creation and validation
 */

import type {
  ModuleInterface,
  ModuleMetadata,
  ModuleDependencies,
  ModuleFederationConfig
} from '../types/ModuleTypes';
import type { BusinessCapability } from '../../capabilities/types/BusinessCapabilities';

/**
 * Creates a standardized module definition
 */
export const createModuleDefinition = (
  metadata: ModuleMetadata,
  dependencies: ModuleDependencies,
  options: {
    federation?: Partial<ModuleFederationConfig>;
    components?: any;
    hooks?: any;
    services?: any;
    lifecycle?: any;
  } = {}
): ModuleInterface => {
  return {
    metadata,
    dependencies,
    federation: options.federation ? createFederationConfig(metadata.id, options.federation) : undefined,
    components: options.components || {},
    hooks: options.hooks,
    services: options.services,
    lifecycle: options.lifecycle
  };
};

/**
 * Creates Module Federation configuration
 */
export const createFederationConfig = (
  moduleId: string,
  config: Partial<ModuleFederationConfig>
): ModuleFederationConfig => {
  return {
    name: config.name || moduleId.replace(/-/g, ''),
    filename: config.filename || 'remoteEntry.js',
    exposes: config.exposes || {
      './Module': `./src/modules/${moduleId}/index.tsx`
    },
    shared: {
      react: { singleton: true, requiredVersion: '^18.0.0' },
      'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
      '@chakra-ui/react': { singleton: true },
      zustand: { singleton: true },
      ...config.shared
    },
    remoteEntry: config.remoteEntry
  };
};

/**
 * Validates module interface
 */
export const validateModuleInterface = (module: ModuleInterface): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate metadata
  if (!module.metadata.id) {
    errors.push('Module ID is required');
  } else if (!/^[a-z][a-z0-9-]*[a-z0-9]$/.test(module.metadata.id)) {
    errors.push('Module ID must be in kebab-case format');
  }

  if (!module.metadata.name) {
    errors.push('Module name is required');
  }

  if (!module.metadata.version) {
    errors.push('Module version is required');
  } else if (!/^\d+\.\d+\.\d+/.test(module.metadata.version)) {
    errors.push('Module version must follow semantic versioning (x.y.z)');
  }

  // Validate dependencies
  if (!module.dependencies.requiredCapabilities) {
    errors.push('Required capabilities must be specified');
  } else if (!Array.isArray(module.dependencies.requiredCapabilities)) {
    errors.push('Required capabilities must be an array');
  }

  // Validate components
  if (!module.components.MainComponent &&
      !module.components.pages &&
      !module.components.components &&
      !module.components.widgets) {
    errors.push('Module must export at least one component');
  }

  // Validate federation config if present
  if (module.federation) {
    if (!module.federation.name) {
      errors.push('Federation name is required');
    }

    if (!module.federation.exposes || Object.keys(module.federation.exposes).length === 0) {
      errors.push('Federation must expose at least one module');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Generates webpack federation config
 */
export const generateWebpackConfig = (modules: ModuleInterface[]): string => {
  const federationConfigs = modules
    .filter(module => module.federation)
    .map(module => module.federation!);

  if (federationConfigs.length === 0) {
    return '// No module federation configuration needed';
  }

  const config = `
const ModuleFederationPlugin = require('@module-federation/webpack');

module.exports = {
  mode: 'development',
  devServer: {
    port: 3001,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        ${federationConfigs.map(config =>
          `${config.name}: '${config.name}@${config.remoteEntry || 'http://localhost:3001/remoteEntry.js'}'`
        ).join(',\n        ')}
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
        '@chakra-ui/react': { singleton: true },
        zustand: { singleton: true }
      }
    })
  ]
};
`;

  return config;
};

/**
 * Checks if module dependencies are satisfied
 */
export const checkDependencySatisfaction = (
  module: ModuleInterface,
  availableCapabilities: BusinessCapability[],
  availableModules: string[]
): { satisfied: boolean; missing: string[] } => {
  const missing: string[] = [];

  // Check required capabilities
  module.dependencies.requiredCapabilities.forEach(capability => {
    if (!availableCapabilities.includes(capability)) {
      missing.push(`capability:${capability}`);
    }
  });

  // Check module dependencies
  module.dependencies.dependsOn?.forEach(moduleId => {
    if (!availableModules.includes(moduleId)) {
      missing.push(`module:${moduleId}`);
    }
  });

  return {
    satisfied: missing.length === 0,
    missing
  };
};

/**
 * Generates module documentation
 */
export const generateModuleDocumentation = (module: ModuleInterface): string => {
  const { metadata, dependencies, components, federation } = module;

  let doc = `# ${metadata.name}\n\n`;
  doc += `**Version:** ${metadata.version}\n`;
  doc += `**ID:** \`${metadata.id}\`\n\n`;

  if (metadata.description) {
    doc += `${metadata.description}\n\n`;
  }

  if (metadata.tags && metadata.tags.length > 0) {
    doc += `**Tags:** ${metadata.tags.join(', ')}\n\n`;
  }

  // Dependencies
  doc += `## Dependencies\n\n`;
  doc += `### Required Capabilities\n`;
  dependencies.requiredCapabilities.forEach(cap => {
    doc += `- \`${cap}\`\n`;
  });

  if (dependencies.optionalCapabilities && dependencies.optionalCapabilities.length > 0) {
    doc += `\n### Optional Capabilities\n`;
    dependencies.optionalCapabilities.forEach(cap => {
      doc += `- \`${cap}\`\n`;
    });
  }

  if (dependencies.dependsOn && dependencies.dependsOn.length > 0) {
    doc += `\n### Module Dependencies\n`;
    dependencies.dependsOn.forEach(moduleId => {
      doc += `- \`${moduleId}\`\n`;
    });
  }

  // Components
  doc += `\n## Components\n\n`;
  if (components.MainComponent) {
    doc += `- **MainComponent**: Primary module component\n`;
  }
  if (components.pages) {
    doc += `- **Pages**: ${Object.keys(components.pages).join(', ')}\n`;
  }
  if (components.components) {
    doc += `- **Components**: ${Object.keys(components.components).join(', ')}\n`;
  }
  if (components.widgets) {
    doc += `- **Widgets**: ${Object.keys(components.widgets).join(', ')}\n`;
  }

  // Federation
  if (federation) {
    doc += `\n## Module Federation\n\n`;
    doc += `- **Name**: \`${federation.name}\`\n`;
    doc += `- **Exposed Modules**:\n`;
    Object.entries(federation.exposes).forEach(([key, value]) => {
      doc += `  - \`${key}\` → \`${value}\`\n`;
    });
  }

  return doc;
};