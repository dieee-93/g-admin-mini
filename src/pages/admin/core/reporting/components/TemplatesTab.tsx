import {
  VStack,
  HStack,
  SimpleGrid,
  Select,
} from '@chakra-ui/react';
import { TemplateCard } from './TemplateCard';
import { type ReportTemplate } from '../types';
import { CATEGORY_COLLECTION } from './constants/collections'; 

interface TemplatesTabProps {
  templates: ReportTemplate[];
  getCategoryColor: (category: string) => string;
  generateReport: (templateId: string, format?: string) => void;
  isGenerating: string | null;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export function TemplatesTab({
  templates,
  getCategoryColor,
  generateReport,
  isGenerating,
  selectedCategory,
  setSelectedCategory
}: TemplatesTabProps) {
  const filteredTemplates = templates.filter(template =>
    selectedCategory === 'all' || template.category === selectedCategory
  );

  return (
    <VStack gap="4" align="stretch">
      {/* Filters */}
      <HStack gap="4" flexWrap="wrap">
        <Select.Root
          collection={CATEGORY_COLLECTION}
          value={[selectedCategory]}
          onValueChange={(details) => setSelectedCategory(details.value[0])}
          width="200px"
        >
          <Select.Trigger>
            <Select.ValueText placeholder="Categoría" />
          </Select.Trigger>
          <Select.Content>
            {CATEGORY_COLLECTION.items.map(item => (
              <Select.Item key={item.value} item={item}>
                {item.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </HStack>

      {/* Templates Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            getCategoryColor={getCategoryColor}
            generateReport={generateReport}
            isGenerating={isGenerating}
          />
        ))}
      </SimpleGrid>
    </VStack>
  );
}
