import { createContext, useContext } from 'react';

import type { API_StatusObject, API_StatusState, API_StatusValue, StoryId } from '@storybook/types';

import type { ComponentEntry, GroupEntry, StoriesHash } from '../../../manager-api';
import { getDescendantIds } from '../../utils/tree';

export const StatusContext = createContext<{
  data?: StoriesHash;
  status?: API_StatusState;
  groupStatus?: Record<StoryId, API_StatusValue>;
}>({});

export const useStatusSummary = (item: GroupEntry | ComponentEntry) => {
  const { data, status, groupStatus } = useContext(StatusContext);
  const summary: {
    counts: Record<API_StatusValue, number>;
    statuses: Record<API_StatusValue, Record<StoryId, API_StatusObject[]>>;
  } = {
    counts: { pending: 0, success: 0, error: 0, warn: 0, unknown: 0 },
    statuses: { pending: {}, success: {}, error: {}, warn: {}, unknown: {} },
  };

  if (
    data &&
    status &&
    groupStatus &&
    ['pending', 'warn', 'error'].includes(groupStatus[item.id])
  ) {
    for (const storyId of getDescendantIds(data, item.id, false)) {
      for (const value of Object.values(status[storyId] || {})) {
        summary.counts[value.status]++;
        summary.statuses[value.status][storyId] = summary.statuses[value.status][storyId] || [];
        summary.statuses[value.status][storyId].push(value);
      }
    }
  }

  return summary;
};
