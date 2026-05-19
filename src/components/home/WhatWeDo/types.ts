import type { WHAT_WE_DO_ITEMS } from "./constants";

export type WhatWeDoItem = (typeof WHAT_WE_DO_ITEMS)[number];

export type WhatWeDoProps = {
  className?: string;
};
