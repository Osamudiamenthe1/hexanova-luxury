/**
 * src/app/(public)/projects/page.js
 * Portfolio listing. Simple grid of every published project.
 */

import Container from "@/components/ui/container";
import SectionHeading from "@/components/ui/section-heading";
import ProjectCard from "@/components/ui/project-card";
import EmptyState from "@/components/ui/empty-state";
import { getAllProjects } from "@/lib/data/projects";
import { getSettings } from "@/lib/data/settings";

export const revalidate = 60;

export async function generateMetadata() {
  const settings = await getSettings();
  const brandName = settings.brand_name || "HexaNova Luxury";
  const city = settings.city || "Nigeria";
  return {
    title: "Projects",
    description: `Interiors designed by ${brandName}. Residential and commercial projects in ${city} and beyond.`,
  };
}

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading
        eyebrow="Portfolio"
        title="Projects"
        description="A small selection of the interiors we've designed. Every project is bespoke and built around how the client actually lives."
        className="mb-14"
      />

      {projects.length > 0 ? (
        <div className="grid gap-12 md:grid-cols-2 lg:gap-16">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No projects yet"
          description="Check back soon, or get in touch to discuss your own project."
          action={{ href: "/contact", label: "Start an enquiry" }}
        />
      )}
    </Container>
  );
}