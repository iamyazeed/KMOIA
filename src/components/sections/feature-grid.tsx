import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { ContentIcon } from "@/components/sections/content-icon";
import { Card, CardBody, CardDescription, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

export type FeatureItem = {
  id?: string;
  title: string;
  description?: string | null;
  icon?: string | null;
};

/**
 * The card grid used for missions, facilities, skills and departments.
 *
 * One component rather than four near-identical ones: these sections differ in
 * their content, not their presentation, and keeping them visually identical is
 * exactly what makes the site feel designed rather than assembled.
 */
export function FeatureGrid({
  items,
  columns = 3,
  className,
}: {
  items: FeatureItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <Stagger
      className={cn(
        "grid gap-6",
        columns === 2 && "sm:grid-cols-2",
        columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {items.map((item) => (
        <StaggerItem key={item.id ?? item.title} className="h-full">
          <Card variant="elevated" interactive className="h-full">
            <CardBody>
              {item.icon ? (
                <span className="mb-5 inline-flex size-11 items-center justify-center rounded-md bg-brand-50 text-brand-600 dark:bg-brand-100 dark:text-brand-700">
                  <ContentIcon name={item.icon} className="size-5" />
                </span>
              ) : null}
              <CardTitle className="text-h3">{item.title}</CardTitle>
              {item.description ? (
                <CardDescription>{item.description}</CardDescription>
              ) : null}
            </CardBody>
          </Card>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
