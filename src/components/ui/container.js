/**
 * src/components/ui/container.js
 * Centers content horizontally with a max width and consistent padding.
 *
 * Use it as the outer element of almost every section:
 *   <Container><h2>...</h2></Container>
 *
 * The "size" prop lets you override the max width when a section needs to
 * be wider (like a full-bleed hero) or narrower (like a form).
 */

export default function Container({
  children,
  className = "",
  size = "default",
  as: Tag = "div",
}) {
  // Map readable names to Tailwind max-width classes.
  const sizes = {
    narrow: "max-w-3xl",
    default: "max-w-7xl",
    wide: "max-w-[90rem]",
    full: "max-w-none",
  };

  return (
    <Tag
      className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${
        sizes[size] || sizes.default
      } ${className}`}
    >
      {children}
    </Tag>
  );
}