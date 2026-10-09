/**
 * src/components/ui/project-card.js
 * A single project tile for the portfolio grid.
 *
 * IMAGE SIZES:
 * Projects render in a 1-column grid on mobile, 2 columns on desktop.
 * Mobile is 100vw, desktop is 50vw. The current sizes string was
 * over-requesting on desktop (33vw is right for a 3-column grid, which
 * this is not).
 */

import Image from "next/image";
import Link from "next/link";
import PlaceholderImage from "./placeholder-image";

export default function ProjectCard({ project }) {
  if (!project) return null;

  const sizes = "(max-width: 768px) 100vw, 50vw";

  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <div className="relative overflow-hidden bg-muted">
        {project.cover_image_url ? (
          <div className="relative aspect-[16/10]">
            <Image
              src={project.cover_image_url}
              alt={project.title}
              fill
              sizes={sizes}
              quality={70}
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          </div>
        ) : (
          <PlaceholderImage label={project.title} aspect="aspect-[16/10]" />
        )}
      </div>

      <div className="mt-5">
        <h3 className="font-heading text-xl leading-tight">{project.title}</h3>

        <p className="mt-1 text-xs uppercase tracking-[0.15em] text-muted-foreground">
          {[project.location, project.year].filter(Boolean).join(" · ")}
        </p>

        {project.summary && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {project.summary}
          </p>
        )}
      </div>
    </Link>
  );
}