/**
 * Dynamic Section Renderer
 * Renders the appropriate section component based on section type
 */

import React from 'react';
import {
  DynamicSection,
  SectionType,
  Experience,
  Education,
  Project,
  Skill,
  Certification,
  Achievement,
  Hackathon,
  Workshop,
  Publication,
  Volunteer,
  SECTION_LABELS,
} from '../../types/resume';
import { ExperienceSection } from './ExperienceSection';
import { EducationSection } from './EducationSection';
import { ProjectsSection } from './ProjectsSection';
import { SkillsSection } from './SkillsSection';
import { CertificationsSection } from './CertificationsSection';
import { AchievementsSection } from './AchievementsSection';
import { HackathonsSection } from './HackathonsSection';
import { WorkshopsSection } from './WorkshopsSection';
import { PublicationsSection } from './PublicationsSection';
import { VolunteerSection } from './VolunteerSection';
import { CustomSection } from './CustomSection';

interface DynamicSectionRendererProps {
  section: DynamicSection;
  onChange: (section: DynamicSection) => void;
  onRemove: () => void;
}

/**
 * Transforms section items to the expected type for each section component
 */
function transformItems<T>(items: Record<string, unknown>[]): T[] {
  return items as unknown as T[];
}

/**
 * Updates items back to the generic format for storage
 */
function updateToGenericItems(items: unknown[]): Record<string, unknown>[] {
  return items as Record<string, unknown>[];
}

export const DynamicSectionRenderer: React.FC<DynamicSectionRendererProps> = ({
  section,
  onChange,
  onRemove,
}) => {
  const handleItemsChange = <T,>(newItems: T[]) => {
    onChange({
      ...section,
      items: updateToGenericItems(newItems),
    });
  };

  switch (section.type) {
    case 'experience':
      return (
        <ExperienceSection
          experience={transformItems<Experience>(section.items)}
          onChange={(items) => handleItemsChange(items)}
        />
      );

    case 'education':
      return (
        <EducationSection
          education={transformItems<Education>(section.items)}
          onChange={(items) => handleItemsChange(items)}
        />
      );

    case 'projects':
      return (
        <ProjectsSection
          projects={transformItems<Project>(section.items)}
          onChange={(items) => handleItemsChange(items)}
        />
      );

    case 'skills':
      return (
        <SkillsSection
          skills={transformItems<Skill>(section.items)}
          onChange={(items) => handleItemsChange(items)}
        />
      );

    case 'certifications':
      return (
        <CertificationsSection
          certifications={transformItems<Certification>(section.items)}
          onChange={(items) => handleItemsChange(items)}
        />
      );

    case 'achievements':
      return (
        <AchievementsSection
          achievements={transformItems<Achievement>(section.items)}
          onChange={(items) => handleItemsChange(items)}
        />
      );

    case 'hackathons':
      return (
        <HackathonsSection
          hackathons={transformItems<Hackathon>(section.items)}
          onChange={(items) => handleItemsChange(items)}
        />
      );

    case 'workshops':
      return (
        <WorkshopsSection
          workshops={transformItems<Workshop>(section.items)}
          onChange={(items) => handleItemsChange(items)}
        />
      );

    case 'publications':
      return (
        <PublicationsSection
          publications={transformItems<Publication>(section.items)}
          onChange={(items) => handleItemsChange(items)}
        />
      );

    case 'volunteer':
      return (
        <VolunteerSection
          volunteer={transformItems<Volunteer>(section.items)}
          onChange={(items) => handleItemsChange(items)}
        />
      );

    case 'custom':
    default:
      return (
        <CustomSection
          section={section}
          onChange={onChange}
          onRemove={onRemove}
        />
      );
  }
};

/**
 * Wrapper component that includes a remove button for dynamic sections
 */
interface DynamicSectionWrapperProps {
  section: DynamicSection;
  onChange: (section: DynamicSection) => void;
  onRemove: () => void;
  showRemoveButton?: boolean;
}

export const DynamicSectionWrapper: React.FC<DynamicSectionWrapperProps> = ({
  section,
  onChange,
  onRemove,
  showRemoveButton = true,
}) => {
  // For custom sections, the CustomSection component handles its own remove button
  if (section.type === 'custom') {
    return (
      <DynamicSectionRenderer
        section={section}
        onChange={onChange}
        onRemove={onRemove}
      />
    );
  }

  // For predefined sections, wrap with a header that includes a remove button
  return (
    <div className="relative">
      {showRemoveButton && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 z-10 bg-danger-500 hover:bg-danger-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-md"
          title={`Remove ${SECTION_LABELS[section.type] || section.title}`}
        >
          ×
        </button>
      )}
      <DynamicSectionRenderer
        section={section}
        onChange={onChange}
        onRemove={onRemove}
      />
    </div>
  );
};

export default DynamicSectionRenderer;
