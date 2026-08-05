import type { ComponentType } from "react";
import { WorkshopIdea } from "./workshop";
import { PuppeteerIdea } from "./puppeteer";

/**
 * Portfolio concept registry.
 * Add a new folder under `src/ideas/<name>/` with an `*Idea` component,
 * then register it here and set `ACTIVE_IDEA` to preview it.
 */
export const ideas = {
  workshop: WorkshopIdea,
  puppeteer: PuppeteerIdea,
} as const satisfies Record<string, ComponentType>;

export type IdeaId = keyof typeof ideas;

/** Switch this to preview another idea. */
export const ACTIVE_IDEA: IdeaId = "puppeteer";
