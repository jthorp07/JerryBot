export type ThreadState = {
  starterId: string | null;
  starterDeleted?: boolean;
  authorId: string | null;

  needsYoutube: boolean;
  needsTracker: boolean;
  needsTitle: boolean;

  needsRegion?: boolean;
  needsRole?: boolean;
  needsHours?: boolean;
  needsSessions?: boolean;
  needsStruggles?: boolean;
  needsGoals?: boolean;

  needsDeathmatch?: boolean;
  firstVodSplitBlocked?: boolean;

  needs1080p?: boolean;
  needsPlayable?: boolean;
  needsDuration?: boolean;

  moderationStatus: "approved" | "denied" | null;
  autoDeniedFirstVodSplit?: boolean;

  requirementsMsgId?: string;
  blockWarnIds: string[];

  requestedManualReview?: boolean;
};
